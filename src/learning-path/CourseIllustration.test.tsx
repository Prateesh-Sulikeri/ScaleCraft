import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CourseIllustration } from "./CourseIllustration";

describe("CourseIllustration", () => {
  it("draws the cube for Building Blocks and the extracted globe panel for Real World Extraction", () => {
    const bb = render(<CourseIllustration courseId="building-blocks" />);
    expect(bb.container.querySelector('[data-illustration="cube"]')).toBeInTheDocument();

    const rwe = render(<CourseIllustration courseId="real-world-extraction" />);
    expect(rwe.container.querySelector('[data-illustration="globe"]')).toBeInTheDocument();
  });

  it("is decorative - hidden from assistive tech, since the header's title carries the meaning", () => {
    const { container } = render(<CourseIllustration courseId="real-world-extraction" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
