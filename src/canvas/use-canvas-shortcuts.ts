"use client";

import { useEffect } from "react";
import { useCanvasStore } from "./store";
import { exportCanvasAsJson } from "./export-json";
import type { ComponentNodeType } from "./types";

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
 * Duplicate/select-all/lock are gated on both the component picker being
 * closed (it owns Up/Down/Enter/Escape for its own list while open — see
 * ComponentPicker.tsx) and focus notes mode being off (the canvas isn't
 * interactable there, just hidden — see DocsPanel.tsx/sandbox/page.tsx), so
 * a shortcut aimed at "the canvas" never silently acts on it from underneath
 * one of those two surfaces.
 *
 * Ctrl/Cmd+Shift+L toggles lock on selected zone/comment/flag nodes (see
 * toggleAnnotationLock in store.tsx) — Shift+L, not bare Ctrl/Cmd+L, since
 * that's the browser's own address-bar focus shortcut. Matches Figma's lock
 * binding. Non-annotation nodes in the selection are silently skipped
 * (toggleAnnotationLock is already a no-op on them); a selection with zero
 * lockable nodes does nothing, same as duplicate on an empty selection.
 *
 * Shift+/ (i.e. "?") toggles ShortcutsModal.tsx via the store's
 * shortcutsModalOpen — checked via `event.code === "Slash"` rather than
 * `event.key === "?"`, same layout-compatibility reasoning as Canvas.tsx's
 * Shift+1/Shift+2 (the physical key position is stable across layouts even
 * when the shifted character it produces isn't). Works everywhere except
 * editable fields, so typing a literal "?" isn't hijacked.
 *
 * Ctrl/Cmd+/ opens documentation (openDocTab) for the first selected
 * component node, mirroring ContextMenu.tsx's "Open Documentation" - a
 * no-op with nothing selected, same as duplicate/select-all. Kept apart from
 * bare "/" (add component) and Shift+/ (this shortcuts modal) as the third,
 * modifier-only member of the "/" family.
 *
 * Escape closes ShortcutsModal.tsx when it's open — checked first, ahead of
 * the focus-mode-exit Escape below, so opening the modal from inside focus
 * mode and pressing Escape once closes just the modal (not both at once).
 *
 * While a blocking (non-interactive) guided-tour step is showing
 * (store.tsx's tourModalActive, set by TourOverlay.tsx from its own
 * `isModal`), every hotkey below the two Escape branches is swallowed. A
 * blocking step has nothing for the learner to do in the app behind the
 * tour's backdrop, so Ctrl+Z/Ctrl+D/Shift+L/`/` firing underneath it (real,
 * reachable if focus happened to still be on the canvas from before the
 * tour opened) would silently act on a board the step gives no on-screen
 * indication is still live. Escape itself stays unguarded — the tour has
 * its own Escape handler (TourOverlay.tsx) that pauses the run, and letting
 * these two branches also run alongside it is existing, unrelated behavior
 * this doesn't change. An *interactive* step leaves tourModalActive false,
 * so a gesture step's real shortcuts (if any) are never touched.
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
  const toggleAnnotationLock = useCanvasStore((s) => s.toggleAnnotationLock);
  const componentPicker = useCanvasStore((s) => s.componentPicker);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);
  const tourModalActive = useCanvasStore((s) => s.tourModalActive);
  const setFocusMode = useCanvasStore((s) => s.setFocusMode);
  const shortcutsModalOpen = useCanvasStore((s) => s.shortcutsModalOpen);
  const toggleShortcutsModal = useCanvasStore((s) => s.toggleShortcutsModal);
  const closeShortcutsModal = useCanvasStore((s) => s.closeShortcutsModal);
  const openDocTab = useCanvasStore((s) => s.openDocTab);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;

      if (event.key === "Escape" && shortcutsModalOpen) {
        event.preventDefault();
        closeShortcutsModal();
        return;
      }

      if (event.key === "Escape" && focusMode && !componentPicker) {
        event.preventDefault();
        setFocusMode(false);
        return;
      }

      if (tourModalActive) return;

      // Shift+/ ("?") — checked before every other branch below (including
      // the bare-`/` one right after) since it's neither a bare key nor a
      // mod combo. See the doc comment above for the event.code reasoning.
      if (event.shiftKey && event.code === "Slash" && !isEditableTarget(event.target)) {
        event.preventDefault();
        toggleShortcutsModal();
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
      if (key === "l" && event.shiftKey && !componentPicker && !focusMode) {
        event.preventDefault();
        nodes
          .filter((n) => n.selected && (n.type === "zone" || n.type === "comment" || n.type === "start"))
          .forEach((n) => toggleAnnotationLock(n.id));
        return;
      }
      if (key === "/" && !componentPicker && !focusMode) {
        event.preventDefault();
        const selected = nodes.find(
          (n): n is ComponentNodeType => n.selected === true && n.type === "component",
        );
        if (selected) openDocTab(selected.data.componentId);
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
    toggleAnnotationLock,
    componentPicker,
    focusMode,
    tourModalActive,
    setFocusMode,
    shortcutsModalOpen,
    toggleShortcutsModal,
    closeShortcutsModal,
    openDocTab,
  ]);
}
