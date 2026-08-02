import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { QuizDifficultyDots } from "./QuizDifficultyDots";

describe("QuizDifficultyDots", () => {
  it("renders 3 dots for difficulty 1 (foundational)", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots).toHaveLength(3);
  });

  it("colors first dot as state-valid for difficulty 1", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0]).toHaveClass("bg-state-valid");
  });

  it("colors remaining dots as border for difficulty 1", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[1]).toHaveClass("bg-border");
    expect(dots[2]).toHaveClass("bg-border");
  });

  it("colors first two dots as state-warning for difficulty 2", () => {
    const { container } = render(<QuizDifficultyDots difficulty={2} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0]).toHaveClass("bg-state-warning");
    expect(dots[1]).toHaveClass("bg-state-warning");
  });

  it("colors third dot as border for difficulty 2", () => {
    const { container } = render(<QuizDifficultyDots difficulty={2} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[2]).toHaveClass("bg-border");
  });

  it("colors all three dots as state-error for difficulty 3", () => {
    const { container } = render(<QuizDifficultyDots difficulty={3} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0]).toHaveClass("bg-state-error");
    expect(dots[1]).toHaveClass("bg-state-error");
    expect(dots[2]).toHaveClass("bg-state-error");
  });

  it("has aria-hidden attribute for accessibility", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("has correct spacing classes", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const span = container.querySelector("span");
    expect(span).toHaveClass("flex", "shrink-0", "items-center", "gap-0.5");
  });

  it("renders correct dot size", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const dots = container.querySelectorAll("span.rounded-full");
    dots.forEach((dot) => {
      expect(dot).toHaveClass("h-1.5", "w-1.5");
    });
  });

  it("handles difficulty 1 correctly", () => {
    const { container } = render(<QuizDifficultyDots difficulty={1} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0].className).toContain("bg-state-valid");
    expect(dots[1].className).toContain("bg-border");
    expect(dots[2].className).toContain("bg-border");
  });

  it("handles difficulty 2 correctly", () => {
    const { container } = render(<QuizDifficultyDots difficulty={2} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0].className).toContain("bg-state-warning");
    expect(dots[1].className).toContain("bg-state-warning");
    expect(dots[2].className).toContain("bg-border");
  });

  it("handles difficulty 3 correctly", () => {
    const { container } = render(<QuizDifficultyDots difficulty={3} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots[0].className).toContain("bg-state-error");
    expect(dots[1].className).toContain("bg-state-error");
    expect(dots[2].className).toContain("bg-state-error");
  });

  it("maintains correct dot order", () => {
    const { container } = render(<QuizDifficultyDots difficulty={2} />);
    const dots = Array.from(container.querySelectorAll("span.rounded-full"));
    expect(dots).toHaveLength(3);
    // Dots should be rendered in sequence
    const parentSpan = container.querySelector("span.flex");
    const children = Array.from(parentSpan?.children || []);
    expect(children.indexOf(dots[0])).toBeLessThan(children.indexOf(dots[1]));
    expect(children.indexOf(dots[1])).toBeLessThan(children.indexOf(dots[2]));
  });
});
