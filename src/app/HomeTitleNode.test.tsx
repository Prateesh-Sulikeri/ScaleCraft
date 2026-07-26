import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeTitleNode, HOME_TITLE_NODE_WIDTH } from "./HomeTitleNode";

describe("HomeTitleNode", () => {
  it("renders the ScaleCraft mark and tagline", () => {
    render(<HomeTitleNode />);
    expect(screen.getByText("ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText("Design real systems. Understand every trade-off.")).toBeInTheDocument();
  });

  it("exports its fixed node width for HomeCanvas's layout math", () => {
    expect(HOME_TITLE_NODE_WIDTH).toBe(420);
  });
});
