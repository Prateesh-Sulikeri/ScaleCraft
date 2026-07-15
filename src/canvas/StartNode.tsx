"use client";

import { useMemo } from "react";
import { Flag } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/content/components/registry";
import { useCanvasStore } from "./store";
import type { ComponentNodeType, StartNodeType } from "./types";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;

/**
 * A fixed-size "start reading here" marker — points at where the diagram's
 * story begins, the reference pattern's "Start here" box. `targetId` is
 * picked from the "Points to…" dropdown below (shown only while selected),
 * not by dragging a handle: a real draggable edge would read as a
 * request-flow connection, and would also only reach components that
 * happen to have a target handle (Client has none — it never receives a
 * request). The dropdown lists every component node instead, so a start
 * marker can point at any of them. The arrow itself is a derived,
 * canvas-only visual computed from `targetId` in Canvas.tsx — it never
 * becomes a real edge, so it's not something toArchitectureGraph has to
 * filter out. The two Handles below are invisible, non-connectable anchors
 * that only exist so xyflow has a point to draw that arrow from/to; they
 * can't be dragged into a new connection.
 */
export function StartNode({ id, data, selected }: NodeProps<StartNodeType>) {
  const updateStartMarker = useCanvasStore((s) => s.updateStartMarker);
  const nodes = useCanvasStore((s) => s.nodes);
  const componentNodes = useMemo(
    () => nodes.filter((n): n is ComponentNodeType => n.type === "component"),
    [nodes],
  );

  return (
    <div
      style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
      className="flex flex-col gap-1.5 rounded-lg border-2 border-foreground/40 bg-panel px-2.5 py-2"
    >
      <div className="flex items-center gap-1.5">
        <Flag size={14} className="shrink-0 text-foreground/60" />
        <input
          value={data.label}
          onChange={(event) => updateStartMarker(id, { label: event.target.value })}
          placeholder="Start here"
          className="nodrag min-w-0 flex-1 bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-foreground/40"
        />
      </div>

      {selected && (
        <select
          value={data.targetId ?? ""}
          onChange={(event) => updateStartMarker(id, { targetId: event.target.value || null })}
          className="nodrag w-full rounded border border-border bg-background px-1 py-1 text-[11px] text-foreground/80 outline-none"
        >
          <option value="">Points to…</option>
          {componentNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {getComponent(n.data.componentId)?.label ?? n.data.componentId}
            </option>
          ))}
        </select>
      )}

      <Handle
        type="source"
        id="start-source"
        position={Position.Right}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
