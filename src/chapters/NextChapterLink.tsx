"use client";

import { ChevronRight } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { nextEntry } from "@/curriculum";
import type { CourseId } from "@/curriculum/types";

type NextChapterLinkProps = {
  courseId: CourseId;
  chapterSlug: string;
  className?: string;
};

/**
 * Compact "Next chapter" link for the Design Editor sidebar and
 * ChapterPassedToast. The Chapter Reader's footer is ChapterPager. Always routes through the Reader
 * (`/<courseId>/<slug>/lesson`), never straight into the Design Editor -
 * same "lesson always precedes exercise" rule ChapterSidebar's "Back to
 * lesson" already follows. Renders nothing at the end of a course, and a
 * disabled affordance (not a dead link) when the next entry has no
 * ChapterDefinition yet - most of the curriculum isn't authored.
 */
export function NextChapterLink({ courseId, chapterSlug, className = "" }: NextChapterLinkProps) {
  const next = nextEntry(courseId, chapterSlug);
  if (!next) return null;

  const authored = next.chapterDefinitionId !== null;

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
