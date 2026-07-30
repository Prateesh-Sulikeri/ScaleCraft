"use client";

import { ChapterList } from "./ChapterList";
import { QuestionPane } from "./QuestionPane";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";

type ChapterSidebarProps = {
  chapters: ChapterDefinition[];
  selectedChapterId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  chapterOutcome: ChapterOutcome | null;
  isStale: boolean;
  /** Curriculum-order prev/next (src/curriculum's adjacentAuthoredEntries),
   *  as opposed to index-adjacency within this mode's own ChapterDefinition
   *  array below — see RELEASE_3.0.0_LEARNING_PATH.md Phase 4.3. When
   *  provided (even with both entries undefined), takes over from the
   *  chapters-array computation entirely. Phase 5 removes the fallback and
   *  this override once the sidebar reads the curriculum manifest directly. */
  navOverride?: { onPrev?: () => void; onNext?: () => void };
};

/**
 * The two-view switcher mounted inside SidebarShell — Chapter List when no
 * chapter is selected, Question Pane once one is. One implementation shared
 * by both /building-blocks and /real-world-extraction via ChapterWorkspace.
 */
export function ChapterSidebar({
  chapters,
  selectedChapterId,
  onSelect,
  onBack,
  chapterOutcome,
  isStale,
  navOverride,
}: ChapterSidebarProps) {
  const selected = chapters.find((c) => c.id === selectedChapterId) ?? null;

  if (!selected) {
    return <ChapterList chapters={chapters} onSelect={onSelect} />;
  }

  const index = chapters.findIndex((c) => c.id === selected.id);
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  const onPrev = navOverride ? navOverride.onPrev : prev ? () => onSelect(prev.id) : undefined;
  const onNext = navOverride ? navOverride.onNext : next ? () => onSelect(next.id) : undefined;

  return (
    <QuestionPane
      chapter={selected}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
      chapterOutcome={chapterOutcome}
      isStale={isStale}
    />
  );
}
