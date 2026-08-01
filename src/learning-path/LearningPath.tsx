"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { PageEnter } from "@/app/PageEnter";
import { CourseHeader } from "./CourseHeader";
import { SectionCard } from "./SectionCard";
import { getCourse } from "@/curriculum";
import { summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { CourseId } from "@/curriculum/types";

/** How far down (px) the page must scroll before the "back to top" button
 *  appears — small enough that a learner scanning Real World Extraction's
 *  32-row page never has to scroll all the way back up by hand, but not so
 *  eager it shows up on a page that barely scrolls at all. */
const SCROLL_TOP_THRESHOLD = 400;

/**
 * The curriculum browser — full-screen, no canvas, no AppHeader, no
 * SidebarShell. Reads the curriculum manifest (static, SSRs) plus the
 * progress store (IndexedDB, client-only). Before hydrate() resolves the
 * store's default empty Set/Map already renders every entry as 0%/NOT_STARTED
 * — the same shape a real empty install would have — so there's no separate
 * loading branch to gate and no hydration mismatch to guard against.
 */
export function LearningPath({ courseId }: { courseId: CourseId }) {
  const course = getCourse(courseId);
  const hydrate = useCurriculumProgressStore((s) => s.hydrate);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition],
  );
  const summary = useMemo(() => summarizeCourse(course, inputs), [course, inputs]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = () => {
    setShowScrollTop((scrollRef.current?.scrollTop ?? 0) > SCROLL_TOP_THRESHOLD);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageEnter>
      {/* body is h-full/overflow-hidden (layout.tsx) — there is no page-level
       * scroll, so this region has to own its own. */}
      <div ref={scrollRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <CourseHeader course={course} summary={summary} />
          <div className="flex flex-col gap-3 pb-8">
            {course.sections.map((section) => (
              <SectionCard key={section.id} section={section} courseId={courseId} inputs={inputs} />
            ))}
          </div>
        </div>
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed right-6 bottom-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-foreground/70 shadow-md transition-colors hover:text-foreground motion-safe:animate-[dropdown-enter_150ms_ease-out] motion-reduce:opacity-100"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
    </PageEnter>
  );
}
