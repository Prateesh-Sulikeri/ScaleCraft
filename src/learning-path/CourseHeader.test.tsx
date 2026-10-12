import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseHeader } from "./CourseHeader";
import { getCourse } from "@/curriculum";
import type { CourseSummary } from "@/curriculum/progress";

const summary: CourseSummary = { completed: 7, total: 26, percent: 27, sectionsCompleted: 1, sectionsTotal: 7 };

describe("CourseHeader", () => {
  it("renders the course title and subtitle as an h1 + supporting text", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} dayStreak={0} streakKnown isSignedIn />);
    expect(screen.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeInTheDocument();
    expect(
      screen.getByText("One concept at a time, with a constrained palette and validation that explains itself."),
    ).toBeInTheDocument();
  });

  it("puts the day streak on the progress line", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} dayStreak={4} streakKnown isSignedIn />);
    expect(screen.getByText(/day streak/)).toHaveTextContent("4 day streak");
  });

  it("signed out, offers sign-in instead of a 0% bar", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} dayStreak={0} streakKnown isSignedIn={false} />);
    expect(screen.getByRole("link", { name: /sign in to track/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Fbuilding-blocks",
    );
    expect(screen.queryByText("7 / 26")).not.toBeInTheDocument();
  });

  it("includes the Download Curriculum button and overall progress", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} dayStreak={0} streakKnown isSignedIn />);
    expect(screen.getByRole("link", { name: /download curriculum/i })).toBeInTheDocument();
    expect(screen.getByText("7 / 26")).toBeInTheDocument();
    expect(screen.getByText("1 / 7")).toBeInTheDocument();
  });
});
