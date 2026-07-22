"use client";

import { createPortal } from "react-dom";
import { MouseLeft, MouseRight } from "lucide-react";

/**
 * A literal cursor replacement teaching "right-click to add a component" —
 * distinct from the static discoverability pill (sandbox/page.tsx), which
 * only names the gesture in text. The canvas wrapper sets `cursor: none`
 * whenever this is mounted (see Canvas.tsx), so this graphic — the right
 * mouse button rendered active/filled, the left one muted — IS the
 * pointer, centered exactly on the real cursor position, not a tooltip
 * floating beside an unchanged native arrow. Shares the same one-time
 * dismiss flag as the pill (see Canvas.tsx) — dismissing either hides both,
 * since they teach the same thing.
 */
export function RightClickCursorHint({ pos }: { pos: { x: number; y: number } }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-[var(--z-tooltip)] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-2 py-1.5 shadow-lg">
        <MouseLeft size={18} className="text-foreground/30" />
        <MouseRight size={18} className="text-foreground" />
      </div>
      <span className="rounded bg-panel px-1.5 py-0.5 text-[11px] font-medium text-foreground/80 shadow-sm">
        Add
      </span>
    </div>,
    document.body,
  );
}
