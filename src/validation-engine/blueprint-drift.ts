import type { Blueprint } from "@/content/chapters/types";
import type { PatternEdge, PatternNode } from "./pattern";
import {
  absentBlockFires,
  nodeMatchesPredicates,
  patternMatches,
  patternNodeCandidates,
  type ConfigPredicate,
} from "./pattern";
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
  /** Present but configured differently, one line each, e.g. "Firewall:
   * default policy should be deny-all or allow-listed (is allow-all)". */
  misconfiguredComponents: string[];
  /** componentIds present on the canvas that don't satisfy any node in the
   * blueprint's required shape — "the blueprint didn't call for this",
   * not necessarily wrong, just extraneous to this particular approach. */
  extraComponentIds: string[];
  /** Human-readable required connections that don't hold given the
   * best-effort binding above (wrong source/target or wrong edge kind). */
  mismatchedConnections: string[];
  /** Labels of this blueprint's `forbid` patterns the graph matches. Without
   * this, a design that contains `require` but trips a forbid got a report
   * naming nothing at all. */
  forbiddenPatterns: string[];
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

function words(field: string): string {
  return field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

function expected(pred: ConfigPredicate): string {
  switch (pred.op) {
    case "in":
      return `should be ${pred.value.join(" or ")}`;
    case "eq":
      return `should be ${pred.value}`;
    case "neq":
      return `should not be ${pred.value}`;
    case "gt":
      return `should be above ${pred.value}`;
    case "gte":
      return `should be at least ${pred.value}`;
    case "lt":
      return `should be below ${pred.value}`;
    case "lte":
      return `should be at most ${pred.value}`;
  }
}

/** Names the config predicates the bound node fails, with its actual value. */
function misconfiguration(index: GraphIndex, patternNode: PatternNode, nodeId: string): string {
  const node = index.nodeById.get(nodeId);
  const defaults = index.defById.get(nodeId)?.defaultConfig as Record<string, unknown> | undefined;
  const config = { ...defaults, ...(node?.config as Record<string, unknown> | null | undefined) };
  const failing = (patternNode.config ?? []).filter(
    (pred) => !nodeMatchesPredicates(index, nodeId, { alias: patternNode.alias, config: [pred] }),
  );
  const parts = failing.map((pred) => `${words(pred.field)} ${expected(pred)} (is ${String(config[pred.field])})`);
  return `${patternNodeLabel(patternNode)}: ${parts.join("; ")}`;
}

function edgeHolds(index: GraphIndex, edge: PatternEdge, fromId: string, toId: string): boolean {
  const kinds = edge.kind ? (Array.isArray(edge.kind) ? edge.kind : [edge.kind]) : undefined;
  if (edge.via === "path") return index.reachable(fromId, kinds).has(toId);
  return (index.outEdges.get(fromId) ?? []).some((e) => e.target === toId && (!kinds || kinds.includes(e.kind)));
}

/** Caps the binding search below; past it, the best binding found so far
 * stands. */
const BINDING_BUDGET = 20_000;

/**
 * The injective alias -> node binding that satisfies the most required
 * edges, so the report names only connections that are really absent.
 * Binding each alias to its first candidate mislabelled correct edges
 * whenever a type appears twice (two Workers, two Followers). An alias whose
 * candidates are all taken reuses its first one rather than going unbound.
 * Only used to name mismatches, never to decide pass/fail.
 */
function bestBinding(
  index: GraphIndex,
  nodes: PatternNode[],
  edges: PatternEdge[],
  candidatesByAlias: Map<string, string[]>,
): Record<string, string> {
  const order = nodes
    .map((n) => n.alias)
    .filter((a) => (candidatesByAlias.get(a) ?? []).length > 0)
    .sort((a, b) => candidatesByAlias.get(a)!.length - candidatesByAlias.get(b)!.length);
  const position = new Map(order.map((a, i) => [a, i]));
  // Each edge is scored once, at the later of its two endpoints in `order`.
  const edgesClosingAt = order.map(() => [] as PatternEdge[]);
  for (const e of edges) {
    const i = position.get(e.from);
    const j = position.get(e.to);
    if (i !== undefined && j !== undefined) edgesClosingAt[Math.max(i, j)].push(e);
  }
  // Upper bound on edges still scorable from position i onward.
  const scorableFrom = order.map((_, i) => edgesClosingAt.slice(i).reduce((sum, list) => sum + list.length, 0));

  let best: Record<string, string> = {};
  let bestScore = -1;
  let budget = BINDING_BUDGET;
  const binding: Record<string, string> = {};
  const used = new Set<string>();

  const visit = (i: number, score: number) => {
    if (i === order.length) {
      if (score > bestScore) {
        bestScore = score;
        best = { ...binding };
      }
      return;
    }
    if (budget-- <= 0 || score + scorableFrom[i] <= bestScore) return;
    const alias = order[i];
    const cands = candidatesByAlias.get(alias)!;
    const free = cands.filter((c) => !used.has(c));
    for (const c of free.length > 0 ? free : [cands[0]]) {
      binding[alias] = c;
      const reused = used.has(c);
      used.add(c);
      const gained = edgesClosingAt[i].filter((e) => edgeHolds(index, e, binding[e.from], binding[e.to])).length;
      visit(i + 1, score + gained);
      if (!reused) used.delete(c);
      delete binding[alias];
      if (bestScore === score + scorableFrom[i]) return; // no sibling can do better
    }
  };
  visit(0, 0);
  return best;
}

function driftForBlueprint(index: GraphIndex, blueprint: Blueprint): BlueprintDriftReport {
  const pattern = blueprint.require;
  const strict = new Map(pattern.nodes.map((n) => [n.alias, patternNodeCandidates(index, n)] as const));
  // Same node predicates minus config: a node of the right type whose
  // config is wrong is misconfigured, not missing.
  const relaxed = new Map(
    pattern.nodes.map((n) => [n.alias, patternNodeCandidates(index, { ...n, config: undefined })] as const),
  );
  const candidatesByAlias = new Map(
    pattern.nodes.map((n) => {
      const exact = strict.get(n.alias) ?? [];
      return [n.alias, exact.length > 0 ? exact : (relaxed.get(n.alias) ?? [])] as const;
    }),
  );

  const missingComponents = pattern.nodes
    .filter((n) => (relaxed.get(n.alias) ?? []).length === 0)
    .map(patternNodeLabel);

  const binding = bestBinding(index, pattern.nodes, pattern.edges ?? [], candidatesByAlias);

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

  const misconfiguredComponents = pattern.nodes
    .filter((n) => (strict.get(n.alias) ?? []).length === 0 && binding[n.alias] !== undefined)
    .map((n) => misconfiguration(index, n, binding[n.alias]));

  const extraComponentIds = [
    ...new Set(
      index.graph.nodes
        .filter((n) => !pattern.nodes.some((pn) => nodeMatchesPredicates(index, n.id, { ...pn, config: undefined })))
        .map((n) => n.componentId),
    ),
  ];

  const forbiddenPatterns = [
    ...(blueprint.forbid ?? [])
      .filter((p) => patternMatches(index, p))
      .map((p) => p.label ?? p.id ?? "a shape this chapter rules out"),
    // A fired `absent` block inside `require` is the same kind of failure.
    ...(pattern.absent ?? [])
      .filter((block) => absentBlockFires(index, block, binding))
      .map((block) => block.label ?? `an extra ${block.nodes.map(patternNodeLabel).join(" and ")}`),
  ];

  return {
    blueprintId: blueprint.id,
    blueprintLabel: blueprint.label,
    missingComponents,
    misconfiguredComponents,
    extraComponentIds,
    mismatchedConnections,
    forbiddenPatterns,
  };
}

/** Picks the blueprint with the fewest outstanding issues (missing +
 * mismatched + forbidden) as "nearest" — ties keep declaration order. Assumes
 * `blueprints` is non-empty (callers only reach here once
 * `chapter.blueprints.length > 0`). */
export function nearestBlueprintDrift(index: GraphIndex, blueprints: Blueprint[]): BlueprintDriftReport {
  const reports = blueprints.map((b) => driftForBlueprint(index, b));
  const issues = (r: BlueprintDriftReport) =>
    r.missingComponents.length +
    r.misconfiguredComponents.length +
    r.mismatchedConnections.length +
    r.forbiddenPatterns.length;
  return reports.reduce((best, r) => (issues(r) < issues(best) ? r : best));
}
