import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { noDirectClientDatabase } from "./no-direct-client-database";

const client = { id: "client-1", componentId: "client", position: { x: 0, y: 0 }, config: {} };
const appServer = { id: "app-1", componentId: "app-server", position: { x: 1, y: 0 }, config: {} };
const db = { id: "db-1", componentId: "sql-database", position: { x: 2, y: 0 }, config: {} };

describe("noDirectClientDatabase", () => {
  it("passes when the client only reaches the database via an app server", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, appServer, db],
      edges: [
        { id: "e1", source: "client-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "app-1", target: "db-1", kind: "request-flow" },
      ],
    };

    expect(runValidation(graph, [noDirectClientDatabase])).toHaveLength(0);
  });

  it("flags a direct request-flow edge from client to database", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, db],
      edges: [{ id: "e1", source: "client-1", target: "db-1", kind: "request-flow" }],
    };

    const violations = runValidation(graph, [noDirectClientDatabase]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("error");
    expect(violations[0].offendingNodeIds).toEqual(["client-1", "db-1"]);
  });

  it("does not flag a non-request-flow edge from client to database", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, db],
      edges: [{ id: "e1", source: "client-1", target: "db-1", kind: "control" }],
    };

    expect(runValidation(graph, [noDirectClientDatabase])).toHaveLength(0);
  });
});
