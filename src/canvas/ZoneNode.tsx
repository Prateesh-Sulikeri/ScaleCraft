"use client";

import { Pencil } from "lucide-react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "./store";
import { DEFAULT_ZONE_COLOR } from "./annotation-colors";
import type { ZoneNodeType } from "./types";

/**
 * A "mark zone" container — a labeled, resizable boundary for grouping
 * related components visually (e.g. "Backend"), matching the reference
 * pattern the user pointed at. v1 is deliberately visual-only: it does not
 * reparent nodes dragged into it or move them together when the zone
 * itself is dragged — see the type comment on ZoneNodeData.
 *
 * The border is drawn as an SVG rect with an animated dash offset, reusing
 * xyflow's own `dashdraw` keyframe (already loaded globally — it's what
 * animates `request-flow` edges) instead of inventing a new zone-specific
 * animation. This is a deliberate, explicit motion decision — a zone reads
 * as "part of the same system" as the animated edges, permanently, not a
 * one-off creation flourish.
 */
export function ZoneNode({ id, data, selected }: NodeProps<ZoneNodeType>) {
  const updateZone = useCanvasStore((s) => s.updateZone);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const color = data.color ?? DEFAULT_ZONE_COLOR;

  return (
    <div
      style={{ width: data.width, height: data.height }}
      className="relative rounded-lg bg-panel/20"
    >
      <svg
        width={data.width}
        height={data.height}
        className="pointer-events-none absolute inset-0"
      >
        <rect
          x={0.75}
          y={0.75}
          width={Math.max(data.width - 1.5, 0)}
          height={Math.max(data.height - 1.5, 0)}
          rx={8}
          fill="none"
          // Slightly under full opacity — a fully-saturated accent stroke
          // sitting next to a fault-red error ring reads as "the same red"
          // at a glance when the zone's own color happens to be close to it;
          // softening it keeps the two channels (zone accent vs. validation
          // state) visually distinct even when adjacent, without touching
          // the state ring's own color.
          stroke={`color-mix(in srgb, ${color} 80%, transparent)`}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          style={{ animation: "dashdraw 0.5s linear infinite" }}
        />
      </svg>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={140}
        onResize={(_, params) => updateZone(id, { width: params.width, height: params.height })}
        lineStyle={{ borderColor: color }}
        handleStyle={{ backgroundColor: color, width: 8, height: 8, borderRadius: 2 }}
      />
      <input
        value={data.label}
        onChange={(event) => updateZone(id, { label: event.target.value })}
        placeholder="Zone label"
        // "nodrag" is xyflow's convention for opting an element out of the
        // node-drag gesture — without it, clicking into the input to type
        // would drag the whole zone instead of placing a text cursor.
        // bg-panel/70 (not transparent) — an edge crossing through a
        // zone's interior can pass directly behind the label; a soft
        // backing keeps the text legible instead of a line cutting through it.
        className="nodrag relative m-2 w-48 rounded bg-panel/70 px-1 text-xs font-semibold uppercase tracking-wide text-foreground/60 outline-none placeholder:text-foreground/30"
      />
      {selected && (
        // Same visibility gate as the resizer above — static, always-true
        // copy about what a zone actually does, surfaced when a user is
        // actively looking at this one rather than cluttering every zone
        // on the canvas permanently.
        <p className="relative mx-2 text-[10px] text-foreground/60">
          Visual grouping only — doesn&apos;t move or reparent components
        </p>
      )}
      {selected && (
        // Reopens the same color+label popup shown right after placement
        // (see AnnotationEditor.tsx) — one discoverable way to change a
        // zone's color, not a second, separate inline control.
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAnnotationEditor(id, { x: event.clientX, y: event.clientY });
          }}
          aria-label="Edit zone"
          className="nodrag absolute -right-1.5 -top-1.5 z-10 rounded border border-border bg-panel p-1 text-foreground/60 shadow-sm hover:text-foreground"
        >
          <Pencil size={11} />
        </button>
      )}
    </div>
  );
}
