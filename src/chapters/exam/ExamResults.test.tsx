import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamResults } from "./ExamResults";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

function chapter(): ChapterDefinition {
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
    quiz: [
      {
        id: "q1",
        kind: "single",
        difficulty: 1,
        prompt: "First question",
        options: [
          { id: "a", label: "Option A", explanationMd: "Explanation A", correct: true },
          { id: "b", label: "Option B", explanationMd: "Explanation B", correct: false },
        ],
      },
      {
        id: "q2",
        kind: "multi",
        difficulty: 2,
        prompt: "Second question",
        options: [
          { id: "a", label: "Option C", explanationMd: "Explanation C", correct: true },
          { id: "b", label: "Option D", explanationMd: "Explanation D", correct: true },
        ],
      },
    ],
  };
}

describe("ExamResults", () => {
  it("shows the score and a Passed banner when the attempt meets the threshold", () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "ch-1",
      attemptNumber: 1,
      submittedAt: Date.now(),
      score: 100,
      answers: [
        { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
        { questionId: "q2", answer: { kind: "multi", optionIds: ["a", "b"] }, correct: true },
      ],
      dirty: false,
      syncedAt: null,
    };
    render(<ExamResults chapter={chapter()} attempt={attempt} onReturn={vi.fn()} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/passed/i)).toBeInTheDocument();
  });

  it("shows a not-yet-passing banner below the threshold", () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "ch-1",
      attemptNumber: 1,
      submittedAt: Date.now(),
      score: 50,
      answers: [
        { questionId: "q1", answer: { kind: "single", optionId: "b" }, correct: false },
        { questionId: "q2", answer: { kind: "multi", optionIds: ["a", "b"] }, correct: true },
      ],
      dirty: false,
      syncedAt: null,
    };
    render(<ExamResults chapter={chapter()} attempt={attempt} onReturn={vi.fn()} />);

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText(/not yet passing/i)).toBeInTheDocument();
  });

  it("reveals every option's explanation per question, including a non-single kind", () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "ch-1",
      attemptNumber: 1,
      submittedAt: Date.now(),
      score: 100,
      answers: [
        { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
        { questionId: "q2", answer: { kind: "multi", optionIds: ["a", "b"] }, correct: true },
      ],
      dirty: false,
      syncedAt: null,
    };
    render(<ExamResults chapter={chapter()} attempt={attempt} onReturn={vi.fn()} />);

    expect(screen.getByText("Explanation A")).toBeInTheDocument();
    expect(screen.getByText("Explanation B")).toBeInTheDocument();
    expect(screen.getByText("Explanation C")).toBeInTheDocument();
    expect(screen.getByText("Explanation D")).toBeInTheDocument();
  });

  it("labels a skipped question 'Not answered', not 'Incorrect'", () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "ch-1",
      attemptNumber: 1,
      submittedAt: Date.now(),
      score: 50,
      answers: [
        { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
        { questionId: "q2", answer: null, correct: false },
      ],
      dirty: false,
      syncedAt: null,
    };
    render(<ExamResults chapter={chapter()} attempt={attempt} onReturn={vi.fn()} />);

    expect(screen.getByText("Not answered")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
  });
});
