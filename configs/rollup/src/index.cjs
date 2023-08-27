const path = require("node:path")
const { nodeResolve } = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs").default
const json = require("@rollup/plugin-json").default
const builtinModules = require("builtin-modules")
const { babel } = require("@rollup/plugin-babel")
const { visualizer } = require("rollup-plugin-visualizer")

exports.generateRollupConfig = function generateRollupConfig({
  packageDir,
  analyze,
}) {
  if (packageDir == null) {
    throw new Error("packageDir 인자를 넘겨주세요.")
  }

  const packageJSON = require(path.join(packageDir, "package.json"))
  if (packageJSON.exports == null) {
    throw new Error("package.json의 exports필드를 정의해주세요.")
  }

  const entrypoints = Object.keys(packageJSON.exports).filter(
    (path) => path !== "./package.json",
  )

  const externals = [
    ...Object.keys({
      ...packageJSON.devDependencies,
      ...packageJSON.peerDependencies,
    }),
    ...builtinModules,
  ]

  /**
   * @type {import('rollup').ExternalOption}
   */
  const externalOption = (source, _importer, _isResolved) => {
    return externals.some((externalPkg) => source.startsWith(externalPkg))
  }

  const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"]

  const buildJS = (input, output, format) => {
    const isESMFormat = format === "es"

    /**
     * @type {import('rollup').RollupOptions}
     */
    const config = {
      input: input,
      output: [
        {
          format: format,
          ...(isESMFormat
            ? {
                dir: path.dirname(output),
                entryFileNames: `[name]${path.extname(output)}`,
                preserveModules: true,
                preserveModulesRoot: path.dirname(input),
              }
            : {
                file: output,
              }),
        },
      ],
      external: externalOption,
      plugins: [
        babel({
          extensions,
          babelHelpers: "bundled",
          rootMode: "upward",
        }),
        nodeResolve({
          extensions,
        }),
        commonjs(),
        json(),
        ...(analyze ? [visualizer()] : []),
      ],
    }
    return config
  }

  const buildCJS = (input, output) => buildJS(input, output, "cjs")
  const buildESM = (input, output) => buildJS(input, output, "es")

  // TODO 추후 amd(iife) format 지원하기..!
  // const buildAMD = (input, output) => buildJS(input, output, "amd");

  const ensure = (value, msg) => {
    if (value == null) {
      throw new Error(msg)
    }
    return value
  }

  const handleEntrypoint = (exports, entrypoint, type) => {
    if (exports == null || exports[entrypoint] == null) return undefined

    if (exports[entrypoint][type] != null) {
      return exports[entrypoint][type]
    }
    if (typeof exports[entrypoint] === "string") {
      return exports[entrypoint]
    }

    return undefined
  }

  return entrypoints.flatMap((entrypoint) => {
    const cjsInput = path.resolve(
      packageDir,
      ensure(
        handleEntrypoint(packageJSON.exports, entrypoint, "require"),
        "CJS inputfile not found",
      ),
    )
    const cjsOutput = path.resolve(
      packageDir,
      ensure(
        handleEntrypoint(
          packageJSON.publishConfig?.exports,
          entrypoint,
          "require",
        ),
        "CJS outputfile not found.",
      ),
    )

    const esmInput = path.resolve(
      packageDir,
      ensure(
        handleEntrypoint(packageJSON.exports, entrypoint, "import"),
        "ESM inputfile not found.",
      ),
    )
    const esmOutput = path.resolve(
      packageDir,
      ensure(
        handleEntrypoint(
          packageJSON.publishConfig?.exports,
          entrypoint,
          "import",
        ),
        "ESM outfile not found.",
      ),
    )

    return [buildCJS(cjsInput, cjsOutput), buildESM(esmInput, esmOutput)]
  })
}
