"use client";

import { useCanvasStore } from "./store";
import type { EdgeKind } from "@/lib/graph";

const EDGE_KINDS: EdgeKind[] = ["request-flow", "control", "replication", "async"];

/**
 * "Pick an edge kind on connect" (see .claude/docs/MILESTONES.md, milestone 1) is
 * implemented as: new edges default to request-flow, and selecting an edge surfaces
 * this floating picker to change it — rather than interrupting the connect gesture
 * with a modal.
 */
export function EdgeInspector() {
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId);
  const edges = useCanvasStore((s) => s.edges);
  const setEdgeKind = useCanvasStore((s) => s.setEdgeKind);

  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-md border border-border bg-panel px-3 py-2 shadow-sm">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-foreground/60">Edge kind</span>
        <select
          value={edge.data?.kind ?? "request-flow"}
          onChange={(event) => setEdgeKind(edge.id, event.target.value as EdgeKind)}
          className="rounded border border-border bg-background px-2 py-1 font-mono text-xs"
        >
          {EDGE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
