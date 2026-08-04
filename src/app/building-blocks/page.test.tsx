import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BuildingBlocksPage from "./page";

vi.mock("@/learning-path/LearningPath", () => ({
  LearningPath: ({ courseId }: { courseId: string }) => <div data-testid="learning-path">{courseId}</div>,
}));

describe("BuildingBlocksPage", () => {
  it("renders the Learning Path for the building-blocks course", () => {
    render(<BuildingBlocksPage />);
    expect(screen.getByTestId("learning-path")).toHaveTextContent("building-blocks");
  });
});
