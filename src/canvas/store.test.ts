import { describe, expect, it } from "vitest";
import { toArchitectureGraph } from "./store";
import type { ComponentNodeType, ArchitectureEdgeType } from "./types";

describe("toArchitectureGraph", () => {
  it("translates RF-shaped nodes/edges to the domain ArchitectureGraph", () => {
    const nodes: ComponentNodeType[] = [
      {
        id: "n1",
        type: "component",
        position: { x: 10, y: 20 },
        data: { componentId: "client", config: {} },
      },
    ];
    const edges: ArchitectureEdgeType[] = [
      { id: "e1", source: "n1", target: "n1", data: { kind: "control" } },
    ];

    const graph = toArchitectureGraph(nodes, edges);

    expect(graph.nodes).toEqual([
      { id: "n1", componentId: "client", position: { x: 10, y: 20 }, config: {} },
    ]);
    expect(graph.edges).toEqual([{ id: "e1", source: "n1", target: "n1", kind: "control" }]);
  });

  it("defaults edges with no data to request-flow", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "a", target: "b" }];
    expect(toArchitectureGraph([], edges).edges[0].kind).toBe("request-flow");
  });
});
