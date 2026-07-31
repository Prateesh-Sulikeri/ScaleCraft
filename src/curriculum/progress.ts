import type { CurriculumProgress, ExamAttempt } from "@/persistence/db";
import { chapterRegistry } from "@/content/chapters";
import type { ChapterStatus, Course, CurriculumChapter, CurriculumSection } from "./types";
import { allEntries } from "./index";

/** Pure functions over plain data — zero React, zero Dexie. Callers own the
 * I/O (curriculum/progress-store.ts) and pass the results in here. */
export type ProgressInputs = {
  /** ChapterDefinition ids the validation engine has passed
   *  (db.chapterProgress rows). */
  validationPassedDefinitionIds: ReadonlySet<string>;
  /** Curriculum rows by slug (db.curriculumProgress). */
  rowsBySlug: ReadonlyMap<string, CurriculumProgress>;
  /** Submitted exam attempts, by chapterDefinitionId (db.examAttempts). */
  examAttemptsByDefinition: ReadonlyMap<string, readonly ExamAttempt[]>;
};

export const EXAM_PASS_THRESHOLD = 80;
export const MAX_EXAM_ATTEMPTS = 3;

/** 0 for a chapter with no attempts yet. */
export function bestExamScore(attempts: readonly ExamAttempt[]): number {
  return attempts.reduce((best, a) => Math.max(best, a.score), 0);
}

export function examPassed(attempts: readonly ExamAttempt[]): boolean {
  return bestExamScore(attempts) >= EXAM_PASS_THRESHOLD;
}

/** Passing locks further attempts immediately; otherwise exhausting
 *  MAX_EXAM_ATTEMPTS without passing locks to "view your best attempt." */
export function examLocked(attempts: readonly ExamAttempt[]): boolean {
  return examPassed(attempts) || attempts.length >= MAX_EXAM_ATTEMPTS;
}

/** COMPLETED wins over IN_PROGRESS wins over NOT_STARTED. A manual override
 *  is always sufficient on its own — decision D1. A validation pass is
 *  sufficient only when the chapter's definition has no quiz; when it does,
 *  COMPLETED additionally requires the best exam attempt to meet
 *  EXAM_PASS_THRESHOLD (best-score-wins, not last-attempt-wins — see
 *  .claude/docs/pending-quiz-ui.md addendum). */
export function deriveStatus(entry: CurriculumChapter, inputs: ProgressInputs): ChapterStatus {
  const row = inputs.rowsBySlug.get(entry.slug);

  if (row?.manuallyCompletedAt != null) return "COMPLETED";
  if (entry.chapterDefinitionId != null && inputs.validationPassedDefinitionIds.has(entry.chapterDefinitionId)) {
    const definition = chapterRegistry.find((c) => c.id === entry.chapterDefinitionId);
    const quiz = definition?.quiz;
    if (!quiz || quiz.length === 0) return "COMPLETED";
    const attempts = inputs.examAttemptsByDefinition.get(entry.chapterDefinitionId) ?? [];
    if (examPassed(attempts)) return "COMPLETED";
  }
  if (row?.lastVisitedAt != null) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export type ProgressSummary = {
  completed: number;
  total: number;
  /** 0-100, rounded to the nearest integer. `total === 0` → 0, never NaN. */
  percent: number;
};

export function summarizeEntries(
  entries: readonly CurriculumChapter[],
  inputs: ProgressInputs,
): ProgressSummary {
  const total = entries.length;
  const completed = entries.filter((e) => deriveStatus(e, inputs) === "COMPLETED").length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function summarizeSection(s: CurriculumSection, inputs: ProgressInputs): ProgressSummary {
  return summarizeEntries(s.chapters, inputs);
}

export type CourseSummary = ProgressSummary & {
  /** A section counts as complete only when every one of its entries is COMPLETED. */
  sectionsCompleted: number;
  sectionsTotal: number;
};

export function summarizeCourse(course: Course, inputs: ProgressInputs): CourseSummary {
  const overall = summarizeEntries(allEntries(course), inputs);
  const sectionsCompleted = course.sections.filter(
    (s) => s.chapters.length > 0 && s.chapters.every((c) => deriveStatus(c, inputs) === "COMPLETED"),
  ).length;
  return { ...overall, sectionsCompleted, sectionsTotal: course.sections.length };
}
