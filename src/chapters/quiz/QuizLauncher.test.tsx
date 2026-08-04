import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizLauncher } from "./QuizLauncher";
import type { ChapterDefinition, QuizQuestion } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

vi.mock("../exam/ExamShell", () => ({
  ExamShell: (props: { attemptNumber: number; onSubmitted: (a: ExamAttempt) => void; onExit: () => void }) => (
    <div data-testid="exam-shell">
      <span data-testid="exam-attempt-number">{props.attemptNumber}</span>
      <button
        data-testid="exam-submit-btn"
        onClick={() =>
          props.onSubmitted({
            chapterDefinitionId: "ch-1",
            attemptNumber: props.attemptNumber,
            submittedAt: Date.now(),
            score: 100,
            answers: [],
          })
        }
      >
        Submit
      </button>
      <button data-testid="exam-exit-btn" onClick={props.onExit}>
        Exit
      </button>
    </div>
  ),
}));

vi.mock("../exam/ExamResults", () => ({
  ExamResults: (props: { attempt: ExamAttempt; onReturn: () => void }) => (
    <div data-testid="exam-results">
      <span data-testid="exam-results-score">{props.attempt.score}</span>
      <button data-testid="exam-results-return-btn" onClick={props.onReturn}>
        Return
      </button>
    </div>
  ),
}));

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

  it("state 2: attempted, not passed -> attempt count + best score + 'Retake the quiz'", () => {
    examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 40 })]]]);
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);

    expect(screen.getByText("Attempt 1 · Best score 40%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retake the quiz" })).toBeInTheDocument();
  });

  it("state 3: passed -> 'Passed · X%' + 'View your result', locked", () => {
    examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 90 })]]]);
    render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);

    expect(screen.getByText("Passed · 90%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View your result" })).toBeInTheDocument();
  });

  it("state 4: many attempts without passing -> attempt count + best score + 'Retake the quiz', still unlocked", () => {
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

    expect(screen.getByText("Attempt 3 · Best score 60%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retake the quiz" })).toBeInTheDocument();
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

  describe("exam lifecycle", () => {
    it("clicking 'Take the quiz' opens ExamShell at attempt 1", async () => {
      examAttemptsByDefinition = new Map();
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));

      expect(await screen.findByTestId("exam-shell")).toBeInTheDocument();
      expect(screen.getByTestId("exam-attempt-number")).toHaveTextContent("1");
    });

    it("opens ExamShell at the next attempt number when retaking", async () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 40 })]]]);
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "Retake the quiz" }));

      expect(await screen.findByTestId("exam-attempt-number")).toHaveTextContent("2");
    });

    it("submitting the exam records the attempt and shows the results view", async () => {
      examAttemptsByDefinition = new Map();
      recordExamAttempt.mockClear();
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(await screen.findByTestId("exam-submit-btn"));

      expect(recordExamAttempt).toHaveBeenCalledTimes(1);
      expect(await screen.findByTestId("exam-results")).toBeInTheDocument();
      expect(screen.getByTestId("exam-results-score")).toHaveTextContent("100");
      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
    });

    it("exiting the exam without submitting returns to the launcher (no results shown)", async () => {
      examAttemptsByDefinition = new Map();
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(await screen.findByTestId("exam-exit-btn"));

      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
      expect(screen.queryByTestId("exam-results")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Take the quiz" })).toBeInTheDocument();
    });

    it("clicking 'View your result' (locked/passed) shows the best attempt's results directly", async () => {
      examAttemptsByDefinition = new Map([
        [
          "ch-1",
          [attempt({ attemptNumber: 1, score: 60 }), attempt({ attemptNumber: 2, score: 90 })],
        ],
      ]);
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "View your result" }));

      expect(await screen.findByTestId("exam-results")).toBeInTheDocument();
      expect(screen.getByTestId("exam-results-score")).toHaveTextContent("90");
    });

    it("returning from the results view goes back to the launcher", async () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 90 })]]]);
      render(<QuizLauncher chapter={makeChapter({ quiz: [makeQuestion()] })} />);
      fireEvent.click(screen.getByRole("button", { name: "View your result" }));
      fireEvent.click(await screen.findByTestId("exam-results-return-btn"));

      expect(screen.queryByTestId("exam-results")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View your result" })).toBeInTheDocument();
    });
  });
});
