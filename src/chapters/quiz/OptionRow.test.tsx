import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OptionRow } from "./OptionRow";
import type { QuizOption } from "@/content/chapters/types";

const mockOption: QuizOption = {
  id: "opt1",
  label: "Option 1",
  correct: true,
  explanationMd: "This is correct",
};

describe("OptionRow", () => {
  it("renders the option label", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("renders a radio input when inputType is radio", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "radio");
  });

  it("renders a checkbox input when inputType is checkbox", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="checkbox"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("checkbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "checkbox");
  });

  it("calls onChange when input is clicked", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio");
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
  });

  it("checks the input when checked prop is true", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("unchecks the input when checked prop is false", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it("disables the input when disabled prop is true", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={true}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio");
    expect(input).toBeDisabled();
  });

  it("does not disable the input when disabled prop is false", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio");
    expect(input).not.toBeDisabled();
  });

  it("shows check icon for correct answer when revealed and it's the correct option", () => {
    const onChange = vi.fn();
    const { container } = render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it("shows error icon for incorrect choice when revealed", () => {
    const onChange = vi.fn();
    const incorrectOption: QuizOption = {
      ...mockOption,
      correct: false,
    };
    const { container } = render(
      <OptionRow
        option={incorrectOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it("displays explanation when revealed", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    expect(screen.getByText("This is correct")).toBeInTheDocument();
  });

  it("hides explanation when not revealed", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    expect(screen.queryByText("This is correct")).not.toBeInTheDocument();
  });

  it("shows valid border for correct option when revealed", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const validBorders = document.querySelectorAll("div.border-state-valid");
    expect(validBorders.length).toBeGreaterThan(0);
  });

  it("shows error border for incorrect choice when revealed", () => {
    const onChange = vi.fn();
    const incorrectOption: QuizOption = {
      ...mockOption,
      correct: false,
    };
    render(
      <OptionRow
        option={incorrectOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const errorBorders = document.querySelectorAll("div.border-state-error");
    expect(errorBorders.length).toBeGreaterThan(0);
  });

  it("shows neutral border when not revealed", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const neutralBorders = document.querySelectorAll("div.border-border");
    expect(neutralBorders.length).toBeGreaterThan(0);
  });

  it("applies monospace styling when monospace prop is true", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        monospace={true}
        onChange={onChange}
      />
    );

    const monoElement = document.querySelector("span.font-mono");
    expect(monoElement).toBeInTheDocument();
  });

  it("does not apply monospace styling when monospace prop is false", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        monospace={false}
        onChange={onChange}
      />
    );

    const monoElement = document.querySelector("span.font-mono");
    expect(monoElement).not.toBeInTheDocument();
  });

  it("does not apply monospace styling by default", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const monoElement = document.querySelector("span.font-mono");
    expect(monoElement).not.toBeInTheDocument();
  });

  it("sets the correct name attribute for radio inputs", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="question-group"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("radio") as HTMLInputElement;
    expect(input.name).toBe("question-group");
  });

  it("sets the correct name attribute for checkbox inputs", () => {
    const onChange = vi.fn();
    render(
      <OptionRow
        option={mockOption}
        inputType="checkbox"
        name="question-group"
        checked={false}
        disabled={false}
        revealed={false}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.name).toBe("question-group");
  });

  it("correctly determines state as correct when correct option and revealed", () => {
    const onChange = vi.fn();
    const { container } = render(
      <OptionRow
        option={mockOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const validBorders = container.querySelectorAll("div.border-state-valid");
    expect(validBorders.length).toBeGreaterThan(0);
  });

  it("correctly determines state as incorrect when wrong option checked and revealed", () => {
    const onChange = vi.fn();
    const incorrectOption: QuizOption = {
      ...mockOption,
      correct: false,
    };
    const { container } = render(
      <OptionRow
        option={incorrectOption}
        inputType="radio"
        name="q1"
        checked={true}
        disabled={false}
        revealed={true}
        onChange={onChange}
      />
    );

    const errorBorders = container.querySelectorAll("div.border-state-error");
    expect(errorBorders.length).toBeGreaterThan(0);
  });
});
