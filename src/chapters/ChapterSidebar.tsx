"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { QuestionPane } from "./QuestionPane";
import { findEntry } from "@/curriculum";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { deriveStatus, type ProgressInputs } from "@/curriculum/progress";
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
 * The in-workspace sidebar — a "Back to lesson" link above the
 * always-rendered QuestionPane. The Design Editor's own route to a chapter
 * is now reached exclusively through the Chapter Reader (`/<mode>/<slug>/
 * lesson`'s Design Editor CTA), so this is the one way back out: no
 * standalone curriculum browser or "View full Learning Path" link here
 * anymore (that's the Reader's ReaderSidebar's job) — going back always
 * means going back to the lesson this canvas belongs to, not jumping
 * sideways to a different chapter or the full Learning Path.
 */
export function ChapterSidebar({ courseId, chapterSlug, chapterOutcome, isStale }: ChapterSidebarProps) {
  // Guaranteed non-null by the route guard in practice ([chapterSlug]/
  // page.tsx 404s first) — kept as a real lookup so a stale/bad slug
  // degrades to `null` -> the defensive early return below.
  const entry = findEntry(courseId, chapterSlug);
  const chapter = entry?.chapterDefinitionId
    ? (chapterRegistry.find((c) => c.id === entry.chapterDefinitionId) ?? null)
    : null;

  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const correctQuestionIdsByDefinition = useCurriculumProgressStore((s) => s.correctQuestionIdsByDefinition);
  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, correctQuestionIdsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, correctQuestionIdsByDefinition],
  );

  if (!chapter || !entry) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <HeldTransitionLink
          href={`/${courseId}/${chapterSlug}/lesson`}
          label="Returning to the lesson…"
          className="flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft size={12} aria-hidden="true" />
          Back to lesson
        </HeldTransitionLink>
      </div>
      <QuestionPane
        chapter={chapter}
        entry={entry}
        status={deriveStatus(entry, inputs)}
        chapterOutcome={chapterOutcome}
        isStale={isStale}
      />
    </div>
  );
}
