"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { CurriculumSectionList } from "./CurriculumSectionList";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import { ProgressBar } from "@/learning-path/ProgressBar";
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
 * other mounted consumer to do it first. The brand lockup lives in the
 * page's HomeHeader.
 */
export function ReaderSidebar({ course, chapterSlug }: ReaderSidebarProps) {
  const hydrate = useCurriculumProgressStore((s) => s.hydrate);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examBestByDefinition = useCurriculumProgressStore((s) => s.examBestByDefinition);
  const { isSignedIn } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase 11 (pending-6.1.0-poa.md) — the reader is public now. Signed-out
    // visitors never hydrate: no anonymous local writes, no point 401ing
    // against /api/sync/*. The store's untouched empty Set/Map already
    // renders every row as NOT_STARTED, the correct signed-out shape.
    if (!isSignedIn) return;
    void hydrate();
  }, [hydrate, isSignedIn]);

  // A deep chapter (3.13) sits far below the fold of a 48-row list, so open
  // with the current row in view instead of at Part 0.
  useEffect(() => {
    const root = scrollRef.current;
    const current = root?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!root || !current) return;
    root.scrollTop = current.offsetTop - root.clientHeight / 3;
  }, [chapterSlug]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examBestByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examBestByDefinition],
  );
  const summary = summarizeCourse(course, inputs);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 pb-4 pt-4">
        {/* ChevronLeft, not an external-link icon: this is back-navigation
         * inside ScaleCraft. */}
        <HeldTransitionLink
          href={`/${course.id}`}
          label="Returning to Learning Path…"
          className="inline-flex items-center gap-1 self-start text-xs text-foreground/60 transition-colors hover:text-foreground"
        >
          <ChevronLeft size={13} aria-hidden="true" />
          Learning Path
        </HeldTransitionLink>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">{course.title}</h2>
          {isSignedIn && (
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <ProgressBar
                  percent={summary.percent}
                  size="sm"
                  accentColor="var(--course-accent)"
                  label={`${course.title} progress`}
                />
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-foreground/55">
                {summary.completed}/{summary.total}
              </span>
            </div>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto px-1.5 pb-4">
        <CurriculumSectionList course={course} currentSlug={chapterSlug} inputs={inputs} />
      </div>
    </div>
  );
}
