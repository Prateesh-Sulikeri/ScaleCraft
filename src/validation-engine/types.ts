import type { ArchitectureGraph } from "@/lib/graph";

export type MatchResult = {
  offendingNodeIds: string[];
  offendingEdgeIds: string[];
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
