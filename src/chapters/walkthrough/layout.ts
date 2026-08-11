import type { XY } from "@/lib/graph";
import type { WalkthroughEdge, WalkthroughNode } from "./types";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";

/**
 * Layered left-to-right auto-layout constants, in viewBox units. Calibrated
 * (not guessed) against the 3.4 Load Balancer pilot's hand-placed
 * coordinates - see the calibration table in
 * .claude/docs/pending-diagram-pipeline.md and layout.test.ts. Changing
 * these is a deliberate design decision; update both references if it
 * happens.
 */
export const MARGIN_X = 6;
export const MARGIN_Y = 40;
export const COL_GAP = 72;
export const ROW_GAP = 80;

export type LayoutInput = {
  nodes: WalkthroughNode[];
  edges: WalkthroughEdge[];
};

export type LayoutResult = {
  /** Center per node id, viewBox units. */
  positions: Map<string, XY>;
  viewBoxWidth: number;
  viewBoxHeight: number;
};

/**
 * column(n) = longest path (in edges) from a request-flow source to n, over
 * request-flow edges only. Memoized DFS over predecessors; a stack guard
 * stops deepening on a revisit and treats the cycle-closing predecessor as
 * contributing 0 - the product invariant is that request-flow is acyclic
 * (src/lib/graph.ts), but a malformed authored diagram must still terminate
 * with a layout, never hang.
 */
function longestPathColumns(nodes: WalkthroughNode[], edges: WalkthroughEdge[]): Map<string, number> {
  const preds = new Map<string, string[]>();
  const touchesRequestFlow = new Set<string>();
  for (const edge of edges) {
    if (edge.kind !== "request-flow") continue;
    touchesRequestFlow.add(edge.source);
    touchesRequestFlow.add(edge.target);
    const list = preds.get(edge.target);
    if (list) list.push(edge.source);
    else preds.set(edge.target, [edge.source]);
  }

  const memo = new Map<string, number>();
  const stack = new Set<string>();

  function resolve(id: string): number {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (stack.has(id)) return 0;
    stack.add(id);
    let result = 0;
    for (const pred of preds.get(id) ?? []) result = Math.max(result, resolve(pred) + 1);
    stack.delete(id);
    memo.set(id, result);
    return result;
  }

  const columns = new Map<string, number>();
  for (const node of nodes) {
    if (touchesRequestFlow.has(node.id)) columns.set(node.id, resolve(node.id));
  }
  return columns;
}

/** First neighbor of `id` via any edge kind, in edge declaration order - so
 * a control-only or replication-only node sits beside whichever node it was
 * first declared talking to. */
function firstNeighbor(id: string, edges: WalkthroughEdge[]): string | undefined {
  for (const edge of edges) {
    if (edge.source === id) return edge.target;
    if (edge.target === id) return edge.source;
  }
  return undefined;
}

/** Precedence per node: explicit `column` hint > request-flow longest-path >
 * first neighbor's column (any edge kind) > 0. */
function resolveColumns(nodes: WalkthroughNode[], edges: WalkthroughEdge[]): Map<string, number> {
  const requestFlowColumns = longestPathColumns(nodes, edges);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const resolved = new Map<string, number>();
  const inProgress = new Set<string>();

  function resolve(id: string): number {
    const cached = resolved.get(id);
    if (cached !== undefined) return cached;

    const node = nodeById.get(id);
    if (node?.column !== undefined) {
      resolved.set(id, node.column);
      return node.column;
    }

    const requestFlowColumn = requestFlowColumns.get(id);
    if (requestFlowColumn !== undefined) {
      resolved.set(id, requestFlowColumn);
      return requestFlowColumn;
    }

    if (inProgress.has(id)) return 0;
    inProgress.add(id);
    const neighbor = firstNeighbor(id, edges);
    const column = neighbor !== undefined ? resolve(neighbor) : 0;
    inProgress.delete(id);
    resolved.set(id, column);
    return column;
  }

  for (const node of nodes) resolve(node.id);
  return resolved;
}

/**
 * Auto-layout from the request-flow DAG. A node with an explicit `position`
 * uses it verbatim and is excluded from row distribution in its column (its
 * column is still resolved and still counts toward viewBoxWidth). A node
 * without one gets an auto-computed center. See
 * .claude/docs/pending-diagram-pipeline.md P1.1 for the full derivation.
 */
export function computeLayout({ nodes, edges }: LayoutInput): LayoutResult {
  const rawColumns = resolveColumns(nodes, edges);

  const distinctColumns = [...new Set(rawColumns.values())].sort((a, b) => a - b);
  const compactIndex = new Map(distinctColumns.map((raw, i) => [raw, i]));
  const columnOf = new Map(nodes.map((n) => [n.id, compactIndex.get(rawColumns.get(n.id)!)!]));

  const cols = Math.max(distinctColumns.length, 1);
  const viewBoxWidth = 2 * MARGIN_X + cols * NODE_WIDTH + (cols - 1) * COL_GAP;

  const autoNodesByColumn = new Map<number, WalkthroughNode[]>();
  for (const node of nodes) {
    if (node.position) continue;
    const col = columnOf.get(node.id) ?? 0;
    const list = autoNodesByColumn.get(col);
    if (list) list.push(node);
    else autoNodesByColumn.set(col, [node]);
  }

  const rowsMax = Math.max(1, ...[...autoNodesByColumn.values()].map((list) => list.length));
  const viewBoxHeight = 2 * MARGIN_Y + rowsMax * NODE_HEIGHT + (rowsMax - 1) * ROW_GAP;

  const positions = new Map<string, XY>();
  for (const node of nodes) {
    if (node.position) {
      positions.set(node.id, node.position);
      continue;
    }

    const col = columnOf.get(node.id) ?? 0;
    const x = MARGIN_X + col * (NODE_WIDTH + COL_GAP) + NODE_WIDTH / 2;

    const columnNodes = autoNodesByColumn.get(col) ?? [];
    const k = columnNodes.length;
    const i = columnNodes.indexOf(node);
    let y: number;
    if (k <= 1) {
      y = viewBoxHeight / 2;
    } else {
      const top = MARGIN_Y + NODE_HEIGHT / 2;
      const bot = viewBoxHeight - MARGIN_Y - NODE_HEIGHT / 2;
      y = top + (i * (bot - top)) / (k - 1);
    }

    positions.set(node.id, { x, y });
  }

  return { positions, viewBoxWidth, viewBoxHeight };
}
