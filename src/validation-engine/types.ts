import type { ArchitectureGraph } from "@/lib/graph";

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

/**
 * A rule is a pure function over a graph — no hidden state, no DOM access.
 * See .claude/docs/ARCHITECTURE.md ("Validation engine") for the design
 * rationale (ESLint-style pluggability, CloudFormation Guard-style inline
 * messages, rustc-style short+long diagnostics).
 */
export type ValidationRule = {
  id: string;
  severity: "error" | "warning";
  match: (graph: ArchitectureGraph) => MatchResult[];
  /** Short — what's wrong. */
  message: (match: MatchResult) => string;
  /** Long — why it matters. Always shown alongside `message` on failure;
   * this is the product's pedagogical payload, not optional hand-holding. */
  explanation: (match: MatchResult) => string;
};

export type ValidationViolation = {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  explanation: string;
  offendingNodeIds: string[];
  offendingEdgeIds: string[];
};
