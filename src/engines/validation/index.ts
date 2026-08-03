export { validationEngine, type ValidationEngineInput } from "./engine";

// Chapter-scoped orchestration (blueprint matching, required-component
// checks) built on top of the validation engine's run() - not part of the
// generic Engine interface itself, so it's a plain named export here rather
// than a method on validationEngine.
export { evaluateChapter, type ChapterOutcome } from "@/validation-engine/chapter-outcome";

export { getRules, ruleRegistry } from "@/validation-engine/rules";
export { runValidation, hasErrors } from "@/validation-engine/engine";

export type {
  ValidationRule,
  ValidationViolation,
  Severity,
  ImperativeRule,
  PatternRule,
  MatchResult,
} from "@/validation-engine/types";
