"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Search } from "lucide-react";
import { PageEnter } from "@/app/PageEnter";
import { chapterStatusLabel } from "./ChapterStatusIcon";
import { CourseHeader } from "./CourseHeader";
import { SectionCard } from "./SectionCard";
import { getCourse } from "@/curriculum";
import { deriveStatus, summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
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

  // Per-section collapse, in-memory only (decision D5). A section id here
  // means collapsed; absent means expanded, so the default (empty set)
  // matches D5's "defaults expanded" without seeding every id up front.
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());
  const toggleSection = (id: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const anySectionExpanded = course.sections.some((s) => !collapsedSectionIds.has(s.id));
  const toggleAllSections = () => {
    setCollapsedSectionIds(anySectionExpanded ? new Set(course.sections.map((s) => s.id)) : new Set());
  };

  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim().toLowerCase();

  const visibleSections = useMemo(() => {
    if (!trimmedQuery) {
      return course.sections.map((section) => ({ section, visibleChapters: section.chapters }));
    }
    return course.sections
      .map((section) => {
        const sectionMatches =
          section.title.toLowerCase().includes(trimmedQuery) || section.label.toLowerCase().includes(trimmedQuery);
        const visibleChapters = sectionMatches
          ? section.chapters
          : section.chapters.filter((chapter) => {
              const status = deriveStatus(chapter, inputs);
              return (
                chapter.title.toLowerCase().includes(trimmedQuery) ||
                chapterStatusLabel(status).toLowerCase().includes(trimmedQuery)
              );
            });
        return { section, visibleChapters };
      })
      .filter(({ visibleChapters }) => visibleChapters.length > 0);
  }, [course.sections, trimmedQuery, inputs]);

  // A search match must stay visible regardless of collapse state - a
  // section the learner collapsed earlier shouldn't hide the very result
  // they just searched for.
  const isSectionExpanded = (id: string) => (trimmedQuery ? true : !collapsedSectionIds.has(id));

  return (
    <PageEnter>
      {/* body is h-full/overflow-hidden (layout.tsx) — there is no page-level
       * scroll, so this region has to own its own. */}
      <div ref={scrollRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <CourseHeader course={course} summary={summary} />

          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chapters, sections, or status..."
                aria-label="Search chapters"
                className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-foreground/40"
              />
            </div>
            <button
              type="button"
              onClick={toggleAllSections}
              className="shrink-0 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
            >
              {anySectionExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <div className="flex flex-col gap-3 pb-8">
            {visibleSections.length === 0 ? (
              <p className="px-1 py-8 text-center text-sm text-foreground/50">
                No chapters match &quot;{query.trim()}&quot;.
              </p>
            ) : (
              visibleSections.map(({ section, visibleChapters }) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  courseId={courseId}
                  inputs={inputs}
                  expanded={isSectionExpanded(section.id)}
                  onToggleExpanded={() => toggleSection(section.id)}
                  visibleChapters={visibleChapters}
                />
              ))
            )}
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
