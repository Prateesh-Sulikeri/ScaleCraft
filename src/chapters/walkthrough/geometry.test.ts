import { describe, expect, it } from "vitest";
import { computeEdgeGeometry, parseCubic, pointOnCubic } from "./geometry";
import type { WalkthroughEdge } from "./types";

const nodes = [
  { id: "a", position: { x: 80, y: 125 } },
  { id: "b", position: { x: 300, y: 125 } },
];

describe("parseCubic", () => {
  it("reads the control points back out of a real getBezierPath result", () => {
    const [d] = [...computeEdgeGeometry(nodes, [{ id: "e", source: "a", target: "b", kind: "request-flow" } as WalkthroughEdge]).values()];
    const segment = parseCubic(d);

    // The path must start on the source card's right boundary and end on
    // the target's left one - the packet rides these exact endpoints.
    expect(segment).not.toBeNull();
    expect(segment!.p0).toEqual({ x: 154, y: 125 });
    expect(segment!.p3).toEqual({ x: 226, y: 125 });
  });

  it("returns null for a path it can't read as one cubic", () => {
    expect(parseCubic("M 10,10")).toBeNull();
    expect(parseCubic("")).toBeNull();
  });
});

describe("pointOnCubic", () => {
  const segment = { p0: { x: 0, y: 0 }, p1: { x: 0, y: 100 }, p2: { x: 100, y: 100 }, p3: { x: 100, y: 0 } };

  it("starts at the source and ends at the target", () => {
    expect(pointOnCubic(segment, 0)).toEqual({ x: 0, y: 0 });
    expect(pointOnCubic(segment, 1)).toEqual({ x: 100, y: 0 });
  });

  it("advances monotonically along the curve", () => {
    const xs = [0, 0.25, 0.5, 0.75, 1].map((t) => pointOnCubic(segment, t).x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it("clamps out-of-range t to the endpoints, so a trailing dot can't run off the path", () => {
    expect(pointOnCubic(segment, -0.5)).toEqual(pointOnCubic(segment, 0));
    expect(pointOnCubic(segment, 1.5)).toEqual(pointOnCubic(segment, 1));
  });
});
