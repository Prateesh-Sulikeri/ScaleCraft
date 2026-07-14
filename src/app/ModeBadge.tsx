"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The only always-visible answer to "which mode am I in" — everything else
 * in the header (title, subtitle) reads the same regardless of mode. Once
 * chapters exist (milestone 5+) this becomes one of several labels
 * (Building Blocks / Real World Extraction / Sandbox), so it's built as a
 * disclosure now rather than sandbox-specific copy baked into the header.
 * Purpose/scope text is opt-in (click), not shown by default — same
 * "explanation available, never forced" posture as validation hints, just
 * applied to mode identity instead of a validation failure.
 */
export function ModeBadge() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="rounded-full border border-border bg-panel px-2.5 py-0.5 text-xs font-medium text-foreground/70 hover:border-foreground/30 hover:text-foreground"
      >
        Sandbox
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-72 rounded-md border border-border bg-panel p-3 shadow-lg">
          <p className="text-sm font-medium">Free exploration — no objectives, no scoring.</p>
          <p className="mt-1.5 text-sm text-foreground/70">
            Build anything with the full component library. Validate still checks structural
            rules (e.g. no direct client→database calls), but there&apos;s no single correct
            answer here to match — this is the mode for trying things out.
          </p>
        </div>
      )}
    </div>
  );
}
