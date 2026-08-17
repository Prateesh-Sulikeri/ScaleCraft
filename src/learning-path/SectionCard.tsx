"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { ChapterRow } from "./ChapterRow";
import { summarizeSection, deriveStatus, type ProgressInputs } from "@/curriculum/progress";
import type { CourseId, CurriculumChapter, CurriculumSection } from "@/curriculum/types";

type SectionCardProps = {
  section: CurriculumSection;
  courseId: CourseId;
  /** Passed down, never re-read from the store per card. */
  inputs: ProgressInputs;
  /** Lifted to LearningPath (decision D5 extended) so a single collapse-all
   *  control and search can both drive every card's expanded state. */
  expanded: boolean;
  onToggleExpanded: () => void;
  /** Chapter rows to render below the header - the full section, or a
   *  search-filtered subset. The header's own progress count always reflects
   *  the full, unfiltered section. */
  visibleChapters: readonly CurriculumChapter[];
  /** Slug of the chapter the "Up next" card points at, if it happens to be in
   *  this section. */
  upNextSlug?: string | null;
};

/** Collapsible section. Collapsed it is a single compact row - eyebrow badge,
 *  title, count, chevron - so a long curriculum stays scannable; expanded it
 *  grows the section's summary and its chapter rows under the same header.
 *  The header is identical in both states, which is what keeps a collapse from
 *  reading as a different component. */
export function SectionCard({
  section,
  courseId,
  inputs,
  expanded,
  onToggleExpanded,
  visibleChapters,
  upNextSlug = null,
}: SectionCardProps) {
  const summary = summarizeSection(section, inputs);
  const isComplete = summary.total > 0 && summary.completed === summary.total;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-panel transition-colors duration-150 ease-out ${
        expanded ? "border-border" : "border-border hover:border-foreground/20"
      }`}
    >
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        className="group/section flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-border/25"
      >
        <span className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/60 transition-colors duration-150 ease-out group-hover/section:text-foreground/80">
          {section.label}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">{section.title}</span>

        <span className="shrink-0 text-xs tabular-nums text-foreground/55">
          {summary.completed} / {summary.total}
        </span>
        {isComplete && <CheckCircle2 size={14} className="shrink-0 text-state-valid" aria-hidden="true" />}
        <ChevronDown
          size={15}
          className={`shrink-0 text-foreground/40 transition-transform duration-200 ease-out motion-reduce:transition-none ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="border-t border-border motion-safe:animate-[dropdown-enter_180ms_ease-out] motion-reduce:opacity-100">
          {/* Outside the toggle button on purpose: inside, every section's
           * accessible name would carry its whole summary sentence. */}
          <p className="px-4 pt-3 pb-2 text-[13px] leading-relaxed text-foreground/55">{section.summary}</p>
          <ul className="flex flex-col border-t border-border/60">
            {visibleChapters.map((entry) => (
              <li key={entry.slug} className="border-b border-border/40 last:border-b-0">
                <ChapterRow
                  entry={entry}
                  courseId={courseId}
                  status={deriveStatus(entry, inputs)}
                  completedByValidation={
                    entry.chapterDefinitionId !== null &&
                    inputs.validationPassedDefinitionIds.has(entry.chapterDefinitionId)
                  }
                  isNext={entry.slug === upNextSlug}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
