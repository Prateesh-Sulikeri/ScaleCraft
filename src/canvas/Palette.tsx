"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Server } from "lucide-react";
import { componentRegistry } from "@/content/components/registry";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";

/** The MIME type used to identify a drag as "a component from our palette"
 * vs. an arbitrary browser drag (e.g. dragging a link/image onto the page). */
export const PALETTE_DRAG_TYPE = "application/scalecraft-component";

/**
 * A horizontal tray docked under the canvas. The registry will outgrow a
 * single screen width well before MVP (two Building Blocks chapters plus one
 * Real World Extraction chapter each add components — see
 * .claude/docs/MILESTONES.md) — `overflow-x-auto` is the fix for that: cards
 * never wrap or shrink to fit, the tray scrolls horizontally instead.
 */
export function Palette() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="shrink-0 border-t border-border">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-foreground/60 hover:text-foreground"
      >
        Components
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {!collapsed && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {componentRegistry.map((definition) => {
            const Icon = iconMap[definition.icon] ?? Server;
            return (
              <div
                key={definition.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(PALETTE_DRAG_TYPE, definition.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                className="flex shrink-0 cursor-grab items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm active:cursor-grabbing"
                style={{ borderLeft: `3px solid ${categoryColorVar[definition.category]}` }}
              >
                <Icon size={14} style={{ color: categoryColorVar[definition.category] }} />
                <span className="whitespace-nowrap">{definition.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
