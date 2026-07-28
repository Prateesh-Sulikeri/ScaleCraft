import type { ArchitectureGraph } from "@/lib/graph";
import type { MatchResult, PatternRule, ValidationRule, ValidationViolation } from "./types";
import { buildGraphIndex, type GraphIndex } from "./graph-index";
import { matchPattern, type Binding, type PatternEdge } from "./pattern";

function resolveText(text: string | ((match: MatchResult) => string), match: MatchResult): string {
  return typeof text === "function" ? text(match) : text;
}

/** Finds the concrete edge id a `via: "direct"` (the default) pattern edge
 * resolved to for one binding — undefined if the constraint was
 * `via: "path"`, where there's no single edge to point at. */
function resolveDirectEdgeId(index: GraphIndex, edge: PatternEdge, binding: Binding): string | undefined {
  const kinds = edge.kind ? (Array.isArray(edge.kind) ? edge.kind : [edge.kind]) : undefined;
  return (index.outEdges.get(binding[edge.from]) ?? []).find(
    (e) => e.target === binding[edge.to] && (!kinds || kinds.includes(e.kind)),
  )?.id;
}

/** One `MatchResult` per binding the pattern finds: `offendingNodeIds` =
 * every bound node, `offendingEdgeIds` = the edges resolved for each
 * `via: "direct"` constraint (§9.3). */
function matchResultsForPatternRule(index: GraphIndex, rule: PatternRule): MatchResult[] {
  return matchPattern(index, rule.forbid).map((binding) => ({
    offendingNodeIds: Object.values(binding),
    offendingEdgeIds: (rule.forbid.edges ?? [])
      .filter((e) => (e.via ?? "direct") === "direct")
      .map((e) => resolveDirectEdgeId(index, e, binding))
      .filter((id): id is string => id !== undefined),
  }));
}

/**
 * Runs every given rule against the graph and aggregates violations. Rules
 * are looked up by id from the chapter's `validationRuleIds` (or, for
 * Sandbox, not run at all) — the engine never knows about chapters, and
 * rules never know about each other. See .claude/docs/ARCHITECTURE.md.
 *
 * Builds the `GraphIndex` once and dispatches each rule on `kind`; a
 * throwing rule is a bug in that rule, not the learner's fault, so it's
 * caught, logged, and skipped rather than killing the whole run (§9.4).
 */
export function runValidation(
  graph: ArchitectureGraph,
  rules: ValidationRule[],
): ValidationViolation[] {
  const index = buildGraphIndex(graph);
  const violations: ValidationViolation[] = [];

  for (const rule of rules) {
    try {
      const matches =
        rule.kind === "pattern" ? matchResultsForPatternRule(index, rule) : rule.match(graph, index);

      for (const match of matches) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: resolveText(rule.message, match),
          explanation: resolveText(rule.explanation, match),
          offendingNodeIds: match.offendingNodeIds,
          offendingEdgeIds: match.offendingEdgeIds,
        });
      }
    } catch (err) {
      console.error(`[validation-engine] rule "${rule.id}" threw and was skipped:`, err);
    }
  }

  return violations;
}

export function hasErrors(violations: ValidationViolation[]): boolean {
  return violations.some((v) => v.severity === "error");
}
