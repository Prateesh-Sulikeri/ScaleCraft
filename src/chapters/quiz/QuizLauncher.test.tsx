import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuizLauncher } from "./QuizLauncher";
import type { ChapterDefinition, QuizQuestion } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

const recordExamAttempt = vi.fn().mockResolvedValue(undefined);
let examAttemptsByDefinition = new Map<string, ExamAttempt[]>();
let validationPassedDefinitionIds = new Set<string>();

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      examAttemptsByDefinition,
      recordExamAttempt,
      validationPassedDefinitionIds,
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

function attempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    chapterDefinitionId: "ch-1",
    attemptNumber: 1,
    submittedAt: Date.now(),
    score: 50,
    answers: [],
    ...overrides,
  };
}

describe("QuizLauncher", () => {
  it("renders nothing when the chapter has no quiz", () => {
    examAttemptsByDefinition = new Map();
    const { container } = render(<QuizLauncher chapter={makeChapter({ quiz: undefined })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the chapter's quiz array is empty", () => {
    const { container } = render(<QuizLauncher chapter={makeChapter({ quiz: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the Knowledge check heading, question count, and pass threshold upfront", () => {
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion(), makeQuestion({ id: "q2" })] })} />);
    expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
    expect(screen.getByText("2 questions · 80% to pass")).toBeInTheDocument();
  });

  it("state 1: never attempted -> 'Take the quiz', no attempts line", () => {
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
    expect(screen.getByRole("button", { name: "Take the quiz" })).toBeInTheDocument();
    expect(screen.queryByText(/attempt/i)).not.toBeInTheDocument();
  });

  it("state 2: attempts remain, not passed -> attempt count + best score + 'Take the quiz'", () => {
    examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 40 })]]]);
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);

    expect(screen.getByText("Attempt 1 of 3 used · Best score 40%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Take the quiz" })).toBeInTheDocument();
  });

  it("state 3: passed -> 'Passed · X%' + 'View your result', locked", () => {
    examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 90 })]]]);
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);

    expect(screen.getByText("Passed · 90%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View your result" })).toBeInTheDocument();
  });

  it("state 4: exhausted without passing -> attempts-used + best score + 'View your best attempt'", () => {
    examAttemptsByDefinition = new Map([
      [
        "ch-1",
        [
          attempt({ attemptNumber: 1, score: 30 }),
          attempt({ attemptNumber: 2, score: 60 }),
          attempt({ attemptNumber: 3, score: 50 }),
        ],
      ],
    ]);
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);

    expect(screen.getByText("3 of 3 attempts used · Best score 60%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View your best attempt" })).toBeInTheDocument();
  });

  it("shows the Draft badge for placeholder chapters", () => {
    examAttemptsByDefinition = new Map();
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()], placeholder: true })} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("omits the Draft badge for real chapters", () => {
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
    expect(screen.queryByText("Draft")).not.toBeInTheDocument();
  });

  describe("Real World Extraction gating", () => {
    it("renders nothing until the project's Phase B validation pass is recorded", () => {
      validationPassedDefinitionIds = new Set();
      const { container } = render(
        <QuizLauncher chapter={makeChapter({ id: "rwe-1", mode: "real-world-extraction", quiz: [makeQuestion()] })} />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("renders once the chapter's id is in validationPassedDefinitionIds", () => {
      validationPassedDefinitionIds = new Set(["rwe-1"]);
      render(
        <QuizLauncher chapter={makeChapter({ id: "rwe-1", mode: "real-world-extraction", quiz: [makeQuestion()] })} />,
      );
      expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
      validationPassedDefinitionIds = new Set();
    });

    it("building-blocks chapters are never gated by validationPassedDefinitionIds", () => {
      validationPassedDefinitionIds = new Set();
      render(<QuizLauncher chapter={makeChapter({ id: "bb-1", mode: "building-blocks", quiz: [makeQuestion()] })} />);
      expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
    });
  });
});
