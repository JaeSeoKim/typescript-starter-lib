import { defineConfig, mergeConfig } from "vitest/config"

export default mergeConfig(
  {
    esbuild: {
      jsxFactory: "createElement",
      jsxFragment: "Fragment",
    },
  },
  defineConfig({
    test: {
      environment: "happy-dom",
    },
  }),
)
