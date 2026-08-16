import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RealWorldExtractionPage from "./page";

vi.mock("@/learning-path/LearningPath", () => ({
  LearningPath: ({ courseId }: { courseId: string }) => <div data-testid="learning-path">{courseId}</div>,
}));

describe("RealWorldExtractionPage", () => {
  it("renders the Learning Path for the real-world-extraction course", () => {
    render(<RealWorldExtractionPage />);
    expect(screen.getByTestId("learning-path")).toHaveTextContent("real-world-extraction");
  });
});
