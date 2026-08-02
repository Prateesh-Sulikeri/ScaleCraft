import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Ordering } from "./Ordering";
import type { QuizQuestion } from "@/content/chapters/types";

const mockQuestion: QuizQuestion = {
  id: "q1",
  type: "ordering",
  body: "Order these steps",
  options: [
    { id: "opt1", label: "Step 1", correct: true, explanationMd: "First step" },
    { id: "opt2", label: "Step 2", correct: true, explanationMd: "Second step" },
    { id: "opt3", label: "Step 3", correct: true, explanationMd: "Third step" },
  ],
  correctOrder: ["opt1", "opt2", "opt3"],
};

describe("Ordering", () => {
  it("renders all options in the provided order", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("renders list with correct numbering", () => {
    const onReorder = vi.fn();
    const { container } = render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
  });

  it("calls onReorder when moving item up", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]); // Up button for item 2 (index 1)

    expect(onReorder).toHaveBeenCalledWith(["opt2", "opt1", "opt3"]);
  });

  it("calls onReorder when moving item down", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]); // Down button for item 1 (index 0)

    expect(onReorder).toHaveBeenCalledWith(["opt2", "opt1", "opt3"]);
  });

  it("disables up button for first item", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled(); // Up for item 1
    expect(buttons[2]).not.toBeDisabled(); // Up for item 2
  });

  it("disables down button for last item", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[5]).toBeDisabled(); // Down for item 3
    expect(buttons[3]).not.toBeDisabled(); // Down for item 2
  });

  it("disables all buttons when disabled prop is true", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={true}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("shows valid border for correctly ordered items when revealed", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={true}
      />
    );

    const validBorders = document.querySelectorAll("li.border-state-valid");
    expect(validBorders).toHaveLength(3);
  });

  it("shows error border for incorrectly ordered items when revealed", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt2", "opt1", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={true}
      />
    );

    const errorBorders = document.querySelectorAll("li.border-state-error");
    expect(errorBorders.length).toBeGreaterThan(0);
  });

  it("displays explanations when revealed", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={true}
      />
    );

    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
    expect(screen.getByText("Third step")).toBeInTheDocument();
  });

  it("hides explanations when not revealed", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.queryByText("First step")).not.toBeInTheDocument();
  });

  it("handles missing option gracefully", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "missing-id", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeLessThan(3);
  });

  it("does not call onReorder when trying to move beyond bounds", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // Try to move first item up (should be disabled)

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("shows neutral border when not revealed", () => {
    const onReorder = vi.fn();
    render(
      <Ordering
        question={mockQuestion}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={false}
      />
    );

    const neutralBorders = document.querySelectorAll("li.border-border");
    expect(neutralBorders.length).toBeGreaterThan(0);
  });

  it("handles empty correctOrder", () => {
    const onReorder = vi.fn();
    const questionNoCorrectOrder = { ...mockQuestion, correctOrder: [] };
    render(
      <Ordering
        question={questionNoCorrectOrder}
        order={["opt1", "opt2", "opt3"]}
        onReorder={onReorder}
        disabled={false}
        revealed={true}
      />
    );

    const errorBorders = document.querySelectorAll("li.border-state-error");
    expect(errorBorders.length).toBeGreaterThan(0);
  });
});
