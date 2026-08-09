"use client";

import { useCanvasStore } from "./store";
import { EDGE_KINDS, EDGE_KIND_CAPTIONS } from "./edge-styles";
import type { EdgeKind } from "@/lib/graph";

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
    // bottom-right, same corner as xyflow's own zoom/fit/lock Controls panel
    // (see Canvas.tsx, itself pinned there — not its old bottom-left
    // default — to clear the persistent Release Notes button). Controls'
    // own panel margin (15px) plus its rendered width (~28px for the
    // default button stack) claims ~43px from the true edge, so right-14
    // (56px) - not right-4 (16px) - is what actually clears it instead of
    // rendering on top and hiding it outright. Keep in sync with
    // TourOverlay.tsx's DOCK_CONTROLS_CLEARANCE, which floats a docked tour
    // card in this same corner and needs to line up with it.
    <div
      // Anchors the guided tour's "fix the connection" step (see
      // tour/design-editor-tour.ts) so its card is positioned relative to
      // this panel rather than docked over it — bottom-right is also where
      // an unanchored tour card docks, which made the edge-kind select
      // unreachable.
      data-tour="edge-inspector"
      className="absolute bottom-4 right-14 z-[var(--z-dropdown)] max-w-xs rounded-md border border-border bg-panel px-3 py-2 shadow-sm"
    >
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
