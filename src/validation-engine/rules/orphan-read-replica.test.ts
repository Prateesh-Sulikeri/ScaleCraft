import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { orphanReadReplica } from "./orphan-read-replica";

const replica = {
  id: "replica-1",
  componentId: "read-replica",
  position: { x: 0, y: 0 },
  config: { replicationLagBudgetMs: 1000 },
};
const db = { id: "db-1", componentId: "sql-database", position: { x: 1, y: 0 }, config: { engine: "postgres" } };

describe("orphanReadReplica", () => {
  it("flags a Read Replica with no incoming replication edge", () => {
    const graph: ArchitectureGraph = { nodes: [replica], edges: [] };

    const violations = runValidation(graph, [orphanReadReplica]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("error");
    expect(violations[0].offendingNodeIds).toEqual(["replica-1"]);
  });

  it("passes when a SQL Database replicates into it", () => {
    const graph: ArchitectureGraph = {
      nodes: [replica, db],
      edges: [{ id: "e1", source: "db-1", target: "replica-1", kind: "replication" }],
    };

    expect(runValidation(graph, [orphanReadReplica])).toHaveLength(0);
  });

  it("does not count a request-flow edge as a replication source", () => {
    const graph: ArchitectureGraph = {
      nodes: [replica, db],
      edges: [{ id: "e1", source: "db-1", target: "replica-1", kind: "request-flow" }],
    };

    const violations = runValidation(graph, [orphanReadReplica]);
    expect(violations).toHaveLength(1);
  });
});
