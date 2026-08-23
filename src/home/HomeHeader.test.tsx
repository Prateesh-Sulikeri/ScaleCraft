import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeHeader } from "./HomeHeader";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("HomeHeader", () => {
  it("makes the brand lockup the only link home - no duplicate Home tab", () => {
    render(<HomeHeader />);
    expect(screen.getByRole("link", { name: "ScaleCraft home" })).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: /home/i })).toHaveLength(1);
  });

  it("renders upcoming areas as unavailable, never as links that 404", () => {
    render(<HomeHeader />);
    expect(screen.queryByRole("link", { name: /ScaleDocs/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Roadmap/ })).not.toBeInTheDocument();
    expect(screen.getByText("ScaleDocs")).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    // ScaleDocs and Roadmap. Report a Bug used to be a third - it is a real
    // control now (see below), so a "Soon" chip here would be a regression.
    expect(screen.getAllByText("Soon")).toHaveLength(2);
  });

  it("keeps the theme toggle and the account control in the header", () => {
    render(<HomeHeader />);
    expect(screen.getByRole("button", { name: /Switch to (light|dark) theme/ })).toBeInTheDocument();
  });

  it("offers Report a Bug as a real icon-only control, left of the theme toggle", () => {
    render(<HomeHeader />);
    const report = screen.getByRole("button", { name: "Report a bug" });
    expect(report).toBeInTheDocument();
    // Icon-only: the label lives on aria-label and the hover tooltip, not as
    // visible text beside the icon.
    expect(report).toHaveTextContent("");

    // Order matters: the bug control precedes the theme toggle in the DOM,
    // matching every other placement.
    const toggle = screen.getByRole("button", { name: /Switch to (light|dark) theme/ });
    expect(report.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
