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
  it("reports a component with the wrong config as misconfigured, not missing", () => {
    const graph: ArchitectureGraph = {
      nodes: [{ ...node("fw", "firewall"), config: { defaultPolicy: "allow-all" } }, node("app", "app-server")],
      edges: [{ id: "e1", source: "fw", target: "app", kind: "request-flow" }],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: {
        nodes: [
          { alias: "fw", componentId: "firewall", config: [{ field: "defaultPolicy", op: "in", value: ["deny-all", "allow-listed"] }] },
          { alias: "app", componentId: "app-server" },
        ],
        edges: [{ from: "fw", to: "app" }],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.missingComponents).toEqual([]);
    expect(drift.extraComponentIds).toEqual([]);
    expect(drift.mismatchedConnections).toEqual([]);
    expect(drift.misconfiguredComponents).toEqual([
      "Firewall: default policy should be deny-all or allow-listed (is allow-all)",
    ]);
  });

  it("names a fired absent block inside require by its label", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("l1", "leader"), node("l2", "leader")],
      edges: [],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: {
        nodes: [{ alias: "leader", componentId: "leader" }],
        absent: [{ label: "a second Leader", nodes: [{ alias: "other", componentId: "leader" }] }],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.forbiddenPatterns).toEqual(["a second Leader"]);
  });

  it("binds duplicate component types to the instances that satisfy their edges", () => {
    // Two workers: the queue feeds w2, the cron job feeds w1. A first-candidate
    // binding put both aliases on the wrong worker and reported both edges.
    const graph: ArchitectureGraph = {
      nodes: [node("w1", "worker"), node("w2", "worker"), node("q", "message-queue"), node("cron", "cron-job"), node("app", "app-server")],
      edges: [
        { id: "e1", source: "q", target: "w2", kind: "async" },
        { id: "e2", source: "cron", target: "w1", kind: "request-flow" },
      ],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: {
        nodes: [
          { alias: "consumer", componentId: "worker" },
          { alias: "report", componentId: "worker" },
          { alias: "q", componentId: "message-queue" },
          { alias: "cron", componentId: "cron-job" },
          { alias: "app", componentId: "app-server" },
        ],
        edges: [
          { from: "q", to: "consumer", kind: "async" },
          { from: "cron", to: "report", kind: "request-flow" },
          { from: "app", to: "q", kind: "async" },
        ],
      },
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.mismatchedConnections).toEqual(["Application Server -> Message Queue (async)"]);
  });

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

  it("reports a matched forbid pattern by its label when require is satisfied", () => {
    const graph: ArchitectureGraph = { nodes: [node("n1", "leader"), node("n2", "leader")], edges: [], entryPointIds: [] };
    const bp = blueprint({
      require: { nodes: [{ alias: "l", componentId: "leader" }] },
      forbid: [
        {
          id: "split-brain",
          label: "two Leaders with nothing deciding between them",
          nodes: [
            { alias: "l1", componentId: "leader" },
            { alias: "l2", componentId: "leader" },
          ],
          absent: [{ nodes: [{ alias: "c", componentId: "coordinator" }] }],
        },
      ],
    });

    const drift = nearestBlueprintDrift(buildGraphIndex(graph), [bp]);

    expect(drift.missingComponents).toEqual([]);
    expect(drift.forbiddenPatterns).toEqual(["two Leaders with nothing deciding between them"]);
  });

  it("does not report a forbid pattern the graph avoids", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("n1", "leader"), node("n2", "leader"), node("n3", "coordinator")],
      edges: [],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: { nodes: [{ alias: "l", componentId: "leader" }] },
      forbid: [
        {
          id: "split-brain",
          nodes: [
            { alias: "l1", componentId: "leader" },
            { alias: "l2", componentId: "leader" },
          ],
          absent: [{ nodes: [{ alias: "c", componentId: "coordinator" }] }],
        },
      ],
    });

    expect(nearestBlueprintDrift(buildGraphIndex(graph), [bp]).forbiddenPatterns).toEqual([]);
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
