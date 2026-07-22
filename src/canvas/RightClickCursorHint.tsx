"use client";

import { createPortal } from "react-dom";
import { MouseLeft, MouseRight } from "lucide-react";

/**
 * A cursor-following graphic teaching "right-click to add a component" —
 * distinct from the static discoverability pill (sandbox/page.tsx), which
 * only names the gesture in text. This shows it: the right mouse button
 * rendered active/filled, the left one muted, exactly mirroring the
 * two-button reference graphic product direction asked for, literally at
 * the cursor rather than in a fixed corner. Shares the same one-time
 * dismiss flag as the pill (see Canvas.tsx) — dismissing either hides both,
 * since they teach the same thing.
 */
export function RightClickCursorHint({ pos }: { pos: { x: number; y: number } }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-[var(--z-tooltip)] flex flex-col items-center gap-1"
      style={{ left: pos.x + 14, top: pos.y + 10 }}
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
