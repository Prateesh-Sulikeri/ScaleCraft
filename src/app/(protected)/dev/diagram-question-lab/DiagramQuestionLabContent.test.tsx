import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagramQuestionLabContent } from "./DiagramQuestionLabContent";
import { DIAGRAM_QUESTION_FIXTURES } from "./fixtures";

describe("DiagramQuestionLabContent", () => {
  it("renders a FixtureCard for every fixture question", () => {
    render(<DiagramQuestionLabContent />);
    for (const question of DIAGRAM_QUESTION_FIXTURES) {
      expect(screen.getByText(question.prompt)).toBeInTheDocument();
    }
  });

  it("renders the lab heading", () => {
    render(<DiagramQuestionLabContent />);
    expect(screen.getByRole("heading", { name: "Diagram question lab" })).toBeInTheDocument();
  });
});
