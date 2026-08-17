import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseStats } from "./CourseStats";
import type { CourseSummary } from "@/curriculum/progress";

const summary: CourseSummary = { completed: 7, total: 40, percent: 18, sectionsCompleted: 1, sectionsTotal: 10 };

describe("CourseStats", () => {
  it("renders the four course figures from the summary it is handed", () => {
    render(<CourseStats summary={summary} dayStreak={3} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("of 40")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("of 10")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("days")).toBeInTheDocument();
  });

  it("singularizes a one-day streak", () => {
    render(<CourseStats summary={summary} dayStreak={1} />);
    expect(screen.getByText("day")).toBeInTheDocument();
  });
});
