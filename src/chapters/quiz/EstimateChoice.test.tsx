import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EstimateChoice } from "./EstimateChoice";
import type { QuizQuestion } from "@/content/chapters/types";

const mockQuestion: QuizQuestion = {
  id: "q1",
  type: "single-choice",
  body: "Estimate QPS",
  options: [
    { id: "opt1", label: "~10K QPS", correct: true, explanationMd: "Correct" },
    { id: "opt2", label: "~1M QPS", correct: false, explanationMd: "Too high" },
  ],
};

describe("EstimateChoice", () => {
  it("renders with monospace styling for capacity estimates", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const monoElements = document.querySelectorAll("span.font-mono");
    expect(monoElements.length).toBeGreaterThan(0);
  });

  it("calls onSelect when a user selects an option", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio");
    fireEvent.click(inputs[0]);
    expect(onSelect).toHaveBeenCalledWith("opt1");
  });

  it("checks the selected option", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt2"
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(inputs[1].checked).toBe(true);
  });

  it("disables options when disabled prop is true", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={true}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("shows check icon for correct estimate when revealed", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it("displays explanations when revealed", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    expect(screen.getByText("Correct")).toBeInTheDocument();
  });

  it("shows valid border for correct estimate when revealed", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const validBorders = document.querySelectorAll("div.border-state-valid");
    expect(validBorders.length).toBeGreaterThan(0);
  });

  it("shows error border for incorrect estimate when revealed", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt2"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const errorBorders = document.querySelectorAll("div.border-state-error");
    expect(errorBorders.length).toBeGreaterThan(0);
  });

  it("renders all options with correct labels", () => {
    const onSelect = vi.fn();
    render(
      <EstimateChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByText("~10K QPS")).toBeInTheDocument();
    expect(screen.getByText("~1M QPS")).toBeInTheDocument();
  });

  it("does not pass monospace prop explicitly to underlying SingleChoice", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <EstimateChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    // Verify that monospace styling is still applied (via internal monospace={true})
    const monoElements = container.querySelectorAll("span.font-mono");
    expect(monoElements.length).toBeGreaterThan(0);
  });

  it("supports all SingleChoice props except monospace", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(inputs[0].checked).toBe(true);

    rerender(
      <EstimateChoice
        question={mockQuestion}
        selectedId="opt2"
        onSelect={onSelect}
        disabled={true}
        revealed={true}
      />
    );

    expect(screen.getByText("Correct")).toBeInTheDocument();
  });
});
