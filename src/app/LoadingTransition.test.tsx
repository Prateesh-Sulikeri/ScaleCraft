import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingTransition } from "./LoadingTransition";

describe("LoadingTransition", () => {
  it("portals the given label to document.body", () => {
    render(<LoadingTransition label="Crafting your Sandbox…" />);
    // Portaled to document.body, not a descendant of the render container.
    expect(screen.getByText("Crafting your Sandbox…")).toBeInTheDocument();
    expect(document.body.textContent).toContain("Crafting your Sandbox…");
  });

  it("marks the status text as a polite live region", () => {
    render(<LoadingTransition label="Loading Sandbox…" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading Sandbox…");
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
