"use client";

import { Keyboard } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import { Tooltip } from "@/app/Tooltip";

/**
 * Header trigger for ShortcutsModal.tsx — top-right of the header, alongside
 * the other icon-only controls (ThemeToggle). Reads/writes the store's
 * shortcutsModalOpen directly (like NodeConfigPopover/ContextMenu do for
 * openDocTab) rather than local component state, since the global Shift+/
 * shortcut (use-canvas-shortcuts.ts) needs to reach the same open flag from
 * outside this component's render tree.
 */
export function ShortcutsButton() {
  const open = useCanvasStore((s) => s.shortcutsModalOpen);
  const toggleShortcutsModal = useCanvasStore((s) => s.toggleShortcutsModal);

  return (
    <Tooltip label="Keyboard shortcuts (?)">
      <button
        onClick={toggleShortcutsModal}
        aria-label="Keyboard shortcuts"
        aria-pressed={open}
        className={`flex h-8 w-8 items-center justify-center rounded-md border border-border hover:text-foreground ${
          open ? "bg-border text-foreground" : "bg-panel text-foreground/70"
        }`}
      >
        <Keyboard size={16} />
      </button>
    </Tooltip>
  );
}
