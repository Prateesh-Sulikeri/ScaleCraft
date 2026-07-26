import { describe, expect, it } from "vitest";
import { emptyGraph } from "./graph";

describe("emptyGraph", () => {
  it("returns an empty architecture graph", () => {
    expect(emptyGraph()).toEqual({ nodes: [], edges: [], entryPointIds: [] });
  });

  it("returns a fresh object each call (no shared mutable state across callers)", () => {
    const a = emptyGraph();
    const b = emptyGraph();
    expect(a).not.toBe(b);
    expect(a.nodes).not.toBe(b.nodes);

    a.nodes.push({ id: "x", componentId: "client", position: { x: 0, y: 0 }, config: {} });
    expect(b.nodes).toHaveLength(0);
  });
});
