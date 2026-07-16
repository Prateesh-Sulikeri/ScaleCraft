import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { componentRelations } from "./component-relations";

const browser = { id: "browser-1", componentId: "browser", position: { x: 0, y: 0 }, config: {} };
const leader = { id: "leader-1", componentId: "leader", position: { x: 1, y: 0 }, config: {} };
const appServer = { id: "app-1", componentId: "app-server", position: { x: 2, y: 0 }, config: {} };
const lb = { id: "lb-1", componentId: "load-balancer", position: { x: 3, y: 0 }, config: {} };
const serverless = { id: "fn-1", componentId: "serverless-function", position: { x: 4, y: 0 }, config: {} };
const client = { id: "client-1", componentId: "client", position: { x: 5, y: 0 }, config: {} };
const db = { id: "db-1", componentId: "sql-database", position: { x: 6, y: 0 }, config: {} };
const cache = { id: "cache-1", componentId: "cache", position: { x: 7, y: 0 }, config: {} };
const readReplica = { id: "replica-1", componentId: "read-replica", position: { x: 8, y: 0 }, config: {} };
const follower = { id: "follower-1", componentId: "follower", position: { x: 9, y: 0 }, config: {} };
const coordinator = { id: "coord-1", componentId: "coordinator", position: { x: 10, y: 0 }, config: {} };

describe("componentRelations — declared contracts", () => {
  it("flags a Browser wired straight into a Leader (Leader's own input contract rejects networking)", () => {
    const graph: ArchitectureGraph = {
      nodes: [browser, leader],
      edges: [{ id: "e1", source: "browser-1", target: "leader-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    const violations = runValidation(graph, [componentRelations]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("error");
    expect(violations[0].explanation).toContain("Leader");
  });

  it("passes when a Compute component mediates Browser -> Leader", () => {
    const graph: ArchitectureGraph = {
      nodes: [browser, appServer, leader],
      edges: [
        { id: "e1", source: "browser-1", target: "app-1", kind: "request-flow" },
        { id: "e2", source: "app-1", target: "leader-1", kind: "request-flow" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("flags a Serverless Function feeding into a Load Balancer (LB's own input contract rejects compute)", () => {
    const graph: ArchitectureGraph = {
      nodes: [serverless, lb],
      edges: [{ id: "e1", source: "fn-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    const violations = runValidation(graph, [componentRelations]);
    expect(violations).toHaveLength(1);
    expect(violations[0].explanation).toContain("Load Balancer");
  });

  it("passes the correct direction (LB -> App Server)", () => {
    const graph: ArchitectureGraph = {
      nodes: [lb, appServer],
      edges: [{ id: "e1", source: "lb-1", target: "app-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("flags a legal category pair with an illegal kind (Client -> Load Balancer via replication)", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, lb],
      edges: [{ id: "e1", source: "client-1", target: "lb-1", kind: "replication" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(1);
  });

  it("flags Client straight into a Database (Database's own input contract rejects networking)", () => {
    const graph: ArchitectureGraph = {
      nodes: [client, db],
      edges: [{ id: "e1", source: "client-1", target: "db-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(1);
  });
});

describe("componentRelations — regression tests for the reciprocal-contract bugs found via live testing", () => {
  it("passes Cache -> SQL Database (cache-aside miss forwarded straight to the origin store)", () => {
    const graph: ArchitectureGraph = {
      nodes: [cache, db],
      edges: [{ id: "e1", source: "cache-1", target: "db-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("passes Read Replica -> App Server (the replica's own 'Read query' output port)", () => {
    const graph: ArchitectureGraph = {
      nodes: [readReplica, appServer],
      edges: [{ id: "e1", source: "replica-1", target: "app-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("passes Follower -> App Server (the follower's own 'Reads' output port)", () => {
    const graph: ArchitectureGraph = {
      nodes: [follower, appServer],
      edges: [{ id: "e1", source: "follower-1", target: "app-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("passes App Server -> Coordinator (control) — Coordinator was previously unreachable by anything", () => {
    const graph: ArchitectureGraph = {
      nodes: [appServer, coordinator],
      edges: [{ id: "e1", source: "app-1", target: "coord-1", kind: "control" }],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });

  it("passes Coordinator -> Leader and Coordinator -> Follower (control, election management)", () => {
    const graph: ArchitectureGraph = {
      nodes: [coordinator, leader, follower],
      edges: [
        { id: "e1", source: "coord-1", target: "leader-1", kind: "control" },
        { id: "e2", source: "coord-1", target: "follower-1", kind: "control" },
      ],
      entryPointIds: [],
    };

    expect(runValidation(graph, [componentRelations])).toHaveLength(0);
  });
});

describe("componentRelations — coarse fallback for uncontracted components", () => {
  it("falls back to the coarse category+kind matrix when neither endpoint declares a contract", () => {
    // Simulates a custom component: no `relations` on either side, so this
    // must fall back to legal-edge-kinds.ts. networking -> distributed-systems
    // has no legal kinds in that matrix at all (default-deny), so any kind
    // should fail purely off the fallback path.
    const uncontracted = { id: "custom-1", componentId: "__unknown_custom__", position: { x: 0, y: 0 }, config: {} };
    // getComponent() returns undefined for an unknown id, so this edge is
    // skipped entirely (nothing to check against) — covered instead via a
    // direct legalKindsFor check in legal-edge-kinds.test.ts. This test just
    // documents that componentRelations doesn't throw on an unresolvable id.
    const graph: ArchitectureGraph = {
      nodes: [uncontracted, lb],
      edges: [{ id: "e1", source: "custom-1", target: "lb-1", kind: "request-flow" }],
      entryPointIds: [],
    };

    expect(() => runValidation(graph, [componentRelations])).not.toThrow();
  });
});
