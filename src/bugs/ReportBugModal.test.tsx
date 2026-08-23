import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { ReportBugModal } from "./ReportBugModal";
import { resetUnreadBugCount } from "./unread-badge-store";
import type { BugSummary } from "./types";

vi.mock("next/navigation", () => ({ usePathname: () => "/building-blocks" }));

// The API is mocked at the client wrapper, not at fetch: these tests are about
// the modal's state machine (which view is showing, when the list updates),
// and the wire format is already covered by types.test.ts.
const fetchBugs = vi.fn<() => Promise<BugSummary[]>>();
const createBug = vi.fn<(input: unknown) => Promise<BugSummary>>();
const fetchBug = vi.fn();
const markBugSeen = vi.fn<(id: string) => Promise<number>>();

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return {
    ...actual,
    fetchBugs: () => fetchBugs(),
    createBug: (input: unknown) => createBug(input),
    fetchBug: (id: string) => fetchBug(id),
    markBugSeen: (id: string) => markBugSeen(id),
  };
});

const bug = (over: Partial<BugSummary> = {}): BugSummary => ({
  id: "bug-1",
  category: "ui",
  title: "Sidebar overlaps the diagram",
  priority: "medium",
  status: "open",
  createdAt: Date.parse("2026-08-01T10:00:00Z"),
  unread: false,
  ...over,
});

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
  fetchBugs.mockReset();
  createBug.mockReset();
  fetchBug.mockReset();
  markBugSeen.mockReset();
  markBugSeen.mockResolvedValue(0);
  resetUnreadBugCount();
  // The draft outlives a render tree by design, so it has to be cleared
  // between cases or one test's typing opens the next test's modal.
  localStorage.clear();
});

