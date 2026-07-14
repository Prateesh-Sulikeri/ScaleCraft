import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/** Requires specifically a "replication"-kind edge from a database — the
 * first rule in this registry to key off EdgeKind rather than just presence
 * of an edge, since a request-flow edge into a Read Replica means something
 * different (a read query) from a replication feed. */
export const orphanReadReplica: ValidationRule = {
  id: "orphan-read-replica",
  severity: "error",
  match: (graph: ArchitectureGraph) => {
    const results = [];

    for (const replica of graph.nodes.filter((n) => n.componentId === "read-replica")) {
      const hasReplicationSource = graph.edges.some((e) => {
        if (e.target !== replica.id || e.kind !== "replication") return false;
        const source = graph.nodes.find((n) => n.id === e.source);
        return source?.componentId === "sql-database" || source?.componentId === "nosql-database";
      });
      if (!hasReplicationSource) {
        results.push({ offendingNodeIds: [replica.id], offendingEdgeIds: [] });
      }
    }

    return results;
  },
  message: () => "Read Replica has no replication source.",
  explanation: () =>
    "A Read Replica only has data because a primary database streams it via replication — without a " +
    '"replication"-kind edge coming in from a SQL or NoSQL Database, this replica will never receive ' +
    "anything, and any reads from it are empty or permanently stale.",
};
