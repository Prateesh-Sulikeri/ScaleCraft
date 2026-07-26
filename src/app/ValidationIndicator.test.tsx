import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ValidationIndicator } from "./ValidationIndicator";
import type { ValidationViolation } from "@/validation-engine/types";

function makeViolation(overrides: Partial<ValidationViolation> = {}): ValidationViolation {
  return {
    ruleId: "no-direct-client-database",
    severity: "error",
    message: "Client talks directly to a database",
    explanation: "Clients should never call a database directly — route through an API layer.",
    offendingNodeIds: [],
    offendingEdgeIds: [],
    ...overrides,
  };
}

describe("ValidationIndicator", () => {
  it("triggers validation on first click when no results exist yet", () => {
    const onValidate = vi.fn();
    render(<ValidationIndicator violations={null} isStale={false} onValidate={onValidate} />);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it("shows a valid (checkmark) state and 'No violations' when the graph passes", () => {
    const onValidate = vi.fn();
    render(<ValidationIndicator violations={[]} isStale={false} onValidate={onValidate} />);

    const button = screen.getByRole("button", { name: "Validate" });
    expect(button.className).toContain("border-state-valid");

    fireEvent.click(button);
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText("No violations.")).toBeInTheDocument();
  });

  it("shows an error state and lists violations, sorted errors-first", () => {
    const onValidate = vi.fn();
    const violations = [
      makeViolation({ ruleId: "a", severity: "warning", message: "Warning message" }),
      makeViolation({ ruleId: "b", severity: "error", message: "Error message" }),
    ];
    render(<ValidationIndicator violations={violations} isStale={false} onValidate={onValidate} />);

    const button = screen.getByRole("button", { name: "Validate" });
    expect(button.className).toContain("border-state-error");

    fireEvent.click(button);
    expect(screen.getByText("2 issues")).toBeInTheDocument();
    expect(screen.getByText("1 error")).toBeInTheDocument();
    expect(screen.getByText("1 warning")).toBeInTheDocument();

    const messages = screen.getAllByText(/message$/).map((el) => el.textContent);
    expect(messages).toEqual(["Error message", "Warning message"]);
  });

  it("does not open the dropdown while stale, and re-validates instead", () => {
    const onValidate = vi.fn();
    const violations = [makeViolation()];
    render(<ValidationIndicator violations={violations} isStale={true} onValidate={onValidate} />);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/issue/)).not.toBeInTheDocument();
  });

  it("toggles the dropdown closed on a second click of a fresh, non-stale result", () => {
    const onValidate = vi.fn();
    render(<ValidationIndicator violations={[]} isStale={false} onValidate={onValidate} />);
    const button = screen.getByRole("button", { name: "Validate" });

    fireEvent.click(button);
    expect(screen.getByText("No violations.")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText("No violations.")).not.toBeInTheDocument();
  });

  it("closes the dropdown on an outside click but not on a react-flow node click", () => {
    render(
      <div>
        <ValidationIndicator violations={[]} isStale={false} onValidate={vi.fn()} />
        <div className="react-flow__node">a node</div>
        <button>outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(screen.getByText("No violations.")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("a node"));
    expect(screen.getByText("No violations.")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByText("No violations.")).not.toBeInTheDocument();
  });
});
