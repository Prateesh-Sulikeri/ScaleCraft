import { describe, expect, it } from "vitest";
import { buildAttempt } from "./exam-attempt";
import type { ChapterDefinition, QuizQuestion } from "@/content/chapters/types";
import type { QuizAnswer } from "../quiz/evaluate";

function question(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    kind: "single",
    difficulty: 1,
    prompt: "p",
    options: [
      { id: "a", label: "A", explanationMd: "e", correct: true },
      { id: "b", label: "B", explanationMd: "e", correct: false },
    ],
    ...overrides,
  };
}

function chapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: "ch-1",
    mode: "building-blocks",
    title: "Load Balancing",
    problemStatement: "p",
    learningObjectives: [],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
    ...overrides,
  };
}

describe("buildAttempt", () => {
  it("scores every answered question via evaluateAnswer", () => {
    const quiz = [question({ id: "q1" }), question({ id: "q2" })];
    const answers: Record<string, QuizAnswer> = {
      q1: { kind: "single", optionId: "a" },
      q2: { kind: "single", optionId: "b" },
    };

    const attempt = buildAttempt(chapter({ quiz }), answers, 1);

    expect(attempt.answers).toEqual([
      { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
      { questionId: "q2", answer: { kind: "single", optionId: "b" }, correct: false },
    ]);
  });

  it("scores an unanswered question as incorrect with answer: null", () => {
    const quiz = [question({ id: "q1" })];
    const attempt = buildAttempt(chapter({ quiz }), {}, 1);

    expect(attempt.answers).toEqual([{ questionId: "q1", answer: null, correct: false }]);
  });

  it("rounds the percentage score", () => {
    const quiz = [question({ id: "q1" }), question({ id: "q2" }), question({ id: "q3" })];
    const answers: Record<string, QuizAnswer> = { q1: { kind: "single", optionId: "a" } };

    // 1 / 3 = 33.33...% -> rounds to 33
    expect(buildAttempt(chapter({ quiz }), answers, 1).score).toBe(33);
  });

  it("scores 100 when every question is answered correctly", () => {
    const quiz = [question({ id: "q1" }), question({ id: "q2" })];
    const answers: Record<string, QuizAnswer> = {
      q1: { kind: "single", optionId: "a" },
      q2: { kind: "single", optionId: "a" },
    };

    expect(buildAttempt(chapter({ quiz }), answers, 1).score).toBe(100);
  });

  it("scores 0, not NaN, when the chapter has no quiz questions", () => {
    expect(buildAttempt(chapter({ quiz: [] }), {}, 1).score).toBe(0);
    expect(buildAttempt(chapter({ quiz: undefined }), {}, 1).score).toBe(0);
  });

  it("carries through chapterDefinitionId and attemptNumber, and stamps submittedAt", () => {
    const attempt = buildAttempt(chapter({ id: "ch-42", quiz: [question()] }), {}, 2);
    expect(attempt.chapterDefinitionId).toBe("ch-42");
    expect(attempt.attemptNumber).toBe(2);
    expect(attempt.submittedAt).toBeTypeOf("number");
  });
});
