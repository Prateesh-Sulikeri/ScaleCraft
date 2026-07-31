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
});
