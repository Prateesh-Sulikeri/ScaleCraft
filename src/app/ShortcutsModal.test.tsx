import { describe, it, expect, beforeAll } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore } from "@/canvas/canvas-test-utils";
import { ShortcutsModal } from "./ShortcutsModal";

beforeAll(() => {
  // jsdom has no matchMedia; useViewportWidth (use-large-screen.ts) reads it
  // unconditionally to size the shortcut columns. Same stub as
  // ThemeToggle.test.tsx's next-themes workaround.
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

function openModal(api: ReturnType<typeof renderWithCanvasStore>["api"]) {
  act(() => {
    api.getState().openShortcutsModal();
  });
}

describe("ShortcutsModal", () => {
  it("renders nothing when closed", () => {
    renderWithCanvasStore(<ShortcutsModal />);
    expect(screen.queryByText("Keyboard shortcuts")).not.toBeInTheDocument();
  });

  it("lists every section, grouped by use case, when open", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    expect(screen.getByText("Canvas navigation")).toBeInTheDocument();
    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByText("Components & documentation")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();

    // The newly-added canvas pan/zoom shortcuts are present, not just the
    // pre-existing editing ones.
    expect(screen.getByText("Fit entire graph to view")).toBeInTheDocument();
    expect(screen.getByText("Zoom in")).toBeInTheDocument();
    // "Pan canvas" appears twice (Space+Drag and Middle-click+Drag).
    expect(screen.getAllByText("Pan canvas")).toHaveLength(2);
    expect(screen.getByText("Open documentation for selected component")).toBeInTheDocument();
    expect(screen.getByText("Open keyboard shortcuts")).toBeInTheDocument();
  });

  it("filters to a single section when the search matches a section title", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "editing" },
    });

    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.queryByText("Canvas navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Pan canvas")).not.toBeInTheDocument();
  });

  it("filters to a single shortcut when the search matches its label", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "undo" },
    });

    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.queryByText("Redo")).not.toBeInTheDocument();
    expect(screen.queryByText("Duplicate selection")).not.toBeInTheDocument();
  });

  it("filters to a single shortcut when the search matches its key combo", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "ctrl/cmd+e" },
    });

    expect(screen.getByText("Export JSON")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("shows a no-results message when nothing matches", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "zzz-nonexistent" },
    });

    expect(screen.getByText(/No shortcuts match/)).toBeInTheDocument();
  });

  it("shows a clear button once there's search text, and clears it on click", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);

    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "undo" },
    });
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    expect(screen.queryByText("Redo")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByPlaceholderText("Search sections or shortcuts...")).toHaveValue("");
    expect(screen.getByText("Redo")).toBeInTheDocument();
  });

  it("clears the search once the modal closes, so reopening shows the full list again", () => {
    const { api } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);
    fireEvent.change(screen.getByPlaceholderText("Search sections or shortcuts..."), {
      target: { value: "undo" },
    });
    expect(screen.queryByText("Redo")).not.toBeInTheDocument();

    act(() => {
      api.getState().closeShortcutsModal();
    });
    openModal(api);

    expect(screen.getByPlaceholderText("Search sections or shortcuts...")).toHaveValue("");
    expect(screen.getByText("Redo")).toBeInTheDocument();
  });

  it("closes on backdrop click and clears shortcutsModalOpen", () => {
    const { api, container } = renderWithCanvasStore(<ShortcutsModal />);
    openModal(api);
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();

    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(screen.queryByText("Keyboard shortcuts")).not.toBeInTheDocument();
    expect(api.getState().shortcutsModalOpen).toBe(false);
  });
});
