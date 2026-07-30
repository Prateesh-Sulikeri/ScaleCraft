"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChapterNavigator } from "./ChapterNavigator";
import { QuestionPane } from "./QuestionPane";
import { getCourse, findEntry, adjacentAuthoredEntries } from "@/curriculum";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { ProgressInputs } from "@/curriculum/progress";
import { chapterRegistry } from "@/content/chapters";
import type { CourseId } from "@/curriculum/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";

type ChapterSidebarProps = {
  courseId: CourseId;
  chapterSlug: string;
  chapterOutcome: ChapterOutcome | null;
  isStale: boolean;
};

/**
 * The in-workspace sidebar — a collapsible curriculum navigator
 * (ChapterNavigator) above the always-rendered QuestionPane. Since Phase 4
 * made the workspace route-driven, there is always a chapter open; this
 * replaces the old two-view ChapterList/QuestionPane switcher (see git
 * history) entirely. Derives everything from `courseId` + `chapterSlug` —
 * the curriculum manifest and progress store are the single source of
 * truth (RELEASE_3.0.0_LEARNING_PATH.md Phase 5); this component is another
 * *view* over them, same as the Learning Path, never a second writer.
 */
export function ChapterSidebar({ courseId, chapterSlug, chapterOutcome, isStale }: ChapterSidebarProps) {
  const router = useRouter();
  const course = getCourse(courseId);

  // Guaranteed non-null by the route guard in practice ([chapterSlug]/
  // page.tsx 404s first) — kept as a real lookup so a stale/bad slug
  // degrades to `null` -> the defensive early return below.
  const entry = findEntry(courseId, chapterSlug);
  const chapter = entry?.chapterDefinitionId
    ? (chapterRegistry.find((c) => c.id === entry.chapterDefinitionId) ?? null)
    : null;

  const { prev, next } = adjacentAuthoredEntries(courseId, chapterSlug);

  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug }),
    [validationPassedDefinitionIds, rowsBySlug],
  );

  if (!chapter) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChapterNavigator course={course} chapterSlug={chapterSlug} inputs={inputs} />
      <QuestionPane
        chapter={chapter}
        onBack={() => router.push(`/${courseId}`)}
        onPrev={prev ? () => router.push(`/${courseId}/${prev.slug}`) : undefined}
        onNext={next ? () => router.push(`/${courseId}/${next.slug}`) : undefined}
        chapterOutcome={chapterOutcome}
        isStale={isStale}
      />
    </div>
  );
}
