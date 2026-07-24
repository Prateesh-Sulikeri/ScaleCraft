import type { ChapterDefinition } from "./types";

/**
 * Throwaway placeholder content — one dummy chapter per chapter mode, just
 * enough to exercise the Phase 5 shell (ChapterWorkspace/ChapterSidebar/
 * ChapterList/QuestionPane) end to end. This is NOT real curriculum
 * content: the actual Building Blocks / RWE chapters (per
 * .claude/docs/CURRICULUM.md) are Step 5/6 in .claude/docs/NEXT_STEPS.md,
 * authored once the stronger validation agent (Step 3) exists to back
 * `validationRuleIds`. Replace this file's contents then, don't extend it.
 */
export const chapterRegistry: ChapterDefinition[] = [
  {
    id: "bb-dummy-1",
    mode: "building-blocks",
    title: "Placeholder Chapter",
    problemStatement:
      "This is placeholder content for the first Building Blocks chapter — " +
      "real lesson content (starting with load balancing, per CURRICULUM.md) " +
      "lands in a later step. For now, this exists only to prove the chapter " +
      "shell — list, question pane, filtered component picker — works.",
    learningObjectives: ["Placeholder objective — real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server"],
    requiredComponentIds: ["client", "load-balancer", "app-server"],
    validationRuleIds: [],
    hints: [
      {
        id: "bb-dummy-1-hint-1",
        body: "This is a placeholder hint. Real hints are opt-in, never auto-shown — this one is no different.",
      },
    ],
    readingLinks: [],
  },
  {
    id: "rwe-dummy-1",
    mode: "real-world-extraction",
    title: "Placeholder Project",
    problemStatement:
      "This is placeholder content for the first Real World Extraction project " +
      "(bit.ly, per CURRICULUM.md's RWE-1) — real content lands in a later step. " +
      "For now, this exists only to prove the chapter shell works in this mode too.",
    learningObjectives: ["Placeholder objective — real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server", "sql-database", "cache"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    validationRuleIds: [],
    hints: [],
    readingLinks: [],
  },
];

export function getChaptersForMode(mode: ChapterDefinition["mode"]): ChapterDefinition[] {
  return chapterRegistry.filter((c) => c.mode === mode);
}
