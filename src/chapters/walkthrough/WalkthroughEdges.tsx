import { useId } from "react";
import { EDGE_COLOR_VAR, EDGE_DASH_ARRAY } from "@/canvas/edge-styles";
import { HIGHLIGHT_GOLD } from "@/canvas/selection-style";
import { parseCubic } from "./geometry";
import { WalkthroughPacket } from "./WalkthroughPacket";
import type { WalkthroughEdge } from "./types";

/** Arrowhead size in viewBox units. `markerUnits="userSpaceOnUse"` below
 * pins it to this regardless of stroke width, so a highlighted edge's
 * thicker stroke doesn't also inflate its arrow. */
const ARROW = 9;

/**
 * SVG underlay drawing curved, arrow-terminated lines between node
 * boundaries (not centers - see geometry.ts), in the diagram's own
 * viewBoxWidth/viewBoxHeight pixel space. Same EDGE_COLOR_VAR/
 * EDGE_DASH_ARRAY tokens the live canvas and ReadOnlyGraphSummary already
 * share (src/canvas/edge-styles.ts) - not reforked here.
 *
 * A highlighted `request-flow` edge also carries a moving packet
 * (WalkthroughPacket). The scope limit to `request-flow` is deliberate: a
 * packet means "this is the request actually moving," which a `control`
 * health-check edge isn't. Suppressed under prefers-reduced-motion; the
 * static highlight/dim state change stays visible either way.
 */
export function WalkthroughEdges({
  pathById,
  edges,
  highlightEdgeIds,
  dimmed,
  runId,
  playing,
  speed,
  animatePackets,
  viewBoxWidth,
  viewBoxHeight,
}: {
  /** Precomputed by the caller (Walkthrough.tsx, inside its normalize
   * useMemo) - edge paths only depend on nodes/edges, not the active step,
   * so they shouldn't be recomputed on every step change. */
  pathById: Map<string, string>;
  edges: WalkthroughEdge[];
  highlightEdgeIds: ReadonlySet<string>;
  dimmed: boolean;
  /** Changes whenever the active step or algorithm selection changes -
   * restarts each packet's trip from its source. */
  runId: string;
  playing: boolean;
  speed: number;
  animatePackets: boolean;
  viewBoxWidth: number;
  viewBoxHeight: number;
}) {
  // Namespaced per instance: marker ids are document-global, and a lesson
  // page can render more than one walkthrough.
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      aria-hidden="true"
    >
      <defs>
        {edges.map((edge) => {
          const isHighlighted = highlightEdgeIds.has(edge.id);
          const color = isHighlighted ? HIGHLIGHT_GOLD : EDGE_COLOR_VAR[edge.kind];
          return (
            <marker
              key={edge.id}
              id={`${uid}-arrow-${edge.id}`}
              viewBox="0 0 8 8"
              refX={7}
              refY={4}
              markerWidth={ARROW}
              markerHeight={ARROW}
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={color} opacity={dimmed && !isHighlighted ? 0.4 : 1} />
            </marker>
          );
        })}
      </defs>
      {edges.map((edge) => {
        const d = pathById.get(edge.id);
        if (!d) return null;
        const isHighlighted = highlightEdgeIds.has(edge.id);
        const color = isHighlighted ? HIGHLIGHT_GOLD : EDGE_COLOR_VAR[edge.kind];
        const segment = isHighlighted && edge.kind === "request-flow" ? parseCubic(d) : null;
        return (
          <g key={edge.id}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={EDGE_DASH_ARRAY[edge.kind]}
              opacity={dimmed && !isHighlighted ? 0.4 : 1}
              markerEnd={`url(#${uid}-arrow-${edge.id})`}
              className="transition-[opacity,stroke,stroke-width] duration-200 ease-out motion-reduce:transition-none"
            />
            {segment && animatePackets && (
              <WalkthroughPacket
                key={`${edge.id}-${runId}`}
                segment={segment}
                color={EDGE_COLOR_VAR["request-flow"]}
                playing={playing}
                speed={speed}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
