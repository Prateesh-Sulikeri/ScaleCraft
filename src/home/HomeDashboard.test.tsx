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
    slug: "load-balancers",
    chapterLabel: "1.2 Load Balancers",
    chapterDefinitionId: "bb-load-balancers",
    kind: "resume",
  },
  activity: [
    {
      id: "a",
      mode: "building-blocks",
      title: "1.2 Load Balancers",
      status: "In progress",
      at: NOW - 3_600_000,
      href: "/building-blocks/load-balancers/lesson",
    },
  ],
  allActivity: [
    {
      id: "a",
      mode: "building-blocks",
      title: "1.2 Load Balancers",
      status: "In progress",
      at: NOW - 3_600_000,
      href: "/building-blocks/load-balancers/lesson",
    },
  ],
  stats: {
    chaptersCompleted: 2,
    chaptersTotal: 69,
    checkpointsCompleted: 0,
    checkpointsTotal: 3,
    dayStreak: 2,
    longestStreak: 6,
  streakKnown: true,
  },
  now: NOW,
  isSignedIn: true,
  authResolved: true,
};

let current: HomeData = data;
vi.mock("./use-home-data", () => ({ useHomeData: () => current }));

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

  // Matched on the card's uppercase short code, which only the mode card
  // renders. The mode name in prose is not unique on this page - the header
  // nav uses it, and so does a Recent activity row for a chapter in that
  // mode, which is why a /Building Blocks/ query now finds two links.
  it("keeps one link per mode card, pointing at the existing routes", () => {
    render(<HomeDashboard />);
    expect(screen.getByRole("link", { name: /BUILD/ })).toHaveAttribute("href", "/building-blocks");
    expect(screen.getByRole("link", { name: /EXTRACT/ })).toHaveAttribute("href", "/real-world-extraction");
    expect(screen.getByRole("link", { name: /SANDBOX/ })).toHaveAttribute("href", "/sandbox");
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

  it("shows the loop to everyone", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("How a chapter works")).toBeInTheDocument();
  });

  it("signed out, keeps the stat cards as a skeleton behind a sign-in prompt", () => {
    current = { ...data, isSignedIn: false };
    render(<HomeDashboard />);
    expect(screen.getByText("At a glance")).toBeInTheDocument();
    expect(screen.getByText("Chapters completed")).toBeInTheDocument();
    expect(screen.queryByText("of 69")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in?redirect_url=%2F");
    current = data;
  });

  it("holds the stats row back until auth resolves", () => {
    current = { ...data, authResolved: false };
    render(<HomeDashboard />);
    expect(screen.queryByText("At a glance")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    current = data;
  });
});
