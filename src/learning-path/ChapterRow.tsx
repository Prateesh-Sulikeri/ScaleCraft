"use client";

import Link from "next/link";
import { Circle, CheckCircle2 } from "lucide-react";
import { ChapterStatusIcon } from "./ChapterStatusIcon";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { CourseId, CurriculumChapter, ChapterStatus } from "@/curriculum/types";

type ChapterRowProps = {
  entry: CurriculumChapter;
  courseId: CourseId;
  status: ChapterStatus;
  /** Distinguishes "COMPLETED by a real validation pass" from "COMPLETED by
   *  manual override" — only the latter can be un-toggled (a manual flag
   *  can't un-pass a real validation pass, decision D1). */
  completedByValidation: boolean;
};

export function ChapterRow({ entry, courseId, status, completedByValidation }: ChapterRowProps) {
  const setManualComplete = useCurriculumProgressStore((s) => s.setManualComplete);
  const isAuthored = entry.chapterDefinitionId !== null;
  const isCompleted = status === "COMPLETED";

  const mainContent = (
    <>
      <ChapterStatusIcon status={status} />
      {entry.number && (
        <span className="w-9 shrink-0 text-sm tabular-nums text-foreground/50">{entry.number}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${isAuthored ? "text-foreground" : "text-foreground/40"}`}>
          {entry.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-foreground/50">
          {entry.difficulty} · {entry.estimatedMinutes} min
        </p>
      </div>
      {!isAuthored && (
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/50">
          Not yet authored
        </span>
      )}
    </>
  );

  // Sits outside the <Link> (not nested inside it) — a button nested in an
  // anchor is invalid HTML and would fight the anchor's own click handling.
  // stopPropagation still guards it against the row's own hover/click affordances.
  const toggleButton = (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void setManualComplete(entry.slug, !isCompleted);
      }}
      disabled={completedByValidation}
      aria-label={isCompleted ? `Mark ${entry.title} incomplete` : `Mark ${entry.title} complete`}
      title={completedByValidation ? "Completed by validation" : undefined}
      className={`shrink-0 rounded-md p-1 ${
        completedByValidation
          ? "cursor-not-allowed text-state-valid opacity-50"
          : isCompleted
            ? "text-state-valid hover:opacity-80"
            : "text-foreground/40 hover:text-foreground"
      }`}
    >
      {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
    </button>
  );

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 ${isAuthored ? "hover:bg-border/40" : ""}`}>
      {isAuthored ? (
        <Link href={`/${courseId}/${entry.slug}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          {mainContent}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">{mainContent}</div>
      )}
      {toggleButton}
      {isAuthored && (
        <span className="shrink-0 text-foreground/30" aria-hidden="true">
          &rarr;
        </span>
      )}
    </div>
  );
}
