"use client";

import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import type { ChapterDefinition } from "@/content/chapters/types";

type DesignEditorCTAProps = {
  mode: ChapterDefinition["mode"];
  chapterSlug: string;
};

/**
 * Closes the Chapter Reader out into the Design Editor - the unchanged
 * canvas route (`/<mode>/<chapterSlug>`).
 */
export function DesignEditorCTA({ mode, chapterSlug }: DesignEditorCTAProps) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <HeldTransitionLink
        href={`/${mode}/${chapterSlug}`}
        label="Opening the Design Editor…"
        className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-panel px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border/50"
      >
        Begin exercise <span className="pl-2">&#8594;</span>
      </HeldTransitionLink>

      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
