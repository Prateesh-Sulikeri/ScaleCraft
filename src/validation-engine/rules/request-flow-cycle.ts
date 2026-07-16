import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/**
 * Acyclicity is a `request-flow`-only invariant (see lib/graph.ts's own
 * doc comment) — cycles in control/replication/async edges are legitimate
 * (replica sync, cache invalidation, heartbeats), so this deliberately
 * builds the subgraph from request-flow edges alone before running DFS.
 */
export const requestFlowCycle: ValidationRule = {
  id: "request-flow-cycle",
  severity: "error",
  match: (graph: ArchitectureGraph) => {
    const adjacency = new Map<string, string[]>();
    for (const n of graph.nodes) adjacency.set(n.id, []);
    for (const e of graph.edges) {
      if (e.kind !== "request-flow") continue;
      adjacency.get(e.source)?.push(e.target);
    }

    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map<string, number>(graph.nodes.map((n) => [n.id, WHITE]));
    const path: string[] = [];
    const cycles: string[][] = [];

    function dfs(nodeId: string) {
      color.set(nodeId, GRAY);
      path.push(nodeId);

      for (const next of adjacency.get(nodeId) ?? []) {
        const state = color.get(next);
        if (state === GRAY) {
          const cycleStart = path.indexOf(next);
          cycles.push(path.slice(cycleStart));
        } else if (state === WHITE) {
          dfs(next);
        }
      }

      path.pop();
      color.set(nodeId, BLACK);
    }

    for (const n of graph.nodes) {
      if (color.get(n.id) === WHITE) dfs(n.id);
    }

    return cycles.map((cycleNodeIds) => ({
      offendingNodeIds: cycleNodeIds,
      offendingEdgeIds: [],
    }));
  },
  message: () => "Request-flow edges form a cycle.",
  explanation: () =>
    "A request that enters this loop can never reach an endpoint — it just keeps circulating " +
    "among the same components forever. Request-flow is the only edge kind meant to be acyclic; " +
    "if this back-edge is intentional (a callback, a retry, a feedback loop), model it as a " +
    "control, replication, or async edge instead, which are allowed to form cycles.",
};
