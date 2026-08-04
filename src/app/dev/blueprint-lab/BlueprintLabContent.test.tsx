import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithCanvasStore, stubResizeObserver } from "@/canvas/canvas-test-utils";
import { BlueprintLabContent } from "./BlueprintLabContent";

vi.mock("@/canvas/Canvas", () => ({ Canvas: () => null }));

beforeAll(() => {
  stubResizeObserver();
});

describe("BlueprintLabContent", () => {
  it("renders the header and a pre-filled example blueprint", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByRole("heading", { name: "Blueprint Lab" })).toBeInTheDocument();
    const textarea = screen.getByLabelText(/Blueprint JSON/) as HTMLTextAreaElement;
    expect(textarea.value).toContain("example-client-lb-app");
  });

  it("shows 'not matched' against an empty canvas (no nodes to satisfy require)", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText("Blueprint not matched")).toBeInTheDocument();
    expect(screen.getByText("require: 0 match(es)")).toBeInTheDocument();
  });

  it("shows a parse error for invalid JSON", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/);
    fireEvent.change(textarea, { target: { value: "not valid json" } });
    expect(screen.getByText(/Invalid JSON|Unexpected token/)).toBeInTheDocument();
  });

  it("shows a shape error for JSON missing a require field", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/);
    fireEvent.change(textarea, { target: { value: "{}" } });
    expect(screen.getByText(/Expected an object with at least a `require`/)).toBeInTheDocument();
  });

  it("reports no rule violations against an empty canvas", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText(/Rule violations \(0, full registry\)/)).toBeInTheDocument();
    expect(screen.getByText("None.")).toBeInTheDocument();
  });

  it("'Load example' resets the textarea back to the example blueprint", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "{}" } });
    expect(textarea.value).toBe("{}");
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    expect(textarea.value).toContain("example-client-lb-app");
  });

  it("lists component ids/categories in the cheat sheet", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText("Component ids / categories cheat sheet")).toBeInTheDocument();
    expect(screen.getByText("client")).toBeInTheDocument();
  });
});
