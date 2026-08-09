"use client";

import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import type { ChapterDefinition } from "@/content/chapters/types";

type DesignEditorCTAProps = {
  mode: ChapterDefinition["mode"];
  chapterSlug: string;
};

/**
 * Closes the Chapter Reader out into the Design Editor - the unchanged
 * canvas route (`/<mode>/<chapterSlug>`). Styled as a task card - label +
 * one-line blurb on the left, action button on the right - matching
 * QuizLauncher's row so the two read as one "this chapter's tasks" group
 * rather than two independently-styled buttons.
 */
export function DesignEditorCTA({ mode, chapterSlug }: DesignEditorCTAProps) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-border bg-panel px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Design exercise</h2>
        <p className="mt-0.5 text-xs text-foreground/60">Build it on the canvas and get validated against this chapter&apos;s target design.</p>
      </div>
      <HeldTransitionLink
        href={`/${mode}/${chapterSlug}`}
        label="Opening the Design Editor…"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border/40"
      >
        Begin exercise <span aria-hidden="true">&#8594;</span>
      </HeldTransitionLink>
    </div>
  );
}
