import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { YourTurnCard } from "./YourTurnCard";
import type { ChapterDefinition, QuizQuestion } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

vi.mock("next/navigation", () => ({
  usePathname: () => "/building-blocks/test-chapter/lesson",
}));

vi.mock("./exam/ExamShell", () => ({
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
            dirty: false,
            syncedAt: null,
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

vi.mock("./exam/ExamResults", () => ({
  ExamResults: (props: { attempt: ExamAttempt; onReturn: () => void }) => (
    <div data-testid="exam-results">
      <span data-testid="exam-results-score">{props.attempt.score}</span>
      <button data-testid="exam-results-return-btn" onClick={props.onReturn}>
        Return
      </button>
    </div>
  ),
}));

vi.mock("@/app/HeldTransitionLink", () => ({
  HeldTransitionLink: ({
    children,
    href,
    label,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    label: string;
    className: string;
  }) => (
    <a href={href} title={label} className={className}>
      {children}
    </a>
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
    dirty: false,
    syncedAt: null,
    ...overrides,
  };
}

function renderCard(chapter: ChapterDefinition) {
  return render(<YourTurnCard chapter={chapter} mode={chapter.mode} chapterSlug="test-chapter" />);
}

describe("YourTurnCard", () => {
  beforeEach(() => {
    examAttemptsByDefinition = new Map();
    validationPassedDefinitionIds = new Set();
    recordExamAttempt.mockClear();
  });

  it("renders nothing for a chapter with no quiz and no editor exercise", () => {
    const { container } = renderCard(makeChapter({ quiz: undefined, hasEditorExercise: false }));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders both rows in one shared card when the chapter has a quiz and an exercise", () => {
    const { container } = renderCard(makeChapter({ quiz: [makeQuestion()] }));
    const card = container.querySelector(".rounded-lg.border.border-border.bg-panel");
    expect(card).toBeInTheDocument();
    expect(card).toContainElement(screen.getByRole("heading", { name: "Knowledge check" }));
    expect(card).toContainElement(screen.getByRole("heading", { name: "Design exercise" }));
    // one shared card, not two independently-bordered ones
    expect(container.querySelectorAll(".rounded-lg.border.border-border.bg-panel")).toHaveLength(1);
  });

  it("renders a divider between the two rows when both are present", () => {
    const { container } = renderCard(makeChapter({ quiz: [makeQuestion()] }));
    expect(container.querySelector(".border-t.border-border")).toBeInTheDocument();
  });

  it("renders only the exercise row for a chapter with no quiz", () => {
    renderCard(makeChapter({ quiz: undefined }));
    expect(screen.queryByRole("heading", { name: "Knowledge check" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Design exercise" })).toBeInTheDocument();
  });

  it("renders only the quiz row for a chapter with hasEditorExercise: false", () => {
    renderCard(makeChapter({ quiz: [makeQuestion()], hasEditorExercise: false }));
    expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Design exercise" })).not.toBeInTheDocument();
  });

  describe("exercise row", () => {
    it("links to the canvas route", () => {
      renderCard(makeChapter({ quiz: undefined, mode: "real-world-extraction" }));
      const link = screen.getByRole("link", { name: /begin exercise/i });
      expect(link).toHaveAttribute("href", "/real-world-extraction/test-chapter");
    });

    it("stays neutral when the exercise hasn't been validated yet", () => {
      renderCard(makeChapter({ quiz: undefined }));
      const link = screen.getByRole("link", { name: /begin exercise/i });
      expect(link).toHaveClass("border-border", "text-foreground");
      expect(link).not.toHaveClass("border-state-valid");
    });

    it("turns the done color once the chapter's id is in validationPassedDefinitionIds", () => {
      validationPassedDefinitionIds = new Set(["ch-1"]);
      renderCard(makeChapter({ quiz: undefined }));
      const link = screen.getByRole("link", { name: /begin exercise/i });
      expect(link).toHaveClass("border-state-valid", "text-state-valid");
    });
  });

  describe("quiz row states", () => {
    it("state 1: never attempted -> 'Take the quiz', neutral, no attempts line", () => {
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      const button = screen.getByRole("button", { name: "Take the quiz" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("border-border", "text-foreground");
      expect(screen.queryByText(/attempt/i)).not.toBeInTheDocument();
    });

    it("state 2: attempted, not passed -> attempt count + best score + 'Retake the quiz', failed color", () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 40 })]]]);
      renderCard(makeChapter({ quiz: [makeQuestion()] }));

      expect(screen.getByText("Attempt 1 · Best score 40%")).toBeInTheDocument();
      const button = screen.getByRole("button", { name: "Retake the quiz" });
      expect(button).toHaveClass("border-state-error", "text-state-error");
    });

    it("state 3: passed -> 'Passed · X%' + 'View your result', locked, done color", () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 90 })]]]);
      renderCard(makeChapter({ quiz: [makeQuestion()] }));

      expect(screen.getByText("Passed · 90%")).toBeInTheDocument();
      const button = screen.getByRole("button", { name: "View your result" });
      expect(button).toHaveClass("border-state-valid", "text-state-valid");
    });

    it("shows the Draft badge for placeholder chapters", () => {
      renderCard(makeChapter({ quiz: [makeQuestion()], placeholder: true }));
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });
  });

  describe("Real World Extraction gating", () => {
    it("hides the quiz row (but keeps the exercise row) until the project's Phase B validation pass is recorded", () => {
      renderCard(makeChapter({ id: "rwe-1", mode: "real-world-extraction", quiz: [makeQuestion()] }));
      expect(screen.queryByRole("heading", { name: "Knowledge check" })).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Design exercise" })).toBeInTheDocument();
    });

    it("shows the quiz row once the chapter's id is in validationPassedDefinitionIds", () => {
      validationPassedDefinitionIds = new Set(["rwe-1"]);
      renderCard(makeChapter({ id: "rwe-1", mode: "real-world-extraction", quiz: [makeQuestion()] }));
      expect(screen.getByRole("heading", { name: "Knowledge check" })).toBeInTheDocument();
    });
  });

  describe("exam lifecycle", () => {
    it("clicking 'Take the quiz' opens ExamShell at attempt 1", async () => {
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));

      expect(await screen.findByTestId("exam-shell")).toBeInTheDocument();
      expect(screen.getByTestId("exam-attempt-number")).toHaveTextContent("1");
    });

    it("opens ExamShell at the next attempt number when retaking", async () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 40 })]]]);
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Retake the quiz" }));

      expect(await screen.findByTestId("exam-attempt-number")).toHaveTextContent("2");
    });

    it("submitting the exam records the attempt and shows the results view", async () => {
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(await screen.findByTestId("exam-submit-btn"));

      expect(recordExamAttempt).toHaveBeenCalledTimes(1);
      expect(await screen.findByTestId("exam-results")).toBeInTheDocument();
      expect(screen.getByTestId("exam-results-score")).toHaveTextContent("100");
      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
    });

    it("exiting the exam without submitting returns to the launcher (no results shown)", async () => {
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(await screen.findByTestId("exam-exit-btn"));

      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
      expect(screen.queryByTestId("exam-results")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Take the quiz" })).toBeInTheDocument();
    });

    it("clicking 'View your result' (locked/passed) shows the best attempt's results directly", async () => {
      examAttemptsByDefinition = new Map([
        ["ch-1", [attempt({ attemptNumber: 1, score: 60 }), attempt({ attemptNumber: 2, score: 90 })]],
      ]);
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "View your result" }));

      expect(await screen.findByTestId("exam-results")).toBeInTheDocument();
      expect(screen.getByTestId("exam-results-score")).toHaveTextContent("90");
    });

    it("returning from the results view goes back to the launcher", async () => {
      examAttemptsByDefinition = new Map([["ch-1", [attempt({ attemptNumber: 1, score: 90 })]]]);
      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "View your result" }));
      fireEvent.click(await screen.findByTestId("exam-results-return-btn"));

      expect(screen.queryByTestId("exam-results")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View your result" })).toBeInTheDocument();
    });
  });

  // Release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) - the lesson reader
  // hosting this card is public now. Signed out, "Take the quiz" and "Begin
  // exercise" must show AuthPromptDialog instead of launching ExamShell /
  // navigating, and only redirect to sign-in once the dialog is confirmed
  // (11.5's "gate at the action").
  describe("signed out", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    });

    afterEach(() => {
      vi.mocked(useAuth).mockReset();
      vi.mocked(useClerk).mockReset();
    });

    it("shows the auth prompt dialog instead of opening ExamShell when 'Take the quiz' is clicked", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(redirectToSignIn).not.toHaveBeenCalled();
      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
    });

    it("redirects to sign-in only after confirming the dialog from 'Take the quiz'", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(screen.getByRole("button", { name: "Sign in / sign up" }));

      expect(redirectToSignIn).toHaveBeenCalledOnce();
      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
    });

    it("dismissing the dialog never redirects and never opens ExamShell", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      renderCard(makeChapter({ quiz: [makeQuestion()] }));
      fireEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
      fireEvent.click(screen.getByRole("button", { name: "Not now" }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(redirectToSignIn).not.toHaveBeenCalled();
      expect(screen.queryByTestId("exam-shell")).not.toBeInTheDocument();
    });

    it("renders the exercise CTA as a plain button, not a navigable link", () => {
      renderCard(makeChapter({ quiz: undefined }));
      expect(screen.queryByRole("link", { name: /begin exercise/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /begin exercise/i })).toBeInTheDocument();
    });

    it("redirects to sign-in only after confirming the dialog from 'Begin exercise'", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      renderCard(makeChapter({ quiz: undefined }));
      fireEvent.click(screen.getByRole("button", { name: /begin exercise/i }));
      expect(redirectToSignIn).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Sign in / sign up" }));
      expect(redirectToSignIn).toHaveBeenCalledOnce();
    });
  });
});
