"use client";

import { useEffect } from "react";
import { useCanvasStore } from "./store";
import { exportCanvasAsJson } from "./export-json";

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Global keyboard shortcuts for the sandbox canvas: Ctrl/Cmd+S (save),
 * Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y (redo), Ctrl/Cmd+E
 * (export JSON), Ctrl/Cmd+D (duplicate selection), Ctrl/Cmd+A (select all),
 * and Escape to exit focus notes mode. `onSave` is the only external
 * dependency — save touches IndexedDB (see sandbox/page.tsx), everything
 * else is a direct store action or the shared exportCanvasAsJson helper.
 *
 * Arrow-key nudging of selected nodes is NOT implemented here — xyflow
 * already ships it (5px/press, 4x with Shift; see its own NodeWrapper
 * onKeyDown, gated on `disableKeyboardA11y` which this app never sets), and
 * it already flows through the same controlled onNodesChange path this
 * store's undo history relies on. A first attempt at this hook added a
 * second, independent nudge handler without knowing that — the two stacked
 * (visually confirmed as compounded movement per keypress in a live
 * browser), so it was removed rather than kept as a redundant, buggy
 * duplicate. Just documented as a discoverable shortcut in ShortcutsButton.
 *
 * Undo/redo are skipped while focus is inside a text field (input/textarea/
 * contentEditable/select) so Ctrl+Z edits that field's own text via the
 * browser's native undo instead of reverting the whole canvas out from
 * under whatever the user is typing — Save/Export stay global regardless of
 * focus, since neither conflicts with in-field editing.
 *
 * Duplicate/select-all are gated on both the component picker being closed
 * (it owns Up/Down/Enter/Escape for its own list while open — see
 * ComponentPicker.tsx) and focus notes mode being off (the canvas isn't
 * interactable there, just hidden — see DocsPanel.tsx/sandbox/page.tsx), so
 * a shortcut aimed at "the canvas" never silently acts on it from underneath
 * one of those two surfaces.
 */
export function useCanvasShortcuts(onSave: () => void) {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const openComponentPicker = useCanvasStore((s) => s.openComponentPicker);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes);
  const componentPicker = useCanvasStore((s) => s.componentPicker);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);
  const setFocusMode = useCanvasStore((s) => s.setFocusMode);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;

      if (event.key === "Escape" && focusMode && !componentPicker) {
        event.preventDefault();
        setFocusMode(false);
        return;
      }

      // Checked before the `mod` early-return below — `/` is a bare
      // (non-modified) shortcut, same class as Delete/Backspace, not a
      // Ctrl/Cmd combo. preventDefault matters here specifically: Firefox
      // binds bare `/` to Quick Find.
      if (!mod && event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        openComponentPicker();
        return;
      }

      if (!mod) return;
      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        onSave();
        return;
      }
      if (key === "e") {
        event.preventDefault();
        exportCanvasAsJson(nodes, edges);
        return;
      }
      if (isEditableTarget(event.target)) return;

      if (key === "d" && !componentPicker && !focusMode) {
        event.preventDefault();
        const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
        if (selectedIds.length > 0) duplicateNodes(selectedIds);
        return;
      }
      if (key === "a" && !componentPicker && !focusMode) {
        event.preventDefault();
        onNodesChange(nodes.map((n) => ({ id: n.id, type: "select", selected: true })));
        onEdgesChange(edges.map((e) => ({ id: e.id, type: "select", selected: true })));
        return;
      }

      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
      } else if (key === "z") {
        event.preventDefault();
        undo();
      } else if (key === "y") {
        event.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    onSave,
    undo,
    redo,
    openComponentPicker,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    duplicateNodes,
    componentPicker,
    focusMode,
    setFocusMode,
  ]);
}
