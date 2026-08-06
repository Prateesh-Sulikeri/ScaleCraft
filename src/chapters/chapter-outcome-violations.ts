import type { AnyNodeType } from "@/canvas/types";
import { getComponent } from "@/content/components/registry";
import type { BlueprintDriftReport, ValidationViolation } from "@/engines";

/** The common shape both ChapterValidationOutcome (Validate) and
 * ChapterOutcome (Submit) satisfy — `driftReport` only ever exists on the
 * latter, and only once Submit's structural stage passed but no blueprint
 * matched (see chapter-outcome.ts). Optional/nullable here so a plain
 * Validate result (which has no such field at all) is still assignable. */
export type ViolationSource = {
  violations: ValidationViolation[];
  missingRequiredComponentIds: string[];
  disconnectedRequiredComponentIds: string[];
  driftReport?: BlueprintDriftReport | null;
};

function driftExplanation(drift: BlueprintDriftReport): string {
  const parts: string[] = [];
  if (drift.missingComponents.length > 0) {
    parts.push(`Missing: ${drift.missingComponents.join(", ")}.`);
  }
  if (drift.mismatchedConnections.length > 0) {
    parts.push(`Connections that don't match: ${drift.mismatchedConnections.join("; ")}.`);
  }
  if (drift.extraComponentIds.length > 0) {
    const labels = drift.extraComponentIds.map((id) => getComponent(id)?.label ?? id);
    parts.push(`Not part of this approach: ${labels.join(", ")}.`);
  }
  return parts.length > 0
    ? parts.join(" ")
    : "The overall shape doesn't match any of the approaches this chapter is teaching.";
}

/**
 * A chapter can fail with zero real rule violations — a required component
 * missing/disconnected, or (Submit only) present-and-connected but not
 * matching any declared blueprint. That's "allowed" (nothing caught as an
 * anti-pattern), not "correct" (the thing this chapter is teaching), and it
 * used to be conflated: QuestionPane said "passing" while the header's
 * Validation pane said "No violations", which is exactly the beginner
 * confusion CLAUDE.md's "explanations always shown on failure" rule exists
 * to prevent. Rather than inventing a second, separate surface for these,
 * this formats them as ValidationViolation-shaped entries so they render in
 * the *same* header dropdown as real rule violations — one place a learner
 * looks for "what's wrong and why". Display-only: never fed back into
 * ChapterOutcome/passed, which stays the pure engine's job in
 * chapter-outcome.ts.
 */
export function chapterDisplayViolations(outcome: ViolationSource, nodes: AnyNodeType[]): ValidationViolation[] {
  const synthetic: ValidationViolation[] = [];

  for (const componentId of outcome.missingRequiredComponentIds) {
    const label = getComponent(componentId)?.label ?? componentId;
    synthetic.push({
      ruleId: `missing-required-component:${componentId}`,
      severity: "error",
      message: `${label} is required for this chapter but isn't on the canvas.`,
      explanation: `This chapter requires a ${label}. Add one to the diagram to continue.`,
      offendingNodeIds: [],
      offendingEdgeIds: [],
    });
  }

  for (const componentId of outcome.disconnectedRequiredComponentIds) {
    const label = getComponent(componentId)?.label ?? componentId;
    const offendingNodeIds = nodes
      .filter((n) => n.type === "component" && n.data.componentId === componentId)
      .map((n) => n.id);
    synthetic.push({
      ruleId: `disconnected-required-component:${componentId}`,
      severity: "error",
      message: `${label} is on the canvas but not connected to anything.`,
      explanation:
        `This chapter requires a connected ${label}. It's present but has no incoming or ` +
        "outgoing edges, so it plays no part in the architecture as drawn - connect it to " +
        "the rest of the diagram.",
      offendingNodeIds,
      offendingEdgeIds: [],
    });
  }

  // Submit-only: the structural stage passed (no rule violations, every
  // required component present and connected — the two loops above are both
  // empty) but no declared blueprint matched. driftReport carries exactly
  // which pieces are missing/extra/mismatched relative to the nearest one —
  // real, specific deltas rather than a bare "doesn't match" (§8.4's spoiler
  // limit still applies: blueprint.commentary itself never appears here).
  if (outcome.driftReport) {
    const drift = outcome.driftReport;
    synthetic.push({
      ruleId: `blueprint-drift:${drift.blueprintId}`,
      severity: "error",
      message: `This design doesn't yet match "${drift.blueprintLabel}" - the closest known approach for this chapter.`,
      explanation: driftExplanation(drift),
      offendingNodeIds: [],
      offendingEdgeIds: [],
    });
  }

  return [...outcome.violations, ...synthetic];
}
