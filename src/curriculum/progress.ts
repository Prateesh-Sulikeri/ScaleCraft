import type { CurriculumProgress } from "@/persistence/db";
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
};

/** COMPLETED wins over IN_PROGRESS wins over NOT_STARTED. A manual override
 *  and a validation pass are both sufficient, never required together —
 *  decision D1. */
export function deriveStatus(entry: CurriculumChapter, inputs: ProgressInputs): ChapterStatus {
  const row = inputs.rowsBySlug.get(entry.slug);

  if (row?.manuallyCompletedAt != null) return "COMPLETED";
  if (entry.chapterDefinitionId != null && inputs.validationPassedDefinitionIds.has(entry.chapterDefinitionId)) {
    return "COMPLETED";
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
