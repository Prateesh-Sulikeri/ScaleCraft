"use client";

import { useCanvasStore } from "./store";
import type { EdgeKind } from "@/lib/graph";

const EDGE_KINDS: EdgeKind[] = ["request-flow", "control", "replication", "async"];

// Always-visible, not a dynamic hint — this is what the currently selected
// kind means, not a nudge toward help someone didn't ask for. See
// .claude/docs/ARCHITECTURE.md ("Architecture Graph") for the full model.
const EDGE_KIND_CAPTIONS: Record<EdgeKind, string> = {
  "request-flow": "Client-facing request path — the only kind checked for cycles.",
  control: "Non-blocking control signal, e.g. a health check or heartbeat.",
  replication: "Data replicated between instances (a legitimate back-edge).",
  async: "Asynchronous messaging — queues, events, fire-and-forget.",
};

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

  const kind = edge.data?.kind ?? "request-flow";

  return (
    <div className="absolute bottom-4 left-4 z-10 max-w-xs rounded-md border border-border bg-panel px-3 py-2 shadow-sm">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-foreground/60">Edge kind</span>
        <select
          value={kind}
          onChange={(event) => setEdgeKind(edge.id, event.target.value as EdgeKind)}
          className="rounded border border-border bg-background px-2 py-1 font-mono text-xs"
        >
          {EDGE_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-1.5 text-xs text-foreground/60">{EDGE_KIND_CAPTIONS[kind]}</p>
    </div>
  );
}
