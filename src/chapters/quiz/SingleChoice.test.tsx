import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SingleChoice } from "./SingleChoice";
import type { QuizQuestion } from "@/content/chapters/types";

const mockQuestion: QuizQuestion = {
  id: "q1",
  type: "single-choice",
  body: "Choose one",
  options: [
    { id: "opt1", label: "Option 1", correct: true, explanationMd: "Correct!" },
    { id: "opt2", label: "Option 2", correct: false, explanationMd: "Wrong" },
    { id: "opt3", label: "Option 3", correct: false, explanationMd: "Also wrong" },
  ],
};

describe("SingleChoice", () => {
  it("renders all options as radio buttons", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("calls onSelect when a user selects an option", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
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
      <SingleChoice
        question={mockQuestion}
        selectedId="opt2"
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
    expect(inputs[2].checked).toBe(false);
  });

  it("disables all options when disabled prop is true", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
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

  it("shows check icon for correct answer when revealed", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SingleChoice
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

  it("shows error icon for incorrect choice when revealed", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SingleChoice
        question={mockQuestion}
        selectedId="opt2"
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
      <SingleChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("hides explanations when not revealed", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
  });

  it("shows valid border for correct choice when revealed", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
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

  it("shows error border for incorrect choice when revealed", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
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

  it("shows monospace styling when monospace prop is true", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
        monospace={true}
      />
    );

    const monoElements = document.querySelectorAll("span.font-mono");
    expect(monoElements.length).toBeGreaterThan(0);
  });

  it("does not apply monospace styling by default", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    let monoElements = document.querySelectorAll("span.font-mono");
    expect(monoElements.length).toBe(0);

    rerender(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
        monospace={false}
      />
    );

    monoElements = document.querySelectorAll("span.font-mono");
    expect(monoElements.length).toBe(0);
  });

  it("uses question.id as radio group name", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const inputs = screen.getAllByRole("radio") as HTMLInputElement[];
    inputs.forEach((input) => {
      expect(input.name).toBe("q1");
    });
  });

  it("shows neutral border when not revealed and no selection", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId={null}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const neutralBorders = document.querySelectorAll("div.border-border");
    expect(neutralBorders.length).toBeGreaterThan(0);
  });

  it("shows all explanations when revealed, regardless of selection", () => {
    const onSelect = vi.fn();
    render(
      <SingleChoice
        question={mockQuestion}
        selectedId="opt1"
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText("Wrong")).toBeInTheDocument();
    expect(screen.getByText("Also wrong")).toBeInTheDocument();
  });
});
