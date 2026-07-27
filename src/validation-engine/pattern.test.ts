import { describe, expect, it, vi } from "vitest";
import type { ArchitectureGraph, EdgeKind, GraphEdge, GraphNode } from "@/lib/graph";
import { buildGraphIndex } from "./graph-index";
import { matchPattern, patternMatches, type GraphPattern } from "./pattern";

function node(id: string, componentId: string, config: unknown = {}): GraphNode {
  return { id, componentId, position: { x: 0, y: 0 }, config };
}

function edge(id: string, source: string, target: string, kind: EdgeKind = "request-flow"): GraphEdge {
  return { id, source, target, kind };
}

describe("matchPattern — node predicates", () => {
  it("matches a single node by componentId", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer"), node("app-1", "app-server")],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = { nodes: [{ alias: "x", componentId: "load-balancer" }] };
    expect(matchPattern(index, pattern)).toEqual([{ x: "lb-1" }]);
  });

  it("matches a single node by category", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer"), node("cache-1", "cache")],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = { nodes: [{ alias: "x", category: "caching" }] };
    expect(matchPattern(index, pattern)).toEqual([{ x: "cache-1" }]);
  });

  it("matches a single node requiring both componentId and category", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("cache-1", "cache")],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [{ alias: "x", componentId: "app-server", category: "compute" }],
    };
    expect(matchPattern(index, pattern)).toEqual([{ x: "app-1" }]);

    const mismatched: GraphPattern = {
      nodes: [{ alias: "x", componentId: "app-server", category: "caching" }],
    };
    expect(matchPattern(index, mismatched)).toEqual([]);
  });

  it("supports componentId/category as arrays (any-of)", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("sql-1", "sql-database"), node("nosql-1", "nosql-database"), node("lb-1", "load-balancer")],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [{ alias: "db", componentId: ["sql-database", "nosql-database"] }],
    };
    const results = matchPattern(index, pattern).map((b) => b.db).sort();
    expect(results).toEqual(["nosql-1", "sql-1"]);
  });

  describe("every ConfigPredicate operator", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server", { instances: 3 })],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);

    function matchesInstances(op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte", value: number): boolean {
      const pattern: GraphPattern = {
        nodes: [{ alias: "x", componentId: "app-server", config: [{ field: "instances", op, value }] }],
      };
      return matchPattern(index, pattern).length === 1;
    }

    it("eq", () => {
      expect(matchesInstances("eq", 3)).toBe(true);
      expect(matchesInstances("eq", 2)).toBe(false);
    });
    it("neq", () => {
      expect(matchesInstances("neq", 2)).toBe(true);
      expect(matchesInstances("neq", 3)).toBe(false);
    });
    it("gt", () => {
      expect(matchesInstances("gt", 2)).toBe(true);
      expect(matchesInstances("gt", 3)).toBe(false);
    });
    it("gte", () => {
      expect(matchesInstances("gte", 3)).toBe(true);
      expect(matchesInstances("gte", 4)).toBe(false);
    });
    it("lt", () => {
      expect(matchesInstances("lt", 4)).toBe(true);
      expect(matchesInstances("lt", 3)).toBe(false);
    });
    it("lte", () => {
      expect(matchesInstances("lte", 3)).toBe(true);
      expect(matchesInstances("lte", 2)).toBe(false);
    });
    it("in", () => {
      const pattern: GraphPattern = {
        nodes: [{ alias: "x", componentId: "app-server", config: [{ field: "instances", op: "in", value: [1, 3, 5] }] }],
      };
      expect(matchPattern(index, pattern)).toHaveLength(1);
      const miss: GraphPattern = {
        nodes: [{ alias: "x", componentId: "app-server", config: [{ field: "instances", op: "in", value: [1, 2] }] }],
      };
      expect(matchPattern(index, miss)).toHaveLength(0);
    });
  });
});

