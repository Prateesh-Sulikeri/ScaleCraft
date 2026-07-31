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
 * gives ChapterReader's TOC a stable anchor to point at.
 *
 * Real World Extraction retrospective quizzes gate on the project's Phase B
 * pass (evaluateChapter via ChapterWorkspace, recorded into
 * validationPassedDefinitionIds) — a retrospective on a design the learner
 * hasn't built yet has nothing to retrospect on. Building Blocks chapters
 * carry no such gate: their quiz is Reader-only knowledge check, decoupled
 * from the canvas build (see .claude/docs/pending-quiz-ui.md Phase 6).
 */
export function QuizSection({ chapter }: QuizSectionProps) {
  const correctQuestionIdsByDefinition = useCurriculumProgressStore((s) => s.correctQuestionIdsByDefinition);
  const recordQuizCorrect = useCurriculumProgressStore((s) => s.recordQuizCorrect);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);

  if (!chapter.quiz || chapter.quiz.length === 0) return null;
  if (chapter.mode === "real-world-extraction" && !validationPassedDefinitionIds.has(chapter.id)) return null;

  const masteredIds = correctQuestionIdsByDefinition.get(chapter.id) ?? new Set<string>();
  const allMastered = chapter.quiz.every((q) => masteredIds.has(q.id));

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <h2 id="knowledge-check" className="text-lg font-semibold text-foreground">
          Knowledge check
        </h2>
        {/* Same Draft treatment as the chapter title/QuestionPane — dummy
         * quiz content on a placeholder chapter must never read as finished
         * curriculum. */}
        {chapter.placeholder && (
          <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
            Draft
          </span>
        )}
      </div>

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
