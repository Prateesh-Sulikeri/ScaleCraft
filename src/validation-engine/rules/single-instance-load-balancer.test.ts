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
      entryPointIds: [],
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
      entryPointIds: [],
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
      entryPointIds: [],
    };

    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("does not flag a Load Balancer with no outgoing edges (a different, unrelated problem)", () => {
    const graph: ArchitectureGraph = { nodes: [lb], edges: [], entryPointIds: [] };
    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("counts non-app-server backends as adding 1 capacity each", () => {
    const cache = { id: "cache-1", componentId: "redis-cache", position: { x: 1, y: 0 }, config: {} };
    const graph: ArchitectureGraph = {
      nodes: [lb, cache],
      edges: [{ id: "e1", source: "lb-1", target: "cache-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    // Non-app-server backend adds 1 capacity, but rule requires >= 2, so flags
    const violations = runValidation(graph, [singleInstanceLoadBalancer]);
    expect(violations).toHaveLength(1);
  });

  it("sums app-server instances + non-app-server backends correctly", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 1 } };
    const cache = { id: "cache-1", componentId: "redis-cache", position: { x: 2, y: 0 }, config: {} };
    const graph: ArchitectureGraph = {
      nodes: [lb, app, cache],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-1", target: "cache-1", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("uses default instances count of 1 when config is undefined", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: undefined };
    const app2 = { id: "app-2", componentId: "app-server", position: { x: 1, y: 1 }, config: { instances: 2 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app, app2],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-1", target: "app-2", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    // app-1 defaults to 1 instance, app-2 has 2, total = 3, passes
    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("uses default instances count of 1 when config.instances is missing", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { algorithm: "round-robin" } };
    const app2 = { id: "app-2", componentId: "app-server", position: { x: 1, y: 1 }, config: { instances: 1 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app, app2],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-1", target: "app-2", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    // app-1 defaults to 1 instance (no instances field), app-2 has 1, total = 2, passes
    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("ignores non-request-flow edges when calculating capacity", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 1 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app],
      edges: [{ id: "e1", source: "lb-1", target: "app-1", kind: "replication" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("handles target node not found in graph gracefully (malformed graph) — counts toward capacity but not found = no capacity", () => {
    // When a target is missing from nodes, it doesn't contribute to capacity, so capacity = 0
    const graph: ArchitectureGraph = {
      nodes: [lb],
      edges: [{ id: "e1", source: "lb-1", target: "missing-node-123", kind: "request-flow" }],
      entryPointIds: [],
    };

    // Missing target means capacity is 0, which triggers the violation
    const violations = runValidation(graph, [singleInstanceLoadBalancer]);
    expect(violations).toHaveLength(1);
    expect(violations[0].offendingNodeIds).toEqual(["lb-1", "missing-node-123"]);
  });

  it("ignores edges to missing targets when calculating with other valid targets", () => {
    const app = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 2 } };
    const graph: ArchitectureGraph = {
      nodes: [lb, app],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-1", target: "missing-node-123", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    // Missing target contributes 0, app-1 contributes 2, total = 2, passes
    expect(runValidation(graph, [singleInstanceLoadBalancer])).toHaveLength(0);
  });

  it("flags multiple load balancers independently", () => {
    const lb2 = { id: "lb-2", componentId: "load-balancer", position: { x: 0, y: 1 }, config: { algorithm: "least-connections" } };
    const app1 = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: { instances: 1 } };
    const app2 = { id: "app-2", componentId: "app-server", position: { x: 1, y: 1 }, config: { instances: 2 } };

    const graph: ArchitectureGraph = {
      nodes: [lb, lb2, app1, app2],
      edges: [
        { id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "lb-2", target: "app-2", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    const violations = runValidation(graph, [singleInstanceLoadBalancer]);
    expect(violations).toHaveLength(1);
    expect(violations[0].offendingNodeIds).toContain("lb-1");
    expect(violations[0].offendingNodeIds).not.toContain("lb-2");
  });
});
