import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShortcutsButton } from "./ShortcutsButton";

describe("ShortcutsButton", () => {
  it("keeps the shortcuts list closed by default", () => {
    render(<ShortcutsButton />);
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();
  });

  it("shows a hover tooltip before the dropdown is opened", () => {
    render(<ShortcutsButton />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Keyboard shortcuts" }));
    // Two "Keyboard shortcuts" texts can legitimately coexist (button label +
    // tooltip caption) — assert the tooltip caption specifically exists.
    expect(screen.getAllByText("Keyboard shortcuts").length).toBeGreaterThanOrEqual(1);
  });

  it("hides the hover tooltip on mouse leave", () => {
    render(<ShortcutsButton />);
    const button = screen.getByRole("button", { name: "Keyboard shortcuts" });
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    // Only the button's own accessible name remains; no floating tooltip.
    expect(screen.queryAllByText("Keyboard shortcuts")).toHaveLength(0);
  });

  it("opens the full shortcuts list on click, listing every shortcut", () => {
    render(<ShortcutsButton />);
    fireEvent.click(screen.getByRole("button", { name: "Keyboard shortcuts" }));

    expect(screen.getByText("Add component")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.getByText("Redo")).toBeInTheDocument();
    expect(screen.getByText("Export JSON")).toBeInTheDocument();
    expect(screen.getByText("Delete selection")).toBeInTheDocument();
    expect(screen.getByText("Cancel placement / close popovers")).toBeInTheDocument();
  });

  it("closes the dropdown on a second click", () => {
    render(<ShortcutsButton />);
    const button = screen.getByRole("button", { name: "Keyboard shortcuts" });
    fireEvent.click(button);
    expect(screen.getByText("Add component")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();
  });

  it("closes the dropdown when the backdrop is clicked", () => {
    const { container } = render(<ShortcutsButton />);
    fireEvent.click(screen.getByRole("button", { name: "Keyboard shortcuts" }));
    expect(screen.getByText("Add component")).toBeInTheDocument();

    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();
  });
});
