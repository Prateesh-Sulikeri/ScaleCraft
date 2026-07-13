"use client";

import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "./store";
import type { ZoneNodeType } from "./types";

/**
 * A "mark zone" container — a labeled, resizable boundary for grouping
 * related components visually (e.g. "Backend"), matching the reference
 * pattern the user pointed at. v1 is deliberately visual-only: it does not
 * reparent nodes dragged into it or move them together when the zone
 * itself is dragged — see the type comment on ZoneNodeData.
 */
export function ZoneNode({ id, data, selected }: NodeProps<ZoneNodeType>) {
  const updateZone = useCanvasStore((s) => s.updateZone);

  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        borderColor: "color-mix(in srgb, var(--zone, #e22f80) 65%, transparent)",
      }}
      className="rounded-lg border border-dashed bg-panel/20"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={140}
        onResize={(_, params) => updateZone(id, { width: params.width, height: params.height })}
        lineStyle={{ borderColor: "var(--zone, #e22f80)" }}
        handleStyle={{ backgroundColor: "var(--zone, #e22f80)", width: 8, height: 8, borderRadius: 2 }}
      />
      <input
        value={data.label}
        onChange={(event) => updateZone(id, { label: event.target.value })}
        placeholder="Zone label"
        // "nodrag" is xyflow's convention for opting an element out of the
        // node-drag gesture — without it, clicking into the input to type
        // would drag the whole zone instead of placing a text cursor.
        className="nodrag m-2 w-48 bg-transparent text-xs font-semibold uppercase tracking-wide text-foreground/60 outline-none placeholder:text-foreground/30"
      />
    </div>
  );
}
