import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverallProgress } from "./OverallProgress";
import type { CourseSummary } from "@/curriculum/progress";

function summary(overrides: Partial<CourseSummary> = {}): CourseSummary {
  return { completed: 7, total: 26, percent: 27, sectionsCompleted: 1, sectionsTotal: 7, ...overrides };
}

describe("OverallProgress", () => {
  it("renders the percent, chapter count, and section count", () => {
    render(<OverallProgress summary={summary()} courseId="building-blocks" />);
    expect(screen.getByText("27%")).toBeInTheDocument();
    expect(screen.getByText("7 / 26 chapters · 1 / 7 sections")).toBeInTheDocument();
  });

  it("labels the progress bar with the course's overall percent", () => {
    render(<OverallProgress summary={summary()} courseId="building-blocks" />);
    expect(screen.getByRole("progressbar", { name: "Overall progress: 27%" })).toBeInTheDocument();
  });
});
