import { describe, it, expect, beforeAll } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore, stubResizeObserver } from "../canvas-test-utils";
import { DocsPanel } from "./DocsPanel";

beforeAll(() => {
  stubResizeObserver();
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
});

function openTab(api: ReturnType<typeof renderWithCanvasStore>["api"], componentId: string) {
  act(() => {
    api.getState().openDocTab(componentId);
  });
}

describe("DocsPanel", () => {
  it("shows the empty state when no docs are open", () => {
    renderWithCanvasStore(<DocsPanel />);
    expect(screen.getByText(/no documentation open/i)).toBeInTheDocument();
  });

  it("renders the active tab's content instead of the empty state once a doc is open", () => {
    const { api } = renderWithCanvasStore(<DocsPanel />);
    openTab(api, "client");
    expect(screen.queryByText(/no documentation open/i)).not.toBeInTheDocument();
    expect(screen.getByText(/end user's device or application/i)).toBeInTheDocument();
  });

  it("minimizes the panel when the minimize button is clicked", () => {
    const { api } = renderWithCanvasStore(<DocsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /minimize documentation panel/i }));
    expect(api.getState().docsPanel.minimized).toBe(true);
  });

  it("enters focus mode and hides the resize handle + header actions", () => {
    const { api, container } = renderWithCanvasStore(<DocsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /enter focus notes mode/i }));
    expect(api.getState().docsPanel.focusMode).toBe(true);
    expect(screen.queryByRole("button", { name: /minimize documentation panel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enter focus notes mode/i })).not.toBeInTheDocument();
    expect(container.querySelector(".cursor-col-resize")).not.toBeInTheDocument();
  });
});
