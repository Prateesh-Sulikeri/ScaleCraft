import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagramQuestion } from "./DiagramQuestion";
import type { QuizQuestion } from "@/content/chapters/types";

describe("DiagramQuestion", () => {
  it("renders the read-only graph summary above a single-choice body", () => {
    const question: QuizQuestion = {
      id: "q1",
      kind: "diagram",
      difficulty: 2,
      prompt: "What will happen if the load balancer fails?",
      graph: {
        nodes: [
          { id: "n1", componentId: "client", position: { x: 0, y: 0 }, config: {} },
          { id: "n2", componentId: "load-balancer", position: { x: 100, y: 0 }, config: {} },
        ],
        edges: [{ id: "e1", source: "n1", target: "n2", kind: "request-flow" }],
        entryPointIds: ["n1"],
      },
      options: [
        { id: "a", label: "Requests fail", explanationMd: "e", correct: true },
        { id: "b", label: "Nothing changes", explanationMd: "e", correct: false },
      ],
    };

    render(<DiagramQuestion question={question} selectedId={null} onSelect={vi.fn()} disabled={false} revealed={false} />);

    expect(screen.getByText(/client.*load balancer/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Requests fail")).toBeInTheDocument();
    expect(screen.getByLabelText("Nothing changes")).toBeInTheDocument();
  });
});
