"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
const COLLAPSED_WIDTH = 40;

export function QuestionPanel({ intro }: QuestionPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { width, onMouseDown } = useResizableWidth(320, 220, 480, "right");

  return (
    <div className="flex shrink-0">
      <aside
        style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
        className="flex shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      >
        <div
          className={`flex shrink-0 items-center px-3 pt-3 ${
            collapsed ? "flex-col gap-3" : "justify-between"
          }`}
        >
          <Link
            href="/"
            aria-label="Back to Home"
            className="text-foreground/60 hover:text-foreground"
          >
            <Home size={collapsed ? 16 : 14} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand question panel" : "Collapse question panel"}
            className="text-foreground/60 hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <p className="border-b border-border px-3 pb-3 pt-2 text-sm text-foreground/70">{intro}</p>
          <div className="min-h-0 flex-1">
            <Palette />
          </div>
        </div>
      </aside>
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
        />
      )}
    </div>
  );
}
