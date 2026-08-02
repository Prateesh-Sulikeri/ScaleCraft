import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeBadge } from "./ModeBadge";

describe("ModeBadge", () => {
  it("renders the mode label and keeps the tagline/description popover closed by default", () => {
    render(<ModeBadge mode="sandbox" />);
    expect(screen.getByRole("button", { name: "Sandbox" })).toBeInTheDocument();
    expect(screen.queryByText("Free exploration - no objectives, no scoring.")).not.toBeInTheDocument();
  });

  it("opens the tagline/description popover on click", () => {
    render(<ModeBadge mode="building-blocks" />);
    fireEvent.click(screen.getByRole("button", { name: "Building Blocks" }));
    expect(screen.getByText("Guided, constrained lessons - one concept at a time.")).toBeInTheDocument();
    expect(
      screen.getByText(/Only the components relevant to the lesson are available/),
    ).toBeInTheDocument();
  });

  it("toggles the popover closed on a second click of the badge", () => {
    render(<ModeBadge mode="real-world-extraction" />);
    const button = screen.getByRole("button", { name: "Real World Extraction" });
    fireEvent.click(button);
    expect(screen.getByText(/Apply what you've learned/)).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText(/Apply what you've learned/)).not.toBeInTheDocument();
  });

  it("closes the popover on an outside click (capture-phase document listener)", () => {
    render(
      <div>
        <ModeBadge mode="sandbox" />
        <button>outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sandbox" }));
    expect(screen.getByText("Free exploration - no objectives, no scoring.")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByText("Free exploration - no objectives, no scoring.")).not.toBeInTheDocument();
  });
});
