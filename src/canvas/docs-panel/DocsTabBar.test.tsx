import { describe, it, expect, beforeAll } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore, stubResizeObserver } from "../canvas-test-utils";
import { DocsTabBar } from "./DocsTabBar";

beforeAll(() => {
  stubResizeObserver();
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
});

function openTab(api: ReturnType<typeof renderWithCanvasStore>["api"], componentId: string) {
  act(() => {
    api.getState().openDocTab(componentId);
  });
}

describe("DocsTabBar", () => {
  it("renders nothing when there are no open tabs", () => {
    const { container } = renderWithCanvasStore(<DocsTabBar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a tab per open doc, using the component's label", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "client");
    openTab(api, "cache");
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cache" })).toBeInTheDocument();
  });

  it("does not show a Close all button with only one tab open", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "client");
    expect(screen.queryByRole("button", { name: /close all/i })).not.toBeInTheDocument();
  });

  it("switches the active tab when a tab label is clicked", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "client");
    openTab(api, "cache");
    expect(api.getState().docsPanel.activeTabId).toBe("cache");
    fireEvent.click(screen.getByRole("button", { name: "Client" }));
    expect(api.getState().docsPanel.activeTabId).toBe("client");
  });

  it("closes a single tab via its close button", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "client");
    openTab(api, "cache");
    fireEvent.click(screen.getByRole("button", { name: "Close Client tab" }));
    expect(api.getState().docsPanel.tabs.map((t) => t.componentId)).toEqual(["cache"]);
  });

  it("shows and wires up Close all once more than one tab is open", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "client");
    openTab(api, "cache");
    fireEvent.click(screen.getByRole("button", { name: /close all/i }));
    expect(api.getState().docsPanel.tabs).toEqual([]);
    expect(api.getState().docsPanel.activeTabId).toBeNull();
  });

  it("falls back to the raw componentId label for an unknown/removed component", () => {
    const { api } = renderWithCanvasStore(<DocsTabBar />);
    openTab(api, "not-a-real-component");
    expect(screen.getByRole("button", { name: "not-a-real-component" })).toBeInTheDocument();
  });
});
