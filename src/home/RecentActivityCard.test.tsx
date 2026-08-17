import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecentActivityCard } from "./RecentActivityCard";
import type { ActivityEntry } from "./home-data";

const NOW = Date.parse("2026-08-17T12:00:00");

const entries: ActivityEntry[] = [
  {
    id: "a",
    mode: "building-blocks",
    title: "1.2 Load Balancers",
    status: "In progress",
    at: NOW - 2 * 3_600_000,
    href: "/building-blocks/load-balancers/lesson",
  },
  { id: "b", mode: "sandbox", title: "Sandbox board", status: "Edited", at: NOW - 3 * 86_400_000, href: null },
];

const older: ActivityEntry = {
  id: "c",
  mode: "real-world-extraction",
  title: "2.1 URL Shortener",
  status: "Completed",
  at: NOW - 10 * 86_400_000,
  href: "/real-world-extraction/url-shortener/lesson",
};

describe("RecentActivityCard", () => {
  it("renders one row per activity, with mode, title, status, and relative time", () => {
    render(<RecentActivityCard activity={entries} allActivity={entries} now={NOW} isSignedIn />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("1.2 Load Balancers")).toBeInTheDocument();
    expect(screen.getByText("Building Blocks")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getByText("3d ago")).toBeInTheDocument();
  });

  it("invites a signed-out visitor to sign in rather than showing an empty list", () => {
    render(<RecentActivityCard activity={[]} allActivity={[]} now={NOW} isSignedIn={false} />);
    expect(screen.getByText(/Sign in to track chapters/)).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("tells a signed-in learner with no history what will fill the card", () => {
    render(<RecentActivityCard activity={[]} allActivity={[]} now={NOW} isSignedIn />);
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });

  it("holds rows back until the clock is known, so no timestamp is server-rendered", () => {
    render(<RecentActivityCard activity={entries} allActivity={entries} now={null} isSignedIn />);
    expect(screen.queryByText("1.2 Load Balancers")).not.toBeInTheDocument();
  });

  it("links a chapter row back to its lesson", () => {
    render(<RecentActivityCard activity={entries} allActivity={entries} now={NOW} isSignedIn />);
    expect(screen.getByRole("link", { name: /1\.2 Load Balancers/ })).toHaveAttribute(
      "href",
      "/building-blocks/load-balancers/lesson",
    );
  });

  it("leaves the Sandbox row unlinked - a save slot is not a chapter to return to", () => {
    render(<RecentActivityCard activity={entries} allActivity={entries} now={NOW} isSignedIn />);
    expect(screen.queryByRole("link", { name: /Sandbox board/ })).not.toBeInTheDocument();
  });

  it("opens the All activity dialog, showing rows the card's preview clipped", () => {
    render(<RecentActivityCard activity={entries} allActivity={[...entries, older]} now={NOW} isSignedIn />);

    expect(screen.queryByText("2.1 URL Shortener")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /View all activity/ }));

    expect(screen.getByText("All activity")).toBeInTheDocument();
    expect(screen.getByText("2.1 URL Shortener")).toBeInTheDocument();
  });

  it("closes the dialog again", () => {
    render(<RecentActivityCard activity={entries} allActivity={entries} now={NOW} isSignedIn />);

    fireEvent.click(screen.getByRole("button", { name: /View all activity/ }));
    fireEvent.click(screen.getByRole("button", { name: "Close All activity" }));

    expect(screen.queryByText("All activity")).not.toBeInTheDocument();
  });
});
