import type { ArchitectureGraph } from "@/lib/graph";

/**
 * MVP simulation is qualitative/visual only — tracing which `request-flow`
 * edges a request would traverse from an entry node, for the canvas to
 * animate a token along. No latency/throughput/capacity modeling; that's a
 * deliberately deferred, separate effort. See .claude/docs/ARCHITECTURE.md
 * ("Simulation engine") and .claude/docs/OPEN_QUESTIONS.md.
 *
 * Per-component-type behavior (cache hit/miss, load-balancer routing
 * choice) branches this trace — not yet implemented, this is the seed the
 * canvas smoke-test page uses to prove edge traversal + animation work.
 */
export function traceRequestFlow(
  graph: ArchitectureGraph,
  entryNodeId: string,
): string[] {
  const edgesByStep: string[] = [];
  const visited = new Set<string>();
  let current = entryNodeId;

  while (true) {
    const nextEdge = graph.edges.find(
      (e) => e.kind === "request-flow" && e.source === current && !visited.has(e.id),
    );
    if (!nextEdge) break;
    visited.add(nextEdge.id);
    edgesByStep.push(nextEdge.id);
    current = nextEdge.target;
  }

  return edgesByStep;
}
