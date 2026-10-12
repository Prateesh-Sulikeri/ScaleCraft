"use client";

import type { CSSProperties } from "react";
import { ArrowRight, Flag, Server } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { categoryColorVar } from "@/canvas/category-colors";
import { iconMap } from "@/canvas/icon-map";
import { chapterComponents } from "./chapter-components";
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
  /** False when every row in the section shares one difficulty - the section
   *  header states it once instead of repeating it per row. */
  showDifficulty?: boolean;
};

const MAX_PLATES = 4;

/** Small category-tinted icon plates - the node card's icon plate at row
 *  scale - for the components a chapter is about (see chapter-components.ts). */
function ComponentPlates({ courseId, slug }: { courseId: CourseId; slug: string }) {
  const defs = chapterComponents(courseId, slug);
  if (defs.length === 0) return null;
  const shown = defs.slice(0, MAX_PLATES);

  return (
    <span aria-hidden="true" className="hidden shrink-0 items-center gap-1 sm:flex">
      {shown.map((def) => {
        const Icon = iconMap[def.icon] ?? Server;
        return (
          <span
            key={def.id}
            aria-hidden="true"
            title={def.label}
            style={{ "--accent": categoryColorVar[def.category] } as CSSProperties}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-[color:color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
          >
            <Icon size={13} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
          </span>
        );
      })}
      {defs.length > MAX_PLATES && (
        <span aria-hidden="true" className="pl-0.5 text-[11px] tabular-nums text-foreground/45">
          +{defs.length - MAX_PLATES}
        </span>
      )}
    </span>
  );
}

export function ChapterRow({
  entry,
  courseId,
  status,
  completedByValidation,
  isNext = false,
  showDifficulty = true,
}: ChapterRowProps) {
  const setManualComplete = useCurriculumProgressStore((s) => s.setManualComplete);
  const resetChapter = useCurriculumProgressStore((s) => s.resetChapter);
  const { requireAuth, dialog } = useRequireAuthAction();
  const isAuthored = entry.chapterDefinitionId !== null;
  const isCompleted = status === "COMPLETED";
  // A checkpoint is a blank-canvas re-demonstration gating the next group,
  // not just another row (CURRICULUM.md Part 4) - shape-distinct (icon +
  // bordered number chip), not color-only, per DESIGN.md's signal rule.
  const isCheckpoint = entry.kind === "checkpoint";
  // Outside the link and referenced by aria-describedby, so the components
  // describe the row without becoming part of the link's name.
  const components = chapterComponents(courseId, entry.slug);
  const describedById = components.length > 0 ? `components-${entry.slug}` : undefined;

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
        {isNext && (
          <span className="shrink-0 rounded-sm border border-[var(--course-accent-line)] bg-[var(--course-accent-soft)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[var(--course-accent)]">
            Up next
          </span>
        )}
        {(showDifficulty || entry.domain) && (
          <p className="flex shrink-0 items-center gap-1.5 text-xs text-foreground/45">
            {showDifficulty && (
              <>
                <DifficultyDots difficulty={entry.difficulty} />
                {entry.difficulty}
              </>
            )}
            {showDifficulty && entry.domain && <span aria-hidden="true">&middot;</span>}
            {entry.domain && <span>{entry.domain}</span>}
          </p>
        )}
      </div>
      <ComponentPlates courseId={courseId} slug={entry.slug} />
      <span className="hidden w-14 shrink-0 text-right text-xs tabular-nums text-foreground/45 sm:block">
        ~{entry.estimatedMinutes} min
      </span>
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
    // separate control and cannot nest inside an anchor). Up next is a tinted
    // surface, an inset accent outline and an "Up next" chip - not a colored
    // left rule, which DESIGN.md bans as a side stripe.
    <div
      data-up-next={isNext || undefined}
      className={`group/row flex items-center gap-2.5 px-4 py-2.5 transition-colors duration-150 ease-out ${
        isNext
          ? "bg-[color:color-mix(in_srgb,var(--course-accent)_9%,transparent)] shadow-[inset_0_0_0_1px_var(--course-accent-line)]"
          : ""
      } ${isCheckpoint && !isNext ? "bg-border/20" : ""} ${isAuthored ? "hover:bg-border/40" : ""}`}
    >
      {toggleButton}
      {isAuthored ? (
        <HeldTransitionLink
          href={`/${courseId}/${entry.slug}/lesson`}
          label={`Opening ${entry.title}\u2026`}
          preload={() => preloadChapterLesson(entry.chapterDefinitionId ?? undefined)}
          aria-describedby={describedById}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {mainContent}
        </HeldTransitionLink>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">{mainContent}</div>
      )}
      {describedById && (
        <span id={describedById} className="sr-only">
          Components: {components.map((d) => d.label).join(", ")}
        </span>
      )}
      {dialog}
    </div>
  );
}
