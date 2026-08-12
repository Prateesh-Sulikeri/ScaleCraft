export { validationEngine, type ValidationEngineInput } from "./engine";

// Chapter-scoped orchestration (blueprint matching, required-component
// checks) built on top of the validation engine's run() - not part of the
// generic Engine interface itself, so it's a plain named export here rather
// than a method on validationEngine.
export {
  evaluateChapter,
  runChapterValidation,
  type ChapterOutcome,
  type ChapterValidationOutcome,
  type BlueprintDriftReport,
} from "@/validation-engine/chapter-outcome";

export { getRules, ruleRegistry } from "@/validation-engine/rules";
export { runValidation, hasErrors } from "@/validation-engine/engine";
export { buildGraphIndex, type GraphIndex } from "@/validation-engine/graph-index";
export { matchPattern, type Binding, type GraphPattern } from "@/validation-engine/pattern";

export type {
  ValidationRule,
  ValidationViolation,
  Severity,
  ImperativeRule,
  PatternRule,
  MatchResult,
} from "@/validation-engine/types";
