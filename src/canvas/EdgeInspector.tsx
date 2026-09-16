"use client";

import { ArrowLeftRight, Spline } from "lucide-react";
import { useCanvasStore } from "./store";
import { isHandPlaced } from "./edge-routing";
import { EDGE_KINDS, EDGE_KIND_CAPTIONS, EDGE_COLOR_VAR } from "./edge-styles";
import { componentDisplayNames } from "./component-display-name";
import type { EdgeKind } from "@/lib/graph";
import type { ValidationViolation } from "@/engines";

type EdgeInspectorProps = {
  /** Same full Validate result NodeConfigPopover receives — filtered here to
   * violations naming this edge. Edges had no validation-state surface at
   * all before Step 3: `connection-rules.ts` only refuses a connection with
   * nowhere to attach, so every other bad connection now reaches the graph
   * and needs its explanation to be findable somewhere other than the
   * global dropdown. */
  violations?: ValidationViolation[] | null;
};

/**
 * "Pick an edge kind on connect" (see .claude/docs/MILESTONES.md, milestone 1) is
 * implemented as: new edges default to request-flow, and selecting an edge surfaces
 * this floating picker to change it — rather than interrupting the connect gesture
 * with a modal.
 *
 * Redesigned in Step 3 of the Design Editor revamp (D14 -
 * .claude/docs/pending-design-editor-revamp.md) to read as one system with
 * NodeConfigPopover: a source -> target identity line (same display names as
 * the node popover's connection list, via the same componentDisplayNames
 * helper) and this edge's own validation explanations, not just the kind
 * picker it used to be. D6/D7 made creating an edge dramatically easier,
 * which is what turns this from a rarely-opened control into a main one.
 */
export function EdgeInspector({ violations }: EdgeInspectorProps) {
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId);
  const edges = useCanvasStore((s) => s.edges);
  const nodes = useCanvasStore((s) => s.nodes);
  const setEdgeKind = useCanvasStore((s) => s.setEdgeKind);
  const reverseEdge = useCanvasStore((s) => s.reverseEdge);
  const autoRouteEdge = useCanvasStore((s) => s.autoRouteEdge);

  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  const kind = edge.data?.kind ?? "request-flow";
  const names = componentDisplayNames(nodes);
  const sourceLabel = names.get(edge.source) ?? edge.source;
  const targetLabel = names.get(edge.target) ?? edge.target;
  const edgeIssues = (violations ?? []).filter((v) => v.offendingEdgeIds.includes(edge.id));
  // An edge drawn by hand keeps the two ports it was dropped on. That is the
  // point, but it means moving the cards afterwards can leave it reaching
  // backwards across a card, with nothing to do about it but delete and
  // redraw. This is that something: it drops the ports and lets the router
  // pick sides from where the cards now sit.
  const placedByHand = isHandPlaced(edge);

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
      className="absolute bottom-4 right-14 z-[var(--z-dropdown)] w-72 rounded-md border border-border bg-panel p-3 shadow-sm"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: EDGE_COLOR_VAR[kind] }}
        />
        <span className="truncate">{sourceLabel}</span>
        <span className="shrink-0 text-foreground/40">&rarr;</span>
        <span className="truncate">{targetLabel}</span>
        {/* Which way a new edge points is decided by the drag - from the card
          * you grabbed to the card you dropped on - and that is easy to get
          * backwards, because a port is a port and nothing about grabbing a
          * card's left side says "this end receives". Reversing already
          * existed on the edge's right-click menu, which is not where anyone
          * looks after clicking an edge and finding this panel open. */}
        {placedByHand && (
          <button
            type="button"
            onClick={() => autoRouteEdge(edge.id)}
            title="Re-route automatically"
            aria-label="Re-route this connection automatically, from where the components now sit"
            className="ml-auto shrink-0 rounded border border-border p-1 text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Spline size={12} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => reverseEdge(edge.id)}
          title="Reverse direction"
          aria-label={`Reverse direction: make this ${targetLabel} to ${sourceLabel}`}
          className={`${placedByHand ? "" : "ml-auto "}shrink-0 rounded border border-border p-1 text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground`}
        >
          <ArrowLeftRight size={12} aria-hidden="true" />
        </button>
      </div>

      <label className="mt-2 flex items-center gap-2 text-sm">
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

      {edgeIssues.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
          {edgeIssues.map((v, i) => (
            <div key={i}>
              <p
                className="text-xs font-medium"
                style={{ color: v.severity === "error" ? "var(--state-error)" : "var(--state-warning)" }}
              >
                {v.message}
              </p>
              <p className="mt-0.5 text-xs text-foreground/70">{v.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
