import type { XY } from "@/lib/graph";
import type { ComponentCategory } from "@/content/components/types";
import { getComponent } from "@/content/components/registry";
import { computeLayout } from "./layout";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";
import type {
  WalkthroughAlgorithm,
  WalkthroughEdge,
  WalkthroughProps,
  WalkthroughStep,
  WalkthroughStepVariant,
} from "./types";

/** Fits the fixed h-20 line-clamp-3 caption strip at text-sm (Walkthrough.tsx). */
export const CAPTION_MAX_CHARS = 220;

export type WalkthroughIssue = {
  code:
    | "unknown-component"
    | "duplicate-node-id"
    | "duplicate-edge-id"
    | "edge-endpoint-missing"
    | "highlight-node-missing"
    | "highlight-edge-missing"
    | "focus-edge-missing"
    | "variant-unknown-algorithm"
    | "node-overlap"
    | "node-outside-viewbox"
    | "caption-too-long"
    | "too-few-steps"
    | "cycle";
  /** Names the offending id and the step index where relevant. */
  message: string;
};

export type ResolvedWalkthroughNode =
  | { id: string; kind: "component"; componentId: string; position: XY; label?: string }
  | { id: string; kind: "custom"; icon: string; label: string; category: ComponentCategory; position: XY };

export type ResolvedWalkthroughStepVariant = {
  caption: string;
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
};

export type ResolvedWalkthroughStep = {
  caption: string;
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
  variants?: Record<string, ResolvedWalkthroughStepVariant>;
};

export type ResolvedWalkthrough = {
  nodes: ResolvedWalkthroughNode[];
  edges: WalkthroughEdge[];
  steps: ResolvedWalkthroughStep[];
  viewBoxWidth: number;
  viewBoxHeight: number;
  algorithms?: WalkthroughAlgorithm[];
  title?: string;
  description?: string;
};

function rectsOverlap(a: XY, b: XY): boolean {
  return Math.abs(a.x - b.x) < NODE_WIDTH && Math.abs(a.y - b.y) < NODE_HEIGHT;
}

function withinViewBox(center: XY, viewBoxWidth: number, viewBoxHeight: number): boolean {
  return (
    center.x - NODE_WIDTH / 2 >= 0 &&
    center.x + NODE_WIDTH / 2 <= viewBoxWidth &&
    center.y - NODE_HEIGHT / 2 >= 0 &&
    center.y + NODE_HEIGHT / 2 <= viewBoxHeight
  );
}

/** DFS cycle check over request-flow edges only, restricted to declared node
 * ids. The product invariant (src/lib/graph.ts) says this cannot happen on
 * the live canvas, but authored MDX has no such guarantee - this is what
 * turns a malformed diagram into a visible issue instead of an infinite
 * layout loop (see layout.ts's own stack guard, which handles the
 * non-crash side; this handles reporting it). */
function detectRequestFlowCycle(nodes: { id: string }[], edges: WalkthroughEdge[]): [string, string] | null {
  const declaredIds = new Set(nodes.map((n) => n.id));
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.kind !== "request-flow") continue;
    if (!declaredIds.has(edge.source) || !declaredIds.has(edge.target)) continue;
    const list = adjacency.get(edge.source);
    if (list) list.push(edge.target);
    else adjacency.set(edge.source, [edge.target]);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();

  function visit(id: string): [string, string] | null {
    color.set(id, GRAY);
    for (const next of adjacency.get(id) ?? []) {
      const nextColor = color.get(next) ?? WHITE;
      if (nextColor === GRAY) return [id, next];
      if (nextColor === WHITE) {
        const found = visit(next);
        if (found) return found;
      }
    }
    color.set(id, BLACK);
    return null;
  }

  for (const node of nodes) {
    if ((color.get(node.id) ?? WHITE) === WHITE) {
      const found = visit(node.id);
      if (found) return found;
    }
  }
  return null;
}

/** Expands `focus` into the union of `highlightEdgeIds` and its edges'
 * endpoints, merged with any explicit arrays - then validates every id in
 * the result resolves. Shared by steps and their variants. */
function expandHighlights(
  input: { focus?: string | string[]; highlightNodeIds?: string[]; highlightEdgeIds?: string[] },
  edgeById: Map<string, WalkthroughEdge>,
  declaredNodeIds: Set<string>,
  issues: WalkthroughIssue[],
  location: string,
): { highlightNodeIds: string[]; highlightEdgeIds: string[] } {
  const focusIds = input.focus === undefined ? [] : Array.isArray(input.focus) ? input.focus : [input.focus];
  const edgeIds = new Set(input.highlightEdgeIds ?? []);
  const nodeIds = new Set(input.highlightNodeIds ?? []);

  for (const focusId of focusIds) {
    const edge = edgeById.get(focusId);
    if (!edge) {
      issues.push({ code: "focus-edge-missing", message: `${location}: focus id "${focusId}" is not a declared edge id` });
      continue;
    }
    edgeIds.add(focusId);
    nodeIds.add(edge.source);
    nodeIds.add(edge.target);
  }

  for (const id of edgeIds) {
    if (!edgeById.has(id)) {
      issues.push({ code: "highlight-edge-missing", message: `${location}: highlighted edge id "${id}" is not declared` });
    }
  }
  for (const id of nodeIds) {
    if (!declaredNodeIds.has(id)) {
      issues.push({ code: "highlight-node-missing", message: `${location}: highlighted node id "${id}" is not declared` });
    }
  }

  return { highlightNodeIds: [...nodeIds], highlightEdgeIds: [...edgeIds] };
}

