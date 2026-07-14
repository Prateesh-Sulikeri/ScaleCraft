import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { singleInstanceLoadBalancer } from "./single-instance-load-balancer";

const lb = { id: "lb-1", componentId: "load-balancer", position: { x: 0, y: 0 }, config: { algorithm: "round-robin" } };

describe("singleInstanceLoadBalancer", () => {
  it("flags a Load Balancer pointed at a single-instance App Server", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 1 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app],
      edges: [{ id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" }],
    };

    const violations = runValidation(graph, [singleInstanceLoadBalancer]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("warning");
    expect(violations[0].offendingNodeIds).toEqual(["lb-1", "app-1"]);
  });

  it("passes when the App Server's instances config is bumped to 2 — config alone flips the result", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 2 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app],
      edges: [{ id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" }],
    };

    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("passes when two single-instance backends together provide capacity", () => {
    const app1 = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 1 } };
    const app2 = { id: "app-2", componentId: "app-server", position: { x: 1, y: 1 }, config: { instances: 1 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app1, app2],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-1", target: "app-2", kind: "request-flow" },
      ],
    };

    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("does not flag a Load Balancer with no outgoing edges (a different, unrelated problem)", () => {
    const graph: ArchitectureGraph = { nodes: [lb], edges: [] };
    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });
});
