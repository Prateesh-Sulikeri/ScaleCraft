"use client";

import { useEffect, useMemo } from "react";
import { PageEnter } from "@/app/PageEnter";
import { CourseHeader } from "./CourseHeader";
import { SectionCard } from "./SectionCard";
import { getCourse } from "@/curriculum";
import { summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { CourseId } from "@/curriculum/types";

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

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug }),
    [validationPassedDefinitionIds, rowsBySlug],
  );
  const summary = useMemo(() => summarizeCourse(course, inputs), [course, inputs]);

  return (
    <PageEnter>
      {/* body is h-full/overflow-hidden (layout.tsx) — there is no page-level
       * scroll, so this region has to own its own. */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <CourseHeader course={course} summary={summary} />
          <div className="flex flex-col gap-3 pb-8">
            {course.sections.map((section) => (
              <SectionCard key={section.id} section={section} courseId={courseId} inputs={inputs} />
            ))}
          </div>
        </div>
      </div>
    </PageEnter>
  );
}
