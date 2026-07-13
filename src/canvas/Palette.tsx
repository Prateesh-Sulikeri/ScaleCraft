"use client";

import { componentRegistry } from "@/content/components/registry";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import { Server } from "lucide-react";

/** The MIME type used to identify a drag as "a component from our palette"
 * vs. an arbitrary browser drag (e.g. dragging a link/image onto the page). */
export const PALETTE_DRAG_TYPE = "application/scalecraft-component";

export function Palette() {
  return (
    <aside className="w-56 shrink-0 border-r border-border p-3 overflow-y-auto">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Components
      </h2>
      <div className="flex flex-col gap-2">
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
              className="flex cursor-grab items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm active:cursor-grabbing"
              style={{ borderLeft: `3px solid ${categoryColorVar[definition.category]}` }}
            >
              <Icon size={14} style={{ color: categoryColorVar[definition.category] }} />
              <span>{definition.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
