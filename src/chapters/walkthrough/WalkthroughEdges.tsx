import { useEffect, useRef, useSyncExternalStore } from "react";
import { EDGE_COLOR_VAR, EDGE_DASH_ARRAY } from "@/canvas/edge-styles";
import { HIGHLIGHT_GOLD } from "@/canvas/selection-style";
import { computeEdgeGeometry } from "./geometry";
import type { WalkthroughEdge, WalkthroughNode } from "./types";

// Local, not shared - same "kept local since nothing else needs it yet"
// convention as src/app/not-found.tsx's own copy of this exact hook (its
// only other user in this codebase). SMIL's <animateMotion> isn't
// CSS-driven, so a motion-reduce: Tailwind class can't gate it the way the
// rest of this app handles reduced motion.
// matchMedia is guarded, not assumed: jsdom (and any non-browser render
// path) doesn't implement it, and an unguarded call there is a hard crash
// rather than a degraded animation.
function subscribeReducedMotion(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getReducedMotion() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

const PACKET_DURATION_S = 0.8;

/** The path's own start point, so the packet sits at the edge's source
 * rather than flashing at the SVG origin in the frame before the animation
 * is started imperatively below. getBezierPath always emits "M x,y C ...". */
function pathStart(d: string): { x: number; y: number } {
  const match = /^M\s*(-?[\d.]+)[,\s]\s*(-?[\d.]+)/.exec(d);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 };
}

/**
 * One packet traveling the length of a highlighted request-flow edge.
 *
 * `begin="indefinite"` + an imperative `beginElement()`, NOT `begin="0s"`:
 * SMIL resolves a begin time against the *document* timeline, not the
 * element's mount time, so a `begin="0s"` animation mounted seconds after
 * page load is already past its start and renders frozen at the end of the
 * path instead of animating across it. (not-found.tsx's packets get away
 * with `begin="0s"` only because `repeatCount="indefinite"` leaves them
 * permanently mid-cycle.) Keyed remount by the caller re-runs this effect,
 * which is what replays the animation on each step/algorithm change.
 */
function Packet({ d }: { d: string }) {
  const ref = useRef<SVGAnimateMotionElement>(null);
  useEffect(() => {
    // Guarded like matchMedia above - jsdom implements the SVG element but
    // not SMIL's beginElement, and an unguarded call is a hard crash there.
    if (typeof ref.current?.beginElement === "function") ref.current.beginElement();
  }, [d]);
  const start = pathStart(d);
  return (
    <circle r={4} cx={start.x} cy={start.y} fill={EDGE_COLOR_VAR["request-flow"]}>
      <animateMotion ref={ref} dur={`${PACKET_DURATION_S}s`} begin="indefinite" repeatCount="1" fill="freeze" path={d} />
    </circle>
  );
}

/**
 * SVG underlay drawing curved lines between node boundaries (not centers -
 * see geometry.ts), in the diagram's own viewBoxWidth/viewBoxHeight pixel
 * space. Same EDGE_COLOR_VAR/EDGE_DASH_ARRAY tokens the live canvas and
 * ReadOnlyGraphSummary already share (src/canvas/edge-styles.ts) - not
 * reforked here.
 *
 * A highlighted `request-flow` edge also gets a small animated packet
 * traveling along its exact path, once per step (or algorithm-toggle)
 * change - the deliberate scope limit is `request-flow` only: a packet
 * implies "this is the request actually moving," which a `control`
 * health-check edge isn't. Gated on prefers-reduced-motion; the static
 * highlight/dim state change stays visible either way.
 */
export function WalkthroughEdges({
  nodes,
  edges,
  highlightEdgeIds,
  dimmed,
  animationKey,
  viewBoxWidth,
  viewBoxHeight,
}: {
  nodes: WalkthroughNode[];
  edges: WalkthroughEdge[];
  highlightEdgeIds: ReadonlySet<string>;
  dimmed: boolean;
  /** Changes whenever the active step or algorithm selection changes -
   * remounting the packet <circle>/<animateMotion> below is what replays
   * the SMIL animation, no imperative beginElement() call needed. */
  animationKey: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
}) {
  const reducedMotion = useReducedMotion();
  const pathById = computeEdgeGeometry(nodes, edges);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      aria-hidden="true"
    >
      {edges.map((edge) => {
        const d = pathById.get(edge.id);
        if (!d) return null;
        const isHighlighted = highlightEdgeIds.has(edge.id);
        const color = isHighlighted ? HIGHLIGHT_GOLD : EDGE_COLOR_VAR[edge.kind];
        return (
          <g key={edge.id}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={EDGE_DASH_ARRAY[edge.kind]}
              opacity={dimmed && !isHighlighted ? 0.4 : 1}
              className="transition-[opacity,stroke,stroke-width] duration-200 ease-out motion-reduce:transition-none"
            />
            {isHighlighted && edge.kind === "request-flow" && !reducedMotion && (
              <Packet key={`${edge.id}-${animationKey}`} d={d} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
