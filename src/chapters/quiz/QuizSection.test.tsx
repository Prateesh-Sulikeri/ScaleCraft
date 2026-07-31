import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuizSection } from "./QuizSection";
import type { ChapterDefinition, QuizQuestion } from "@/content/chapters/types";

const recordQuizCorrect = vi.fn().mockResolvedValue(undefined);
let correctQuestionIdsByDefinition = new Map<string, Set<string>>();

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      correctQuestionIdsByDefinition,
      recordQuizCorrect,
    }),
}));

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    kind: "single",
    difficulty: 1,
    prompt: "What is a load balancer for?",
    options: [
      { id: "a", label: "Distributes traffic across servers", explanationMd: "Correct.", correct: true },
      { id: "b", label: "Stores session data", explanationMd: "That's a cache's job.", correct: false },
    ],
    ...overrides,
  };
}

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
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

describe("QuizSection", () => {
  it("renders nothing when the chapter has no quiz", () => {
    const { container } = render(<QuizSection chapter={makeChapter({ quiz: undefined })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the chapter's quiz array is empty", () => {
    const { container } = render(<QuizSection chapter={makeChapter({ quiz: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the Knowledge check heading and one card per question", () => {
    const quiz = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2", prompt: "Second question" })];
    render(<QuizSection chapter={makeChapter({ quiz })} />);

    expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
    expect(screen.getByText("What is a load balancer for?")).toBeInTheDocument();
    expect(screen.getByText("Second question")).toBeInTheDocument();
  });

  it("does not show the all-mastered state when only some questions are mastered", () => {
    correctQuestionIdsByDefinition = new Map([["ch-1", new Set(["q1"])]]);
    const quiz = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];
    render(<QuizSection chapter={makeChapter({ quiz })} />);

    expect(screen.queryByText(/all questions answered/i)).not.toBeInTheDocument();
  });

  it("shows the quiet all-mastered state once every question id is mastered", () => {
    correctQuestionIdsByDefinition = new Map([["ch-1", new Set(["q1", "q2"])]]);
    const quiz = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];
    render(<QuizSection chapter={makeChapter({ quiz })} />);

    expect(screen.getByText(/all questions answered/i)).toBeInTheDocument();
  });

  it("mastery is scoped per chapterDefinitionId — another chapter's mastered set doesn't leak in", () => {
    correctQuestionIdsByDefinition = new Map([["some-other-chapter", new Set(["q1"])]]);
    const quiz = [makeQuestion({ id: "q1" })];
    render(<QuizSection chapter={makeChapter({ id: "ch-1", quiz })} />);

    expect(screen.queryByText(/all questions answered/i)).not.toBeInTheDocument();
  });
});
