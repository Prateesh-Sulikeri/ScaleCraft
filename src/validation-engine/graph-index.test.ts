import { describe, expect, it } from "vitest";
import type { ArchitectureGraph, EdgeKind, GraphEdge, GraphNode } from "@/lib/graph";
import { buildGraphIndex } from "./graph-index";

function node(id: string): GraphNode {
  return { id, componentId: "client", position: { x: 0, y: 0 }, config: {} };
}

function edge(id: string, source: string, target: string, kind: EdgeKind = "request-flow"): GraphEdge {
  return { id, source, target, kind };
}

describe("buildGraphIndex", () => {
  it("computes outEdges/inEdges correctly on a 5-node graph with mixed edge kinds", () => {
    const nodes = ["a", "b", "c", "d", "e"].map(node);
    const edges = [
      edge("e1", "a", "b", "request-flow"),
      edge("e2", "a", "c", "control"),
      edge("e3", "b", "d", "replication"),
      edge("e4", "c", "d", "async"),
      edge("e5", "d", "e", "request-flow"),
    ];
    const graph: ArchitectureGraph = { nodes, edges, entryPointIds: [] };

    const index = buildGraphIndex(graph);

    expect(index.outEdges.get("a")?.map((e) => e.id)).toEqual(["e1", "e2"]);
    expect(index.outEdges.get("d")?.map((e) => e.id)).toEqual(["e5"]);
    expect(index.outEdges.get("e")).toEqual([]);

    expect(index.inEdges.get("d")?.map((e) => e.id)).toEqual(["e3", "e4"]);
    expect(index.inEdges.get("a")).toEqual([]);
    expect(index.inEdges.get("e")?.map((e) => e.id)).toEqual(["e5"]);
  });

  it("reachable() finds a direct neighbor", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b"].map(node),
      edges: [edge("e1", "a", "b")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    expect(index.reachable("a")).toEqual(new Set(["b"]));
  });

  it("reachable() traverses multiple hops", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b", "c", "d"].map(node),
      edges: [edge("e1", "a", "b"), edge("e2", "b", "c"), edge("e3", "c", "d")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    expect(index.reachable("a")).toEqual(new Set(["b", "c", "d"]));
  });

  it("reachable() excludes a node with no path from the source", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b", "isolated"].map(node),
      edges: [edge("e1", "a", "b")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    expect(index.reachable("a")).toEqual(new Set(["b"]));
    expect(index.reachable("a").has("isolated")).toBe(false);
  });

  it("reachable(from, kinds) excludes a path that only exists via a non-matching edge kind", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b", "c"].map(node),
      edges: [edge("e1", "a", "b", "request-flow"), edge("e2", "b", "c", "control")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);

    expect(index.reachable("a", ["request-flow"])).toEqual(new Set(["b"]));
    expect(index.reachable("a")).toEqual(new Set(["b", "c"]));
  });

  it("reachable() terminates and returns the correct set on a graph containing a cycle", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b", "c"].map(node),
      edges: [edge("e1", "a", "b"), edge("e2", "b", "c"), edge("e3", "c", "a")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    expect(index.reachable("a")).toEqual(new Set(["a", "b", "c"]));
  });

  it("memoizes reachable() for the same (from, kinds) — same reference, not just equal content", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a", "b"].map(node),
      edges: [edge("e1", "a", "b")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const first = index.reachable("a");
    const second = index.reachable("a");
    expect(second).toBe(first);
    expect(second).toEqual(first);
  });

  it("populates entryPoints from graph.entryPointIds unchanged", () => {
    const graph: ArchitectureGraph = {
      nodes: ["a"].map(node),
      edges: [],
      entryPointIds: ["a", "ghost-id"],
    };
    const index = buildGraphIndex(graph);
    expect(index.entryPoints).toEqual(new Set(["a", "ghost-id"]));
  });

  it("stays fast on a ~150-node synthetic graph", () => {
    const nodeCount = 150;
    const nodes = Array.from({ length: nodeCount }, (_, i) => node(`n${i}`));
    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      edges.push(edge(`chain-${i}`, `n${i}`, `n${i + 1}`));
    }
    // A handful of extra cross-links so reachable() isn't just walking a line.
    for (let i = 0; i < nodeCount; i += 7) {
      edges.push(edge(`cross-${i}`, `n${i}`, `n${(i + 13) % nodeCount}`, "control"));
    }
    const graph: ArchitectureGraph = { nodes, edges, entryPointIds: [] };

    const start = performance.now();
    const index = buildGraphIndex(graph);
    for (let i = 0; i < nodeCount; i += 10) {
      index.reachable(`n${i}`);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
  });
});
