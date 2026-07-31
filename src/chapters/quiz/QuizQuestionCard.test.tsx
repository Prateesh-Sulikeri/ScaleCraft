import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuizQuestionCard } from "./QuizQuestionCard";
import type { QuizQuestion } from "@/content/chapters/types";

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    kind: "single",
    difficulty: 1,
    prompt: "What is a load balancer for?",
    options: [
      { id: "a", label: "Distributes traffic across servers", explanationMd: "Correct — that's the job.", correct: true },
      { id: "b", label: "Stores session data", explanationMd: "That's a cache's job.", correct: false },
    ],
    ...overrides,
  };
}

describe("QuizQuestionCard", () => {
  it("disables Submit until a selection is made", () => {
    render(<QuizQuestionCard question={makeQuestion()} mastered={false} onCorrect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/distributes traffic/i));
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("reveals every option's explanation after submit, chosen or not, right or wrong", () => {
    render(<QuizQuestionCard question={makeQuestion()} mastered={false} onCorrect={vi.fn()} />);

    fireEvent.click(screen.getByLabelText(/stores session data/i));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("Correct — that's the job.")).toBeInTheDocument();
    expect(screen.getByText("That's a cache's job.")).toBeInTheDocument();
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  });

  it("calls onCorrect exactly once when the first attempt is correct and not already mastered", () => {
    const onCorrect = vi.fn();
    render(<QuizQuestionCard question={makeQuestion()} mastered={false} onCorrect={onCorrect} />);

    fireEvent.click(screen.getByLabelText(/distributes traffic/i));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/^correct\.$/i)).toBeInTheDocument();
  });

  it("does not call onCorrect on a wrong attempt", () => {
    const onCorrect = vi.fn();
    render(<QuizQuestionCard question={makeQuestion()} mastered={false} onCorrect={onCorrect} />);

    fireEvent.click(screen.getByLabelText(/stores session data/i));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("does not call onCorrect again once already mastered, even on a correct re-attempt", () => {
    const onCorrect = vi.fn();
    render(<QuizQuestionCard question={makeQuestion()} mastered={true} onCorrect={onCorrect} />);

    fireEvent.click(screen.getByLabelText(/distributes traffic/i));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("Try again resets the card back to an unanswered, unlocked state", () => {
    render(<QuizQuestionCard question={makeQuestion()} mastered={false} onCorrect={vi.fn()} />);

    fireEvent.click(screen.getByLabelText(/stores session data/i));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.queryByText("That's a cache's job.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    expect(screen.getByLabelText(/stores session data/i)).not.toBeChecked();
  });

  describe("multi", () => {
    function multiQuestion(): QuizQuestion {
      return makeQuestion({
        kind: "multi",
        options: [
          { id: "a", label: "Latency", explanationMd: "e", correct: true },
          { id: "b", label: "Throughput", explanationMd: "e", correct: true },
          { id: "c", label: "Color scheme", explanationMd: "e", correct: false },
        ],
      });
    }

    it("requires the exact correct set to be marked correct", () => {
      const onCorrect = vi.fn();
      render(<QuizQuestionCard question={multiQuestion()} mastered={false} onCorrect={onCorrect} />);

      fireEvent.click(screen.getByLabelText("Latency"));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(onCorrect).not.toHaveBeenCalled();
      expect(screen.getByText(/not quite/i)).toBeInTheDocument();
    });
  });

  describe("ordering", () => {
    function orderingQuestion(): QuizQuestion {
      return makeQuestion({
        kind: "ordering",
        options: [
          { id: "a", label: "Clarify", explanationMd: "e", correct: false },
          { id: "b", label: "Estimate", explanationMd: "e", correct: false },
        ],
        correctOrder: ["b", "a"],
      });
    }

    it("Submit is enabled immediately (a full ordering always exists) and evaluates the current sequence", () => {
      const onCorrect = vi.fn();
      render(<QuizQuestionCard question={orderingQuestion()} mastered={false} onCorrect={onCorrect} />);

      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      // Authored order (Clarify, Estimate) doesn't match correctOrder (Estimate, Clarify).
      expect(onCorrect).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      fireEvent.click(screen.getByRole("button", { name: /move "clarify" down/i }));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(onCorrect).toHaveBeenCalledTimes(1);
    });
  });
});
