import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ChapterRow } from "./ChapterRow";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";
import type { CurriculumChapter } from "@/curriculum/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/building-blocks",
}));

function entry(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "1-2-load-balancing",
    number: "1.2",
    title: "Load Balancing",
    kind: "chapter",
    chapterDefinitionId: "bb-dummy-1",
    estimatedMinutes: 35,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    domain: null,
    ...overrides,
  };
}

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
  });
  await db.curriculumProgress.clear();
});

describe("ChapterRow", () => {
  it("renders an authored chapter as a real link to its lesson (Chapter Reader) route", () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/building-blocks/1-2-load-balancing/lesson");
  });

  it("renders a domain chip for RWE entries, and nothing for entries with no domain", () => {
    const { rerender } = render(
      <ChapterRow
        entry={entry({ domain: "Messaging" })}
        courseId="building-blocks"
        status="NOT_STARTED"
        completedByValidation={false}
      />,
    );
    expect(screen.getByText("Messaging")).toBeInTheDocument();

    rerender(
      <ChapterRow entry={entry({ domain: null })} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />,
    );
    expect(screen.queryByText("Messaging")).not.toBeInTheDocument();
  });

  it("renders an unauthored chapter as a non-interactive row with a chip, not a link", () => {
    render(
      <ChapterRow
        entry={entry({ chapterDefinitionId: null })}
        courseId="building-blocks"
        status="NOT_STARTED"
        completedByValidation={false}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("the manual toggle sits outside the link and does not navigate when clicked", async () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);

    const toggle = screen.getByRole("button", { name: "Mark Load Balancing complete" });
    expect(screen.getByRole("link")).not.toContainElement(toggle);

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(
        useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt,
      ).toBeTypeOf("number"),
    );
  });

  it("resets the chapter's progress (manual flag + validation-pass record) when completed by validation", async () => {
    useCurriculumProgressStore.setState({
      validationPassedDefinitionIds: new Set(["bb-dummy-1"]),
    });
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="COMPLETED" completedByValidation={true} />);
    const toggle = screen.getByRole("button", { name: "Reset Load Balancing progress" });
    expect(toggle).not.toBeDisabled();
    expect(toggle).toHaveAttribute("title", "Completed by validation - click to reset and redo this chapter");

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(useCurriculumProgressStore.getState().validationPassedDefinitionIds.has("bb-dummy-1")).toBe(false);
      expect(
        useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt,
      ).toBeNull();
    });
  });

  it("renders a checkpoint's R-number in a bordered chip and its title in bold, unlike a regular chapter", () => {
    render(
      <ChapterRow
        entry={entry({ slug: "checkpoint-r1-a-site-that-stays-up", number: "R1", title: "Checkpoint · A Site That Stays Up", kind: "checkpoint" })}
        courseId="building-blocks"
        status="NOT_STARTED"
        completedByValidation={false}
      />,
    );
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("Checkpoint · A Site That Stays Up")).toHaveClass("font-semibold");
  });

  it("leaves the toggle enabled when COMPLETED came from a manual override, not validation", async () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="COMPLETED" completedByValidation={false} />);
    const toggle = screen.getByRole("button", { name: "Mark Load Balancing incomplete" });
    expect(toggle).not.toBeDisabled();

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt).toBeNull(),
    );
  });

  // Release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) - this row now lives
  // on a public page. Signed out, the toggle must show AuthPromptDialog and
  // only send the visitor to sign-in once confirmed, never writing progress
  // beforehand (11.5's "gate at the action").
  describe("signed out", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    });

    afterEach(() => {
      vi.mocked(useAuth).mockReset();
      vi.mocked(useClerk).mockReset();
    });

    it("shows the auth prompt dialog instead of redirecting immediately when the toggle is clicked", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Mark Load Balancing complete" }));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(redirectToSignIn).not.toHaveBeenCalled();
      expect(useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")).toBeUndefined();
    });

    it("redirects to sign-in and never writes progress once the dialog is confirmed", async () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Mark Load Balancing complete" }));
      fireEvent.click(screen.getByRole("button", { name: "Sign in / sign up" }));

      expect(redirectToSignIn).toHaveBeenCalledOnce();
      expect(useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")).toBeUndefined();
    });

    it("dismissing the dialog never redirects and never writes progress", () => {
      const redirectToSignIn = vi.fn();
      vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

      render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Mark Load Balancing complete" }));
      fireEvent.click(screen.getByRole("button", { name: "Not now" }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(redirectToSignIn).not.toHaveBeenCalled();
      expect(useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")).toBeUndefined();
    });
  });
});
