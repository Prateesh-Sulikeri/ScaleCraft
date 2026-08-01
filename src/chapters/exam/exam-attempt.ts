import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt, ExamQuestionAnswer } from "@/persistence/db";
import { evaluateAnswer, type QuizAnswer } from "../quiz/evaluate";

/**
 * Pure and unit-testable — no React, no Dexie. Scores every question in
 * `chapter.quiz`; a question absent from `answersByQuestionId` (skipped,
 * never visited) is scored incorrect with `answer: null` so ExamResults can
 * render "Not answered" instead of "Wrong" (see .claude/docs/pending-quiz-ui.md
 * addendum). `total === 0` never divides by zero.
 */
export function buildAttempt(
  chapter: ChapterDefinition,
  answersByQuestionId: Record<string, QuizAnswer>,
  attemptNumber: number,
): ExamAttempt {
  const quiz = chapter.quiz ?? [];
  const answers: ExamQuestionAnswer[] = quiz.map((question) => {
    const answer = answersByQuestionId[question.id] ?? null;
    const correct = answer !== null && evaluateAnswer(question, answer).correct;
    return { questionId: question.id, answer, correct };
  });

  const correctCount = answers.filter((a) => a.correct).length;
  const score = quiz.length === 0 ? 0 : Math.round((correctCount / quiz.length) * 100);

  return {
    chapterDefinitionId: chapter.id,
    attemptNumber,
    submittedAt: Date.now(),
    score,
    answers,
  };
}
