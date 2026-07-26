import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "./Callout";

describe("Callout", () => {
  it("renders a plain italic blockquote when there's no data-callout", () => {
    const { container } = render(<Callout>Just a quote</Callout>);
    const bq = container.querySelector("blockquote");
    expect(bq).toBeInTheDocument();
    expect(bq).toHaveClass("italic");
    expect(screen.getByText("Just a quote")).toBeInTheDocument();
  });

  it("renders a plain blockquote for an unrecognized data-callout value", () => {
    const { container } = render(<Callout data-callout="NOT_A_KIND">body</Callout>);
    expect(container.querySelector("blockquote")).toBeInTheDocument();
  });

  it.each([
    ["NOTE", "Note"],
    ["TIP", "Tip"],
    ["IMPORTANT", "Important"],
    ["WARNING", "Warning"],
    ["CAUTION", "Caution"],
  ])("renders a styled %s callout with the %s label", (kind, label) => {
    render(<Callout data-callout={kind}>content</Callout>);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
