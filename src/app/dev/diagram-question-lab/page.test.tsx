import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DiagramQuestionLabPage from "./page";

describe("DiagramQuestionLabPage", () => {
  it("renders the diagram question lab content", () => {
    render(<DiagramQuestionLabPage />);
    expect(screen.getByRole("heading", { name: "Diagram question lab" })).toBeInTheDocument();
  });
});
