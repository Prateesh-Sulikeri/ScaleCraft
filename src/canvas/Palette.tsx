"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Server, SquareDashedBottom } from "lucide-react";
import { componentRegistry } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";
import { categoryColorVar, categoryLabel, categoryOrder } from "./category-colors";
import { iconMap } from "./icon-map";
import { useCanvasStore } from "./store";

/** The MIME type used to identify a drag as "a component from our palette"
 * vs. an arbitrary browser drag (e.g. dragging a link/image onto the page). */
export const PALETTE_DRAG_TYPE = "application/scalecraft-component";

const TOOLTIP_WIDTH = 176;
// Rough upper bound for a two-line label + two-line summary at this padding
// — used only to decide whether the tooltip fits below the item or needs to
// flip above it, not for exact layout.
const TOOLTIP_EST_HEIGHT = 90;

function PaletteItem({ definition }: { definition: ComponentDefinition }) {
  const Icon = iconMap[definition.icon] ?? Server;
  const color = categoryColorVar[definition.category];
  const boxRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  // Portaled to document.body and positioned via a measured rect, rather
  // than a plain absolute/group-hover child — the palette list below is a
  // scrolling container, and CSS couples overflow-x to overflow-y's
  // non-visible value (there's no way to scroll one axis while leaving the
  // other visible), so an in-flow tooltip gets silently clipped exactly
  // where it'd otherwise need to show.
  const showTooltip = () => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const margin = 8;
    const left = Math.min(
      Math.max(center, TOOLTIP_WIDTH / 2 + margin),
      window.innerWidth - TOOLTIP_WIDTH / 2 - margin,
    );
    // Flip above the tile when there isn't room below. The reported case
    // isn't the viewport edge — it's the tile's OWN category group ending
    // right below it, so the tooltip spills into the next group's tiles.
    // Measure against the specific group container's own bottom (not just
    // window.innerHeight) so this actually detects that case.
    const groupRect = boxRef.current?.closest("[data-palette-group]")?.getBoundingClientRect();
    const roomInGroup = groupRect ? groupRect.bottom - rect.bottom : Infinity;
    const roomInViewport = window.innerHeight - rect.bottom;
    const fitsBelow = Math.min(roomInGroup, roomInViewport) >= TOOLTIP_EST_HEIGHT;
    const top = fitsBelow ? rect.bottom + 6 : rect.top - 6 - TOOLTIP_EST_HEIGHT;
    setTooltipPos({ top, left });
  };

  return (
    <div
      ref={boxRef}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setTooltipPos(null)}
      className="flex flex-col items-center gap-1"
    >
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(PALETTE_DRAG_TYPE, definition.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border-2 active:cursor-grabbing"
        style={{
          borderColor: color,
          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <span className="w-16 text-center text-xs leading-tight text-foreground/70">{definition.label}</span>

      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-border bg-panel px-2.5 py-2 shadow-lg"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-xs font-semibold text-foreground">{definition.label}</div>
            <div className="mt-0.5 text-xs leading-snug text-foreground/70">{definition.summary}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * A searchable grid, grouped by category, living inside the left panel (see
 * QuestionPanel.tsx) rather than a horizontal tray under the canvas. Each
 * card is icon+name only (Clapet-style) — the description moves to a
 * hover-only detail card so the grid stays compact as the registry grows
 * (two Building Blocks chapters plus one Real World Extraction chapter each
 * add components — see .claude/docs/MILESTONES.md). No own collapse
 * toggle — the containing QuestionPanel aside already has one.
 */
export function Palette() {
  const [query, setQuery] = useState("");
  const isPlacingZone = useCanvasStore((s) => s.isPlacingZone);
  const setIsPlacingZone = useCanvasStore((s) => s.setIsPlacingZone);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? componentRegistry.filter(
          (d) => d.label.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q),
        )
      : componentRegistry;
    return categoryOrder
      .map((category) => ({ category, items: matches.filter((d) => d.category === category) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Components</h2>
        <button
          onClick={() => setIsPlacingZone(!isPlacingZone)}
          title="Visual grouping only — a zone doesn't move or reparent the components inside it"
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
            isPlacingZone
              ? "border-foreground/40 text-foreground"
              : "border-border text-foreground/60 hover:text-foreground"
          }`}
        >
          <SquareDashedBottom size={12} />
          {isPlacingZone ? "Cancel" : "Add zone"}
        </button>
      </div>

      <div className="relative px-3 pt-2">
        <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components..."
          className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-foreground/40"
        />
      </div>

      <div className="mt-2 flex-1 space-y-4 overflow-y-auto p-3">
        {grouped.length === 0 ? (
          <p className="text-sm text-foreground/70">No components match &ldquo;{query}&rdquo;.</p>
        ) : (
          grouped.map(({ category, items }) => (
            <div key={category}>
              <h3 className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                {categoryLabel[category]}
              </h3>
              <div data-palette-group className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
                {items.map((definition) => (
                  <PaletteItem key={definition.id} definition={definition} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
