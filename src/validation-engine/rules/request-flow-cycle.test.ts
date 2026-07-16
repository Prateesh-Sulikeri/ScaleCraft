import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { requestFlowCycle } from "./request-flow-cycle";

const a = { id: "a", componentId: "app-server", position: { x: 0, y: 0 }, config: {} };
const b = { id: "b", componentId: "app-server", position: { x: 1, y: 0 }, config: {} };
const c = { id: "c", componentId: "app-server", position: { x: 2, y: 0 }, config: {} };

describe("requestFlowCycle", () => {
  it("flags a 3-node request-flow cycle", () => {
    const graph: ArchitectureGraph = {
      nodes: [a, b, c],
      edges: [
        { id: "e1", source: "a", target: "b", kind: "request-flow" },
        { id: "e2", source: "b", target: "c", kind: "request-flow" },
        { id: "e3", source: "c", target: "a", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    const violations = runValidation(graph, [requestFlowCycle]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("error");
    expect(violations[0].offendingNodeIds).toEqual(expect.arrayContaining(["a", "b", "c"]));
  });

  it("does not flag a linear request-flow chain", () => {
    const graph: ArchitectureGraph = {
      nodes: [a, b, c],
      edges: [
        { id: "e1", source: "a", target: "b", kind: "request-flow" },
        { id: "e2", source: "b", target: "c", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [requestFlowCycle])).toHaveLength(0);
  });

  it("does not flag a cycle made of replication edges (legitimate back-edge)", () => {
    const graph: ArchitectureGraph = {
      nodes: [a, b],
      edges: [
        { id: "e1", source: "a", target: "b", kind: "replication" },
        { id: "e2", source: "b", target: "a", kind: "replication" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [requestFlowCycle])).toHaveLength(0);
  });
});
