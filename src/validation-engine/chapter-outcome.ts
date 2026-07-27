import type { ArchitectureGraph } from "@/lib/graph";
import type { Blueprint, ChapterDefinition } from "@/content/chapters/types";
import type { ValidationViolation } from "./types";
import { runValidation } from "./engine";
import { getRules } from "./rules";
import { buildGraphIndex, type GraphIndex } from "./graph-index";
import { patternMatches } from "./pattern";
import { connectedNodeIds } from "./rules/orphan-component";

export type ChapterOutcome = {
  passed: boolean;
  matchedBlueprintId: string | null;
  violations: ValidationViolation[];
  errorCount: number;
  missingRequiredComponentIds: string[];
  /** Present on canvas but no incident edge and not an entry point. */
  disconnectedRequiredComponentIds: string[];
};

/** A blueprint counts as matched when its `require` pattern is found and
 * none of its `forbid` patterns are (§9.5) — easy to accidentally only
 * check `require` and forget `forbid` exists too. */
function blueprintMatches(index: GraphIndex, blueprint: Blueprint): boolean {
  if (!patternMatches(index, blueprint.require)) return false;
  return !(blueprint.forbid ?? []).some((pattern) => patternMatches(index, pattern));
}

/**
 * Implements §8.3's four pass criteria: zero errors, every required
 * component present and connected, and (when the chapter declares any) at
 * least one blueprint matched. `warning`/`note` violations never block.
 */
export function evaluateChapter(graph: ArchitectureGraph, chapter: ChapterDefinition): ChapterOutcome {
  const violations = runValidation(graph, getRules(chapter.validationRuleIds));
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

  let matchedBlueprintId: string | null = null;
  if (chapter.blueprints.length > 0) {
    const index = buildGraphIndex(graph);
    const matched = chapter.blueprints.find((b) => blueprintMatches(index, b));
    matchedBlueprintId = matched?.id ?? null;
  }

  const passed =
    errorCount === 0 &&
    missingRequiredComponentIds.length === 0 &&
    disconnectedRequiredComponentIds.length === 0 &&
    (chapter.blueprints.length === 0 || matchedBlueprintId !== null);

  return {
    passed,
    matchedBlueprintId,
    violations,
    errorCount,
    missingRequiredComponentIds,
    disconnectedRequiredComponentIds,
  };
}
