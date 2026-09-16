import { Position, getBezierPath } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { bowedEdgePath } from "./ArchitectureEdge";
import { PORT_IDS, routeCurvedEdge, type Box } from "./edge-routing";

/** The four numbers a cubic path string carries, read back out of it - so
 * these assertions test the path that actually ships, not a re-derivation. */
function samplePath(d: string, steps = 200) {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = n;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const e = t * t * t;
    points.push({ x: a * x0 + b * x1 + c * x2 + e * x3, y: a * y0 + b * y1 + c * y2 + e * y3 });
  }
  return points;
}

const inside = (p: { x: number; y: number }, b: Box) =>
  p.x > b.x && p.x < b.x + b.width && p.y > b.y && p.y < b.y + b.height;

/** Where a port sits on a card. xyflow puts a handle's centre on the border. */
const portPoint = (b: Box, handle: string) => {
  if (handle === PORT_IDS.left) return { x: b.x, y: b.y + b.height / 2, pos: Position.Left };
  if (handle === PORT_IDS.right) return { x: b.x + b.width, y: b.y + b.height / 2, pos: Position.Right };
  if (handle === PORT_IDS.top) return { x: b.x + b.width / 2, y: b.y, pos: Position.Top };
  return { x: b.x + b.width / 2, y: b.y + b.height, pos: Position.Bottom };
};

function pathFor(source: Box, target: Box, others: Box[], reciprocal = false) {
  const route = routeCurvedEdge(source, target, others, PORT_IDS, reciprocal);
  const s = portPoint(source, route.sourceHandle);
  const t = portPoint(target, route.targetHandle);
  const args = {
    sourceX: s.x,
    sourceY: s.y,
    sourcePosition: s.pos,
    targetX: t.x,
    targetY: t.y,
    targetPosition: t.pos,
  };
  return route.bow ? bowedEdgePath({ ...args, bow: route.bow }) : getBezierPath(args)[0];
}

describe("bowed edges", () => {
  // 3.12's starter graph: the primary, the replica, and the NoSQL card that
  // stands between them. Wiring the primary to the replica is the exercise.
  const db: Box = { x: 840, y: 0, width: 120, height: 96 };
  const nosql: Box = { x: 840, y: 160, width: 120, height: 96 };
  const replica: Box = { x: 840, y: 320, width: 120, height: 96 };
  const column = [db, nosql, replica];

  it("keeps a replication feed outside the card standing between primary and replica", () => {
    const points = samplePath(pathFor(db, replica, column));
    expect(points.filter((p) => inside(p, nosql))).toEqual([]);
  });

  it("stays outside it on the way back up too", () => {
    const points = samplePath(pathFor(replica, db, column));
    expect(points.filter((p) => inside(p, nosql))).toEqual([]);
  });

  // The regression, stated as geometry: the same pair of cards routed the old
  // way (both ends on their card's right side) is a straight vertical line
  // ruled along the blocker's border, because xyflow's bezier control offset
  // is driven by the gap along the handle's own axis - which is zero when the
  // two cards are column-aligned.
  it("does not collapse onto the blocker's border the way the same-side route did", () => {
    const sameSide = getBezierPath({
      sourceX: 960,
      sourceY: 48,
      sourcePosition: Position.Right,
      targetX: 960,
      targetY: 368,
      targetPosition: Position.Right,
    })[0];
    expect(samplePath(sameSide).every((p) => Math.abs(p.x - 960) < 1e-9)).toBe(true);

    const bowed = samplePath(pathFor(db, replica, column));
    const clearance = Math.max(...bowed.map((p) => p.x)) - (nosql.x + nosql.width);
    expect(clearance).toBeGreaterThan(20);
  });

  it("clears a card a learner has widened", () => {
    const wide: Box = { x: 840, y: 160, width: 200, height: 96 };
    const points = samplePath(pathFor(db, replica, [db, wide, replica]));
    expect(points.filter((p) => inside(p, wide))).toEqual([]);
  });

  it("routes a tier-skipping edge clear of the tier it skips", () => {
    const a: Box = { x: 0, y: 0, width: 120, height: 96 };
    const middle: Box = { x: 260, y: 0, width: 120, height: 96 };
    const c: Box = { x: 520, y: 0, width: 120, height: 96 };
    const points = samplePath(pathFor(a, c, [a, middle, c]));
    expect(points.filter((p) => inside(p, middle))).toEqual([]);
  });

  // Both halves of a two-way pair resolve to the same two ports in reverse
  // order, so without the bow one is drawn exactly on top of the other.
  it("separates the two halves of a two-way pair", () => {
    const a: Box = { x: 0, y: 0, width: 120, height: 96 };
    const b: Box = { x: 260, y: 0, width: 120, height: 96 };
    const forward = samplePath(pathFor(a, b, [a, b], true));
    const backward = samplePath(pathFor(b, a, [a, b], true));
    // Compare at matching x, since the two run in opposite directions.
    const gap = forward[100].y - backward[100].y;
    expect(Math.abs(gap)).toBeGreaterThan(30);
  });

  it("leaves an ordinary edge on xyflow's own curve, byte for byte", () => {
    const a: Box = { x: 0, y: 0, width: 120, height: 96 };
    const b: Box = { x: 260, y: 0, width: 120, height: 96 };
    expect(pathFor(a, b, [a, b])).toBe(
      getBezierPath({
        sourceX: 120,
        sourceY: 48,
        sourcePosition: Position.Right,
        targetX: 260,
        targetY: 48,
        targetPosition: Position.Left,
      })[0],
    );
  });
});
