import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiChoice } from "./MultiChoice";
import type { QuizQuestion } from "@/content/chapters/types";

const mockQuestion: QuizQuestion = {
  id: "q1",
  type: "multi-choice",
  prompt: "Select all that apply",
  options: [
    { id: "opt-a", label: "Option A", correct: true },
    { id: "opt-b", label: "Option B", correct: false },
    { id: "opt-c", label: "Option C", correct: true },
  ],
  explanation: "This is the explanation",
};

describe("MultiChoice", () => {
  it("renders all options as checkboxes", () => {
    const onToggle = vi.fn();
    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("displays correct option labels", () => {
    const onToggle = vi.fn();
    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
    expect(screen.getByLabelText("Option C")).toBeInTheDocument();
  });

  it("calls onToggle with correct option id when checkbox is clicked", () => {
    const onToggle = vi.fn();

    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    fireEvent.click(screen.getByLabelText("Option A"));
    expect(onToggle).toHaveBeenCalledWith("opt-a");
  });

  it("shows checked state for selected options", () => {
    const onToggle = vi.fn();
    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a", "opt-c"]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked(); // opt-a
    expect(checkboxes[1]).not.toBeChecked(); // opt-b
    expect(checkboxes[2]).toBeChecked(); // opt-c
  });

  it("allows multiple selections", () => {
    const onToggle = vi.fn();

    const { rerender } = render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a"]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    fireEvent.click(screen.getByLabelText("Option B"));
    expect(onToggle).toHaveBeenCalledWith("opt-b");

    // Simulate selection update
    rerender(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a", "opt-b"]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByLabelText("Option A")).toBeChecked();
    expect(screen.getByLabelText("Option B")).toBeChecked();
  });

  it("disables checkboxes when disabled prop is true", () => {
    const onToggle = vi.fn();
    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={true}
        revealed={false}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("handles empty options array", () => {
    const onToggle = vi.fn();
    const emptyQuestion: QuizQuestion = {
      ...mockQuestion,
      options: [],
    };

    render(
      <MultiChoice
        question={emptyQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("renders with custom CSS class from OptionRow (revealed state visual difference)", () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a", "opt-c"]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    // Revealed state should pass different styling to OptionRow
    rerender(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a", "opt-c"]}
        onToggle={onToggle}
        disabled={false}
        revealed={true}
      />
    );

    // Just verify it renders without error when revealed changes
    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
  });

  it("unselecting a selected option calls onToggle", () => {
    const onToggle = vi.fn();

    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={["opt-a"]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    const optionA = screen.getByLabelText("Option A");
    expect(optionA).toBeChecked();

    fireEvent.click(optionA);
    expect(onToggle).toHaveBeenCalledWith("opt-a");
  });

  it("passes correct name attribute to OptionRow for form grouping", () => {
    const onToggle = vi.fn();
    render(
      <MultiChoice
        question={mockQuestion}
        selectedIds={[]}
        onToggle={onToggle}
        disabled={false}
        revealed={false}
      />
    );

    // All checkboxes should have the same name (the question id)
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("name", "q1");
    });
  });
});
