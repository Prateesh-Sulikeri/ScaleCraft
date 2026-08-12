"use client";

import { Flag } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { ChapterStatusIcon } from "./ChapterStatusIcon";
import { DifficultyDots } from "./DifficultyDots";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { CourseId, CurriculumChapter, ChapterStatus } from "@/curriculum/types";

type ChapterRowProps = {
  entry: CurriculumChapter;
  courseId: CourseId;
  status: ChapterStatus;
  /** Distinguishes "COMPLETED by a real validation pass" from "COMPLETED by
   *  manual override" — clicking the toggle on the former resets the
   *  chapter (see resetChapter, progress-store.ts) instead of just flipping
   *  a manual flag, since a manual flag alone can't un-pass a real
   *  validation pass (decision D1). */
  completedByValidation: boolean;
};

export function ChapterRow({ entry, courseId, status, completedByValidation }: ChapterRowProps) {
  const setManualComplete = useCurriculumProgressStore((s) => s.setManualComplete);
  const resetChapter = useCurriculumProgressStore((s) => s.resetChapter);
  const isAuthored = entry.chapterDefinitionId !== null;
  const isCompleted = status === "COMPLETED";
  // A checkpoint is a blank-canvas re-demonstration gating the next group,
  // not just another row (CURRICULUM.md Part 4) - shape-distinct (icon +
  // bordered number chip), not color-only, per DESIGN.md's signal rule.
  const isCheckpoint = entry.kind === "checkpoint";

  // Sits outside the navigation element (not nested inside it) — a button
  // nested in an anchor is invalid HTML and would fight the anchor's own
  // click handling. stopPropagation still guards it against the row's own
  // hover/click affordances.
  const toggleButton = (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (completedByValidation) {
          void resetChapter(entry.slug, entry.chapterDefinitionId);
        } else {
          void setManualComplete(entry.slug, !isCompleted);
        }
      }}
      aria-label={
        completedByValidation
          ? `Reset ${entry.title} progress`
          : isCompleted
            ? `Mark ${entry.title} incomplete`
            : `Mark ${entry.title} complete`
      }
      title={completedByValidation ? "Completed by validation - click to reset and redo this chapter" : undefined}
      className={`shrink-0 rounded-md p-1 transition-colors ${
        isCompleted ? "text-state-valid hover:opacity-80" : "text-foreground/40 hover:text-foreground"
      }`}
    >
      <ChapterStatusIcon status={status} />
    </button>
  );

  const mainContent = (
    <>
      {entry.number &&
        (isCheckpoint ? (
          <span className="flex w-9 shrink-0 items-center justify-center rounded-md border border-border bg-panel py-0.5 text-[11px] font-semibold tabular-nums text-foreground/70">
            {entry.number}
          </span>
        ) : (
          <span className="w-9 shrink-0 text-sm tabular-nums text-foreground/50">{entry.number}</span>
        ))}
      <div className="min-w-0 flex-1">
        <p
          className={`flex items-center gap-1 truncate text-sm ${isAuthored ? "text-foreground" : "text-foreground/40"} ${isCheckpoint ? "font-semibold" : ""}`}
        >
          {isCheckpoint && <Flag size={12} className="shrink-0 text-foreground/50" aria-hidden="true" />}
          {entry.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-foreground/50">
          <DifficultyDots difficulty={entry.difficulty} />
          {entry.difficulty}
          {entry.domain && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{entry.domain}</span>
            </>
          )}
        </p>
      </div>
      {!isAuthored && (
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/50">
          Coming soon
        </span>
      )}
    </>
  );

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${isCheckpoint ? "bg-border/20" : ""} ${isAuthored ? "hover:bg-border/40" : ""}`}
    >
      {toggleButton}
      {isAuthored ? (
        <HeldTransitionLink
          href={`/${courseId}/${entry.slug}/lesson`}
          label={`Opening ${entry.title}\u2026`}
          preload={() => preloadChapterLesson(entry.chapterDefinitionId ?? undefined)}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {mainContent}
        </HeldTransitionLink>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">{mainContent}</div>
      )}
      {isAuthored && (
        <span className="shrink-0 text-foreground/30" aria-hidden="true">
          &rarr;
        </span>
      )}
    </div>
  );
}
