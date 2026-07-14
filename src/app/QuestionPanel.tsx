"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Palette } from "@/canvas/Palette";
import { useResizableWidth } from "@/lib/use-resizable-width";

type QuestionPanelProps = {
  /** Short instructional line shown above the palette. Once the chapter
   * framework lands (milestone 5, see .claude/docs/MILESTONES.md) this slot
   * holds a chapter's problem statement and learning objectives instead —
   * Sandbox has no chapter, so it gets a plain how-to-use-this-mode line
   * passed in from the route instead of hardcoded here. */
  intro: string;
};

/**
 * The left panel. Kept as its own collapsible component rather than folded
 * into page.tsx specifically so the intro/problem-statement slot doesn't
 * need re-plumbing when chapters arrive. Validation feedback lives at the
 * Validate button itself now (see ValidationIndicator), not here — it never
 * belonged to "the question," and there was no upside to burying it in a
 * side panel.
 */
export function QuestionPanel({ intro }: QuestionPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { width, onMouseDown } = useResizableWidth(320, 220, 480, "right");

  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-border py-3">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand question panel"
          className="text-foreground/60 hover:text-foreground"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0">
      <aside style={{ width }} className="flex shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse question panel"
            className="text-foreground/40 hover:text-foreground"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
        <p className="border-b border-border px-3 pb-3 pt-2 text-sm text-foreground/70">{intro}</p>
        <div className="min-h-0 flex-1">
          <Palette />
        </div>
      </aside>
      <div
        onMouseDown={onMouseDown}
        className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
      />
    </div>
  );
}
