import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/**
 * The exact example from INITIAL_THOUGHTS.md's "Validation Philosophy"
 * section — kept as the canonical reference implementation for what a rule
 * should look like.
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
      .filter(
        (e) =>
          e.kind === "request-flow" &&
          clientIds.has(e.source) &&
          databaseIds.has(e.target),
      )
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
