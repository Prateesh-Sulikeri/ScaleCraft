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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { isEditableTarget, useCanvasShortcuts } from "./use-canvas-shortcuts";
import { CanvasStoreProvider, useCanvasStoreApi } from "./store";

function wrapper({ children }: { children: ReactNode }) {
  return <CanvasStoreProvider>{children}</CanvasStoreProvider>;
}

function fireKey(init: Partial<KeyboardEventInit> & { key: string }, target: EventTarget = window) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe("isEditableTarget", () => {
  it("is true for input/textarea/select and contentEditable elements", () => {
    expect(isEditableTarget(document.createElement("input"))).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
    expect(isEditableTarget(document.createElement("select"))).toBe(true);
    const div = document.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    expect(isEditableTarget(div)).toBe(true);
  });

  it("is false for a plain element, and for null/non-element targets", () => {
    // jsdom doesn't implement `isContentEditable` (always undefined, never a
    // real boolean — see jsdom/jsdom#1670), so a plain div can fall through
    // to that final `||` operand and return undefined rather than a coerced
    // `false`; toBeFalsy() is the right assertion for an environment gap,
    // not a real behavior difference from a browser.
    expect(isEditableTarget(document.createElement("div"))).toBeFalsy();
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({} as EventTarget)).toBe(false);
  });
});

describe("useCanvasShortcuts", () => {
  let onSave: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onSave = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Ctrl/Cmd+S calls onSave and prevents the default browser save dialog", () => {
    renderHook(() => useCanvasShortcuts(onSave), { wrapper });
    const event = fireKey({ key: "s", ctrlKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("Cmd+S (metaKey) also triggers save", () => {
    renderHook(() => useCanvasShortcuts(onSave), { wrapper });
    fireKey({ key: "s", metaKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("bare 's' (no modifier) does not trigger save", () => {
    renderHook(() => useCanvasShortcuts(onSave), { wrapper });
    fireKey({ key: "s" });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("Ctrl+Z undoes the last action and Ctrl+Shift+Z / Ctrl+Y redo it", () => {
    // Verified through real store state (add a zone, then undo/redo it)
    // rather than spying on the store's action functions directly — a
    // rebind via useCanvasStore((s) => s.undo) only happens on a re-render,
    // so a spy installed after mount (patching the object getState()
    // returns) never reaches the closure useCanvasShortcuts already
    // captured, and asserting on real behavior is what the task actually
    // cares about anyway.
    let api: ReturnType<typeof useCanvasStoreApi> | undefined;
    function Capture() {
      api = useCanvasStoreApi();
      useCanvasShortcuts(onSave);
      return null;
    }
    renderHook(() => null, {
      wrapper: ({ children }) => (
        <CanvasStoreProvider>
          <Capture />
          {children}
        </CanvasStoreProvider>
      ),
    });

    act(() => {
      api!.getState().addZone({ x: 0, y: 0 });
    });
    expect(api!.getState().nodes).toHaveLength(1);

    fireKey({ key: "z", ctrlKey: true });
    expect(api!.getState().nodes).toHaveLength(0);

    fireKey({ key: "z", ctrlKey: true, shiftKey: true });
    expect(api!.getState().nodes).toHaveLength(1);

    fireKey({ key: "z", ctrlKey: true });
    expect(api!.getState().nodes).toHaveLength(0);

    fireKey({ key: "y", ctrlKey: true });
    expect(api!.getState().nodes).toHaveLength(1);
  });

  it("undo/redo are skipped while focus is inside an editable field", () => {
    let api: ReturnType<typeof useCanvasStoreApi> | undefined;
    function Capture() {
      api = useCanvasStoreApi();
      useCanvasShortcuts(onSave);
      return null;
    }
    renderHook(() => null, {
      wrapper: ({ children }) => (
        <CanvasStoreProvider>
          <Capture />
          {children}
        </CanvasStoreProvider>
      ),
    });

    act(() => {
      api!.getState().addZone({ x: 0, y: 0 });
    });
    expect(api!.getState().nodes).toHaveLength(1);

    const input = document.createElement("input");
    document.body.appendChild(input);

    fireKey({ key: "z", ctrlKey: true }, input);
    expect(api!.getState().nodes).toHaveLength(1);

    document.body.removeChild(input);
  });

  it("Ctrl+E exports the current canvas as JSON", () => {
    global.URL.createObjectURL = vi.fn(() => "blob:mock");
    global.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = realCreateElement(tag);
      if (tag === "a") el.click = clickSpy;
      return el;
    });

    renderHook(() => useCanvasShortcuts(onSave), { wrapper });
    fireKey({ key: "e", ctrlKey: true });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("bare '/' opens the component picker (and is prevented) when focus isn't in an editable field", () => {
    let api: ReturnType<typeof useCanvasStoreApi> | undefined;
    function Capture() {
      api = useCanvasStoreApi();
      useCanvasShortcuts(onSave);
      return null;
    }
    renderHook(() => null, {
      wrapper: ({ children }) => (
        <CanvasStoreProvider>
          <Capture />
          {children}
        </CanvasStoreProvider>
      ),
    });

    expect(api!.getState().componentPicker).toBe(false);
    const event = fireKey({ key: "/" });
    expect(api!.getState().componentPicker).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("bare '/' inside an editable field does not open the picker (lets it type a literal slash)", () => {
    let api: ReturnType<typeof useCanvasStoreApi> | undefined;
    function Capture() {
      api = useCanvasStoreApi();
      useCanvasShortcuts(onSave);
      return null;
    }
    renderHook(() => null, {
      wrapper: ({ children }) => (
        <CanvasStoreProvider>
          <Capture />
          {children}
        </CanvasStoreProvider>
      ),
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    fireKey({ key: "/" }, input);
    expect(api!.getState().componentPicker).toBe(false);
    document.body.removeChild(input);
  });

  it("removes its window listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useCanvasShortcuts(onSave), { wrapper });
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
