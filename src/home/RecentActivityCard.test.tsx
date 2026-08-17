import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivityCard } from "./RecentActivityCard";
import { ALL_ACTIVITY_HREF } from "./links";
import type { ActivityEntry } from "./home-data";

const NOW = Date.parse("2026-08-17T12:00:00");

const entries: ActivityEntry[] = [
  { id: "a", mode: "building-blocks", title: "1.2 Load Balancers", status: "In progress", at: NOW - 2 * 3_600_000 },
  { id: "b", mode: "sandbox", title: "Sandbox board", status: "Edited", at: NOW - 3 * 86_400_000 },
];

describe("RecentActivityCard", () => {
  it("renders one row per activity, with mode, title, status, and relative time", () => {
    render(<RecentActivityCard activity={entries} now={NOW} isSignedIn />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("1.2 Load Balancers")).toBeInTheDocument();
    expect(screen.getByText("Building Blocks")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getByText("3d ago")).toBeInTheDocument();
  });

  it("invites a signed-out visitor to sign in rather than showing an empty list", () => {
    render(<RecentActivityCard activity={[]} now={NOW} isSignedIn={false} />);
    expect(screen.getByText(/Sign in to track chapters/)).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("tells a signed-in learner with no history what will fill the card", () => {
    render(<RecentActivityCard activity={[]} now={NOW} isSignedIn />);
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });

  it("holds rows back until the clock is known, so no timestamp is server-rendered", () => {
    render(<RecentActivityCard activity={entries} now={null} isSignedIn />);
    expect(screen.queryByText("1.2 Load Balancers")).not.toBeInTheDocument();
  });

  it("offers exactly one way out of the card", () => {
    render(<RecentActivityCard activity={entries} now={NOW} isSignedIn />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", ALL_ACTIVITY_HREF);
  });
});
