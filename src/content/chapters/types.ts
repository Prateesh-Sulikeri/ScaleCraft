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
