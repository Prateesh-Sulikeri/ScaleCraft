"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { ChapterRow } from "./ChapterRow";
import { ProgressBar } from "./ProgressBar";
import { summarizeSection, deriveStatus, type ProgressInputs } from "@/curriculum/progress";
import type { CourseId, CurriculumSection } from "@/curriculum/types";

type SectionCardProps = {
  section: CurriculumSection;
  courseId: CourseId;
  /** Passed down, never re-read from the store per card. */
  inputs: ProgressInputs;
};

/** Collapsible section (decision D5: in-memory only, defaults expanded).
 *  The header row (chevron, eyebrow label, mini progress bar, count) stays
 *  visible whether collapsed or expanded; the full title/summary and the
 *  chapter list only render while expanded. */
export function SectionCard({ section, courseId, inputs }: SectionCardProps) {
  const [expanded, setExpanded] = useState(true);
  const summary = summarizeSection(section, inputs);
  const isComplete = summary.total > 0 && summary.completed === summary.total;

  return (
    <div className="rounded-md border border-border bg-panel">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-border/30"
      >
        <ChevronRight
          size={14}
          className={`shrink-0 text-foreground/50 transition-transform duration-200 motion-reduce:transition-none ${
            expanded ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
        <span className="shrink-0 text-[11px] font-semibold tracking-wide text-foreground/60 uppercase">
          {section.label}
        </span>
        <div className="ml-auto flex w-36 shrink-0 items-center gap-2">
          <ProgressBar
            percent={summary.percent}
            size="sm"
            label={`${section.title} progress: ${summary.percent}%`}
          />
          <span className="shrink-0 text-xs tabular-nums text-foreground/60">
            {summary.completed} / {summary.total}
          </span>
          {isComplete && <CheckCircle2 size={14} className="shrink-0 text-state-valid" aria-hidden="true" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border motion-safe:animate-[dropdown-enter_180ms_ease-out] motion-reduce:opacity-100">
          <div className="px-4 pt-3 pb-1 pl-[calc(14px+0.5rem)]">
            <p className="text-[15px] font-semibold text-foreground">{section.title}</p>
            <p className="mt-0.5 text-[13px] text-foreground/60">{section.summary}</p>
          </div>
          <ul className="flex flex-col">
            {section.chapters.map((entry) => (
              <li key={entry.slug}>
                <ChapterRow
                  entry={entry}
                  courseId={courseId}
                  status={deriveStatus(entry, inputs)}
                  completedByValidation={
                    entry.chapterDefinitionId !== null &&
                    inputs.validationPassedDefinitionIds.has(entry.chapterDefinitionId)
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