describe("matchPattern — edges", () => {
  it("via: direct, kind-unconstrained", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("cache-1", "cache")],
      edges: [edge("e1", "app-1", "cache-1", "async")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [{ alias: "app", componentId: "app-server" }, { alias: "cache", category: "caching" }],
      edges: [{ from: "app", to: "cache" }],
    };
    expect(matchPattern(index, pattern)).toEqual([{ app: "app-1", cache: "cache-1" }]);
  });

  it("via: direct, kind-constrained rejects a non-matching edge kind", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("cache-1", "cache")],
      edges: [edge("e1", "app-1", "cache-1", "control")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [{ alias: "app", componentId: "app-server" }, { alias: "cache", category: "caching" }],
      edges: [{ from: "app", to: "cache", kind: "request-flow" }],
    };
    expect(matchPattern(index, pattern)).toEqual([]);

    const okPattern: GraphPattern = {
      nodes: [{ alias: "app", componentId: "app-server" }, { alias: "cache", category: "caching" }],
      edges: [{ from: "app", to: "cache", kind: ["control", "async"] }],
    };
    expect(matchPattern(index, okPattern)).toEqual([{ app: "app-1", cache: "cache-1" }]);
  });

  it("via: path matches across an intermediate node it never names", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("client-1", "client"), node("lb-1", "load-balancer"), node("app-1", "app-server")],
      edges: [edge("e1", "client-1", "lb-1"), edge("e2", "lb-1", "app-1")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);

    // No direct edge exists between client and app-server — only via path.
    const directPattern: GraphPattern = {
      nodes: [{ alias: "c", componentId: "client" }, { alias: "a", componentId: "app-server" }],
      edges: [{ from: "c", to: "a", via: "direct" }],
    };
    expect(matchPattern(index, directPattern)).toEqual([]);

    const pathPattern: GraphPattern = {
      nodes: [{ alias: "c", componentId: "client" }, { alias: "a", componentId: "app-server" }],
      edges: [{ from: "c", to: "a", via: "path" }],
    };
    expect(matchPattern(index, pathPattern)).toEqual([{ c: "client-1", a: "app-1" }]);
  });

  it("injective bindings: two distinct aliases never bind the same node, even with only one candidate", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer")],
      edges: [],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [
        { alias: "a", componentId: "load-balancer" },
        { alias: "b", componentId: "load-balancer" },
      ],
    };
    expect(matchPattern(index, pattern)).toEqual([]);
  });

  it("injective bindings: two distinct backends behind one load balancer", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer"), node("app-1", "app-server"), node("app-2", "app-server")],
      edges: [edge("e1", "lb-1", "app-1"), edge("e2", "lb-1", "app-2")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [
        { alias: "lb", componentId: "load-balancer" },
        { alias: "a", componentId: "app-server" },
        { alias: "b", componentId: "app-server" },
      ],
      edges: [
        { from: "lb", to: "a" },
        { from: "lb", to: "b" },
      ],
    };
    const results = matchPattern(index, pattern);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) expect(r.a).not.toBe(r.b);
  });
});

describe("matchPattern — absent sub-patterns", () => {
  it("matches without the negative constraint, then correctly rejects once the forbidden shape is added", () => {
    const base: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("db-1", "sql-database")],
      edges: [edge("e1", "app-1", "db-1")],
      entryPointIds: [],
    };

    const pattern: GraphPattern = {
      nodes: [{ alias: "app", componentId: "app-server" }],
      absent: [
        {
          nodes: [{ alias: "app" }, { alias: "cache", category: "caching" }],
          edges: [{ from: "app", to: "cache" }],
        },
      ],
    };

    const indexBefore = buildGraphIndex(base);
    expect(matchPattern(indexBefore, pattern)).toEqual([{ app: "app-1" }]);

    const withCache: ArchitectureGraph = {
      nodes: [...base.nodes, node("cache-1", "cache")],
      edges: [...base.edges, edge("e2", "app-1", "cache-1")],
      entryPointIds: [],
    };
    const indexAfter = buildGraphIndex(withCache);
    expect(matchPattern(indexAfter, pattern)).toEqual([]);
  });

  it("resolves an absent block's outer-alias reference against the current binding, not in isolation", () => {
    // Two app servers; only one of them has the forbidden direct DB edge.
    // The absent check must reject only the binding for the offending one.
    const graph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("app-2", "app-server"), node("db-1", "sql-database")],
      edges: [edge("e1", "app-1", "db-1")],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);

    const pattern: GraphPattern = {
      nodes: [{ alias: "app", componentId: "app-server" }],
      absent: [
        {
          nodes: [{ alias: "app" }, { alias: "db", componentId: "sql-database" }],
          edges: [{ from: "app", to: "db" }],
        },
      ],
    };

    const results = matchPattern(index, pattern);
    expect(results).toEqual([{ app: "app-2" }]);
  });
});

