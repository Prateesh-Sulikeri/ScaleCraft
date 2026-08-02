import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamQuestionBody } from "./ExamQuestionBody";
import type { QuizQuestion } from "@/content/chapters/types";
import type { QuizAnswer } from "../quiz/evaluate";

const singleChoiceQuestion: QuizQuestion = {
  id: "q1",
  kind: "single",
  body: "Choose one",
  options: [
    { id: "opt1", label: "Option 1", correct: true, explanationMd: "Correct!" },
    { id: "opt2", label: "Option 2", correct: false, explanationMd: "Wrong" },
  ],
};

const estimateQuestion: QuizQuestion = {
  id: "q2",
  kind: "estimate",
  body: "Estimate",
  options: [
    { id: "opt1", label: "~10K", correct: true, explanationMd: "Correct" },
    { id: "opt2", label: "~1M", correct: false, explanationMd: "Wrong" },
  ],
};

const multiChoiceQuestion: QuizQuestion = {
  id: "q3",
  kind: "multi",
  body: "Select all that apply",
  options: [
    { id: "opt1", label: "A", correct: true, explanationMd: "Yes" },
    { id: "opt2", label: "B", correct: false, explanationMd: "No" },
    { id: "opt3", label: "C", correct: true, explanationMd: "Yes" },
  ],
};

const orderingQuestion: QuizQuestion = {
  id: "q4",
  kind: "ordering",
  body: "Order these",
  options: [
    { id: "opt1", label: "Step 1", correct: true, explanationMd: "First" },
    { id: "opt2", label: "Step 2", correct: true, explanationMd: "Second" },
  ],
  correctOrder: ["opt1", "opt2"],
};

const matchingQuestion: QuizQuestion = {
  id: "q5",
  kind: "matching",
  body: "Match these",
  options: [
    { id: "opt1", label: "Answer 1", correct: true, explanationMd: "Match A" },
    { id: "opt2", label: "Answer 2", correct: true, explanationMd: "Match B" },
  ],
  pairs: [
    ["Left A", "opt1"],
    ["Left B", "opt2"],
  ],
};

const diagramQuestion: QuizQuestion = {
  id: "q6",
  kind: "diagram",
  body: "Diagram",
  options: [
    { id: "opt1", label: "Diagram A", correct: true, explanationMd: "Correct" },
  ],
};

