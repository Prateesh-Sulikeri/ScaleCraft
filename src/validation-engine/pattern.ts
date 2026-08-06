import type { EdgeKind } from "@/lib/graph";
import type { ComponentCategory } from "@/content/components/types";
import type { GraphIndex } from "./graph-index";

/**
 * Cypher-style graph pattern matching — the "expression style" RESEARCH.md
 * flagged as worth borrowing without needing a real graph database (see
 * .claude/docs/validation_agent_design.md §2.5/§9.2). Every field here is
 * intentionally generic over the app's actual vocabulary rather than
 * hard-coding any specific component/category/kind, so adding a new
 * ComponentCategory, EdgeKind, or componentId never requires touching this
 * file — only the pattern objects authored against it.
 */
export type ConfigPredicate =
  | { field: string; op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte"; value: string | number | boolean }
  | { field: string; op: "in"; value: (string | number | boolean)[] };

export type PatternNode = {
  alias: string;
  /** A literal componentId (e.g. "load-balancer") or any of several — for
   * rules that only make sense for specific base-pack components. */
  componentId?: string | string[];
  /** A ComponentCategory or any of several — the custom-component-visible
   * fallback (see §5/§9.2): a pattern keyed on category matches user-authored
   * components too, one keyed on componentId never will. */
  category?: ComponentCategory | ComponentCategory[];
  /** All predicates must hold — reads the node's own `config` (whatever
   * flat fields that component's ConfigFieldSpec declares). */
  config?: ConfigPredicate[];
};

export type PatternEdge = {
  from: string; // alias
  to: string; // alias
  /** A single EdgeKind or any of several. Omitted = any kind. */
  kind?: EdgeKind | EdgeKind[];
  /** "direct" = adjacency (an actual GraphEdge). "path" = reachability via
   * GraphIndex.reachable() — the mechanism that makes anti-patterns like
   * "the origin sits on the hot path" expressible without a bespoke
   * traversal. Default "direct". */
  via?: "direct" | "path";
};

export type GraphPattern = {
  /** Optional identifier, purely for the budget-guard console.warn (§9.2) —
   * not part of matching itself. Not shown in the illustrative §9.2 type,
   * added here since a warning naming an unidentifiable pattern is useless;
   * callers (a PatternRule's `forbid`, a Blueprint's `require`) should set
   * this to their own rule/blueprint id. */
  id?: string;
  nodes: PatternNode[];
  edges?: PatternEdge[];
  /** Negative constraints — if any sub-pattern matches given the current
   * bindings, the match is killed. Aliases may reference outer nodes: an
   * absent node whose `alias` matches an outer pattern node's `alias` is
   * resolved against that outer binding, not re-searched. */
  absent?: { nodes: PatternNode[]; edges?: PatternEdge[] }[];
};

export type Binding = Record<string, string>; // alias -> nodeId

const MAX_MATCHES = 200;
const MAX_STEPS = 50_000;

type Budget = { steps: number; exhausted: boolean };

export function matchPattern(index: GraphIndex, p: GraphPattern): Binding[] {
  const budget: Budget = { steps: 0, exhausted: false };
  const matches: Binding[] = [];
  const edges = p.edges ?? [];

  const order = orderBySelectivity(p.nodes, edges);
  const aliasConstraints = buildAliasConstraintIndex(edges);
  const structuralCandidates = new Map(
    order.map((n) => [n.alias, structuralNodeCandidates(index, n)] as const),
  );

  backtrack(index, order, aliasConstraints, structuralCandidates, 0, {}, new Set(), budget, matches, MAX_MATCHES);

  const survivors =
    p.absent && p.absent.length > 0
      ? matches.filter((binding) => !p.absent!.some((block) => absentBlockMatches(index, block, binding, budget)))
      : matches;

  if (budget.exhausted) {
    console.warn(
      `[validation-engine/pattern] pattern "${p.id ?? "<unnamed>"}" hit its matcher budget ` +
        `(MAX_MATCHES=${MAX_MATCHES}, MAX_STEPS=${MAX_STEPS}); returning partial results.`,
    );
  }

  return survivors;
}

export function patternMatches(index: GraphIndex, p: GraphPattern): boolean {
  return matchPattern(index, p).length > 0;
}

// ---- selectivity ordering -------------------------------------------------

function selectivityRank(n: PatternNode): number {
  if (n.componentId) return 0;
  if (n.category) return 1;
  return 2;
}

/** Most-constrained aliases first: componentId > category > unconstrained,
 * then by how many edge constraints touch the alias. Stable sort keeps ties
 * in authoring order, which is what makes results deterministic run to run. */
function orderBySelectivity(nodes: PatternNode[], edges: PatternEdge[]): PatternNode[] {
  const edgeCount = new Map<string, number>();
  for (const n of nodes) edgeCount.set(n.alias, 0);
  for (const e of edges) {
    edgeCount.set(e.from, (edgeCount.get(e.from) ?? 0) + 1);
    edgeCount.set(e.to, (edgeCount.get(e.to) ?? 0) + 1);
  }

  return [...nodes].sort((a, b) => {
    const rankDiff = selectivityRank(a) - selectivityRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (edgeCount.get(b.alias) ?? 0) - (edgeCount.get(a.alias) ?? 0);
  });
}

function buildAliasConstraintIndex(edges: PatternEdge[]): Map<string, PatternEdge[]> {
  const map = new Map<string, PatternEdge[]>();
  for (const e of edges) {
    if (!map.has(e.from)) map.set(e.from, []);
    if (!map.has(e.to)) map.set(e.to, []);
    map.get(e.from)!.push(e);
    map.get(e.to)!.push(e);
  }
  return map;
}

// ---- node/config predicates -------------------------------------------------

/** Exported for blueprint-drift.ts's "extra components" check — does this
 * one graph node satisfy this one pattern node's own predicates. */
export function nodeMatchesPredicates(index: GraphIndex, nodeId: string, patternNode: PatternNode): boolean {
  const node = index.nodeById.get(nodeId);
  if (!node) return false;

  if (patternNode.componentId) {
    const ids = Array.isArray(patternNode.componentId) ? patternNode.componentId : [patternNode.componentId];
    if (!ids.includes(node.componentId)) return false;
  }

  if (patternNode.category) {
    const def = index.defById.get(nodeId);
    if (!def) return false;
    const cats = Array.isArray(patternNode.category) ? patternNode.category : [patternNode.category];
    if (!cats.includes(def.category)) return false;
  }

  if (patternNode.config) {
    for (const pred of patternNode.config) {
      if (!evalConfigPredicate(node.config, pred)) return false;
    }
  }

  return true;
}

function evalConfigPredicate(config: unknown, pred: ConfigPredicate): boolean {
  const actual = (config as Record<string, unknown> | null | undefined)?.[pred.field];

  if (pred.op === "in") return pred.value.some((v) => v === actual);
  if (pred.op === "eq") return actual === pred.value;
  if (pred.op === "neq") return actual !== pred.value;

  // gt/gte/lt/lte: only meaningful when both sides are the same primitive
  // type — a type mismatch is a config drift bug in the pattern authoring,
  // never a match.
  const cmp = compareOrdered(actual, pred.value);
  if (cmp === null) return false;
  switch (pred.op) {
    case "gt":
      return cmp > 0;
    case "gte":
      return cmp >= 0;
    case "lt":
      return cmp < 0;
    case "lte":
      return cmp <= 0;
  }
}

/** Returns -1/0/1 like a normal comparator, or null when the two values
 * aren't the same comparable primitive type (never satisfies gt/gte/lt/lte). */
function compareOrdered(actual: unknown, value: string | number | boolean): number | null {
  if (typeof actual === "number" && typeof value === "number") return actual < value ? -1 : actual > value ? 1 : 0;
  if (typeof actual === "string" && typeof value === "string") return actual < value ? -1 : actual > value ? 1 : 0;
  if (typeof actual === "boolean" && typeof value === "boolean") {
    return actual === value ? 0 : actual ? 1 : -1;
  }
  return null;
}

function structuralNodeCandidates(index: GraphIndex, patternNode: PatternNode): string[] {
  return patternNodeCandidates(index, patternNode);
}

/** Every graph node id satisfying a single PatternNode's own predicates
 * (componentId/category/config), ignoring edges entirely. Exported for the
 * blueprint drift report (blueprint-drift.ts), which needs this same
 * per-node candidate check outside of a full pattern match. */
export function patternNodeCandidates(index: GraphIndex, patternNode: PatternNode): string[] {
  const ids: string[] = [];
  for (const nodeId of index.nodeById.keys()) {
    if (nodeMatchesPredicates(index, nodeId, patternNode)) ids.push(nodeId);
  }
  return ids;
}

// ---- edge predicates ---------------------------------------------------

function directEdgeExists(index: GraphIndex, fromId: string, toId: string, kind?: EdgeKind | EdgeKind[]): boolean {
  const kinds = kind ? (Array.isArray(kind) ? kind : [kind]) : undefined;
  return (index.outEdges.get(fromId) ?? []).some((e) => e.target === toId && (!kinds || kinds.includes(e.kind)));
}

function pathExists(index: GraphIndex, fromId: string, toId: string, kind?: EdgeKind | EdgeKind[]): boolean {
  const kinds = kind ? (Array.isArray(kind) ? kind : [kind]) : undefined;
  return index.reachable(fromId, kinds).has(toId);
}

function edgeConstraintHolds(index: GraphIndex, edge: PatternEdge, fromId: string, toId: string): boolean {
  return edge.via === "path" ? pathExists(index, fromId, toId, edge.kind) : directEdgeExists(index, fromId, toId, edge.kind);
}

/** Checks every edge constraint touching `alias` against whichever of its
 * other endpoints are already bound. Constraints against a not-yet-bound
 * alias are deferred — they get checked when that alias is placed instead. */
function satisfiesBoundEdgeConstraints(
  index: GraphIndex,
  alias: string,
  candidateNodeId: string,
  binding: Binding,
  aliasConstraints: Map<string, PatternEdge[]>,
): boolean {
  for (const edge of aliasConstraints.get(alias) ?? []) {
    const isFrom = edge.from === alias;
    const otherAlias = isFrom ? edge.to : edge.from;
    const otherNodeId = binding[otherAlias];
    if (otherNodeId === undefined) continue;

    const fromId = isFrom ? candidateNodeId : otherNodeId;
    const toId = isFrom ? otherNodeId : candidateNodeId;
    if (!edgeConstraintHolds(index, edge, fromId, toId)) return false;
  }
  return true;
}

// ---- backtracking search -------------------------------------------------

function backtrack(
  index: GraphIndex,
  order: PatternNode[],
  aliasConstraints: Map<string, PatternEdge[]>,
  structuralCandidates: Map<string, string[]>,
  depth: number,
  binding: Binding,
  used: Set<string>,
  budget: Budget,
  matches: Binding[],
  maxMatches: number,
): void {
  if (budget.exhausted || matches.length >= maxMatches) return;

  if (depth === order.length) {
    matches.push({ ...binding });
    if (matches.length >= maxMatches && maxMatches === MAX_MATCHES) budget.exhausted = true;
    return;
  }

  const node = order[depth];
  for (const candidate of structuralCandidates.get(node.alias) ?? []) {
    if (budget.exhausted || matches.length >= maxMatches) return;

    budget.steps++;
    if (budget.steps > MAX_STEPS) {
      budget.exhausted = true;
      return;
    }

    if (used.has(candidate)) continue; // injective bindings — no opt-out
    if (!satisfiesBoundEdgeConstraints(index, node.alias, candidate, binding, aliasConstraints)) continue;

    binding[node.alias] = candidate;
    used.add(candidate);
    backtrack(index, order, aliasConstraints, structuralCandidates, depth + 1, binding, used, budget, matches, maxMatches);
    delete binding[node.alias];
    used.delete(candidate);
  }
}

// ---- absent sub-patterns -------------------------------------------------

/** Resolves an `absent` block against one already-found outer binding.
 * Returns true (the outer binding is rejected) iff the forbidden shape
 * exists — a shared `budget` keeps the whole matchPattern call, including
 * every absent block it evaluates, under one MAX_STEPS ceiling. */
function absentBlockMatches(
  index: GraphIndex,
  block: { nodes: PatternNode[]; edges?: PatternEdge[] },
  outerBinding: Binding,
  budget: Budget,
): boolean {
  const edges = block.edges ?? [];
  const presetBinding: Binding = {};
  const used = new Set<string>(Object.values(outerBinding));

  for (const n of block.nodes) {
    const outerNodeId = outerBinding[n.alias];
    if (outerNodeId === undefined) continue;
    if (!nodeMatchesPredicates(index, outerNodeId, n)) return false; // outer alias doesn't qualify — block can't fire
    presetBinding[n.alias] = outerNodeId;
  }

  for (const e of edges) {
    if (presetBinding[e.from] !== undefined && presetBinding[e.to] !== undefined) {
      if (!edgeConstraintHolds(index, e, presetBinding[e.from], presetBinding[e.to])) return false;
    }
  }

  const newNodes = block.nodes.filter((n) => presetBinding[n.alias] === undefined);
  if (newNodes.length === 0) return true; // purely a reference to outer aliases, already validated above

  const order = orderBySelectivity(newNodes, edges);
  const aliasConstraints = buildAliasConstraintIndex(edges);
  const structuralCandidates = new Map(order.map((n) => [n.alias, structuralNodeCandidates(index, n)] as const));

  const matches: Binding[] = [];
  backtrack(index, order, aliasConstraints, structuralCandidates, 0, { ...presetBinding }, used, budget, matches, 1);

  return matches.length > 0;
}
