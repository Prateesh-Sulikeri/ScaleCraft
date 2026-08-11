import type { EdgeKind, XY } from "@/lib/graph";
import type { ComponentCategory } from "@/content/components/types";

/**
 * A node placed in a Walkthrough diagram. `position` is NOT canvas pixels -
 * it's a percentage (0-100) of the diagram container's width/height,
 * node-center-based, so the diagram scales responsively with zero
 * measurement/ResizeObserver. Two kinds, matching the release 5.0.0-alpha
 * Final Plan (.claude/docs/pending.md): `component` for a real registry
 * entry (identical card/icon/color to the sandbox), `custom` for an
 * illustration-only node (e.g. a Kafka partition) with no registry backing -
 * both render through the same WalkthroughNodeCard so neither ever reads as
 * a second, visually distinct system. `custom` isn't exercised by the pilot
 * (Load Balancer walkthrough is `component`-only) but the type exists now so
 * adding it later isn't a rewrite.
 */
export type WalkthroughNode =
  | { id: string; kind: "component"; componentId: string; position: XY }
  | { id: string; kind: "custom"; icon: string; label: string; category: ComponentCategory; position: XY };

/** An edge between two WalkthroughNode ids, styled identically to the live
 * canvas and ReadOnlyGraphSummary via the shared EDGE_COLOR_VAR/EDGE_DASH_ARRAY
 * maps (src/canvas/edge-styles.ts) - one source of truth for what an edge
 * kind looks like everywhere it's drawn. */
export type WalkthroughEdge = { id: string; source: string; target: string; kind: EdgeKind };

/**
 * One step of the walkthrough: which nodes/edges are spotlighted, and the
 * caption explaining why. `caption` is a plain string, not markdown/JSX -
 * it's authored as an inline MDX prop literal (a JS array in JSX), and a
 * plain string keeps authors from slipping stray JSX into a prop value.
 *
 * The diagram itself is `aria-hidden` (decorative reinforcement, not the
 * information channel) and the caption is rendered with `aria-live="polite"`
 * - which means the caption is the ONLY accessible description of what
 * changed on this step for a screen-reader user. Always name the highlighted
 * node/edge in the caption's own prose (e.g. "The Load Balancer forwards the
 * request to App Server 1"), never rely on the visual highlight alone to
 * carry that information.
 */
export type WalkthroughStep = {
  caption: string;
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
};

export type WalkthroughProps = {
  nodes: WalkthroughNode[];
  edges: WalkthroughEdge[];
  steps: WalkthroughStep[];
  /** CSS `aspect-ratio` for the diagram container. Default "12 / 5" suits a
   * small, wide, few-node diagram (e.g. Client -> Load Balancer -> App
   * Servers) - override for a taller/narrower shape. */
  aspectRatio?: string;
};