function resolveStep(
  step: WalkthroughStep,
  index: number,
  edgeById: Map<string, WalkthroughEdge>,
  declaredNodeIds: Set<string>,
  algorithmIds: Set<string>,
  issues: WalkthroughIssue[],
): ResolvedWalkthroughStep {
  if (step.caption.length > CAPTION_MAX_CHARS) {
    issues.push({
      code: "caption-too-long",
      message: `step ${index}: caption is ${step.caption.length} chars, budget is ${CAPTION_MAX_CHARS}`,
    });
  }
  const base = expandHighlights(step, edgeById, declaredNodeIds, issues, `step ${index}`);

  let variants: Record<string, ResolvedWalkthroughStepVariant> | undefined;
  if (step.variants) {
    variants = {};
    for (const [algorithmId, variant] of Object.entries(step.variants) as [string, WalkthroughStepVariant][]) {
      if (!algorithmIds.has(algorithmId)) {
        issues.push({
          code: "variant-unknown-algorithm",
          message: `step ${index}: variant key "${algorithmId}" is not a declared algorithm id`,
        });
      }
      if (variant.caption.length > CAPTION_MAX_CHARS) {
        issues.push({
          code: "caption-too-long",
          message: `step ${index} variant "${algorithmId}": caption is ${variant.caption.length} chars, budget is ${CAPTION_MAX_CHARS}`,
        });
      }
      const expanded = expandHighlights(variant, edgeById, declaredNodeIds, issues, `step ${index} variant "${algorithmId}"`);
      variants[algorithmId] = { caption: variant.caption, ...expanded };
    }
  }

  return { caption: step.caption, ...base, variants };
}

/**
 * The single entry point the pipeline is built around: takes what an author
 * writes in MDX and produces both a fully-resolved shape for the renderer
 * and a list of authoring mistakes. Never throws - always returns a
 * best-effort `resolved` (skipping unresolvable references the same way the
 * renderer already does) plus `issues`, so production stays safe while
 * walkthrough-invariants.test.ts turns issues into build-time failures.
 */
export function normalizeWalkthrough(props: WalkthroughProps): {
  resolved: ResolvedWalkthrough;
  issues: WalkthroughIssue[];
} {
  const issues: WalkthroughIssue[] = [];

  const declaredNodeIds = new Set<string>();
  for (const node of props.nodes) {
    if (declaredNodeIds.has(node.id)) {
      issues.push({ code: "duplicate-node-id", message: `node id "${node.id}" is declared more than once` });
    }
    declaredNodeIds.add(node.id);
  }

  const declaredEdgeIds = new Set<string>();
  for (const edge of props.edges) {
    if (declaredEdgeIds.has(edge.id)) {
      issues.push({ code: "duplicate-edge-id", message: `edge id "${edge.id}" is declared more than once` });
    }
    declaredEdgeIds.add(edge.id);
  }

  for (const edge of props.edges) {
    if (!declaredNodeIds.has(edge.source)) {
      issues.push({ code: "edge-endpoint-missing", message: `edge "${edge.id}": source "${edge.source}" is not a declared node id` });
    }
    if (!declaredNodeIds.has(edge.target)) {
      issues.push({ code: "edge-endpoint-missing", message: `edge "${edge.id}": target "${edge.target}" is not a declared node id` });
    }
  }

  for (const node of props.nodes) {
    if (node.kind === "component" && !getComponent(node.componentId)) {
      issues.push({ code: "unknown-component", message: `node "${node.id}": componentId "${node.componentId}" is not in the registry` });
    }
  }

  const cycle = detectRequestFlowCycle(props.nodes, props.edges);
  if (cycle) {
    issues.push({ code: "cycle", message: `request-flow cycle detected: "${cycle[0]}" -> "${cycle[1]}"` });
  }

  const edgeById = new Map(props.edges.map((edge) => [edge.id, edge]));
  const algorithmIds = new Set((props.algorithms ?? []).map((a) => a.id));
  const resolvedSteps = props.steps.map((step, index) =>
    resolveStep(step, index, edgeById, declaredNodeIds, algorithmIds, issues),
  );

  if (props.steps.length < 2) {
    issues.push({ code: "too-few-steps", message: `walkthrough has ${props.steps.length} step(s), minimum is 2` });
  }

  const layout = computeLayout({ nodes: props.nodes, edges: props.edges });
  const viewBoxWidth = props.viewBoxWidth ?? layout.viewBoxWidth;
  const viewBoxHeight = props.viewBoxHeight ?? layout.viewBoxHeight;

  const resolvedNodes: ResolvedWalkthroughNode[] = props.nodes.map((node) => {
    const position = layout.positions.get(node.id) ?? { x: 0, y: 0 };
    return node.kind === "component"
      ? { id: node.id, kind: "component", componentId: node.componentId, position, label: node.label }
      : { id: node.id, kind: "custom", icon: node.icon, label: node.label, category: node.category, position };
  });

  for (let i = 0; i < resolvedNodes.length; i++) {
    for (let j = i + 1; j < resolvedNodes.length; j++) {
      if (rectsOverlap(resolvedNodes[i].position, resolvedNodes[j].position)) {
        issues.push({ code: "node-overlap", message: `nodes "${resolvedNodes[i].id}" and "${resolvedNodes[j].id}" overlap` });
      }
    }
  }
  for (const node of resolvedNodes) {
    if (!withinViewBox(node.position, viewBoxWidth, viewBoxHeight)) {
      issues.push({
        code: "node-outside-viewbox",
        message: `node "${node.id}" falls outside the ${viewBoxWidth}x${viewBoxHeight} viewBox`,
      });
    }
  }

  const resolved: ResolvedWalkthrough = {
    nodes: resolvedNodes,
    edges: props.edges,
    steps: resolvedSteps,
    viewBoxWidth,
    viewBoxHeight,
    algorithms: props.algorithms,
    title: props.title,
    description: props.description,
  };

  return { resolved, issues };
}
