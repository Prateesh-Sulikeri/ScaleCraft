import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamConfirmSubmitDialog } from "./ExamConfirmSubmitDialog";

describe("ExamConfirmSubmitDialog", () => {
  it("pluralizes the unanswered count correctly", () => {
    render(<ExamConfirmSubmitDialog unansweredCount={3} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText("3 questions unanswered - submit anyway?")).toBeInTheDocument();
  });

  it("does not pluralize a single unanswered question", () => {
    render(<ExamConfirmSubmitDialog unansweredCount={1} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText("1 question unanswered - submit anyway?")).toBeInTheDocument();
  });

  it("calls onCancel when 'Keep going' is clicked", () => {
    const onCancel = vi.fn();
    render(<ExamConfirmSubmitDialog unansweredCount={2} onCancel={onCancel} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Keep going" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when 'Submit anyway' is clicked", () => {
    const onConfirm = vi.fn();
    render(<ExamConfirmSubmitDialog unansweredCount={2} onCancel={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit anyway" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the backdrop is clicked", () => {
    const onCancel = vi.fn();
    const { container } = render(<ExamConfirmSubmitDialog unansweredCount={2} onCancel={onCancel} onConfirm={vi.fn()} />);
    const backdrop = container.querySelector(".fixed.inset-0.z-\\[var\\(--z-modal-backdrop\\)\\]");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
