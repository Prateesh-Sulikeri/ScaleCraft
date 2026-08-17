import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AtAGlanceCard } from "./AtAGlanceCard";
import type { HomeStats } from "./home-data";

const stats: HomeStats = {
  chaptersCompleted: 7,
  chaptersTotal: 69,
  checkpointsCompleted: 1,
  checkpointsTotal: 3,
  dayStreak: 4,
  longestStreak: 9,
};

describe("AtAGlanceCard", () => {
  it("shows exactly the four preliminary metrics", () => {
    render(<AtAGlanceCard stats={stats} />);
    expect(screen.getByText("Chapters completed")).toBeInTheDocument();
    expect(screen.getByText("Checkpoints completed")).toBeInTheDocument();
    expect(screen.getByText("Day streak")).toBeInTheDocument();
    expect(screen.getByText("Longest streak")).toBeInTheDocument();
    expect(screen.queryByText(/Problems attempted/)).not.toBeInTheDocument();
  });

  it("pairs each completion count with its total", () => {
    render(<AtAGlanceCard stats={stats} />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("of 69")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("of 3")).toBeInTheDocument();
  });

  it("shows both streaks side by side", () => {
    render(<AtAGlanceCard stats={stats} />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getAllByText("days")).toHaveLength(2);
  });

  it("shows a real zero rather than a placeholder dash", () => {
    render(<AtAGlanceCard stats={{ ...stats, dayStreak: 0, longestStreak: 0 }} />);
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("has no time-spent tile, since nothing measures it", () => {
    render(<AtAGlanceCard stats={stats} />);
    expect(screen.queryByText(/Time spent/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Curriculum time/i)).not.toBeInTheDocument();
  });

  it("singularizes a one-day streak", () => {
    render(<AtAGlanceCard stats={{ ...stats, dayStreak: 1, longestStreak: 5 }} />);
    expect(screen.getByText("day")).toBeInTheDocument();
  });

  it("carries the encouragement line without turning it into a score", () => {
    render(<AtAGlanceCard stats={stats} />);
    expect(screen.getByText(/Consistency builds mastery/)).toBeInTheDocument();
  });
});
