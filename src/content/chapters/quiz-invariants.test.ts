import { describe, it, expect } from "vitest";
import { chapterRegistry } from "./index";
import type { QuizQuestion } from "./types";

/**
 * Registry-level invariants for every quiz question in every chapter — mirrors
 * registry.test.ts's style. Currently vacuous (no chapter has authored a quiz
 * yet) but exercises the schema shape as soon as one does.
 */
describe("quiz question invariants", () => {
  const questionsByChapter = chapterRegistry
    .filter((chapter) => chapter.quiz && chapter.quiz.length > 0)
    .map((chapter) => ({ chapterId: chapter.id, quiz: chapter.quiz as QuizQuestion[] }));

  it("question ids are unique within a chapter", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      const ids = quiz.map((q) => q.id);
      expect(new Set(ids).size, `duplicate question id in ${chapterId}`).toBe(ids.length);
    }
  });

  it("every question has at least 2 options", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        expect(
          question.options.length,
          `${chapterId}/${question.id} has fewer than 2 options`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("single/multi/estimate questions have at least one correct option", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind === "single" || question.kind === "multi" || question.kind === "estimate") {
          expect(
            question.options.some((o) => o.correct),
            `${chapterId}/${question.id} has no correct option`
          ).toBe(true);
        }
      }
    }
  });

  it("option ids are unique within a question", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        const ids = question.options.map((o) => o.id);
        expect(
          new Set(ids).size,
          `duplicate option id in ${chapterId}/${question.id}`
        ).toBe(ids.length);
      }
    }
  });

  it("graph is present if and only if kind is diagram", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind === "diagram") {
          expect(question.graph, `${chapterId}/${question.id} is a diagram question with no graph`).toBeDefined();
        } else {
          expect(question.graph, `${chapterId}/${question.id} is not a diagram question but has a graph`).toBeUndefined();
        }
      }
    }
  });

  it("correctOrder is present if and only if kind is ordering, and references real option ids", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind === "ordering") {
          expect(question.correctOrder, `${chapterId}/${question.id} is ordering with no correctOrder`).toBeDefined();
          const optionIds = new Set(question.options.map((o) => o.id));
          for (const id of question.correctOrder ?? []) {
            expect(optionIds.has(id), `${chapterId}/${question.id} correctOrder references unknown option id ${id}`).toBe(
              true
            );
          }
        } else {
          expect(question.correctOrder, `${chapterId}/${question.id} is not ordering but has correctOrder`).toBeUndefined();
        }
      }
    }
  });

  it("pairs is present if and only if kind is matching, and references real option ids", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind === "matching") {
          expect(question.pairs, `${chapterId}/${question.id} is matching with no pairs`).toBeDefined();
          const optionIds = new Set(question.options.map((o) => o.id));
          for (const [, optionId] of question.pairs ?? []) {
            expect(
              optionIds.has(optionId),
              `${chapterId}/${question.id} pairs references unknown option id ${optionId}`
            ).toBe(true);
          }
        } else {
          expect(question.pairs, `${chapterId}/${question.id} is not matching but has pairs`).toBeUndefined();
        }
      }
    }
  });

  // Three mechanical guards against positionally-guessable quizzes - each
  // catches a real pattern authored content actually shipped with once
  // (2026-08-06, user review): single-choice correct answers clustered on
  // one letter, matching pairs whose correct option sat at the same index as
  // the pair itself (a diagonal), and an ordering question whose authored
  // option array was already the correct sequence. None of these are
  // content-quality judgments (a human still checks whether the distractors
  // are good) - they only catch a shape a test-taker could exploit without
  // reading the question.

  it("a chapter's single-choice correct answers are not all the same option position", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      const singles = quiz.filter((q) => q.kind === "single");
      if (singles.length < 3) continue; // too few to judge a pattern
      const correctPositions = singles.map((q) => q.options.findIndex((o) => o.correct));
      expect(
        new Set(correctPositions).size,
        `${chapterId}'s ${singles.length} single-choice questions all put the correct answer at the same position`
      ).toBeGreaterThan(1);
    }
  });

  it("a matching question's correct-option sequence is not an index-for-index copy of its options array", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind !== "matching") continue;
        const pairs = question.pairs ?? [];
        const correctSequence = pairs.map(([, optionId]) => optionId);
        const optionSequence = question.options.map((o) => o.id).slice(0, pairs.length);
        expect(
          correctSequence,
          `${chapterId}/${question.id}: pair i's correct option is options[i] for every i - the dropdown ` +
            "position alone gives away every answer"
        ).not.toEqual(optionSequence);
      }
    }
  });

  it("an ordering question's authored option array is not already the correct sequence", () => {
    for (const { chapterId, quiz } of questionsByChapter) {
      for (const question of quiz) {
        if (question.kind !== "ordering") continue;
        const authoredSequence = question.options.map((o) => o.id);
        expect(
          authoredSequence,
          `${chapterId}/${question.id}: the authored options are already in correctOrder - the exercise is ` +
            "solved before the learner touches it"
        ).not.toEqual(question.correctOrder ?? []);
      }
    }
  });
});
