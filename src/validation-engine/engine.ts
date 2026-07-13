import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule, ValidationViolation } from "./types";

/**
 * Runs every given rule against the graph and aggregates violations. Rules
 * are looked up by id from the chapter's `validationRuleIds` (or, for
 * Sandbox, not run at all) — the engine never knows about chapters, and
 * rules never know about each other. See .claude/docs/ARCHITECTURE.md.
 */
export function runValidation(
  graph: ArchitectureGraph,
  rules: ValidationRule[],
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  for (const rule of rules) {
    for (const match of rule.match(graph)) {
      violations.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message(match),
        explanation: rule.explanation(match),
        offendingNodeIds: match.offendingNodeIds,
        offendingEdgeIds: match.offendingEdgeIds,
      });
    }
  }

  return violations;
}

export function hasErrors(violations: ValidationViolation[]): boolean {
  return violations.some((v) => v.severity === "error");
}
