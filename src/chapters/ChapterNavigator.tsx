"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { ChapterStatusIcon } from "@/learning-path/ChapterStatusIcon";
import { deriveStatus, type ProgressInputs } from "@/curriculum/progress";
import type { ChapterStatus, Course, CourseId, CurriculumChapter } from "@/curriculum/types";

type ChapterNavigatorProps = {
  course: Course;
  chapterSlug: string;
  inputs: ProgressInputs;
};

/**
 * Compact, collapsible curriculum browser mounted above QuestionPane inside
 * the in-workspace sidebar — replaces the old ChapterList (Phase 5,
 * RELEASE_3.0.0_LEARNING_PATH.md). Reads the same manifest + progress store
 * as the Learning Path (src/learning-path/), just condensed: same sections,
 * same entries, same ChapterStatusIcon (imported, not reimplemented — a
 * second status-icon mapping is the specific failure mode Phase 5 flags to
 * avoid). Never a second source of truth over progress; this is another
 * view, not another writer.
 *
 * Closed by default — this is a secondary navigation surface now, not the
 * primary one (that's the Learning Path, reachable via the link below).
 */
export function ChapterNavigator({ course, chapterSlug, inputs }: ChapterNavigatorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="shrink-0 border-b border-border">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          <ChevronRight
            size={12}
            className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
            aria-hidden="true"
          />
          Curriculum
        </button>
        <HeldTransitionLink
          href={`/${course.id}`}
          label="Returning to Learning Path…"
          className="flex shrink-0 items-center gap-1 text-xs text-foreground/50 hover:text-foreground"
        >
          View full Learning Path
          <ExternalLink size={11} aria-hidden="true" />
        </HeldTransitionLink>
      </div>

      {open && (
        <div className="max-h-72 overflow-y-auto border-t border-border px-1 pb-2 motion-safe:animate-[dropdown-enter_180ms_ease-out] motion-reduce:opacity-100">
          {course.sections.map((section) => (
            <div key={section.id} className="pt-2">
              <p className="px-2.5 text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">
                {section.label}
              </p>
              <ul className="flex flex-col">
                {section.chapters.map((entry) => (
                  <ChapterNavigatorRow
                    key={entry.slug}
                    courseId={course.id}
                    entry={entry}
                    isCurrent={entry.slug === chapterSlug}
                    status={deriveStatus(entry, inputs)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterNavigatorRow({
  courseId,
  entry,
  isCurrent,
  status,
}: {
  courseId: CourseId;
  entry: CurriculumChapter;
  isCurrent: boolean;
  status: ChapterStatus;
}) {
  const isAuthored = entry.chapterDefinitionId !== null;
  const content = (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <ChapterStatusIcon status={status} />
      <span className={`truncate text-xs ${isAuthored ? "text-foreground" : "text-foreground/40"}`}>
        {entry.number ? `${entry.number} ` : ""}
        {entry.title}
      </span>
    </span>
  );

  return (
    <li>
      {isAuthored ? (
        <HeldTransitionLink
          href={`/${courseId}/${entry.slug}`}
          label={`Opening ${entry.title}…`}
          aria-current={isCurrent ? "page" : undefined}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors hover:bg-border/40 ${
            isCurrent ? "bg-border/60" : ""
          }`}
        >
          {content}
        </HeldTransitionLink>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1.5 opacity-60">{content}</div>
      )}
    </li>
  );
}