describe("ReportBugModal", () => {
  it("shows the empty state, not an empty table, when nothing has been reported", async () => {
    fetchBugs.mockResolvedValue([]);
    render(<ReportBugModal onClose={vi.fn()} />);

    expect(await screen.findByText("No bugs reported yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Report a bug" })).toBeInTheDocument();
  });

  it("lists existing reports with the + Report a bug action above them", async () => {
    fetchBugs.mockResolvedValue([bug(), bug({ id: "bug-2", title: "Quiz score is wrong", priority: "high" })]);
    render(<ReportBugModal onClose={vi.fn()} />);

    expect(await screen.findByText("Sidebar overlaps the diagram")).toBeInTheDocument();
    expect(screen.getByText("Quiz score is wrong")).toBeInTheDocument();
    expect(screen.queryByText("No bugs reported yet")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Report a bug" })).toBeInTheDocument();
  });

  it("opens a bug's details on click and offers a way back to the list", async () => {
    fetchBugs.mockResolvedValue([bug()]);
    fetchBug.mockResolvedValue({
      ...bug(),
      description: "Steps: open chapter 3.4 at 1280px.",
      updatedAt: Date.parse("2026-08-01T10:00:00Z"),
      hasImage: false,
      pagePath: "/building-blocks/load-balancer/lesson",
      appVersion: "7.0.0-alpha",
    });

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Sidebar overlaps the diagram/ }));

    expect(await screen.findByText("Steps: open chapter 3.4 at 1280px.")).toBeInTheDocument();
    expect(screen.getByText("/building-blocks/load-balancer/lesson")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All reports" }));
    expect(await screen.findByText("Sidebar overlaps the diagram")).toBeInTheDocument();
  });

  it("shows a submitted report in the list immediately, with no refetch", async () => {
    fetchBugs.mockResolvedValue([]);
    createBug.mockResolvedValue(bug({ id: "bug-new", title: "Progress resets on refresh" }));

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Progress resets on refresh" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Completed 3.4, refreshed, back to Not started." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    expect(await screen.findByText("Progress resets on refresh")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Report submitted");
    // One load on open, and none after the submit - the create response is
    // what populates the list.
    expect(fetchBugs).toHaveBeenCalledTimes(1);
  });

  it("blocks submission with an empty title or description, without calling the API", async () => {
    fetchBugs.mockResolvedValue([]);

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    expect(screen.getByText("A title is required.")).toBeInTheDocument();
    expect(screen.getByText("A description is required.")).toBeInTheDocument();
    expect(createBug).not.toHaveBeenCalled();
  });

  it("keeps the typed report on screen when submission fails", async () => {
    fetchBugs.mockResolvedValue([]);
    createBug.mockRejectedValue(new Error("Could not submit your report."));

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Broken link" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "The Roadmap link 404s." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    expect(await screen.findByText("Could not submit your report.")).toBeInTheDocument();
    // Losing what they typed is the one thing a failed submit must not do.
    expect(screen.getByLabelText("Title")).toHaveValue("Broken link");
    expect(screen.getByLabelText("Description")).toHaveValue("The Roadmap link 404s.");
  });

  it("does not fire a second create while one is in flight", async () => {
    fetchBugs.mockResolvedValue([]);
    let release: (bug: BugSummary) => void = () => {};
    createBug.mockImplementation(() => new Promise<BugSummary>((resolve) => { release = resolve; }));

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Double submit" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Clicking twice filed two bugs." } });

    const submit = screen.getByRole("button", { name: "Submit report" });
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByRole("button", { name: /Submitting/ })).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: /Submitting/ }));

    expect(createBug).toHaveBeenCalledTimes(1);
    release(bug({ id: "bug-once" }));
  });

  it("surfaces a failed load with a retry rather than an empty state", async () => {
    fetchBugs.mockRejectedValueOnce(new Error("Could not load your reports."));
    render(<ReportBugModal onClose={vi.fn()} />);

    expect(await screen.findByText("Could not load your reports.")).toBeInTheDocument();
    expect(screen.queryByText("No bugs reported yet")).not.toBeInTheDocument();

    fetchBugs.mockResolvedValue([bug()]);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Sidebar overlaps the diagram")).toBeInTheDocument();
  });

  it("clears a report's unread marker once its details have been opened", async () => {
    fetchBugs.mockResolvedValue([bug({ status: "resolved", unread: true })]);
    fetchBug.mockResolvedValue({
      ...bug({ status: "resolved", unread: true }),
      description: "Steps: open chapter 3.4 at 1280px.",
      closingNotes: null,
      updatedAt: Date.parse("2026-08-02T10:00:00Z"),
      hasImage: false,
      pagePath: null,
      appVersion: null,
    });

    render(<ReportBugModal onClose={vi.fn()} />);
    expect(await screen.findByText("Updated since you last opened it")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sidebar overlaps the diagram/ }));
    await screen.findByText("Steps: open chapter 3.4 at 1280px.");
    await waitFor(() => expect(markBugSeen).toHaveBeenCalledWith("bug-1"));

    // Back on the list, the marker is gone without a refetch - the modal
    // patched the row it already had.
    fireEvent.click(screen.getByRole("button", { name: "All reports" }));
    await screen.findByText("Sidebar overlaps the diagram");
    expect(screen.queryByText("Updated since you last opened it")).not.toBeInTheDocument();
    expect(fetchBugs).toHaveBeenCalledTimes(1);
  });

  it("does not acknowledge a report whose status the reporter has already seen", async () => {
    fetchBugs.mockResolvedValue([bug()]);
    fetchBug.mockResolvedValue({
      ...bug(),
      description: "Steps: open chapter 3.4 at 1280px.",
      closingNotes: null,
      updatedAt: Date.parse("2026-08-01T10:00:00Z"),
      hasImage: false,
      pagePath: null,
      appVersion: null,
    });

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Sidebar overlaps the diagram/ }));
    await screen.findByText("Steps: open chapter 3.4 at 1280px.");

    expect(markBugSeen).not.toHaveBeenCalled();
  });

  it("keeps a half-written report when the modal is closed, and reopens straight into it", async () => {
    fetchBugs.mockResolvedValue([]);
    const { unmount } = render(<ReportBugModal onClose={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Canvas drops the node" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Dragging from the palette onto an edge loses it." },
    });

    // Closing to go take the screenshot - the case that used to cost the
    // whole report.
    unmount();
    render(<ReportBugModal onClose={vi.fn()} />);

    expect(await screen.findByLabelText("Title")).toHaveValue("Canvas drops the node");
    expect(screen.getByLabelText("Description")).toHaveValue("Dragging from the palette onto an edge loses it.");
    expect(screen.getByRole("status")).toHaveTextContent("Restored the report you had not sent yet.");
  });

  it("drops the draft once the report is filed", async () => {
    fetchBugs.mockResolvedValue([]);
    createBug.mockResolvedValue(bug({ id: "bug-new", title: "Filed" }));

    const { unmount } = render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Filed" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Submitted for real." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));
    await screen.findByText("Filed");

    unmount();
    render(<ReportBugModal onClose={vi.fn()} />);
    // Back to the list, not a form pre-filled with the report already sent.
    expect(await screen.findByText("No bugs reported yet")).toBeInTheDocument();
  });

  it("drops the draft when the form is cancelled, since that is the explicit 'not filing this'", async () => {
    fetchBugs.mockResolvedValue([]);
    const { unmount } = render(<ReportBugModal onClose={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Never mind" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    unmount();
    render(<ReportBugModal onClose={vi.fn()} />);
    expect(await screen.findByText("No bugs reported yet")).toBeInTheDocument();
  });

  it("empties the form on Discard without closing it", async () => {
    fetchBugs.mockResolvedValue([]);
    const { unmount } = render(<ReportBugModal onClose={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Report a bug" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Restore me" } });
    unmount();

    render(<ReportBugModal onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));

    expect(screen.getByLabelText("Title")).toHaveValue("");
    // Still on the form - Discard clears the report, it does not walk away
    // from writing one.
    expect(screen.getByRole("button", { name: "Submit report" })).toBeInTheDocument();
    expect(screen.queryByText("Restored the report you had not sent yet.")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    fetchBugs.mockResolvedValue([]);
    render(<ReportBugModal onClose={onClose} />);
    await screen.findByText("No bugs reported yet");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invites a signed-out visitor to sign in instead of requesting bugs", async () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<ReportBugModal onClose={vi.fn()} />);

    expect(await screen.findByText("Sign in to report a bug")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Fbuilding-blocks",
    );
    expect(fetchBugs).not.toHaveBeenCalled();
  });
});
