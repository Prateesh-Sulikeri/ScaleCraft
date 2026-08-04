import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeBlueprintFrame } from "./HomeBlueprintFrame";

describe("HomeBlueprintFrame", () => {
  it("renders four decorative corner brackets and the tagline", () => {
    const { container } = render(<HomeBlueprintFrame />);
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(4);
    expect(screen.getByText("Build it. Break it. Understand why.")).toBeInTheDocument();
  });
});
