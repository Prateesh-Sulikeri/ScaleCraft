import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BugDetailsView } from "./BugDetailsView";
import type { BugDetail } from "./types";

const fetchBug = vi.fn<() => Promise<BugDetail>>();
const markBugSeen = vi.fn<(id: string) => Promise<number>>();

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return {
    ...actual,
    fetchBug: () => fetchBug(),
    markBugSeen: (id: string) => markBugSeen(id),
  };
});

const detail = (over: Partial<BugDetail> = {}): BugDetail => ({
  id: "bug-1",
  category: "ui",
  title: "Sidebar overlaps the diagram",
  description: "Steps: open chapter 3.4 at 1280px.",
  closingNotes: null,
  priority: "medium",
  status: "open",
  createdAt: Date.parse("2026-08-01T10:00:00Z"),
  updatedAt: Date.parse("2026-08-01T10:00:00Z"),
  unread: false,
  hasImage: false,
  pagePath: null,
  appVersion: null,
  ...over,
});

beforeEach(() => {
  fetchBug.mockReset();
  markBugSeen.mockReset();
  markBugSeen.mockResolvedValue(0);
});

describe("BugDetailsView", () => {
  it("shows the author's closing notes when there are any", async () => {
    fetchBug.mockResolvedValue(
      detail({ status: "closed", closingNotes: "Fixed in 7.1.0 - the panel now clamps to the canvas width." }),
    );
    render(<BugDetailsView bugId="bug-1" onBack={vi.fn()} />);

    expect(await screen.findByText("Closing notes")).toBeInTheDocument();
    expect(
      screen.getByText("Fixed in 7.1.0 - the panel now clamps to the canvas width."),
    ).toBeInTheDocument();
  });

  it("renders no closing-notes section at all when none has been written", async () => {
    fetchBug.mockResolvedValue(detail());
    render(<BugDetailsView bugId="bug-1" onBack={vi.fn()} />);

    // An empty "Closing notes" heading would pose the question without
    // answering it, so the whole block stays out.
    await screen.findByText("Steps: open chapter 3.4 at 1280px.");
    expect(screen.queryByText("Closing notes")).not.toBeInTheDocument();
  });

  it("acknowledges an unread update once, after the report is on screen", async () => {
    fetchBug.mockResolvedValue(detail({ status: "resolved", unread: true }));
    const onSeen = vi.fn();
    render(<BugDetailsView bugId="bug-1" onBack={vi.fn()} onSeen={onSeen} />);

    await screen.findByText("Steps: open chapter 3.4 at 1280px.");
    await waitFor(() => expect(onSeen).toHaveBeenCalledWith("bug-1"));
    expect(markBugSeen).toHaveBeenCalledTimes(1);
  });

  it("still shows the report when acknowledging it fails", async () => {
    fetchBug.mockResolvedValue(detail({ status: "resolved", unread: true }));
    markBugSeen.mockRejectedValue(new Error("offline"));
    render(<BugDetailsView bugId="bug-1" onBack={vi.fn()} />);

    expect(await screen.findByText("Steps: open chapter 3.4 at 1280px.")).toBeInTheDocument();
    await waitFor(() => expect(markBugSeen).toHaveBeenCalled());
    expect(screen.queryByText("offline")).not.toBeInTheDocument();
  });
});
