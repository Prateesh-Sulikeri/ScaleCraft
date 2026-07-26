import { describe, expect, it } from "vitest";
import type { ArchitectureGraph, GraphEdge } from "@/lib/graph";
import { traceRequestFlow } from "./trace";

function graphWith(edges: GraphEdge[]): ArchitectureGraph {
  return { nodes: [], edges, entryPointIds: [] };
}

function edge(
  id: string,
  source: string,
  target: string,
  kind: GraphEdge["kind"] = "request-flow",
): GraphEdge {
  return { id, source, target, kind };
}

describe("traceRequestFlow", () => {
  it("returns an empty trace when the entry node has no outgoing edges", () => {
    expect(traceRequestFlow(graphWith([]), "client")).toEqual([]);
  });

  it("follows a linear chain of request-flow edges", () => {
    const graph = graphWith([
      edge("e1", "client", "lb"),
      edge("e2", "lb", "server"),
      edge("e3", "server", "db"),
    ]);
    expect(traceRequestFlow(graph, "client")).toEqual(["e1", "e2", "e3"]);
  });

  it("stops at a node with no further request-flow edge", () => {
    const graph = graphWith([edge("e1", "client", "lb")]);
    expect(traceRequestFlow(graph, "lb")).toEqual([]);
  });

  it("ignores edges that are not kind='request-flow'", () => {
    const graph = graphWith([
      edge("e1", "client", "lb"),
      edge("e2", "lb", "cache", "async"),
      edge("e3", "lb", "server"),
    ]);
    expect(traceRequestFlow(graph, "client")).toEqual(["e1", "e3"]);
  });

  it("picks the first matching outgoing edge when a node fans out to more than one", () => {
    const graph = graphWith([
      edge("e1", "client", "lb"),
      edge("e2", "lb", "server-a"),
      edge("e3", "lb", "server-b"),
    ]);
    expect(traceRequestFlow(graph, "client")).toEqual(["e1", "e2"]);
  });

  it("terminates instead of looping forever when the graph has a request-flow cycle", () => {
    const graph = graphWith([edge("e1", "a", "b"), edge("e2", "b", "a")]);
    expect(traceRequestFlow(graph, "a")).toEqual(["e1", "e2"]);
  });

  it("does not retraverse an already-visited edge on a longer cycle", () => {
    const graph = graphWith([edge("e1", "a", "b"), edge("e2", "b", "c"), edge("e3", "c", "a")]);
    // a -> b -> c -> a, then from a again the only outgoing edge (e1) is
    // already visited, so the trace stops instead of looping forever.
    expect(traceRequestFlow(graph, "a")).toEqual(["e1", "e2", "e3"]);
  });

  it("returns an empty trace for an entry node id absent from the graph", () => {
    const graph = graphWith([edge("e1", "client", "lb")]);
    expect(traceRequestFlow(graph, "nonexistent")).toEqual([]);
  });
});
