"use client";

import { ChapterList } from "./ChapterList";
import { QuestionPane } from "./QuestionPane";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ValidationViolation } from "@/validation-engine/types";

type ChapterSidebarProps = {
  chapters: ChapterDefinition[];
  selectedChapterId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  violations: ValidationViolation[] | null;
  isStale: boolean;
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
  violations,
  isStale,
}: ChapterSidebarProps) {
  const selected = chapters.find((c) => c.id === selectedChapterId) ?? null;

  if (!selected) {
    return <ChapterList chapters={chapters} onSelect={onSelect} />;
  }

  const index = chapters.findIndex((c) => c.id === selected.id);
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  return (
    <QuestionPane
      chapter={selected}
      onBack={onBack}
      onPrev={prev ? () => onSelect(prev.id) : undefined}
      onNext={next ? () => onSelect(next.id) : undefined}
      violations={violations}
      isStale={isStale}
    />
  );
}
