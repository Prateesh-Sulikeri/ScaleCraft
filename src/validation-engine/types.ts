import type { ArchitectureGraph } from "@/lib/graph";
import type { GraphIndex } from "./graph-index";
import type { GraphPattern } from "./pattern";

export type MatchResult = {
  offendingNodeIds: string[];
  offendingEdgeIds: string[];
  /** Optional, rule-computed specifics for this exact match — CloudFormation
   * Guard-style inline messages (see this file's own doc comment below).
   * Lets one rule that covers several distinct failure shapes (e.g.
   * component-relations.ts, which checks a component's own declared
   * contract OR a coarse category/kind fallback) still produce a message
   * and explanation as specific as if each shape were its own rule, instead
   * of falling back to one generic sentence for every case it covers.
   * Rules that only ever have one failure shape can safely ignore this. */
  detail?: string;
};

/** `"note"` is non-blocking and carries no node ring state — see
 * .claude/docs/validation_agent_design.md §9.3 for why trade-off
 * commentary is split out from real `warning`/`error` issues. */
export type Severity = "error" | "warning" | "note";

/**
 * A rule is a pure function over a graph — no hidden state, no DOM access.
 * See .claude/docs/ARCHITECTURE.md ("Validation engine") for the design
 * rationale (ESLint-style pluggability, CloudFormation Guard-style inline
 * messages, rustc-style short+long diagnostics). This is the original,
 * still-supported rule shape — the 10 existing rule files need no edits:
 * they have no `kind` field (so they narrow to `ImperativeRule`), and a
 * `(graph) => MatchResult[]` function is assignable to `(graph, index) =>
 * MatchResult[]`.
 */
export type ImperativeRule = {
  kind?: "imperative";
  id: string;
  severity: Severity;
  match: (graph: ArchitectureGraph, index: GraphIndex) => MatchResult[];
  /** Short — what's wrong. */
  message: (match: MatchResult) => string;
  /** Long — why it matters. Always shown alongside `message` on failure;
   * this is the product's pedagogical payload, not optional hand-holding. */
  explanation: (match: MatchResult) => string;
};

/**
 * A rule expressed declaratively as a `GraphPattern` (see pattern.ts) rather
 * than hand-rolled traversal code. A violation is raised once per binding
 * the pattern finds — see engine.ts for how `offendingNodeIds`/
 * `offendingEdgeIds` are derived from a binding.
 */
export type PatternRule = {
  kind: "pattern";
  id: string;
  severity: Severity;
  /** A violation is raised when this pattern IS found. */
  forbid: GraphPattern;
  message: string | ((match: MatchResult) => string);
  explanation: string | ((match: MatchResult) => string);
};

export type ValidationRule = ImperativeRule | PatternRule;

export type ValidationViolation = {
  ruleId: string;
  severity: Severity;
  message: string;
  explanation: string;
  offendingNodeIds: string[];
  offendingEdgeIds: string[];
};
