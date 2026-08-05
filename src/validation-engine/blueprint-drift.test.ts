import { describe, it, expect } from "vitest";
import type { ArchitectureGraph, GraphNode } from "@/lib/graph";
import type { Blueprint } from "@/content/chapters/types";
import { buildGraphIndex } from "./graph-index";
import { nearestBlueprintDrift } from "./blueprint-drift";

function node(id: string, componentId: string): GraphNode {
  return { id, componentId, position: { x: 0, y: 0 }, config: {} };
}

function blueprint(overrides: Partial<Blueprint> = {}): Blueprint {
  return {
    id: "bp-1",
    label: "Test blueprint",
    require: { nodes: [] },
    commentary: "",
    ...overrides,
  };
}

describe("nearestBlueprintDrift", () => {
  it("reports a missing component by label when no candidate node exists anywhere on the canvas", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: [] };
    const bp = blueprint({
      require: { nodes: [{ alias: "c", componentId: "client" }, { alias: "cache", componentId: "cache" }] },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.blueprintId).toBe("bp-1");
    expect(drift.missingComponents).toEqual(["Cache"]);
    expect(drift.mismatchedConnections).toEqual([]);
  });

  it("reports a mismatched connection when both endpoints exist but aren't actually wired together", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("n1", "client"), node("n2", "app-server")],
      edges: [],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: {
        nodes: [{ alias: "c", componentId: "client" }, { alias: "app", componentId: "app-server" }],
        edges: [{ from: "c", to: "app" }],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.missingComponents).toEqual([]);
    expect(drift.mismatchedConnections).toHaveLength(1);
    expect(drift.mismatchedConnections[0]).toMatch(/Client/);
    expect(drift.mismatchedConnections[0]).toMatch(/Application Server/);
  });

  it("names the required edge kind in a mismatched connection when one is specified", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("n1", "client"), node("n2", "app-server")],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "control" }],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: {
        nodes: [{ alias: "c", componentId: "client" }, { alias: "app", componentId: "app-server" }],
        edges: [{ from: "c", to: "app", kind: "request-flow" }],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    // The edge exists but with the wrong kind — still a mismatch, and the
    // required kind is named so the report is specific, not just "missing".
    expect(drift.mismatchedConnections).toHaveLength(1);
    expect(drift.mismatchedConnections[0]).toMatch(/request-flow/);
  });

  it("does not report a mismatched connection when a node on that edge is already missing", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: [] };
    const bp = blueprint({
      require: {
        nodes: [{ alias: "c", componentId: "client" }, { alias: "app", componentId: "app-server" }],
        edges: [{ from: "c", to: "app" }],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.missingComponents).toEqual(["Application Server"]);
    // The edge check is skipped entirely once one endpoint has no binding —
    // no double-reporting the same underlying gap two different ways.
    expect(drift.mismatchedConnections).toEqual([]);
  });

  it("reports componentIds present on the canvas that the blueprint's shape never references as extra", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("n1", "client"), node("n2", "message-queue")],
      edges: [],
      entryPointIds: [],
    };
    const bp = blueprint({ require: { nodes: [{ alias: "c", componentId: "client" }] } });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.extraComponentIds).toEqual(["message-queue"]);
  });

  it("never reports a node the shape actually matched as extra", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: [] };
    const bp = blueprint({ require: { nodes: [{ alias: "c", componentId: "client" }] } });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.extraComponentIds).toEqual([]);
  });

  it("picks the blueprint with the fewest outstanding issues as nearest", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: [] };
    const closeBp = blueprint({
      id: "close",
      require: { nodes: [{ alias: "c", componentId: "client" }, { alias: "cache", componentId: "cache" }] },
    });
    const farBp = blueprint({
      id: "far",
      require: {
        nodes: [
          { alias: "c", componentId: "client" },
          { alias: "cache", componentId: "cache" },
          { alias: "q", componentId: "message-queue" },
        ],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [farBp, closeBp]);

    expect(drift.blueprintId).toBe("close");
  });

  it("breaks a tie between equally-close blueprints by declaration order", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: [] };
    const bpA = blueprint({ id: "a", require: { nodes: [{ alias: "c", componentId: "cache" }] } });
    const bpB = blueprint({ id: "b", require: { nodes: [{ alias: "q", componentId: "message-queue" }] } });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bpA, bpB]);

    expect(drift.blueprintId).toBe("a");
  });
});
