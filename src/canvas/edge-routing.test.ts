import { describe, expect, it } from "vitest";
import {
  centerDelta,
  fanOutStepPositions,
  horizontalRunBlocked,
  pickEdgeHandles,
  reciprocalEdgeIds,
  routeEdge,
  verticalRunBlocked,
  PORT_IDS,
} from "./edge-routing";

const box = (x: number, y: number) => ({ x, y, width: 120, height: 96 });

describe("pickEdgeHandles", () => {
  it("sends a forward edge out of the right and into the left", () => {
    const { dx, dy } = centerDelta(box(0, 0), box(260, 0));
    expect(pickEdgeHandles(dx, dy, PORT_IDS)).toEqual({
      sourceHandle: PORT_IDS.right,
      targetHandle: PORT_IDS.left,
    });
  });

  it("sends a downward edge out of the bottom and into the top", () => {
    const { dx, dy } = centerDelta(box(0, 0), box(0, 160));
    expect(pickEdgeHandles(dx, dy, PORT_IDS)).toEqual({
      sourceHandle: PORT_IDS.bottom,
      targetHandle: PORT_IDS.top,
    });
  });

  // The defect this whole module exists to kill. A card sits above its source
  // (a learner dragged it there, or a graph has a genuine feedback path). The
  // only outgoing sides used to be right and bottom, so the edge left
  // downward, doubled straight back over itself and arrived at a top handle
  // *above* where it started. On screen that is one line laid on another, and
  // it reads as joining two cards it has nothing to do with.
  it("sends an upward edge out of the top, never doubling back out of the bottom", () => {
    const { dx, dy } = centerDelta(box(0, 320), box(0, 0));
    const pair = pickEdgeHandles(dx, dy, PORT_IDS);
    expect(pair).toEqual({ sourceHandle: PORT_IDS.top, targetHandle: PORT_IDS.bottom });
    expect(pair.sourceHandle).not.toBe(PORT_IDS.bottom);
  });

  it("sends a backward edge out of the left and into the right, at any vertical offset", () => {
    for (const targetY of [-400, 0, 400]) {
      const { dx, dy } = centerDelta(box(520, 0), box(0, targetY));
      expect(pickEdgeHandles(dx, dy, PORT_IDS), `target at y=${targetY}`).toEqual({
        sourceHandle: PORT_IDS.left,
        targetHandle: PORT_IDS.right,
      });
    }
  });

  // A fan-out's outer branches travel further vertically than horizontally.
  // Choosing the pair by `|dx| >= |dy|` therefore sent exactly those out of
  // the card's bottom while the inner branches left its right - three edges,
  // two different sides, no longer reading as one fan.
  it("keeps every branch of a fan-out leaving the same side", () => {
    const source = box(0, 320);
    const sides = [box(260, 0), box(260, 160), box(260, 320)].map((target) => {
      const { dx, dy } = centerDelta(source, target);
      return pickEdgeHandles(dx, dy, PORT_IDS).sourceHandle;
    });
    expect(new Set(sides)).toEqual(new Set([PORT_IDS.right]));
  });
});

describe("fanOutStepPositions", () => {
  const edges = [
    { id: "near", source: "app", sourceHandle: PORT_IDS.right, dy: 0 },
    { id: "mid", source: "app", sourceHandle: PORT_IDS.right, dy: -160 },
    { id: "far", source: "app", sourceHandle: PORT_IDS.right, dy: -320 },
  ];
  const deltaOf = (e: (typeof edges)[number]) => ({ dy: e.dy });

  // Without this, all three turn at the midpoint of the gap, their vertical
  // runs sit exactly on top of each other, and the fan looks like one thick
  // stroke that mysteriously sprouts arrowheads.
  it("gives each branch of a fan-out its own turn position", () => {
    const steps = fanOutStepPositions(edges, deltaOf);
    const values = [steps.get("near"), steps.get("mid"), steps.get("far")];
    expect(new Set(values).size).toBe(3);
  });

  it("turns the furthest branch last, so the channels nest instead of crossing", () => {
    const steps = fanOutStepPositions(edges, deltaOf);
    expect(steps.get("near")!).toBeLessThan(steps.get("mid")!);
    expect(steps.get("mid")!).toBeLessThan(steps.get("far")!);
  });

  it("leaves a lone edge on the default midpoint", () => {
    const steps = fanOutStepPositions([edges[0]], deltaOf);
    expect(steps.has("near")).toBe(false);
  });

  it("treats edges out of different ports as separate fans", () => {
    const steps = fanOutStepPositions(
      [
        { id: "a", source: "app", sourceHandle: PORT_IDS.right, dy: 0 },
        { id: "b", source: "app", sourceHandle: PORT_IDS.bottom, dy: 160 },
      ],
      deltaOf,
    );
    expect(steps.size).toBe(0);
  });
});