describe("matchPattern — budget guard", () => {
  it("returns within the step cap on a pathological pattern/graph pair and warns with the pattern id", () => {
    const nodeCount = 60;
    const nodes = Array.from({ length: nodeCount }, (_, i) => node(`n${i}`, "app-server"));
    // Dense near-complete graph.
    const edges: GraphEdge[] = [];
    let eid = 0;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = 0; j < nodeCount; j++) {
        if (i !== j) edges.push(edge(`e${eid++}`, `n${i}`, `n${j}`));
      }
    }
    const graph: ArchitectureGraph = { nodes, edges, entryPointIds: [] };
    const index = buildGraphIndex(graph);

    // Under-constrained: every alias matches every node, forcing heavy backtracking.
    const pattern: GraphPattern = {
      id: "pathological-test-pattern",
      nodes: [
        { alias: "a", componentId: "app-server" },
        { alias: "b", componentId: "app-server" },
        { alias: "c", componentId: "app-server" },
        { alias: "d", componentId: "app-server" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "c", to: "d" },
      ],
    };

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const start = performance.now();
    const results = matchPattern(index, pattern);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
    expect(results.length).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("pathological-test-pattern"));
    warnSpy.mockRestore();
  });
});

describe("matchPattern — determinism", () => {
  it("returns the same binding set across repeated runs", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        node("lb-1", "load-balancer"),
        node("app-1", "app-server"),
        node("app-2", "app-server"),
        node("db-1", "sql-database"),
      ],
      edges: [
        edge("e1", "lb-1", "app-1"),
        edge("e2", "lb-1", "app-2"),
        edge("e3", "app-1", "db-1"),
        edge("e4", "app-2", "db-1"),
      ],
      entryPointIds: [],
    };
    const index = buildGraphIndex(graph);
    const pattern: GraphPattern = {
      nodes: [
        { alias: "lb", componentId: "load-balancer" },
        { alias: "app", componentId: "app-server" },
        { alias: "db", componentId: "sql-database" },
      ],
      edges: [
        { from: "lb", to: "app" },
        { from: "app", to: "db" },
      ],
    };

    const sortBindings = (bindings: ReturnType<typeof matchPattern>) =>
      [...bindings].map((b) => JSON.stringify(b)).sort();

    const first = matchPattern(index, pattern);
    const second = matchPattern(index, pattern);
    expect(sortBindings(first)).toEqual(sortBindings(second));
  });
});

describe("matchPattern — composite curriculum-shaped patterns", () => {
  it("cache-aside: App Server -> Cache (direct) and App Server -> Database (direct)", () => {
    const cachedGraph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("cache-1", "cache"), node("db-1", "sql-database")],
      edges: [edge("e1", "app-1", "cache-1", "async"), edge("e2", "app-1", "db-1")],
      entryPointIds: [],
    };
    const noCacheGraph: ArchitectureGraph = {
      nodes: [node("app-1", "app-server"), node("db-1", "sql-database")],
      edges: [edge("e1", "app-1", "db-1")],
      entryPointIds: [],
    };

    const cacheAside: GraphPattern = {
      id: "cache-aside",
      nodes: [
        { alias: "app", componentId: "app-server" },
        { alias: "cache", category: "caching" },
        { alias: "db", componentId: ["sql-database", "nosql-database"] },
      ],
      edges: [
        { from: "app", to: "cache" },
        { from: "app", to: "db" },
      ],
    };

    expect(patternMatches(buildGraphIndex(cachedGraph), cacheAside)).toBe(true);
    expect(patternMatches(buildGraphIndex(noCacheGraph), cacheAside)).toBe(false);
  });

  it("hot-path anti-pattern: a Client reaching a Database via any route", () => {
    const viaAppServer: ArchitectureGraph = {
      nodes: [node("client-1", "client"), node("app-1", "app-server"), node("db-1", "sql-database")],
      edges: [edge("e1", "client-1", "app-1"), edge("e2", "app-1", "db-1")],
      entryPointIds: [],
    };
    const directHotPath: ArchitectureGraph = {
      nodes: [node("client-1", "client"), node("lb-1", "load-balancer"), node("db-1", "sql-database")],
      edges: [edge("e1", "client-1", "lb-1"), edge("e2", "lb-1", "db-1")],
      entryPointIds: [],
    };

    const hotPath: GraphPattern = {
      id: "hot-path-anti-pattern",
      nodes: [{ alias: "client", componentId: "client" }, { alias: "db", category: "data" }],
      edges: [{ from: "client", to: "db", via: "path" }],
    };

    // Both actually reach the database eventually — via:"path" doesn't care
    // which intermediate components carry it, only that a route exists.
    expect(patternMatches(buildGraphIndex(viaAppServer), hotPath)).toBe(true);
    expect(patternMatches(buildGraphIndex(directHotPath), hotPath)).toBe(true);
  });
});
