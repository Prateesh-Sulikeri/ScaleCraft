import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { ReportBugButton } from "./ReportBugButton";
import { resetUnreadBugCount } from "./unread-badge-store";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const fetchUnreadBugCount = vi.fn<() => Promise<number>>();

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return { ...actual, fetchUnreadBugCount: () => fetchUnreadBugCount() };
});

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
  // The count lives in a module-level store, so it outlives a render tree and
  // would otherwise leak from one case into the next.
  resetUnreadBugCount();
  fetchUnreadBugCount.mockReset();
  fetchUnreadBugCount.mockResolvedValue(0);
});

describe("ReportBugButton", () => {
  it("renders icon-only, with the label carried by aria-label rather than visible text", () => {
    render(<ReportBugButton />);
    const button = screen.getByRole("button", { name: "Report a bug" });
    expect(button).toHaveTextContent("");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("shows the 'Report a bug' tooltip on hover, not a permanent label", () => {
    render(<ReportBugButton />);
    const button = screen.getByRole("button", { name: "Report a bug" });
    expect(screen.queryByText("Report a bug")).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);
    expect(screen.getByText("Report a bug")).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.queryByText("Report a bug")).not.toBeInTheDocument();
  });

  it("mounts nothing modal-shaped until it is clicked", () => {
    render(<ReportBugButton />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("badges the button with the number of reports whose status moved", async () => {
    fetchUnreadBugCount.mockResolvedValue(2);
    render(<ReportBugButton />);

    expect(await screen.findByText("2")).toBeInTheDocument();
    // The count is in the accessible name too - the badge itself is decorative
    // markup a screen reader would otherwise read as a bare digit.
    expect(screen.getByRole("button", { name: "Report a bug (2 updates)" })).toBeInTheDocument();
  });

  it("shows no badge at all when nothing has changed", async () => {
    render(<ReportBugButton />);
    await waitFor(() => expect(fetchUnreadBugCount).toHaveBeenCalled());

    // A zero badge is a notification that there are no notifications.
    expect(screen.getByRole("button", { name: "Report a bug" })).toHaveTextContent("");
  });

  it("caps the badge rather than letting a long number overflow the control", async () => {
    fetchUnreadBugCount.mockResolvedValue(24);
    render(<ReportBugButton />);

    expect(await screen.findByText("9+")).toBeInTheDocument();
  });

  it("does not check for updates while signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<ReportBugButton />);

    expect(fetchUnreadBugCount).not.toHaveBeenCalled();
  });
});