describe("verticalRunBlocked", () => {
  const a = box(0, 0);
  const middle = box(0, 160);
  const c = box(0, 320);

  it("spots a card standing between two column-aligned cards", () => {
    expect(verticalRunBlocked(a, c, [a, middle, c])).toBe(true);
  });

  it("leaves an adjacent pair alone", () => {
    expect(verticalRunBlocked(a, middle, [a, middle, c])).toBe(false);
  });

  it("ignores a card in a different column", () => {
    expect(verticalRunBlocked(a, c, [a, box(260, 160), c])).toBe(false);
  });

  // The case that drew a replication feed straight through a NoSQL card: a
  // primary and its replica two rows apart with a third database between.
  it("routes a blocked run out of and back into the same side", () => {
    const { dx, dy } = centerDelta(a, c);
    expect(pickEdgeHandles(dx, dy, PORT_IDS, { blocked: true })).toEqual({
      sourceHandle: PORT_IDS.right,
      targetHandle: PORT_IDS.right,
    });
    expect(pickEdgeHandles(dx, dy, PORT_IDS, { blocked: false })).toEqual({
      sourceHandle: PORT_IDS.bottom,
      targetHandle: PORT_IDS.top,
    });
  });
});

describe("horizontalRunBlocked", () => {
  const a = box(0, 0);
  const middle = box(260, 0);
  const c = box(520, 0);

  // The mirror of the replication-feed case, and the one it missed: an edge
  // skipping a tier was drawn straight through the card it skipped.
  it("spots a card standing between two row-aligned cards", () => {
    expect(horizontalRunBlocked(a, c, [a, middle, c])).toBe(true);
  });

  it("leaves an adjacent pair alone", () => {
    expect(horizontalRunBlocked(a, middle, [a, middle, c])).toBe(false);
  });

  it("ignores a card in a different row", () => {
    expect(horizontalRunBlocked(a, c, [a, box(260, 320), c])).toBe(false);
  });

  it("routes a blocked horizontal run under the card in the way", () => {
    expect(routeEdge(a, c, [a, middle, c])).toEqual({
      sourceHandle: PORT_IDS.bottom,
      targetHandle: PORT_IDS.bottom,
    });
    expect(routeEdge(a, c, [a, c])).toEqual({
      sourceHandle: PORT_IDS.right,
      targetHandle: PORT_IDS.left,
    });
  });
});

describe("two-way pairs", () => {
  const a = box(0, 0);
  const b = box(260, 0);

  it("flags both halves of a pair that exists in both directions", () => {
    const ids = reciprocalEdgeIds([
      { id: "fwd", source: "a", target: "b" },
      { id: "back", source: "b", target: "a" },
      { id: "lone", source: "b", target: "c" },
    ]);
    expect(ids).toEqual(new Set(["fwd", "back"]));
  });

  // Without the detour both halves resolve to the same two ports in reverse
  // order - the same line, drawn twice. The learner sees one wire where they
  // made two, and only the top one can be clicked, inspected or deleted.
  it("moves exactly the backward half, so the two are never the same line", () => {
    const forward = routeEdge(a, b, [a, b], PORT_IDS, true);
    const backward = routeEdge(b, a, [a, b], PORT_IDS, true);
    expect(forward).toEqual({ sourceHandle: PORT_IDS.right, targetHandle: PORT_IDS.left });
    expect(backward).toEqual({ sourceHandle: PORT_IDS.top, targetHandle: PORT_IDS.top });
  });

  it("moves the backward half of a column-aligned pair too", () => {
    const down = box(0, 320);
    expect(routeEdge(a, down, [a, down], PORT_IDS, true)).toEqual({
      sourceHandle: PORT_IDS.bottom,
      targetHandle: PORT_IDS.top,
    });
    expect(routeEdge(down, a, [a, down], PORT_IDS, true)).toEqual({
      sourceHandle: PORT_IDS.left,
      targetHandle: PORT_IDS.left,
    });
  });

  // A detour and a route-around must not land on the same side either, or the
  // fix for one recreates the other.
  it("keeps a detour clear of the side a blocked run uses", () => {
    const far = box(520, 0);
    const middle = box(260, 0);
    const blockedDetour = routeEdge(far, a, [a, middle, far], PORT_IDS, true);
    const blockedForward = routeEdge(a, far, [a, middle, far], PORT_IDS, true);
    expect(blockedDetour).not.toEqual(blockedForward);
  });
});
