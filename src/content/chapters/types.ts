import type { ArchitectureGraph } from "@/lib/graph";

export type Hint = {
  id: string;
  /** Markdown. Only ever shown if the user deliberately reveals it — see
   * "Hints vs. explanations" in .claude/docs/ARCHITECTURE.md. Never
   * auto-surfaced on failure. */
  body: string;
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
  hints: Hint[];
  /** Manual citations into the textbook — no content coupling, just links. */
  readingLinks: { label: string; url: string }[];
  starterGraph?: ArchitectureGraph;
  solutionGraph?: ArchitectureGraph;
};
