/**
 * The Architecture Graph — the core artifact a user builds. See
 * .claude/docs/ARCHITECTURE.md ("Architecture Graph") for the full model,
 * including why acyclicity only applies to "request-flow" edges.
 */

export type XY = { x: number; y: number };

/**
 * "request-flow" is the primary synchronous client-facing path and is the
 * only kind subject to the acyclic constraint / used for simulation tracing.
 * The others exist so legitimate back-edges (replica sync, cache
 * invalidation, heartbeats) are representable without violating that
 * constraint.
 */
export type EdgeKind = "request-flow" | "control" | "replication" | "async";

export type GraphNode = {
  id: string;
  componentId: string;
  position: XY;
  config: unknown;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
};

export type ArchitectureGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export function emptyGraph(): ArchitectureGraph {
  return { nodes: [], edges: [] };
}
