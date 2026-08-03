import type { AnyNodeType } from "@/canvas/types";
import type { ChapterDefinition } from "@/content/chapters/types";
import { getComponent } from "@/content/components/registry";
import type { ChapterOutcome, ValidationViolation } from "@/engines";

/**
 * A chapter can fail with zero real rule violations — a required component
 * missing/disconnected, or present-and-connected but not matching any
 * declared blueprint. That's "allowed" (nothing caught as an anti-pattern),
 * not "correct" (the thing this chapter is teaching), and it used to be
 * conflated: QuestionPane said "passing" while the header's Validation pane
 * said "No violations", which is exactly the beginner confusion CLAUDE.md's
 * "explanations always shown on failure" rule exists to prevent. Rather
 * than inventing a second, separate surface for these, this formats them as
 * ValidationViolation-shaped entries so they render in the *same* header
 * dropdown as real rule violations — one place a learner looks for "what's
 * wrong and why". Display-only: never fed back into ChapterOutcome/passed,
 * which stays the pure engine's job in chapter-outcome.ts.
 */
export function chapterDisplayViolations(
  outcome: ChapterOutcome,
  chapter: ChapterDefinition,
  nodes: AnyNodeType[],
): ValidationViolation[] {
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

  // The one case that genuinely can't be more specific without spoiling the
  // chapter: every required component is present and connected, nothing
  // matches a known anti-pattern, but the shape doesn't match any declared
  // blueprint either. Naming exactly what's different from the blueprint
  // *is* the answer — that's a hint, and hints are pull-only (CLAUDE.md),
  // never force-surfaced here.
  const allowedButUnmatched =
    !outcome.passed &&
    outcome.violations.length === 0 &&
    outcome.missingRequiredComponentIds.length === 0 &&
    outcome.disconnectedRequiredComponentIds.length === 0 &&
    chapter.blueprints.length > 0;

  if (allowedButUnmatched) {
    synthetic.push({
      ruleId: "blueprint-mismatch",
      severity: "error",
      message: "This design doesn't match a known correct approach for this chapter yet.",
      explanation:
        "Every required component is present and connected, and nothing here matches a " +
        "known anti-pattern - but the overall shape doesn't match any of the approaches " +
        "this chapter is teaching. Structural checks can't be more specific without giving " +
        "away the answer; if you want a nudge, check this chapter's hints.",
      offendingNodeIds: [],
      offendingEdgeIds: [],
    });
  }

  return [...outcome.violations, ...synthetic];
}
