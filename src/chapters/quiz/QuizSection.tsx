"use client";

import { CheckCircle2 } from "lucide-react";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { QuizQuestionCard } from "./QuizQuestionCard";
import type { ChapterDefinition } from "@/content/chapters/types";

type QuizSectionProps = {
  chapter: ChapterDefinition;
};

/**
 * "Knowledge check" — the Reader's last content section before
 * DesignEditorCTA (.claude/docs/CURRICULUM.md §5.3 beat 15). Renders nothing
 * for chapters with no quiz (checkpoints never have one). id="knowledge-check"
 * gives ChapterReader's TOC a stable anchor to point at once Phase 4 wires it
 * in — this component doesn't own the headings list itself.
 */
export function QuizSection({ chapter }: QuizSectionProps) {
  const correctQuestionIdsByDefinition = useCurriculumProgressStore((s) => s.correctQuestionIdsByDefinition);
  const recordQuizCorrect = useCurriculumProgressStore((s) => s.recordQuizCorrect);

  if (!chapter.quiz || chapter.quiz.length === 0) return null;

  const masteredIds = correctQuestionIdsByDefinition.get(chapter.id) ?? new Set<string>();
  const allMastered = chapter.quiz.every((q) => masteredIds.has(q.id));

  return (
    <div className="mt-8">
      <h2 id="knowledge-check" className="text-lg font-semibold text-foreground">
        Knowledge check
      </h2>

      {allMastered && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-foreground/70">
          <CheckCircle2 size={14} className="text-state-valid" />
          All questions answered
        </p>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {chapter.quiz.map((question) => (
          <QuizQuestionCard
            key={question.id}
            question={question}
            mastered={masteredIds.has(question.id)}
            onCorrect={() => void recordQuizCorrect(chapter.id, question.id)}
          />
        ))}
      </div>
    </div>
  );
}
