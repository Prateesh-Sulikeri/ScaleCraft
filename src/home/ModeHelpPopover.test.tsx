import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeHelpPopover } from "./ModeHelpPopover";

const TRIGGER = { name: "Which mode should I use?" };

describe("ModeHelpPopover", () => {
  it("stays closed until asked - explanations are opt-in", () => {
    render(<ModeHelpPopover />);
    expect(screen.getByRole("button", TRIGGER)).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains all three modes when opened", () => {
    render(<ModeHelpPopover />);
    fireEvent.click(screen.getByRole("button", TRIGGER));
    const popover = screen.getByRole("dialog", TRIGGER);
    expect(popover).toBeInTheDocument();
    expect(screen.getByText("Building Blocks")).toBeInTheDocument();
    expect(screen.getByText("Real World Extraction")).toBeInTheDocument();
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("toggles closed on a second click of the trigger", () => {
    render(<ModeHelpPopover />);
    const trigger = screen.getByRole("button", TRIGGER);
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on an outside click", () => {
    render(
      <div>
        <ModeHelpPopover />
        <button>outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", TRIGGER));
    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<ModeHelpPopover />);
    fireEvent.click(screen.getByRole("button", TRIGGER));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays open on a click inside itself", () => {
    render(<ModeHelpPopover />);
    fireEvent.click(screen.getByRole("button", TRIGGER));
    fireEvent.mouseDown(screen.getByText("Sandbox"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
