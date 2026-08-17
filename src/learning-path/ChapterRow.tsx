"use client";

import { ArrowRight, Flag } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { ChapterStatusIcon } from "./ChapterStatusIcon";
import { DifficultyDots } from "./DifficultyDots";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { useRequireAuthAction } from "@/auth/useRequireAuthAction";
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
  /** The chapter the "Up next" card points at - the same entry
   *  resolveContinueTarget picked, not a second guess. Marked with a left
   *  accent rule and a tinted surface so the card and the list agree about
   *  where the learner is. */
  isNext?: boolean;
};

export function ChapterRow({ entry, courseId, status, completedByValidation, isNext = false }: ChapterRowProps) {
  const setManualComplete = useCurriculumProgressStore((s) => s.setManualComplete);
  const resetChapter = useCurriculumProgressStore((s) => s.resetChapter);
  const { requireAuth, dialog } = useRequireAuthAction();
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
        requireAuth(() => {
          if (completedByValidation) {
            void resetChapter(entry.slug, entry.chapterDefinitionId);
          } else {
            void setManualComplete(entry.slug, !isCompleted);
          }
        });
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
          <span
            className={`w-9 shrink-0 text-sm tabular-nums ${isNext ? "font-medium text-[var(--course-accent)]" : "text-foreground/50"}`}
          >
            {entry.number}
          </span>
        ))}
      {/* One line where there is room, wrapping the metadata under the title
       * when there isn't - denser than the two fixed lines this used to be,
       * without ever truncating the difficulty away on a narrow window. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-0.5">
        <p
          className={`flex min-w-0 items-center gap-1 truncate text-sm ${isAuthored ? "text-foreground" : "text-foreground/40"} ${isCheckpoint ? "font-semibold" : ""}`}
        >
          {isCheckpoint && <Flag size={12} className="shrink-0 text-foreground/50" aria-hidden="true" />}
          {entry.title}
        </p>
        <p className="flex shrink-0 items-center gap-1.5 text-xs text-foreground/45">
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
      {/* Inside the link, so it responds from anywhere on the row rather than
       * only when the pointer reaches the arrow itself. */}
      {isAuthored && (
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="ml-auto shrink-0 text-foreground/25 transition-[transform,color] duration-150 ease-out group-hover/row:translate-x-0.5 group-hover/row:text-[var(--course-accent)] motion-reduce:transition-none motion-reduce:group-hover/row:translate-x-0"
        />
      )}
    </>
  );

  return (
    // The whole row is the hit area (the status toggle excepted - it is a
    // separate control and cannot nest inside an anchor), with a 2px left rule
    // reserved for the up-next chapter. Rows that are not next still occupy
    // that column via a transparent border, so nothing shifts sideways when
    // the marker moves to another row.
    <div
      data-up-next={isNext || undefined}
      className={`group/row flex items-center gap-2.5 border-l-2 py-2.5 pr-4 pl-[calc(1rem-2px)] transition-colors duration-150 ease-out ${
        isNext ? "border-l-[var(--course-accent)] bg-[var(--course-accent-wash)]" : "border-l-transparent"
      } ${isCheckpoint && !isNext ? "bg-border/20" : ""} ${isAuthored ? "hover:bg-border/40" : ""}`}
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
      {dialog}
    </div>
  );
}
