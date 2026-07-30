import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes percent via aria-valuenow and the given label", () => {
    render(<ProgressBar percent={42} label="Unit 1 progress: 42%" />);
    const bar = screen.getByRole("progressbar", { name: "Unit 1 progress: 42%" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps percent below 0 and above 100", () => {
    const { rerender } = render(<ProgressBar percent={-10} label="test" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    rerender(<ProgressBar percent={150} label="test" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("uses the neutral fill by default, not accentColor", () => {
    render(<ProgressBar percent={50} label="test" />);
    const fill = screen.getByRole("progressbar").firstElementChild;
    expect(fill).toHaveClass("bg-foreground/70");
  });

  it("uses accentColor as an inline style when provided, instead of the neutral class", () => {
    render(<ProgressBar percent={50} label="test" accentColor="var(--mode-building-blocks)" />);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill).not.toHaveClass("bg-foreground/70");
    expect(fill.style.backgroundColor).toBe("var(--mode-building-blocks)");
  });
});
