import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseStats } from "./CourseStats";
import type { CourseSummary } from "@/curriculum/progress";

const summary: CourseSummary = { completed: 7, total: 40, percent: 18, sectionsCompleted: 1, sectionsTotal: 10 };

describe("CourseStats", () => {
  it("renders the four course figures from the summary it is handed", () => {
    render(<CourseStats summary={summary} dayStreak={3} streakKnown />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("of 40")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("of 10")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("days")).toBeInTheDocument();
  });

  it("singularizes a one-day streak", () => {
    render(<CourseStats summary={summary} dayStreak={1} streakKnown />);
    expect(screen.getByText("day")).toBeInTheDocument();
  });

  it("shows a dash rather than a number when the day log has not loaded", () => {
    // A streak computed from whatever this browser happens to hold reads low
    // with full confidence, which is how a reset once looked like it *added*
    // days. Saying "not loaded" is the honest answer.
    render(<CourseStats summary={summary} dayStreak={1} streakKnown={false} />);

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("not loaded")).toBeInTheDocument();
    expect(screen.queryByText("day")).not.toBeInTheDocument();
  });
});
