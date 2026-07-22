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
 * (export JSON). `onSave` is the only external dependency — save touches
 * IndexedDB (see sandbox/page.tsx), everything else is a direct store
 * action or the shared exportCanvasAsJson helper.
 *
 * Undo/redo are skipped while focus is inside a text field (input/textarea/
 * contentEditable/select) so Ctrl+Z edits that field's own text via the
 * browser's native undo instead of reverting the whole canvas out from
 * under whatever the user is typing — Save/Export stay global regardless of
 * focus, since neither conflicts with in-field editing.
 */
export function useCanvasShortcuts(onSave: () => void) {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const openComponentPicker = useCanvasStore((s) => s.openComponentPicker);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;

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
        exportCanvasAsJson();
        return;
      }
      if (isEditableTarget(event.target)) return;

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
  }, [onSave, undo, redo, openComponentPicker]);
}
