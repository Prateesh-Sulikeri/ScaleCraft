"use client";

import { ChevronRight } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { nextEntry } from "@/curriculum";
import type { CourseId } from "@/curriculum/types";

type NextChapterLinkProps = {
  courseId: CourseId;
  chapterSlug: string;
  /** "card" - full-width footer pagination card (eyebrow + next chapter's
   *  own title + arrow), the doc-site "Next" pattern (Docusaurus/Mintlify/
   *  Stripe docs), for the Chapter Reader footer. "inline" (default) -
   *  compact text link for tight rows: ChapterSidebar's header,
   *  ChapterPassedToast. */
  variant?: "inline" | "card";
  className?: string;
};

/**
 * "Next chapter" affordance shared by the Chapter Reader, the Design
 * Editor sidebar, and ChapterPassedToast. Always routes through the Reader
 * (`/<courseId>/<slug>/lesson`), never straight into the Design Editor -
 * same "lesson always precedes exercise" rule ChapterSidebar's "Back to
 * lesson" already follows. Renders nothing at the end of a course, and a
 * disabled affordance (not a dead link) when the next entry has no
 * ChapterDefinition yet - most of the curriculum isn't authored.
 */
export function NextChapterLink({ courseId, chapterSlug, variant = "inline", className = "" }: NextChapterLinkProps) {
  const next = nextEntry(courseId, chapterSlug);
  if (!next) return null;

  const authored = next.chapterDefinitionId !== null;

  if (variant === "card") {
    const label = next.number ? `${next.number} ${next.title}` : next.title;

    if (!authored) {
      return (
        <div
          className={`flex w-full cursor-not-allowed items-center justify-end gap-3 rounded-lg border border-dashed border-border/60 px-5 py-4 text-right ${className}`}
        >
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] font-medium tracking-wide text-foreground/30 uppercase">Next chapter</span>
            <span className="text-base font-semibold text-foreground/40">{label}</span>
            <span className="text-[11px] text-foreground/30">Coming soon</span>
          </div>
        </div>
      );
    }

    return (
      <HeldTransitionLink
        href={`/${courseId}/${next.slug}/lesson`}
        label="Loading the next chapter…"
        className={`group flex w-full items-center justify-end gap-3 rounded-lg border border-border bg-panel px-5 py-4 text-right transition-colors hover:border-foreground/30 hover:bg-border/40 ${className}`}
      >
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-medium tracking-wide text-foreground/50 uppercase">Next chapter</span>
          <span className="text-base font-semibold text-foreground">{label}</span>
        </div>
        <ChevronRight
          size={20}
          className="shrink-0 text-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </HeldTransitionLink>
    );
  }

  if (!authored) {
    return (
      <span className={`inline-flex items-center gap-1 text-foreground/40 ${className}`}>
        Next chapter
        <ChevronRight size={12} aria-hidden="true" />
      </span>
    );
  }

  return (
    <HeldTransitionLink
      href={`/${courseId}/${next.slug}/lesson`}
      label="Loading the next chapter…"
      className={`inline-flex items-center gap-1 ${className}`}
    >
      Next chapter
      <ChevronRight size={12} aria-hidden="true" />
    </HeldTransitionLink>
  );
}
