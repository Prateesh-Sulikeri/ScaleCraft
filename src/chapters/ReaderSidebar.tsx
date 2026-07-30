"use client";

import { useEffect, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { CurriculumSectionList } from "./CurriculumSectionList";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { ProgressInputs } from "@/curriculum/progress";
import type { Course } from "@/curriculum/types";

type ReaderSidebarProps = {
  course: Course;
  chapterSlug: string;
};

/**
 * The Chapter Reader's left panel — curriculum-only nav, always expanded
 * (no collapse-toggle disclosure like ChapterNavigator's own "Curriculum"
 * accordion; the Reader has room to just show it). Reuses
 * CurriculumSectionList, the same row rendering ChapterNavigator uses inside
 * the workspace — one implementation, two hosting surfaces. Hydrates the
 * progress store itself (same as LearningPath.tsx) since this page has no
 * other mounted consumer to do it first.
 */
export function ReaderSidebar({ course, chapterSlug }: ReaderSidebarProps) {
  const hydrate = useCurriculumProgressStore((s) => s.hydrate);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug }),
    [validationPassedDefinitionIds, rowsBySlug],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex shrink-0 flex-col gap-3 px-3 py-3">
        {/* ChevronLeft, not an external-link icon — this stays inside
         * ScaleCraft, it's a back-navigation affordance to the Learning
         * Path, not a hop to another site. */}
        <HeldTransitionLink
          href={`/${course.id}`}
          label="Returning to Learning Path…"
          className="flex shrink-0 items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
        >
          <ChevronLeft size={13} aria-hidden="true" />
          Learning Path
        </HeldTransitionLink>
        <div>
          {/* A real heading, not another small label — this is the panel's
           * own title, and pairing it with the course name (course.title,
           * e.g. "Building Blocks") answers "curriculum of what?" instead
           * of leaving "Curriculum" floating with no context. */}
          <h2 className="text-sm font-semibold text-foreground">Curriculum</h2>
          <p className="text-xs text-foreground/50">{course.title}</p>
        </div>
      </div>
      <div className="border-t border-border px-1 pb-2">
        <CurriculumSectionList course={course} currentSlug={chapterSlug} inputs={inputs} />
      </div>
    </div>
  );
}
