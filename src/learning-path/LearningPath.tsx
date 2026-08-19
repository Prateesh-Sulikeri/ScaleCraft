"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Search } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { PageEnter } from "@/app/PageEnter";
import { courseAccentStyle } from "./accent";
import { chapterStatusLabel } from "./ChapterStatusIcon";
import { CourseHeader } from "./CourseHeader";
import { LEARNING_PATH_CONTAINER } from "./layout";
import { SectionCard } from "./SectionCard";
import { StatusFilter, type StatusFilterValue } from "./StatusFilter";
import { ResetProgressDialog } from "./ResetProgressDialog";
import { ReportBugButton } from "@/bugs/ReportBugButton";
import { TipCard } from "./TipCard";
import { UpNextCard } from "./UpNextCard";
import { findEntry, getCourse } from "@/curriculum";
import { deriveStatus, summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { activityTimestamps, computeDayStreak, resolveContinueTarget } from "@/home/home-data";
import { useNow } from "@/lib/use-now";
import type { CourseId, CurriculumChapter } from "@/curriculum/types";

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
 *
 * Two columns on a wide screen: the curriculum, and a sticky rail holding
 * "Up next" and the course's own guidance. Both rail cards fall below the
 * curriculum on narrow screens rather than squeezing into a column too thin
 * to read.
 */
export function LearningPath({ courseId }: { courseId: CourseId }) {
  const course = getCourse(courseId);
  // refresh, not hydrate: this component remounts on every client-side
  // navigation back to the Learning Path, and that is exactly when a learner
  // expects to see what another device did. hydrate()'s already-hydrated
  // bail would make it a no-op for the rest of the tab's life.
  const refresh = useCurriculumProgressStore((s) => s.refresh);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  // Same union Home applies - the two headers must never disagree about the
  // streak. See persistence/streak-days.ts.
  const preservedStreakDays = useCurriculumProgressStore((s) => s.preservedStreakDays);
  const { isSignedIn } = useAuth();
  // null on the server and the hydrating render, so a day streak computed
  // here can never disagree with the first client paint (lib/use-now.ts).
  const now = useNow();

  useEffect(() => {
    // Phase 11 (pending-6.1.0-poa.md) — public page now. Signed-out visitors
    // never refresh: no anonymous local writes, no point 401ing against
    // /api/sync/*. The store's untouched empty Set/Map already renders
    // every row as NOT_STARTED, the correct signed-out shape.
    if (!isSignedIn) return;
    void refresh();
  }, [refresh, isSignedIn]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition],
  );
  const summary = useMemo(() => summarizeCourse(course, inputs), [course, inputs]);
  const dayStreak = useMemo(
    () => computeDayStreak(activityTimestamps(inputs), now ?? 0, preservedStreakDays),
    [inputs, now, preservedStreakDays],
  );

  // Scoped to this course, so the card names a chapter the page below it
  // actually lists — but resolved by Home's own preference order, not a
  // second implementation of "what comes next".
  const upNext = useMemo(() => {
    const target = resolveContinueTarget(inputs, [courseId]);
    const entry = target.slug ? (findEntry(courseId, target.slug) ?? null) : null;
    return { target, entry };
  }, [inputs, courseId]);

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

  const [resetOpen, setResetOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");
  const trimmedQuery = query.trim().toLowerCase();
  const isFiltering = trimmedQuery.length > 0 || statusFilter !== "ALL";

  const visibleSections = useMemo(() => {
    const matchesStatus = (chapter: CurriculumChapter) =>
      statusFilter === "ALL" || deriveStatus(chapter, inputs) === statusFilter;

    return course.sections
      .map((section) => {
        // A section whose own title/label matches the query keeps all of its
        // chapters — the status filter still applies to them, since the two
        // controls compose rather than override each other.
        const sectionMatches =
          trimmedQuery.length > 0 &&
          (section.title.toLowerCase().includes(trimmedQuery) || section.label.toLowerCase().includes(trimmedQuery));

        const visibleChapters = section.chapters.filter((chapter) => {
          if (!matchesStatus(chapter)) return false;
          if (!trimmedQuery || sectionMatches) return true;
          const status = deriveStatus(chapter, inputs);
          return (
            chapter.title.toLowerCase().includes(trimmedQuery) ||
            chapterStatusLabel(status).toLowerCase().includes(trimmedQuery)
          );
        });

        return { section, visibleChapters };
      })
      .filter(({ visibleChapters }) => !isFiltering || visibleChapters.length > 0);
  }, [course.sections, trimmedQuery, statusFilter, isFiltering, inputs]);

  // A match must stay visible regardless of collapse state - a section the
  // learner collapsed earlier shouldn't hide the very result they just
  // filtered for.
  const isSectionExpanded = (id: string) => (isFiltering ? true : !collapsedSectionIds.has(id));

  return (
    <PageEnter>
      {/* body is h-full/overflow-hidden (layout.tsx) — there is no page-level
       * scroll, so this region has to own its own. The accent vars are set
       * here, at the page root, so every card below inherits one course
       * colour instead of naming a hue of its own (see accent.ts). */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={courseAccentStyle(courseId)}
        className="relative flex-1 overflow-y-auto"
      >
        <div className={`${LEARNING_PATH_CONTAINER} py-8`}>
          <CourseHeader course={course} summary={summary} dayStreak={dayStreak} />

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-full lg:w-80">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chapters, sections, or status..."
                  aria-label="Search chapters"
                  className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none transition-colors duration-150 ease-out focus:border-foreground/40"
                />
              </div>
              <button
                type="button"
                onClick={toggleAllSections}
                className="shrink-0 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground"
              >
                {anySectionExpanded ? "Collapse all" : "Expand all"}
              </button>
              {/* Same button shape and padding as "Collapse all" beside it,
                  carrying the error colour on its border and label so the
                  one destructive control on the page reads as destructive at
                  a glance. Outlined rather than filled - a solid red block
                  next to two neutral controls would pull the eye harder than
                  a rarely-used action deserves, and the filled treatment is
                  reserved for the dialog's final confirm. Absent for
                  signed-out visitors, who have no progress to reset - a
                  disabled button would advertise an action with nothing to
                  act on. */}
              {isSignedIn && (
                <button
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="shrink-0 rounded-md border border-state-error/40 bg-panel px-3 py-1.5 text-sm font-medium text-state-error transition-colors duration-150 ease-out hover:border-state-error hover:bg-state-error/5"
                >
                  Reset progress
                </button>
              )}
              {/* Unlike Reset progress, this renders signed out too - the
                  modal invites a sign-in rather than assuming an account,
                  and a broken page is worth reporting whoever you are. */}
              <ReportBugButton />
            </div>

            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>

          <div className="grid items-start gap-4 pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-3">
              {visibleSections.length === 0 ? (
                <p className="rounded-xl border border-border bg-panel px-4 py-10 text-center text-sm text-foreground/50">
                  No chapters match {trimmedQuery ? `"${query.trim()}"` : "this filter"}.
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
                    upNextSlug={upNext.entry?.slug ?? null}
                  />
                ))
              )}
            </div>

            {/* Sticky against this page's own scroll container, which is the
             * nearest scrolling ancestor - the rail stays with the learner
             * through a 32-row course. */}
            <aside className="flex flex-col gap-3 lg:sticky lg:top-2">
              <UpNextCard courseId={courseId} target={upNext.target} entry={upNext.entry} />
              <TipCard courseId={courseId} />
            </aside>
          </div>
        </div>

        {resetOpen && <ResetProgressDialog courseId={courseId} onClose={() => setResetOpen(false)} />}

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
