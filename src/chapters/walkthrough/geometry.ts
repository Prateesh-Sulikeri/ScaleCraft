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

/** The four control points of a single cubic bezier, in viewBox units. */
export type CubicSegment = { p0: XY; p1: XY; p2: XY; p3: XY };

/**
 * Reads the control points back out of a `getBezierPath` result, which is
 * always exactly one cubic ("M sx,sy C c1x,c1y c2x,c2y tx,ty") - so eight
 * numbers in order is the whole path, and the packet's position can be
 * computed arithmetically.
 *
 * Deliberately arithmetic rather than `SVGGeometryElement.getPointAtLength`:
 * that needs a mounted, laid-out DOM node (unavailable during the first
 * paint and unimplemented in jsdom), while this is a pure function the tests
 * can exercise directly.
 */
export function parseCubic(d: string): CubicSegment | null {
  const numbers = d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi);
  if (!numbers || numbers.length < 8) return null;
  const [x0, y0, x1, y1, x2, y2, x3, y3] = numbers.slice(0, 8).map(Number);
  return { p0: { x: x0, y: y0 }, p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 }, p3: { x: x3, y: y3 } };
}

/** Point on `segment` at curve parameter `t` (0..1). Note t is the bezier
 * parameter, not normalized arc length - on the shallow curves this diagram
 * draws, the difference in apparent speed is not perceptible, and an
 * arc-length reparameterization would cost a sampling table per edge. */
export function pointOnCubic(segment: CubicSegment, t: number): XY {
  const clamped = Math.min(Math.max(t, 0), 1);
  const u = 1 - clamped;
  const a = u * u * u;
  const b = 3 * u * u * clamped;
  const c = 3 * u * clamped * clamped;
  const d = clamped * clamped * clamped;
  return {
    x: a * segment.p0.x + b * segment.p1.x + c * segment.p2.x + d * segment.p3.x,
    y: a * segment.p0.y + b * segment.p1.y + c * segment.p2.y + d * segment.p3.y,
  };
}
