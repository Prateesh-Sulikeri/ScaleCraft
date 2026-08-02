import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Matching } from "./Matching";
import type { QuizQuestion } from "@/content/chapters/types";

const mockQuestion: QuizQuestion = {
  id: "q1",
  kind: "matching",
  prompt: "Match items",
  difficulty: 2,
  options: [
    { id: "opt1", label: "Option 1", correct: true, explanationMd: "Correct!" },
    { id: "opt2", label: "Option 2", correct: false, explanationMd: "Wrong" },
  ],
  pairs: [
    ["Left A", "opt1"],
    ["Left B", "opt2"],
  ],
};

describe("Matching", () => {
  it("renders all left labels and option selects", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{}}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.getByText("Left A")).toBeInTheDocument();
    expect(screen.getByText("Left B")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("calls onSelect when a user selects an option", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{}}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "opt1" } });
    expect(onSelect).toHaveBeenCalledWith("Left A", "opt1");
  });

  it("shows placeholder 'Choose...' option", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{}}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Choose...");
  });

  it("disables selects when disabled prop is true", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{}}
        onSelect={onSelect}
        disabled={true}
        revealed={false}
      />
    );

    const selects = screen.getAllByRole("combobox");
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });
  });

  it("shows check icon for correct answer when revealed", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt1" }}
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it("shows error state for incorrect answer when revealed", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt2" }}
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const borders = document.querySelectorAll("div.border-state-error");
    expect(borders.length).toBeGreaterThan(0);
  });

  it("shows valid state for correct answer when revealed", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt1" }}
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    const borders = document.querySelectorAll("div.border-state-valid");
    expect(borders.length).toBeGreaterThan(0);
  });

  it("displays explanation when revealed", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt1" }}
        onSelect={onSelect}
        disabled={false}
        revealed={true}
      />
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("handles empty pairs gracefully", () => {
    const onSelect = vi.fn();
    const questionNoPairs = { ...mockQuestion, pairs: [] };
    render(
      <Matching
        question={questionNoPairs}
        selections={{}}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows neutral border when not revealed and no selection", () => {
    const onSelect = vi.fn();
    render(
      <Matching
        question={mockQuestion}
        selections={{}}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const borders = document.querySelectorAll("div.border-border");
    expect(borders.length).toBeGreaterThan(0);
  });

  it("preserves existing selections across renders", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt1" }}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    const selects = screen.getAllByRole("combobox");
    expect((selects[0] as HTMLSelectElement).value).toBe("opt1");

    rerender(
      <Matching
        question={mockQuestion}
        selections={{ "Left A": "opt1" }}
        onSelect={onSelect}
        disabled={false}
        revealed={false}
      />
    );

    expect((selects[0] as HTMLSelectElement).value).toBe("opt1");
  });
});
