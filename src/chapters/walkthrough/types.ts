import type { EdgeKind, XY } from "@/lib/graph";
import type { ComponentCategory } from "@/content/components/types";

/**
 * A node placed in a Walkthrough diagram, as an author writes it. `position`
 * is a raw coordinate in the diagram's own viewBoxWidth/viewBoxHeight unit
 * space (see WalkthroughProps) - NOT a percentage. Omit it to let
 * `normalizeWalkthrough` auto-layout the node (see layout.ts); `column` is an
 * optional hint into that layout, ignored when `position` is given. Two
 * kinds, matching the release 5.0.0-alpha Final Plan
 * (.claude/docs/pending.md): `component` for a real registry entry (identical
 * card/icon/color to the sandbox), `custom` for an illustration-only node
 * (e.g. a Kafka partition) with no registry backing - both render through the
 * same WalkthroughNodeCard so neither ever reads as a second, visually
 * distinct system. `custom` isn't exercised by the pilot (Load Balancer
 * walkthrough is `component`-only) but the type exists now so adding it
 * later isn't a rewrite.
 */
export type WalkthroughNode =
  | {
      id: string;
      kind: "component";
      componentId: string;
      position?: XY;
      column?: number;
      /** Overrides the registry label on the card. Needed whenever a
       * diagram has two instances of the same component and the captions
       * distinguish them ("App Server 1" vs "App Server 2") - without it
       * both cards read identically and the learner can't tell which one a
       * step is pointing at. Also useful to shorten a long registry label
       * that would otherwise truncate. */
      label?: string;
    }
  | {
      id: string;
      kind: "custom";
      icon: string;
      label: string;
      category: ComponentCategory;
      position?: XY;
      column?: number;
    };

/** An edge between two WalkthroughNode ids, styled identically to the live
 * canvas and ReadOnlyGraphSummary via the shared EDGE_COLOR_VAR/EDGE_DASH_ARRAY
 * maps (src/canvas/edge-styles.ts) - one source of truth for what an edge
 * kind looks like everywhere it's drawn. */
export type WalkthroughEdge = { id: string; source: string; target: string; kind: EdgeKind };

/** Overrides a WalkthroughStep's caption/highlights for one specific
 * WalkthroughAlgorithm - see WalkthroughStep.variants. `focus` is shorthand
 * for `highlightEdgeIds` plus the endpoints of those edges - see
 * WalkthroughStep.focus for the full rule. */
export type WalkthroughStepVariant = {
  caption: string;
  focus?: string | string[];
  highlightNodeIds?: string[];
  highlightEdgeIds?: string[];
};

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
  /** Shorthand for the common "this edge lit up, and so did its endpoints"
   * shape: one edge id or several. `normalizeWalkthrough` expands it into
   * `highlightEdgeIds` (union of the focus edges) and `highlightNodeIds`
   * (union of their endpoints), each merged with any explicit arrays given
   * alongside it. Omit both `focus` and the explicit arrays for a step that
   * highlights nothing (e.g. an establishing step). */
  focus?: string | string[];
  highlightNodeIds?: string[];
  highlightEdgeIds?: string[];
  /** Keyed by a WalkthroughAlgorithm.id (see WalkthroughProps.algorithms) -
   * when present and that algorithm is selected, replaces this step's
   * caption/highlights entirely. Steps that don't differ per algorithm (most
   * of them) omit this. */
  variants?: Record<string, WalkthroughStepVariant>;
};

/** One toggle option for WalkthroughProps.algorithms, e.g. round-robin vs.
 * least-connections - see WalkthroughStep.variants for how a step's content
 * actually differs per selection. */
export type WalkthroughAlgorithm = { id: string; label: string };

export type WalkthroughProps = {
  nodes: WalkthroughNode[];
  edges: WalkthroughEdge[];
  steps: WalkthroughStep[];
  /** The coordinate space WalkthroughNode.position is authored in - also
   * fixes the diagram container's CSS aspect-ratio (viewBoxWidth /
   * viewBoxHeight), so there's one number to get right, not two kept in
   * sync by hand. When a node's `position` is given, it is a center in
   * viewBox units; omit it to auto-layout. Omit both `viewBoxWidth` and
   * `viewBoxHeight` to derive them from the auto-layout too - only needed
   * explicitly for a fully hand-placed diagram. */
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** When present (and more than one), renders a dropdown in the diagram
   * header letting the learner compare outcomes (e.g. round-robin vs.
   * least-connections) - see WalkthroughStep.variants. Omit for a
   * walkthrough with only one possible path. */
  algorithms?: WalkthroughAlgorithm[];
  /** Header line naming what the diagram shows, e.g. "Round Robin, Load
   * Balancing". Both this and `description` are single-line and truncated -
   * the header is a fixed-height band (see Walkthrough.tsx) so that nothing
   * below it moves between steps. Keep them short. */
  title?: string;
  description?: string;
};
