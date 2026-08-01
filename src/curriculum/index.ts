import { courses } from "./manifest";
import type { Course, CourseId, CurriculumChapter, CurriculumSection } from "./types";

export function getCourse(id: CourseId): Course {
  return courses[id];
}

/** All entries across all sections, in curriculum order. */
export function allEntries(course: Course): CurriculumChapter[] {
  return course.sections.flatMap((s) => s.chapters);
}

export function findEntry(courseId: CourseId, slug: string): CurriculumChapter | undefined {
  return allEntries(getCourse(courseId)).find((c) => c.slug === slug);
}

/** The section an entry belongs to — needed for the workspace's breadcrumb. */
export function findSection(courseId: CourseId, slug: string): CurriculumSection | undefined {
  return getCourse(courseId).sections.find((s) => s.chapters.some((c) => c.slug === slug));
}

/** Built once at module scope (not per call) — see Phase 1 gotcha in
 * .claude/docs/RELEASE_3.0.0_LEARNING_PATH.md §4. */
const slugByChapterDefinitionId: ReadonlyMap<string, string> = new Map(
  Object.values(courses)
    .flatMap((course) => allEntries(course))
    .filter((entry) => entry.chapterDefinitionId !== null)
    .map((entry) => [entry.chapterDefinitionId as string, entry.slug]),
);

/** Reverse lookup: which curriculum slug backs this ChapterDefinition?
 *  Needed so a validation pass (keyed by definition id) can be attributed to
 *  a slug. */
export function slugForChapterDefinitionId(id: string): string | undefined {
  return slugByChapterDefinitionId.get(id);
}
