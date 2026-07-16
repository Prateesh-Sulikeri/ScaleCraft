import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { missingInputConnection } from "./missing-input-connection";

const client = { id: "client-1", componentId: "client", position: { x: 0, y: 0 }, config: {} };
const gateway = { id: "gw-1", componentId: "api-gateway", position: { x: 1, y: 0 }, config: {} };
const lb = { id: "lb-1", componentId: "load-balancer", position: { x: 2, y: 0 }, config: {} };

describe("missingInputConnection", () => {
  it("flags an API Gateway with an outgoing edge but no incoming edge", () => {
    const graph: ArchitectureGraph = {
      nodes: [gateway, lb],
      edges: [{ id: "e1", source: "gw-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    const violations = runValidation(graph, [missingInputConnection]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("error");
    expect(violations[0].offendingNodeIds).toEqual(["gw-1"]);
  });

  it("does not flag a Client even with zero incoming edges (inputs: [] by design)", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, lb],
      edges: [{ id: "e1", source: "client-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [missingInputConnection])).toHaveLength(0);
  });

  it("does not flag a fully isolated component (that's orphan-component's job)", () => {
    const graph: ArchitectureGraph = { nodes: [gateway], edges: [], entryPointIds: [] };

    expect(runValidation(graph, [missingInputConnection])).toHaveLength(0);
  });

  it("does not flag a Gateway whose input is satisfied by a Start marker", () => {
    const graph: ArchitectureGraph = {
      nodes: [gateway, lb],
      edges: [{ id: "e1", source: "gw-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: ["gw-1"],
    };

    expect(runValidation(graph, [missingInputConnection])).toHaveLength(0);
  });

  it("passes once a Client feeds into the Gateway", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, gateway, lb],
      edges: [
        { id: "e1", source: "client-1", target: "gw-1", kind: "request-flow" },
        { id: "e2", source: "gw-1", target: "lb-1", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [missingInputConnection])).toHaveLength(0);
  });
});
