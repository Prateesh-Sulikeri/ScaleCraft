import type { ArchitectureGraph } from "@/lib/graph";
import type { GraphPattern } from "@/validation-engine/pattern";

export type Hint = {
  id: string;
  /** Markdown. Only ever shown if the user deliberately reveals it — see
   * "Hints vs. explanations" in .claude/docs/ARCHITECTURE.md. Never
   * auto-surfaced on failure. */
  body: string;
};

export type QuizQuestionKind =
  | "single"
  | "multi"
  | "matching"
  | "ordering"
  | "diagram"
  | "estimate";

export type QuizOption = {
  /** Stable within the question — persistence key for matching/ordering. */
  id: string;
  /** Markdown. */
  label: string;
  /** Markdown. Shown after any attempt, always — chosen or not, right or
   * wrong. A bare "wrong" is a bug. See .claude/docs/QUIZ_FRAMEWORK.md §1. */
  explanationMd: string;
  correct: boolean;
};

/**
 * See .claude/docs/QUIZ_FRAMEWORK.md §2. Question `id` is a persistence key
 * (§17) — never reuse across authoring changes, or mastery history silently
 * points at the wrong question.
 */
export type QuizQuestion = {
  id: string;
  kind: QuizQuestionKind;
  /** Ramp position, not a score (§1 point 4 — no scoring theater). */
  difficulty: 1 | 2 | 3;
  /** Markdown. */
  prompt: string;
  /** kind "diagram" only — rendered read-only, never used for matching. */
  graph?: ArchitectureGraph;
  options: QuizOption[];
  /** kind "ordering" only — the correct sequence of option ids. */
  correctOrder?: string[];
  /** kind "matching" only — pairs of [leftLabel, correctOptionId]. */
  pairs?: [string, string][];
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
 * Manually authored per Building Blocks chapter, transcribed from
 * CURRICULUM.md's own per-chapter "Assumes" / "New concepts" / "Prepares
 * for" fields (plus any explicit simplification notes, e.g. 1.3's "a faster
 * store exists and is two chapters away"). Lets Deep Check
 * (.claude/docs/validation_agent_design.md §10) review a learner's build
 * relative to their actual curriculum stage instead of as a production
 * system. Real World Extraction chapters don't need this — by RWE every
 * concept in the curriculum has already been taught (see the design doc's
 * 2026-07-28 addendum on why `evaluateChapter` runs RWE unscoped; this is
 * the AI-layer counterpart of that same principle).
 */
export type CurriculumContext = {
  /** e.g. "Building Blocks, Group A: Core Infrastructure — Chapter 3.4 of 44." */
  position: string;
  /** Concepts/components already taught in prior chapters — safe background
   * Deep Check may assume without explaining from scratch. */
  masteredConcepts: string[];
  /** Concepts deliberately not yet taught. Never a gap to flag or push the
   * learner toward as a fix — at most a brief "coming up later" pointer. */
  notYetIntroducedConcepts: string[];
  /** Intentional pedagogical simplifications at this stage — not omissions
   * to call out. */
  simplifications: string[];
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
  /** True for throwaway/dummy content authored only to exercise the chapter
   * shell — marks *content* as throwaway, a different fact from "unauthored"
   * (src/curriculum's `chapterDefinitionId: null`, which is what the
   * Learning Path reads). QuestionPane (src/chapters/QuestionPane.tsx) shows
   * a Draft badge for these so they never read as finished curriculum.
   * Omit (or false) for real chapters. */
  placeholder?: boolean;
  problemStatement: string;
  learningObjectives: string[];
  availableComponentIds: string[];
  requiredComponentIds: string[];
  /** Ignored for `mode: "real-world-extraction"` — evaluateChapter always
   * runs the full rule registry there instead, regardless of what's listed
   * here. See the comment on that branch in validation-engine/chapter-outcome.ts
   * for why. Only building-blocks chapters actually curate a subset. */
  validationRuleIds: string[];
  /** At least one must match for the chapter to pass, unless the array is
   * empty — in which case rules alone decide (§8.3 point 4). See
   * evaluateChapter in validation-engine/chapter-outcome.ts. */
  blueprints: Blueprint[];
  hints: Hint[];
  /** Manual citations into the textbook — no content coupling, just links. */
  readingLinks: { label: string; url: string }[];
  starterGraph?: ArchitectureGraph;
  /** Building Blocks only — see CurriculumContext's own doc comment. Absent
   * for real-world-extraction and for not-yet-authored placeholder chapters. */
  curriculumContext?: CurriculumContext;
  /** Absent means the chapter has no quiz — checkpoints never have one. See
   * .claude/docs/QUIZ_FRAMEWORK.md and the Reader's QuizLauncher. */
  quiz?: QuizQuestion[];
};
