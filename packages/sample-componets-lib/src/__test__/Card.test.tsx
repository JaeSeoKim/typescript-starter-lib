import React from "react"
import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { Card } from "../Card"

test("should render title", async () => {
  render(<Card title="test" />)

  await screen.findByTestId("card")

  expect(screen.getByTestId("card-title").innerText).toBe("test")
})
