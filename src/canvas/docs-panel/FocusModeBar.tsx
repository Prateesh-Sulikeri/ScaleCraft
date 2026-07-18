"use client";

import { Minimize2 } from "lucide-react";
import { ThemeToggle } from "@/app/ThemeToggle";
import { useCanvasStore } from "../store";

/**
 * Replaces the full app header while Focus Notes Mode is active (see
 * page.tsx) — only Exit + ThemeToggle survive; Save/Undo/Redo/Export/
 * Import/Board/Validate all disappear since none apply to a canvas-less
 * reading view.
 */
export function FocusModeBar() {
  const setFocusMode = useCanvasStore((s) => s.setFocusMode);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
      <button
        onClick={() => setFocusMode(false)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
      >
        <Minimize2 size={14} />
        Exit focus mode
      </button>
      <ThemeToggle />
    </header>
  );
}
