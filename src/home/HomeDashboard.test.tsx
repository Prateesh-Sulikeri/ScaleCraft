import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeDashboard } from "./HomeDashboard";
import type { HomeData } from "./use-home-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

const NOW = Date.parse("2026-08-17T12:00:00");

const data: HomeData = {
  progressByCourse: {
    "building-blocks": { completed: 2, total: 40, percent: 5 },
    "real-world-extraction": { completed: 0, total: 32, percent: 0 },
  },
  continueTarget: {
    href: "/building-blocks/load-balancers/lesson",
    courseId: "building-blocks",
    chapterLabel: "1.2 Load Balancers",
    chapterDefinitionId: "bb-load-balancers",
    kind: "resume",
  },
  activity: [
    { id: "a", mode: "building-blocks", title: "1.2 Load Balancers", status: "In progress", at: NOW - 3_600_000 },
  ],
  stats: {
    chaptersCompleted: 2,
    chaptersTotal: 69,
    checkpointsCompleted: 0,
    checkpointsTotal: 3,
    dayStreak: 2,
    longestStreak: 6,
  },
  now: NOW,
  isSignedIn: true,
};

vi.mock("./use-home-data", () => ({ useHomeData: () => data }));

describe("HomeDashboard", () => {
  it("composes header, hero, modes, activity, stats, and footer", () => {
    render(<HomeDashboard />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Choose your mode")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
    expect(screen.getByText("At a glance")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("keeps one link per mode, pointing at the existing routes", () => {
    render(<HomeDashboard />);
    expect(screen.getByRole("link", { name: /Building Blocks/ })).toHaveAttribute("href", "/building-blocks");
    expect(screen.getByRole("link", { name: /Real World Extraction/ })).toHaveAttribute(
      "href",
      "/real-world-extraction",
    );
    expect(screen.getByRole("link", { name: /Sandbox/ })).toHaveAttribute("href", "/sandbox");
  });

  it("feeds each course card its own progress", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("2 / 40 chapters")).toBeInTheDocument();
    expect(screen.getByText("0 / 32 chapters")).toBeInTheDocument();
  });

  it("passes real activity and stats through to the cards", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("1h ago")).toBeInTheDocument();
    expect(screen.getByText("of 69")).toBeInTheDocument();
  });
});