describe("ExamQuestionBody", () => {
  describe("single choice", () => {
    it("renders SingleChoice component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("radio")).toHaveLength(2);
    });

    it("passes selected option to SingleChoice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={{ kind: "single", optionId: "opt1" }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      expect(radios[0].checked).toBe(true);
    });

    it("calls onChange with single choice format when option selected", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio");
      fireEvent.click(radios[0]);
      expect(onChange).toHaveBeenCalledWith({ kind: "single", optionId: "opt1" });
    });

    it("handles undefined value for single choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      radios.forEach((radio) => {
        expect(radio.checked).toBe(false);
      });
    });

    it("disables single choice when disabled prop is true", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={true}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });
  });

  describe("estimate choice", () => {
    it("renders EstimateChoice component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={estimateQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("radio")).toHaveLength(2);
    });

    it("passes selected estimate to EstimateChoice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={estimateQuestion}
          value={{ kind: "estimate", optionId: "opt1" }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      expect(radios[0].checked).toBe(true);
    });

    it("calls onChange with estimate format", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={estimateQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio");
      fireEvent.click(radios[1]);
      expect(onChange).toHaveBeenCalledWith({ kind: "estimate", optionId: "opt2" });
    });
  });

  describe("multi choice", () => {
    it("renders MultiChoice component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    });

    it("passes selected options to MultiChoice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={{ kind: "multi", optionIds: ["opt1", "opt3"] }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false);
      expect(checkboxes[2].checked).toBe(true);
    });

    it("adds option when toggling unchecked checkbox", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={{ kind: "multi", optionIds: ["opt1"] }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[2]); // Click opt3

      expect(onChange).toHaveBeenCalledWith({
        kind: "multi",
        optionIds: ["opt1", "opt3"],
      });
    });

    it("removes option when toggling checked checkbox", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={{ kind: "multi", optionIds: ["opt1", "opt3"] }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]); // Click opt1

      expect(onChange).toHaveBeenCalledWith({
        kind: "multi",
        optionIds: ["opt3"],
      });
    });

    it("handles undefined value for multi choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      checkboxes.forEach((checkbox) => {
        expect(checkbox.checked).toBe(false);
      });
    });
  });

  describe("ordering", () => {
    it("renders Ordering component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("passes order to Ordering component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={{ kind: "ordering", order: ["opt2", "opt1"] }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getByText("Step 2")).toBeInTheDocument();
      expect(screen.getByText("Step 1")).toBeInTheDocument();
    });

    it("calls onChange with ordering format", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[1]); // Down button for first item

      expect(onChange).toHaveBeenCalledWith({
        kind: "ordering",
        order: ["opt2", "opt1"],
      });
    });

    it("uses default order from question when value is undefined", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      // Default order should be opt1, opt2
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Step 1");
      expect(items[1]).toHaveTextContent("Step 2");
    });
  });

  describe("matching", () => {
    it("renders Matching component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("combobox")).toHaveLength(2);
    });

    it("passes selections to Matching component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={{ kind: "matching", selections: { "Left A": "opt1" } }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const select = screen.getAllByRole("combobox")[0] as HTMLSelectElement;
      expect(select.value).toBe("opt1");
    });

    it("calls onChange with matching format", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const select = screen.getAllByRole("combobox")[0];
      fireEvent.change(select, { target: { value: "opt1" } });

      expect(onChange).toHaveBeenCalledWith({
        kind: "matching",
        selections: { "Left A": "opt1" },
      });
    });

    it("adds selection to existing selections", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={{ kind: "matching", selections: { "Left A": "opt1" } }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const selects = screen.getAllByRole("combobox");
      fireEvent.change(selects[1], { target: { value: "opt2" } });

      expect(onChange).toHaveBeenCalledWith({
        kind: "matching",
        selections: { "Left A": "opt1", "Left B": "opt2" },
      });
    });

    it("handles undefined value for matching", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      selects.forEach((select) => {
        expect(select.value).toBe("");
      });
    });

    it("overwrites previous selection for same pair", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={{ kind: "matching", selections: { "Left A": "opt2" } }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const select = screen.getAllByRole("combobox")[0];
      fireEvent.change(select, { target: { value: "opt1" } });

      expect(onChange).toHaveBeenCalledWith({
        kind: "matching",
        selections: { "Left A": "opt1" },
      });
    });
  });

  describe("diagram question", () => {
    it("renders DiagramQuestion component", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={diagramQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      expect(screen.getAllByRole("radio")).toHaveLength(1);
    });

    it("passes selected diagram option to DiagramQuestion", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={diagramQuestion}
          value={{ kind: "diagram", optionId: "opt1" }}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radio = screen.getByRole("radio") as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it("calls onChange with diagram format", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={diagramQuestion}
          value={undefined}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radio = screen.getByRole("radio");
      fireEvent.click(radio);

      expect(onChange).toHaveBeenCalledWith({ kind: "diagram", optionId: "opt1" });
    });
  });

  describe("revealed state", () => {
    it("shows explanations when revealed for single choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={{ kind: "single", optionId: "opt1" }}
          onChange={onChange}
          disabled={false}
          revealed={true}
        />
      );

      expect(screen.getByText("Correct!")).toBeInTheDocument();
    });

    it("shows explanations when revealed for multi choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={{ kind: "multi", optionIds: ["opt1"] }}
          onChange={onChange}
          disabled={false}
          revealed={true}
        />
      );

      expect(screen.getAllByText("Yes")).toHaveLength(2); // opt1 and opt3 both have "Yes" explanation
    });

    it("shows explanations when revealed for ordering", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={{ kind: "ordering", order: ["opt1", "opt2"] }}
          onChange={onChange}
          disabled={false}
          revealed={true}
        />
      );

      expect(screen.getByText("First")).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables ordering when disabled prop is true", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={orderingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={true}
          revealed={false}
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("disables matching when disabled prop is true", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={matchingQuestion}
          value={undefined}
          onChange={onChange}
          disabled={true}
          revealed={false}
        />
      );

      const selects = screen.getAllByRole("combobox");
      selects.forEach((select) => {
        expect(select).toBeDisabled();
      });
    });
  });

  describe("wrong kind type with existing value", () => {
    it("ignores single choice value when question is multi choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={multiChoiceQuestion}
          value={{ kind: "single", optionId: "opt1" } as any}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      checkboxes.forEach((checkbox) => {
        expect(checkbox.checked).toBe(false);
      });
    });

    it("ignores multi value when question is single choice", () => {
      const onChange = vi.fn();
      render(
        <ExamQuestionBody
          question={singleChoiceQuestion}
          value={{ kind: "multi", optionIds: ["opt1"] } as any}
          onChange={onChange}
          disabled={false}
          revealed={false}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      radios.forEach((radio) => {
        expect(radio.checked).toBe(false);
      });
    });
  });
});
