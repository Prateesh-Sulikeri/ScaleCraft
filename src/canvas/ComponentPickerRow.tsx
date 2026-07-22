"use client";

import { forwardRef } from "react";
import { Pencil, Server, Trash2 } from "lucide-react";
import type { ComponentDefinition } from "@/content/components/types";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";

/**
 * One selectable tile in ComponentPicker's grid — DESIGN.md's "Palette
 * Tile" spec (40px square, 8px radius, 2px category-color border, 12% tint)
 * reused verbatim rather than a full-width row, per product direction to
 * match a reference command-palette's icon-grid layout. The summary lives
 * in `aria-label` only (screen readers get it; sighted users don't need it
 * repeated once the grid is this compact — the label plus category-color
 * icon is enough to recognize a component at a glance).
 *
 * A real forwardRef (not a custom `rowRef` prop) — the parent needs a DOM
 * ref per tile for scroll-into-view on keyboard nav, and only the literal
 * JSX `ref` attribute is a pattern React Compiler's ref-safety lint can
 * verify is used outside of render.
 */
export const ComponentPickerRow = forwardRef<
  HTMLDivElement,
  {
    id: string;
    definition: ComponentDefinition;
    active: boolean;
    isCustom: boolean;
    onSelect: () => void;
    /** Fires on hover — moves the keyboard-nav active index to this tile,
     * same "mouse hover moves the active index (no dual-highlight state)"
     * rule the spec calls out. */
    onActivate: () => void;
    onEdit?: () => void;
    onDelete?: (event: React.MouseEvent) => void;
  }
>(function ComponentPickerRow({ id, definition, active, isCustom, onSelect, onActivate, onEdit, onDelete }, ref) {
  const Icon = iconMap[definition.icon] ?? Server;
  const color = categoryColorVar[definition.category];

  return (
    <div
      id={id}
      ref={ref}
      role="option"
      aria-selected={active}
      aria-label={`${definition.label}: ${definition.summary}`}
      onMouseEnter={onActivate}
      onClick={onSelect}
      className="group/tile relative flex cursor-pointer flex-col items-center gap-1 rounded-md p-1.5"
    >
      {/* Reachable by hover (mouse) or by being the keyboard-active tile
       * (arrow-key navigation) — a custom component's only edit/delete
       * entry points, so both input modes need a path to them. */}
      {isCustom && (
        <div className={`absolute -right-1 -top-1 z-10 gap-0.5 ${active ? "flex" : "hidden group-hover/tile:flex"}`}>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            aria-label={`Edit ${definition.label}`}
            className="rounded border border-border bg-panel p-0.5 text-foreground/60 shadow-sm hover:text-foreground"
          >
            <Pencil size={10} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(e);
            }}
            aria-label={`Delete ${definition.label}`}
            className="rounded border border-border bg-panel p-0.5 text-foreground/60 shadow-sm hover:text-state-error"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 ${active ? "ring-2 ring-foreground/40" : ""}`}
        style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <span className="w-16 text-center text-[11px] leading-tight text-foreground/70">{definition.label}</span>
    </div>
  );
});
