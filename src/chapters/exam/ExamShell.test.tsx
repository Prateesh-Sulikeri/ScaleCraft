import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamShell } from "./ExamShell";
import type { ChapterDefinition } from "@/content/chapters/types";

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
          { id: "a", label: "Option A", explanationMd: "e", correct: true },
          { id: "b", label: "Option B", explanationMd: "e", correct: false },
        ],
      },
      {
        id: "q2",
        kind: "single",
        difficulty: 1,
        prompt: "Second question",
        options: [
          { id: "a", label: "Option C", explanationMd: "e", correct: true },
          { id: "b", label: "Option D", explanationMd: "e", correct: false },
        ],
      },
    ],
  };
}

describe("ExamShell", () => {
  it("shows Question 1 of N first, and Back is disabled on the first question", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("answer state survives navigating away and back", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Option A"));
    expect(screen.getByLabelText("Option A")).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Second question")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("First question")).toBeInTheDocument();
    expect(screen.getByLabelText("Option A")).toBeChecked();
  });

  it("labels the forward button 'Skip' when the current question is unanswered, 'Next' once answered", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Option A"));
    expect(screen.getByRole("button", { name: /^next/i })).toBeInTheDocument();
  });

  it("supports ArrowRight/ArrowLeft navigation", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Second question")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("First question")).toBeInTheDocument();
  });

  it("Escape exits the exam", () => {
    const onExit = vi.fn();
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={onExit} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("jumping via a progress dot navigates directly to that question", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Question 2" }));
    expect(screen.getByText("Second question")).toBeInTheDocument();
  });

  it("shows the unanswered-confirm dialog with the correct count when submitting early", () => {
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={vi.fn()} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit exam" }));
    expect(screen.getByText("2 questions unanswered - submit anyway?")).toBeInTheDocument();
  });

  it("'Keep going' dismisses the confirm dialog without submitting", () => {
    const onSubmitted = vi.fn();
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={onSubmitted} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit exam" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep going" }));

    expect(screen.queryByText(/unanswered/)).not.toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("submits directly, with no confirm dialog, once every question is answered", () => {
    const onSubmitted = vi.fn();
    render(<ExamShell chapter={chapter()} attemptNumber={2} onSubmitted={onSubmitted} onExit={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Option A"));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByLabelText("Option C"));
    fireEvent.click(screen.getByRole("button", { name: "Submit exam" }));

    expect(onSubmitted).toHaveBeenCalledTimes(1);
    const attempt = onSubmitted.mock.calls[0][0];
    expect(attempt.chapterDefinitionId).toBe("ch-1");
    expect(attempt.attemptNumber).toBe(2);
    expect(attempt.score).toBe(100);
    expect(attempt.answers).toEqual([
      { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
      { questionId: "q2", answer: { kind: "single", optionId: "a" }, correct: true },
    ]);
  });

  it("'Submit anyway' from the confirm dialog produces a well-formed payload scoring unanswered as incorrect", () => {
    const onSubmitted = vi.fn();
    render(<ExamShell chapter={chapter()} attemptNumber={1} onSubmitted={onSubmitted} onExit={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Option A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit exam" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit anyway" }));

    expect(onSubmitted).toHaveBeenCalledTimes(1);
    const attempt = onSubmitted.mock.calls[0][0];
    expect(attempt.score).toBe(50);
    expect(attempt.answers).toEqual([
      { questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true },
      { questionId: "q2", answer: null, correct: false },
    ]);
  });
});
