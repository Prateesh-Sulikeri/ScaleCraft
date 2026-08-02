import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseHeader } from "./CourseHeader";
import { getCourse } from "@/curriculum";
import type { CourseSummary } from "@/curriculum/progress";

const summary: CourseSummary = { completed: 7, total: 26, percent: 27, sectionsCompleted: 1, sectionsTotal: 7 };

describe("CourseHeader", () => {
  it("renders the course title and subtitle as an h1 + supporting text", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} />);
    expect(screen.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeInTheDocument();
    expect(
      screen.getByText("One concept at a time, with a constrained palette and validation that explains itself."),
    ).toBeInTheDocument();
  });

  it("links back to Home", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} />);
    expect(screen.getByRole("link", { name: /scalecraft/i })).toHaveAttribute("href", "/");
  });

  it("includes the Download Curriculum button and overall progress", () => {
    render(<CourseHeader course={getCourse("building-blocks")} summary={summary} />);
    expect(screen.getByRole("link", { name: /download curriculum/i })).toBeInTheDocument();
    expect(screen.getByText("7 / 26")).toBeInTheDocument();
    expect(screen.getByText("1 / 7")).toBeInTheDocument();
  });
});
