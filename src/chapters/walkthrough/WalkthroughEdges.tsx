import { EDGE_COLOR_VAR, EDGE_DASH_ARRAY } from "@/canvas/edge-styles";
import { HIGHLIGHT_GOLD } from "@/canvas/selection-style";
import type { WalkthroughEdge, WalkthroughNode } from "./types";

/**
 * SVG underlay drawing straight lines between node centers, in the same
 * 0-100 percentage space WalkthroughNode.position uses - no border-
 * shortening math needed, since the opaque node cards render in a later DOM
 * layer and naturally cover the line segment underneath them.
 * `preserveAspectRatio="none"` matches that percentage space 1:1
 * independently per axis; `vectorEffect="non-scaling-stroke"` on every line
 * keeps stroke width/dash pattern in constant screen pixels regardless of
 * that non-uniform stretch - without it, a non-square container would
 * visibly distort dash spacing differently per axis. Same
 * EDGE_COLOR_VAR/EDGE_DASH_ARRAY tokens the live canvas and
 * ReadOnlyGraphSummary already share (src/canvas/edge-styles.ts) - not
 * reforked here. No arrowheads for the pilot - direction is implied by
 * left-to-right layout plus narrative captions.
 */
export function WalkthroughEdges({
  nodes,
  edges,
  highlightEdgeIds,
  dimmed,
}: {
  nodes: WalkthroughNode[];
  edges: WalkthroughEdge[];
  highlightEdgeIds: ReadonlySet<string>;
  dimmed: boolean;
}) {
  const positionById = new Map(nodes.map((n) => [n.id, n.position]));

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {edges.map((edge) => {
        const from = positionById.get(edge.source);
        const to = positionById.get(edge.target);
        if (!from || !to) return null;
        const isHighlighted = highlightEdgeIds.has(edge.id);
        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isHighlighted ? HIGHLIGHT_GOLD : EDGE_COLOR_VAR[edge.kind]}
            strokeWidth={isHighlighted ? 2.5 : 1.5}
            strokeDasharray={EDGE_DASH_ARRAY[edge.kind]}
            vectorEffect="non-scaling-stroke"
            opacity={dimmed && !isHighlighted ? 0.4 : 1}
            className="transition-[opacity,stroke,stroke-width] duration-200 ease-out motion-reduce:transition-none"
          />
        );
      })}
    </svg>
  );
}
