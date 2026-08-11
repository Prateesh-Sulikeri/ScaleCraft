import { getBezierPath, Position } from "@xyflow/react";
import type { XY } from "@/lib/graph";
import type { WalkthroughEdge, WalkthroughNode } from "./types";

/**
 * Fixed card size, in the same viewBox-unit space as WalkthroughNode.position
 * - both the SVG anchor math here and WalkthroughNodeCard's CSS size use
 * these same numbers, so computed anchors always land exactly on the
 * rendered card's boundary. Fixed rather than measured (no ref/
 * ResizeObserver): keeps the "no DOM measurement" simplicity of the
 * original design, now anchored to real numbers instead of percentages.
 */
export const NODE_WIDTH = 148;
export const NODE_HEIGHT = 46;

const GAP = 14;

/** Dominant-axis port choice: a straight line between two node centers exits
 * whichever side (Left/Right vs Top/Bottom) the larger displacement is on. */
function resolveSides(centerA: XY, centerB: XY): { sourceSide: Position; targetSide: Position } {
  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { sourceSide: Position.Right, targetSide: Position.Left } : { sourceSide: Position.Left, targetSide: Position.Right };
  }
  return dy >= 0 ? { sourceSide: Position.Bottom, targetSide: Position.Top } : { sourceSide: Position.Top, targetSide: Position.Bottom };
}

/** The boundary point of a NODE_WIDTH x NODE_HEIGHT box centered at `center`,
 * on the given side. */
function anchor(center: XY, side: Position): XY {
  switch (side) {
    case Position.Right:
      return { x: center.x + NODE_WIDTH / 2, y: center.y };
    case Position.Left:
      return { x: center.x - NODE_WIDTH / 2, y: center.y };
    case Position.Bottom:
      return { x: center.x, y: center.y + NODE_HEIGHT / 2 };
    case Position.Top:
      return { x: center.x, y: center.y - NODE_HEIGHT / 2 };
  }
}

/**
 * Computes one curved SVG path per edge, anchored to node boundaries (not
 * centers) via getBezierPath (@xyflow/react - a pure geometry function, not
 * the ReactFlow component/canvas). Edges sharing the exact same
 * (source, target) pair - e.g. this chapter's request-flow + control edge
 * between the same Load Balancer/App Server pair - would otherwise anchor
 * to the identical boundary point and draw the identical curve; each such
 * group gets its anchors shifted sideways by a fixed GAP along the
 * perpendicular of the center-to-center direction, indexed by array
 * position, so they visually separate instead of overlapping.
 */
export function computeEdgeGeometry(nodes: WalkthroughNode[], edges: WalkthroughEdge[]): Map<string, string> {
  const centerById = new Map(nodes.map((n) => [n.id, n.position]));

  const groups = new Map<string, WalkthroughEdge[]>();
  for (const edge of edges) {
    const key = `${edge.source}->${edge.target}`;
    const group = groups.get(key);
    if (group) group.push(edge);
    else groups.set(key, [edge]);
  }

  const pathById = new Map<string, string>();
  for (const group of groups.values()) {
    const centerA = centerById.get(group[0].source);
    const centerB = centerById.get(group[0].target);
    if (!centerA || !centerB) continue;

    const { sourceSide, targetSide } = resolveSides(centerA, centerB);
    const sourceAnchor = anchor(centerA, sourceSide);
    const targetAnchor = anchor(centerB, targetSide);

    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;
    const len = Math.hypot(dx, dy) || 1;
    const perp: XY = { x: -dy / len, y: dx / len };

    group.forEach((edge, index) => {
      const offset = (index - (group.length - 1) / 2) * GAP;
      const src = offset === 0 ? sourceAnchor : { x: sourceAnchor.x + perp.x * offset, y: sourceAnchor.y + perp.y * offset };
      const tgt = offset === 0 ? targetAnchor : { x: targetAnchor.x + perp.x * offset, y: targetAnchor.y + perp.y * offset };
      const [path] = getBezierPath({
        sourceX: src.x,
        sourceY: src.y,
        sourcePosition: sourceSide,
        targetX: tgt.x,
        targetY: tgt.y,
        targetPosition: targetSide,
      });
      pathById.set(edge.id, path);
    });
  }

  return pathById;
}
