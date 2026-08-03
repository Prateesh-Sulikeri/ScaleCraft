import { describe, it, expect, beforeAll } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore } from "@/canvas/canvas-test-utils";
import { ShortcutsButton } from "./ShortcutsButton";
import { ShortcutsModal } from "./ShortcutsModal";

beforeAll(() => {
  // jsdom has no matchMedia; ShortcutsModal's useViewportWidth reads it
  // unconditionally. Same stub as ThemeToggle.test.tsx's next-themes workaround.
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
});

function renderButtonAndModal() {
  return renderWithCanvasStore(
    <>
      <ShortcutsButton />
      <ShortcutsModal />
    </>,
  );
}

describe("ShortcutsButton", () => {
  it("keeps the shortcuts modal closed by default", () => {
    renderButtonAndModal();
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();
  });

  it("opens the modal on click, reflecting aria-pressed", () => {
    renderButtonAndModal();
    const button = screen.getByRole("button", { name: "Keyboard shortcuts" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Add component")).toBeInTheDocument();
  });

  it("closes the modal on a second click", () => {
    renderButtonAndModal();
    const button = screen.getByRole("button", { name: "Keyboard shortcuts" });
    fireEvent.click(button);
    expect(screen.getByText("Add component")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();
  });

  it("stays in sync with the store's shortcutsModalOpen flag set from elsewhere (e.g. the Shift+/ shortcut)", () => {
    const { api } = renderButtonAndModal();
    expect(screen.queryByText("Add component")).not.toBeInTheDocument();

    act(() => {
      api.getState().toggleShortcutsModal();
    });
    expect(screen.getByText("Add component")).toBeInTheDocument();
  });
});
