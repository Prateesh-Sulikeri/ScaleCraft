import { act, render, cleanup } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CanvasStoreProvider, useCanvasStoreApi } from "./store";
import { useCanvasShortcuts } from "./use-canvas-shortcuts";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

let storeApi: ReturnType<typeof useCanvasStoreApi>;

function Harness() {
  const api = useCanvasStoreApi();
  // Assigning in an effect, not during render, keeps this a pure component
  // as far as the React Compiler's purity lint is concerned — the module
  // -level `storeApi` only exists so the tests below can reach into the
  // same store instance the hook under test is bound to.
  useEffect(() => {
    storeApi = api;
  }, [api]);
  useCanvasShortcuts(() => {});
  return null;
}

// Every mutation below runs inside act() — the hook's window keydown
// listener is rebound on every render (its effect deps include nodes/edges,
// see use-canvas-shortcuts.ts), so a store update whose re-render hasn't
// flushed yet would leave a stale listener closed over the pre-mutation
// nodes/edges in place when the next keydown fires.
function mutate(fn: () => void) {
  act(fn);
}

function keydown(init: KeyboardEventInit) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
  });
}

describe("useCanvasShortcuts", () => {
  beforeEach(() => {
    act(() => {
      render(
        <CanvasStoreProvider>
          <Harness />
        </CanvasStoreProvider>,
      );
    });
  });

  afterEach(() => cleanup());

  it("duplicates every selected node on Ctrl/Cmd+D, leaving unselected nodes alone", () => {
    mutate(() => {
      storeApi.getState().addNode(component("client"), { x: 0, y: 0 });
      storeApi.getState().addNode(component("app-server"), { x: 300, y: 0 });
    });
    const [a, b] = storeApi.getState().nodes;
    mutate(() => {
      storeApi.setState({
        nodes: storeApi.getState().nodes.map((n) => (n.id === a.id ? { ...n, selected: true } : n)),
      });
    });

    keydown({ key: "d", ctrlKey: true });

    const nodes = storeApi.getState().nodes;
    expect(nodes).toHaveLength(3);
    // The unselected node's own id survives untouched; only the selected one grew a clone.
    expect(nodes.some((n) => n.id === b.id)).toBe(true);
  });

  it("does nothing on Ctrl/Cmd+D when nothing is selected", () => {
    mutate(() => storeApi.getState().addNode(component("client"), { x: 0, y: 0 }));
    keydown({ key: "d", ctrlKey: true });
    expect(storeApi.getState().nodes).toHaveLength(1);
  });

  it("selects every node and edge on Ctrl/Cmd+A", () => {
    mutate(() => {
      storeApi.getState().addNode(component("client"), { x: 0, y: 0 });
      storeApi.getState().addNode(component("app-server"), { x: 300, y: 0 });
    });
    const [a, b] = storeApi.getState().nodes;
    mutate(() => {
      storeApi
        .getState()
        .onConnect({ source: a.id, target: b.id, sourceHandle: null, targetHandle: null }, "request-flow");
    });

    keydown({ key: "a", ctrlKey: true });

    expect(storeApi.getState().nodes.every((n) => n.selected)).toBe(true);
    expect(storeApi.getState().edges.every((e) => e.selected)).toBe(true);
  });

  it("exits focus notes mode on Escape", () => {
    mutate(() => storeApi.getState().setFocusMode(true));
    expect(storeApi.getState().docsPanel.focusMode).toBe(true);

    keydown({ key: "Escape" });

    expect(storeApi.getState().docsPanel.focusMode).toBe(false);
  });

  it("leaves Escape a no-op when not in focus mode", () => {
    keydown({ key: "Escape" });
    expect(storeApi.getState().docsPanel.focusMode).toBe(false);
  });
});
