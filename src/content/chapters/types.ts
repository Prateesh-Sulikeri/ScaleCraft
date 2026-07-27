import type { ArchitectureGraph } from "@/lib/graph";
import type { GraphPattern } from "@/validation-engine/pattern";

export type Hint = {
  id: string;
  /** Markdown. Only ever shown if the user deliberately reveals it — see
   * "Hints vs. explanations" in .claude/docs/ARCHITECTURE.md. Never
   * auto-surfaced on failure. */
  body: string;
};

/**
 * A known-good design for a chapter, authored as a graph *pattern* rather
 * than a concrete graph — see .claude/docs/validation_agent_design.md §8.2.
 * Matching is containment, not equivalence: the learner passes if their
 * graph *contains* `require`'s shape (and none of `forbid`'s), extra
 * components are fine. A chapter may declare several, which is how "this
 * problem has more than one right answer" (RWE Phase B, Checkpoint R3) is
 * expressed — see evaluateChapter in validation-engine/chapter-outcome.ts.
 */
export type Blueprint = {
  id: string;
  /** Names the approach, e.g. "Cache-aside with a distributed cache". */
  label: string;
  require: GraphPattern;
  forbid?: GraphPattern[];
  /** Markdown. Debrief only — never shown before a pass (§8.4). */
  commentary: string;
  /** Concrete graph rendered in the debrief. Never used for matching. */
  referenceGraph?: ArchitectureGraph;
};

/**
 * See .claude/docs/ARCHITECTURE.md ("Chapter Definition"). Sandbox mode has
 * no ChapterDefinition — it's the component registry with no constraints.
 */
export type ChapterDefinition = {
  id: string;
  mode: "building-blocks" | "real-world-extraction";
  /** Short display name for the Chapter List row — distinct from
   * problemStatement, which is the long-form prose shown in the Question
   * Pane once selected. */
  title: string;
  /** Optional one-level nesting for the Chapter List (see
   * .claude/docs/UI_OVERHAUL_PART2_SPEC.md §2.1) — chapters sharing a
   * `group` render under one expandable/collapsible section; chapters with
   * no group (or when no chapter in the mode declares one) render as a
   * flat list. */
  group?: string;
  /** True for throwaway/dummy content authored only to exercise the chapter
   * shell (see Phase 5 of .claude/docs/UI_OVERHAUL_PART2_SPEC.md) —
   * ChapterList visually mutes these rows and appends a "more coming soon"
   * caption so they never read as finished curriculum. Omit (or false) for
   * real chapters. */
  placeholder?: boolean;
  problemStatement: string;
  learningObjectives: string[];
  availableComponentIds: string[];
  requiredComponentIds: string[];
  validationRuleIds: string[];
  /** At least one must match for the chapter to pass, unless the array is
   * empty — in which case rules alone decide (§8.3 point 4). See
   * evaluateChapter in validation-engine/chapter-outcome.ts. */
  blueprints: Blueprint[];
  hints: Hint[];
  /** Manual citations into the textbook — no content coupling, just links. */
  readingLinks: { label: string; url: string }[];
  starterGraph?: ArchitectureGraph;
};
