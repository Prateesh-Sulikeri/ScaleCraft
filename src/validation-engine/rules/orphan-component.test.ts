import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { orphanComponent } from "./orphan-component";

const cron = { id: "cron-1", componentId: "cron-job", position: { x: 0, y: 0 }, config: {} };
const cdn = { id: "cdn-1", componentId: "cdn", position: { x: 1, y: 0 }, config: {} };
const client = { id: "client-1", componentId: "client", position: { x: 2, y: 0 }, config: {} };
const lb = { id: "lb-1", componentId: "load-balancer", position: { x: 3, y: 0 }, config: {} };

describe("orphanComponent", () => {
  it("flags a component with no edges and no entry point", () => {
    const graph: ArchitectureGraph = { nodes: [cron], edges: [], entryPointIds: [] };

    const violations = runValidation(graph, [orphanComponent]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("warning");
    expect(violations[0].offendingNodeIds).toEqual(["cron-1"]);
  });

  it("flags every disconnected component in the same graph, independent of componentId", () => {
    const graph: ArchitectureGraph = { nodes: [cron, cdn], edges: [], entryPointIds: [] };

    const violations = runValidation(graph, [orphanComponent]);
    expect(violations).toHaveLength(2);
  });

  it("does not flag a component connected only via a Start marker", () => {
    const graph: ArchitectureGraph = { nodes: [client], edges: [], entryPointIds: ["client-1"] };

    expect(runValidation(graph, [orphanComponent])).toHaveLength(0);
  });

  it("does not flag a component with at least one real edge", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, lb],
      edges: [{ id: "e1", source: "client-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [orphanComponent])).toHaveLength(0);
  });
});
