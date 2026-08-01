"use client";

import Link from "next/link";
import { ChapterStatusIcon } from "@/learning-path/ChapterStatusIcon";
import { deriveStatus, type ProgressInputs } from "@/curriculum/progress";
import type { ChapterStatus, Course, CourseId, CurriculumChapter } from "@/curriculum/types";

type CurriculumSectionListProps = {
  course: Course;
  /** The row that should render as visually "current" for whichever
   *  surface is hosting this list. */
  currentSlug: string;
  inputs: ProgressInputs;
};

/**
 * The section/row list used by ReaderSidebar (Chapter Reader) — pulled out
 * of that component so the row rendering itself (sections, entries,
 * ChapterStatusIcon) isn't tangled up with the sidebar's own chrome. Every
 * row links to the chapter's Reader (`/<mode>/<slug>/lesson`), not the
 * canvas directly — the Reader is the only way into a chapter's Design
 * Editor now; the CTA inside the Reader itself is what actually reaches the
 * canvas route.
 */
export function CurriculumSectionList({ course, currentSlug, inputs }: CurriculumSectionListProps) {
  return (
    <>
      {course.sections.map((section) => (
        <div key={section.id} className="pt-2">
          {/* An invisible w-4 spacer mirrors ChapterStatusIcon's own width
           * (see ChapterStatusIcon.tsx's size={16}) plus the same gap-2 a
           * row uses between its icon and title — without it, this label's
           * text starts flush at the row's *icon* edge while every row's
           * own title starts 24px further right past its icon, so nothing
           * lines up. This keeps one shared text column regardless of
           * which rows below happen to render an icon. */}
          <p className="flex items-center gap-2 px-2.5 text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">
            <span className="w-4 shrink-0" aria-hidden="true" />
            {section.label}
          </p>
          <ul className="flex flex-col">
            {section.chapters.map((entry) => (
              <CurriculumSectionListRow
                key={entry.slug}
                courseId={course.id}
                entry={entry}
                isCurrent={entry.slug === currentSlug}
                status={deriveStatus(entry, inputs)}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function CurriculumSectionListRow({
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
        <Link
          href={`/${courseId}/${entry.slug}/lesson`}
          aria-current={isCurrent ? "page" : undefined}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors hover:bg-border/40 ${
            isCurrent ? "bg-border/60" : ""
          }`}
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1.5 opacity-60">{content}</div>
      )}
    </li>
  );
}
