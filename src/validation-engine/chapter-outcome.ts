import type { ArchitectureGraph } from "@/lib/graph";
import type { Blueprint, ChapterDefinition } from "@/content/chapters/types";
import type { ValidationViolation } from "./types";
import { runValidation } from "./engine";
import { getRules, ruleRegistry } from "./rules";
import { buildGraphIndex, type GraphIndex } from "./graph-index";
import { patternMatches } from "./pattern";
import { connectedNodeIds } from "./rules/orphan-component";
import { nearestBlueprintDrift, type BlueprintDriftReport } from "./blueprint-drift";

export type { BlueprintDriftReport } from "./blueprint-drift";

/** The Validate button's result (.claude/docs/pending.md Track A) — rules
 * plus required-component presence/connectivity, no blueprint matching.
 * Also Submit's first stage: Submit never attempts blueprint comparison
 * against a graph that fails this. */
export type ChapterValidationOutcome = {
  passed: boolean;
  violations: ValidationViolation[];
  errorCount: number;
  missingRequiredComponentIds: string[];
  /** Present on canvas but no incident edge and not an entry point. */
  disconnectedRequiredComponentIds: string[];
};

/** Submit's result — the structural check above, plus (only once it
 * passes) blueprint matching. `driftReport` is populated only when the
 * structural check passed but no blueprint matched — Submit's two output
 * shapes ("fix these structural errors" vs. "here's your variance report")
 * are never blended, see pending.md's "two-stage, short-circuiting" note. */
export type ChapterOutcome = ChapterValidationOutcome & {
  matchedBlueprintId: string | null;
  driftReport: BlueprintDriftReport | null;
};

/** A blueprint counts as matched when its `require` pattern is found and
 * none of its `forbid` patterns are (§9.5) — easy to accidentally only
 * check `require` and forget `forbid` exists too. */
function blueprintMatches(index: GraphIndex, blueprint: Blueprint): boolean {
  if (!patternMatches(index, blueprint.require)) return false;
  return !(blueprint.forbid ?? []).some((pattern) => patternMatches(index, pattern));
}

/**
 * Validate's engine call — rules (scoped to `validationRuleIds`, or the
 * full registry for real-world-extraction, see the branch comment below)
 * plus required-component presence/connectivity. No blueprint matching and
 * no chapterProgress write — that's Submit's job (evaluateChapter below).
 */
export function runChapterValidation(
  graph: ArchitectureGraph,
  chapter: ChapterDefinition,
): ChapterValidationOutcome {
  // Real World Extraction always runs the full rule registry, ignoring
  // `validationRuleIds` — per CURRICULUM.md §9's difficulty curve, RWE's
  // posture is "anti-pattern + warnings" over a large-to-full palette, every
  // taught concept already applies uniformly by the time RWE starts, and
  // curating a subset would just re-introduce BB's teach-by-omission
  // scoping where it no longer serves a pedagogical purpose. Building
  // Blocks keeps author-curated scoping — a chapter shouldn't flag concepts
  // it hasn't taught yet.
  const rules = chapter.mode === "real-world-extraction" ? ruleRegistry : getRules(chapter.validationRuleIds);
  const violations = runValidation(graph, rules);
  const errorCount = violations.filter((v) => v.severity === "error").length;

  const connected = connectedNodeIds(graph);
  const missingRequiredComponentIds: string[] = [];
  const disconnectedRequiredComponentIds: string[] = [];

  for (const componentId of chapter.requiredComponentIds) {
    const nodes = graph.nodes.filter((n) => n.componentId === componentId);
    if (nodes.length === 0) {
      missingRequiredComponentIds.push(componentId);
    } else if (!nodes.some((n) => connected.has(n.id))) {
      disconnectedRequiredComponentIds.push(componentId);
    }
  }

  const passed =
    errorCount === 0 && missingRequiredComponentIds.length === 0 && disconnectedRequiredComponentIds.length === 0;

  return { passed, violations, errorCount, missingRequiredComponentIds, disconnectedRequiredComponentIds };
}

/**
 * Submit's engine call — implements §8.3's four pass criteria: zero
 * errors, every required component present and connected, and (when the
 * chapter declares any) at least one blueprint matched. Two-stage,
 * short-circuiting (pending.md, 2026-08-04): the structural check runs
 * first via runChapterValidation, and blueprint comparison is only ever
 * attempted once that passes — a structurally broken graph never gets a
 * drift report computed against it.
 */
export function evaluateChapter(graph: ArchitectureGraph, chapter: ChapterDefinition): ChapterOutcome {
  const structural = runChapterValidation(graph, chapter);
  if (!structural.passed || chapter.blueprints.length === 0) {
    return { ...structural, matchedBlueprintId: null, driftReport: null };
  }

  const index = buildGraphIndex(graph);
  const matched = chapter.blueprints.find((b) => blueprintMatches(index, b));
  if (matched) {
    return { ...structural, matchedBlueprintId: matched.id, driftReport: null };
  }

  return {
    ...structural,
    passed: false,
    matchedBlueprintId: null,
    driftReport: nearestBlueprintDrift(index, chapter.blueprints),
  };
}
