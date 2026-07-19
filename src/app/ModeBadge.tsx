"use client";

import { useEffect, useRef, useState } from "react";
import { type AppMode, modeColorVar, modeDescription, modeLabel, modeTagline } from "@/lib/modes";

type ModeBadgeProps = { mode: AppMode };

/**
 * The always-visible answer to "which mode am I in" — colored per mode
 * (see globals.css's `--mode-*` tokens and .claude/docs/DESIGN_LANGUAGE.md's
 * "Mode color" section) so it reads at a glance, not just as text. Purpose/
 * scope text is opt-in (click), not shown by default — same "explanation
 * available, never forced" posture as validation hints, just applied to mode
 * identity instead of a validation failure.
 */
export function ModeBadge({ mode }: ModeBadgeProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const color = modeColorVar[mode];

  useEffect(() => {
    if (!open) return;
    // Capture phase, not bubble: react-flow's node-drag handling calls
    // stopPropagation() on a node's own mousedown, so a bubble-phase
    // listener here never sees a click on a node (confirmed live — the
    // popover stayed open indefinitely after clicking any node). Capture
    // fires top-down before that stopPropagation can block it, so this
    // still closes on a click anywhere on the canvas, node included.
    const onDocMouseDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as HTMLElement)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown, true);
    return () => document.removeEventListener("mousedown", onDocMouseDown, true);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          borderColor: color,
          backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
          color,
        }}
        className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
      >
        {modeLabel[mode]}
      </button>

      {open && (
        <div
          style={{ borderTopColor: color, borderTopWidth: 2 }}
          className="absolute left-0 z-[var(--z-dropdown)] mt-2 w-72 rounded-md border border-border bg-panel p-3 shadow-lg"
        >
          <p className="text-sm font-medium">{modeTagline[mode]}</p>
          <p className="mt-1.5 text-sm text-foreground/70">{modeDescription[mode]}</p>
        </div>
      )}
    </div>
  );
}
