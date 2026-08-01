import type { QuizQuestion } from "@/content/chapters/types";

export type QuizAnswer =
  | { kind: "single" | "estimate" | "diagram"; optionId: string }
  | { kind: "multi"; optionIds: string[] }
  | { kind: "ordering"; order: string[] }
  /** LeftLabel -> chosen option id, per question.pairs. */
  | { kind: "matching"; selections: Record<string, string> };

export type EvaluationResult = { correct: boolean };

/** Pure and unit-testable — no React, no store. Assumes `answer.kind` matches
 * `question.kind` (the caller, exam/exam-attempt.ts's buildAttempt, only
 * ever evaluates an answer against the question it belongs to). */
export function evaluateAnswer(question: QuizQuestion, answer: QuizAnswer): EvaluationResult {
  switch (answer.kind) {
    case "single":
    case "estimate":
    case "diagram": {
      const option = question.options.find((o) => o.id === answer.optionId);
      return { correct: option?.correct === true };
    }
    case "multi": {
      const correctIds = new Set(question.options.filter((o) => o.correct).map((o) => o.id));
      const selectedIds = new Set(answer.optionIds);
      return {
        correct:
          correctIds.size === selectedIds.size && [...correctIds].every((id) => selectedIds.has(id)),
      };
    }
    case "ordering": {
      const correctOrder = question.correctOrder ?? [];
      return {
        correct:
          correctOrder.length === answer.order.length && correctOrder.every((id, i) => id === answer.order[i]),
      };
    }
    case "matching": {
      const pairs = question.pairs ?? [];
      return {
        correct: pairs.length > 0 && pairs.every(([left, correctOptionId]) => answer.selections[left] === correctOptionId),
      };
    }
  }
}
