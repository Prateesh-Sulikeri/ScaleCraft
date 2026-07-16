import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/**
 * The exact example from INITIAL_THOUGHTS.md's "Validation Philosophy"
 * section — kept as the canonical reference implementation for what a rule
 * should look like.
 *
 * Deliberately checks ANY edge kind, not just "request-flow" — an earlier
 * version filtered on `e.kind === "request-flow"`, which meant the same
 * illegal connection could dodge this rule entirely by picking "control" or
 * "async" instead (the exact evasion bug reported in milestone 5; see
 * .claude/docs/validation_agent_design.md, section 3.4). There is no
 * legitimate EdgeKind for a Client to reach a Database directly — even a
 * "replication" edge would be a database-to-database concept, never
 * client-to-database — so no kind filter belongs here at all.
 */
export const noDirectClientDatabase: ValidationRule = {
  id: "no-direct-client-database",
  severity: "error",
  match: (graph: ArchitectureGraph) => {
    const clientIds = new Set(
      graph.nodes.filter((n) => n.componentId === "client").map((n) => n.id),
    );
    const databaseIds = new Set(
      graph.nodes
        .filter((n) => n.componentId === "sql-database" || n.componentId === "nosql-database")
        .map((n) => n.id),
    );

    return graph.edges
      .filter((e) => clientIds.has(e.source) && databaseIds.has(e.target))
      .map((e) => ({
        offendingNodeIds: [e.source, e.target],
        offendingEdgeIds: [e.id],
      }));
  },
  message: () => "Database is exposed directly to the Client.",
  explanation: () =>
    "The database should not be directly exposed to clients because application " +
    "servers enforce authentication, authorization, and business logic. Route this " +
    "request through an Application Server instead.",
};
