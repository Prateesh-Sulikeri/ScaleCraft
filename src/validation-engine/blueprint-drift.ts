import type { Blueprint } from "@/content/chapters/types";
import type { PatternEdge, PatternNode } from "./pattern";
import { nodeMatchesPredicates, patternNodeCandidates } from "./pattern";
import { getComponent } from "@/content/components/registry";
import type { GraphIndex } from "./graph-index";

/**
 * Submit's "here's how far off you are" surface (.claude/docs/pending.md
 * Track A) — computed only once the structural check (rules + required
 * components) has already passed but no blueprint matched. The matcher
 * itself (pattern.ts) only ever returns a boolean, so this recomputes a
 * best-effort single binding per blueprint (first structural candidate per
 * alias, edges ignored) purely to name *what's* missing or mismatched —
 * never used for pass/fail, that's still blueprintMatches's job.
 */
export type BlueprintDriftReport = {
  blueprintId: string;
  blueprintLabel: string;
  /** Required components (by label) with zero matching nodes anywhere on
   * the canvas. */
  missingComponents: string[];
  /** componentIds present on the canvas that don't satisfy any node in the
   * blueprint's required shape — "the blueprint didn't call for this",
   * not necessarily wrong, just extraneous to this particular approach. */
  extraComponentIds: string[];
  /** Human-readable required connections that don't hold given the
   * best-effort binding above (wrong source/target or wrong edge kind). */
  mismatchedConnections: string[];
};

function patternNodeLabel(n: PatternNode): string {
  if (n.componentId) {
    const ids = Array.isArray(n.componentId) ? n.componentId : [n.componentId];
    return ids.map((id) => getComponent(id)?.label ?? id).join(" or ");
  }
  if (n.category) {
    const cats = Array.isArray(n.category) ? n.category : [n.category];
    return cats.join(" or ");
  }
  return n.alias;
}

function edgeHolds(index: GraphIndex, edge: PatternEdge, fromId: string, toId: string): boolean {
  const kinds = edge.kind ? (Array.isArray(edge.kind) ? edge.kind : [edge.kind]) : undefined;
  if (edge.via === "path") return index.reachable(fromId, kinds).has(toId);
  return (index.outEdges.get(fromId) ?? []).some((e) => e.target === toId && (!kinds || kinds.includes(e.kind)));
}

function driftForBlueprint(index: GraphIndex, blueprint: Blueprint): BlueprintDriftReport {
  const pattern = blueprint.require;
  const candidatesByAlias = new Map(pattern.nodes.map((n) => [n.alias, patternNodeCandidates(index, n)] as const));

  const missingComponents = pattern.nodes
    .filter((n) => (candidatesByAlias.get(n.alias) ?? []).length === 0)
    .map(patternNodeLabel);

  // Best-effort single binding — first structural candidate per alias,
  // deterministic given patternNodeCandidates iterates index.nodeById in
  // graph.nodes order. Only used to name mismatched edges below, never to
  // decide pass/fail.
  const binding: Record<string, string> = {};
  for (const n of pattern.nodes) {
    const cands = candidatesByAlias.get(n.alias) ?? [];
    if (cands.length > 0) binding[n.alias] = cands[0];
  }

  const mismatchedConnections: string[] = [];
  for (const e of pattern.edges ?? []) {
    const fromId = binding[e.from];
    const toId = binding[e.to];
    if (fromId === undefined || toId === undefined) continue; // already covered by a missing component above
    if (edgeHolds(index, e, fromId, toId)) continue;
    const fromNode = pattern.nodes.find((n) => n.alias === e.from);
    const toNode = pattern.nodes.find((n) => n.alias === e.to);
    const kinds = e.kind ? (Array.isArray(e.kind) ? e.kind : [e.kind]) : undefined;
    const fromLabel = fromNode ? patternNodeLabel(fromNode) : e.from;
    const toLabel = toNode ? patternNodeLabel(toNode) : e.to;
    mismatchedConnections.push(kinds ? `${fromLabel} -> ${toLabel} (${kinds.join("/")})` : `${fromLabel} -> ${toLabel}`);
  }

  const extraComponentIds = [
    ...new Set(
      index.graph.nodes
        .filter((n) => !pattern.nodes.some((pn) => nodeMatchesPredicates(index, n.id, pn)))
        .map((n) => n.componentId),
    ),
  ];

  return {
    blueprintId: blueprint.id,
    blueprintLabel: blueprint.label,
    missingComponents,
    extraComponentIds,
    mismatchedConnections,
  };
}

/** Picks the blueprint with the fewest outstanding issues (missing +
 * mismatched) as "nearest" — ties keep declaration order. Assumes
 * `blueprints` is non-empty (callers only reach here once
 * `chapter.blueprints.length > 0`). */
export function nearestBlueprintDrift(index: GraphIndex, blueprints: Blueprint[]): BlueprintDriftReport {
  const reports = blueprints.map((b) => driftForBlueprint(index, b));
  return reports.reduce((best, r) =>
    r.missingComponents.length + r.mismatchedConnections.length <
    best.missingComponents.length + best.mismatchedConnections.length
      ? r
      : best,
  );
}
