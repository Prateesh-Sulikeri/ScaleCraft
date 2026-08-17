"use client";

import { ArrowRight, Rocket } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { DifficultyDots } from "./DifficultyDots";
import { findSection } from "@/curriculum";
import type { ContinueTarget } from "@/home/home-data";
import type { CourseId, CurriculumChapter } from "@/curriculum/types";

/** Names *why* this chapter, which is a different claim per situation - see
 *  ContinueTarget.kind. Same three readings Home's hero CTA hint uses. */
const KIND_HINT: Record<ContinueTarget["kind"], string> = {
  fresh: "Start here",
  resume: "Picking up where you left off",
  next: "Next in the curriculum",
};

type UpNextCardProps = {
  courseId: CourseId;
  /** Resolved by home-data's resolveContinueTarget, scoped to this course -
   *  the same preference order Home's CTA uses, never a second guess. */
  target: ContinueTarget;
  /** The manifest entry behind `target`, or null when everything authored in
   *  this course is finished. */
  entry: CurriculumChapter | null;
};

/**
 * The chapter to open next, as a card. The whole card is the link, and it is
 * the same HeldTransitionLink + lesson route a chapter row uses - one
 * navigation mechanism, so the destination cannot drift from the row it
 * mirrors (that row carries the matching accent rule, see ChapterRow's
 * `isNext`).
 */
export function UpNextCard({ courseId, target, entry }: UpNextCardProps) {
  const heading = (
    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--course-accent)]">
      <Rocket size={15} aria-hidden="true" />
      Up next
    </span>
  );

  if (!entry) {
    return (
      <section className="rounded-xl border border-border bg-panel p-4">
        {heading}
        <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
          Nothing left to open here - every authored chapter in this course is complete. More are on the way.
        </p>
      </section>
    );
  }

  const section = findSection(courseId, entry.slug);

  return (
    <HeldTransitionLink
      href={target.href}
      label={`Opening ${entry.title}…`}
      preload={() => preloadChapterLesson(entry.chapterDefinitionId ?? undefined)}
      aria-label={`Up next: ${entry.number ? `${entry.number} ` : ""}${entry.title}`}
      className="group/next block rounded-xl border border-[var(--course-accent-line)] bg-panel p-4 transition-[border-color,background-color] duration-150 ease-out hover:border-[var(--course-accent)] hover:bg-[var(--course-accent-wash)]"
    >
      {heading}

      {entry.number && (
        <p className="mt-3 text-lg font-semibold leading-none tabular-nums text-[var(--course-accent)]">{entry.number}</p>
      )}
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground">{entry.title}</p>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-foreground/45">
        <DifficultyDots difficulty={entry.difficulty} />
        {entry.difficulty}
        {entry.domain && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{entry.domain}</span>
          </>
        )}
      </p>

      <div className="mt-3.5 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0 text-xs text-foreground/50">
          <p className="text-foreground/60">{KIND_HINT[target.kind]}</p>
          {section && (
            <p className="mt-0.5 truncate">
              {section.label} &middot; {section.title}
            </p>
          )}
          <p className="mt-0.5 tabular-nums">~{entry.estimatedMinutes} min</p>
        </div>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[var(--course-accent-line)] transition-[transform,color] duration-150 ease-out group-hover/next:translate-x-0.5 group-hover/next:text-[var(--course-accent)] motion-reduce:transition-none motion-reduce:group-hover/next:translate-x-0"
        />
      </div>
    </HeldTransitionLink>
  );
}
