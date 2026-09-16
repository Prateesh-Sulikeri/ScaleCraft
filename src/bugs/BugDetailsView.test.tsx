import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BugDetailsView } from "./BugDetailsView";
import { formatBugFullDate } from "./BugChips";
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
  deletesAt: null,
  imageDeletesAt: null,
  imageRemovedAt: null,
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

describe("BugDetailsView retention notices", () => {
  const imageDeletesAt = Date.parse("2026-08-31T09:30:00Z");
  const deletesAt = Date.parse("2026-09-08T09:30:00Z");
  const removedAt = imageDeletesAt;

  // The explicit product call: the reporter is told the date, and told that
  // reading the report does not extend it. Discovering the deletion afterwards
  // is the failure mode this exists to prevent.
  it("states the deletion date and that reading changes nothing", async () => {
    fetchBug.mockResolvedValue(detail({ status: "closed", deletesAt }));
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    const notice = await screen.findByText(/This report will be deleted on/);
    // Compared through the shared formatter rather than a literal: the exact
    // wording is the viewer's locale, but it must be the *deletion* date and
    // not, say, the closedAt it was derived from.
    expect(notice).toHaveTextContent(formatBugFullDate(deletesAt));
    expect(notice).toHaveTextContent("15 days");
    expect(notice).toHaveTextContent(/whether or not they have been read/);
  });

  it("says nothing about deletion while the report is still open", async () => {
    fetchBug.mockResolvedValue(detail({ status: "in-progress", deletesAt: null }));
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    await screen.findByText("Steps: open chapter 3.4 at 1280px.");
    expect(screen.queryByText(/will be deleted/)).toBeNull();
  });

  it("explains a screenshot that was removed after the grace window", async () => {
    fetchBug.mockResolvedValue(
      detail({ status: "closed", deletesAt, hasImage: false, imageRemovedAt: removedAt }),
    );
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    const notice = await screen.findByText(/Removed on/);
    expect(notice).toHaveTextContent(formatBugFullDate(removedAt));
    expect(notice).toHaveTextContent("7 days");
  });

  // The grace window is only worth having if the reporter knows it is running
  // - the notice goes under the screenshot while there is still one to see.
  it("dates the screenshot removal while the screenshot is still there", async () => {
    fetchBug.mockResolvedValue(
      detail({ status: "closed", deletesAt, imageDeletesAt, hasImage: true }),
    );
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    const notice = await screen.findByText(/This screenshot will be removed on/);
    expect(notice).toHaveTextContent(formatBugFullDate(imageDeletesAt));
    // Both dates, because "the picture goes first, the report later" is the
    // part that is genuinely surprising.
    expect(notice).toHaveTextContent(formatBugFullDate(deletesAt));
  });

  it("says nothing about screenshot removal while the report is open", async () => {
    fetchBug.mockResolvedValue(
      detail({ status: "open", deletesAt: null, imageDeletesAt: null, hasImage: true }),
    );
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    await screen.findByText("Steps: open chapter 3.4 at 1280px.");
    expect(screen.queryByText(/will be removed on/)).toBeNull();
  });

  // A report that never had an attachment must not be told about one.
  it("says nothing about an attachment that never existed", async () => {
    fetchBug.mockResolvedValue(
      detail({ status: "closed", deletesAt, hasImage: false, imageRemovedAt: null }),
    );
    render(<BugDetailsView bugId="bug-1" onBack={() => {}} />);

    await screen.findByText(/This report will be deleted on/);
    expect(screen.queryByText("Attachment")).toBeNull();
  });
});
