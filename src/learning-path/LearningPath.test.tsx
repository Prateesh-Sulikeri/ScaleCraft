import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { LearningPath } from "./LearningPath";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";
import { getCourse } from "@/curriculum";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/building-blocks",
}));

// The reset flow pushes a streak snapshot before deleting anything, and real
// fetch() has no server here. `resetPushImpl` is swappable so one case can
// prove a failed snapshot is surfaced rather than silently swallowed.
let resetPushImpl: (days: readonly number[]) => Promise<number[] | null> = async (days) => [...days];
vi.mock("@/persistence/streak-days", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/persistence/streak-days")>();
  return {
    ...actual,
    fetchStreakDays: () => Promise.resolve([]),
    pushStreakDays: (days: readonly number[]) => resetPushImpl(days),
  };
});

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
  });
  await db.curriculumProgress.clear();
  await db.chapterProgress.clear();
});

describe("LearningPath", () => {
  it("renders Building Blocks' 10 sections and all 40 chapter rows", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeInTheDocument();

    const sectionToggles = screen.getAllByRole("button", { name: /^(part|group) /i });
    expect(sectionToggles).toHaveLength(10);

    // Every section defaults expanded (D5) — every chapter's status icon is
    // present, one per curriculum entry (40 for BB, after Release 6.1.0-alpha
    // Phase 10 condensed Part 1 from 11 chapters to 4: 47 - 11 + 4 = 40).
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(40);
  });

  it("renders Real World Extraction's 5 sections and all 32 chapter rows", () => {
    render(<LearningPath courseId="real-world-extraction" />);
    expect(screen.getByRole("heading", { level: 1, name: "Real World Extraction" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^tier /i })).toHaveLength(5);
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(32);
  });

  it("the authored Load Balancer row is a real link to its lesson (Chapter Reader) route; an unauthored row is not", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /load balancer/i })).toHaveAttribute(
      "href",
      "/building-blocks/3-4-load-balancer/lesson",
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });

  it("includes a working Download Curriculum link", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /download curriculum/i })).toHaveAttribute(
      "href",
      "/docs/The_Crafters_Guide_to_System_Design.pdf",
    );
  });

  it("'Collapse all' collapses every section and flips to 'Expand all'; clicking again restores them", () => {
    render(<LearningPath courseId="building-blocks" />);
    const toggleAll = screen.getByRole("button", { name: /collapse all/i });

    fireEvent.click(toggleAll);
    expect(screen.getAllByRole("button", { name: /^(part|group) /i }).every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
    expect(screen.getByRole("button", { name: /expand all/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /expand all/i }));
    expect(screen.getAllByRole("button", { name: /^(part|group) /i }).every((b) => b.getAttribute("aria-expanded") === "true")).toBe(true);
  });

  it("search filters chapter rows by title, hiding sections with no match", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "load balancer" },
    });

    expect(screen.getByText("Load Balancer")).toBeInTheDocument();
    expect(screen.queryByText("Vertical vs. Horizontal Scaling")).not.toBeInTheDocument();
  });

  it("search matches on completion status", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "not started" },
    });

    expect(screen.getAllByRole("img", { name: /not started/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("img", { name: /^completed$/i })).toHaveLength(0);
  });

  it("shows a no-results message when nothing matches", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "zzz-no-such-chapter" },
    });

    expect(screen.getByText(/no chapters match/i)).toBeInTheDocument();
  });

  it("search matches a section's own title/label, showing all of that section's chapters", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "foundations" },
    });

    // getAllByText: the first unfinished chapter also appears in the Up next
    // card, which sits outside the filtered curriculum and does not move.
    expect(screen.getAllByText("Welcome to ScaleCraft").length).toBeGreaterThan(0);
    expect(screen.getByText("What is System Design?")).toBeInTheDocument();
  });

  it("toggling a single section collapses just that section, independent of the others", () => {
    render(<LearningPath courseId="building-blocks" />);
    const toggles = screen.getAllByRole("button", { name: /^(part|group) /i });
    const first = toggles[0];
    const second = toggles[1];

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("the status filter narrows the curriculum, and composes with the search box", () => {
    render(<LearningPath courseId="building-blocks" />);

    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    // Nothing is completed in a clean store, so every section filters out.
    expect(screen.getByText(/no chapters match/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Not started" }));
    expect(screen.getAllByRole("img", { name: /not started/i })).toHaveLength(40);

    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "load balancer" },
    });
    expect(screen.getAllByRole("img", { name: /not started/i })).toHaveLength(1);
  });

  it("the Up next card links to the first unfinished authored chapter's lesson, the same route its row uses", () => {
    render(<LearningPath courseId="building-blocks" />);

    // The card and the chapter's own row are the only two links to it, and
    // they must point at the identical route - the card is not a second
    // navigation mechanism.
    const links = screen.getAllByRole("link", { name: /welcome to scalecraft/i });
    expect(links).toHaveLength(2);
    expect(screen.getByRole("link", { name: /^up next:/i })).toHaveAttribute(
      "href",
      links.find((l) => !/^up next:/i.test(l.getAttribute("aria-label") ?? ""))?.getAttribute("href") ?? "",
    );
  });

  it("shows a 'Scroll to top' button once scrolled past the threshold, which scrolls the pane back to 0", () => {
    const { container } = render(<LearningPath courseId="building-blocks" />);
    const scrollPane = container.querySelector(".overflow-y-auto")!;
    const scrollTo = vi.fn();
    Object.defineProperty(scrollPane, "scrollTop", { value: 500, configurable: true });
    // jsdom doesn't implement Element.scrollTo.
    (scrollPane as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo;

    fireEvent.scroll(scrollPane);
    const scrollTopBtn = screen.getByRole("button", { name: "Scroll to top" });
    expect(scrollTopBtn).toBeInTheDocument();

    fireEvent.click(scrollTopBtn);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    Object.defineProperty(scrollPane, "scrollTop", { value: 0, configurable: true });
    fireEvent.scroll(scrollPane);
    expect(screen.queryByRole("button", { name: "Scroll to top" })).not.toBeInTheDocument();
  });
});

describe("LearningPath reset progress", () => {
  const course = getCourse("building-blocks");
  const firstSlug = course.sections[0].chapters[0].slug;

  const openDialog = () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.click(screen.getByRole("button", { name: /^reset progress$/i }));
  };

  const advanceToConfirm = () => {
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /reset anyway/i }));
  };

  beforeEach(async () => {
    resetPushImpl = async (days) => [...days];
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
    useCurriculumProgressStore.setState({
      hydrated: true,
      hydrating: false,
      validationPassedDefinitionIds: new Set(),
      rowsBySlug: new Map(),
      examAttemptsByDefinition: new Map(),
      activeDays: [],
      activeDaysLoaded: true,
    });
    await db.examAttempts.clear();
    await db.activeDays.clear();
  });

  it("sits with the page controls, next to the collapse toggle", () => {
    render(<LearningPath courseId="building-blocks" />);
    const reset = screen.getByRole("button", { name: /^reset progress$/i });
    const collapse = screen.getByRole("button", { name: /^(collapse|expand) all$/i });
    // Same control row - if the reset ever drifts into the rail or a card,
    // this is what catches it.
    expect(reset.parentElement).toBe(collapse.parentElement);
  });

  it("is hidden from signed-out visitors, who have no progress to reset", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.queryByRole("button", { name: /^reset progress$/i })).not.toBeInTheDocument();
  });

  it("does not reset on the first click - it warns first", () => {
    openDialog();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset anyway/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not now/i })).toBeInTheDocument();
    // The type-to-confirm gate belongs to the second stage.
    expect(screen.queryByLabelText(/type reset progress to confirm/i)).not.toBeInTheDocument();
  });

  it("says the streak is kept before the learner commits", () => {
    openDialog();
    expect(screen.getByText(/day streak and longest streak/i)).toBeInTheDocument();
  });

  it("closes without resetting on 'Not now'", () => {
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: /not now/i }));
    expect(screen.queryByText(/cannot be undone/i)).not.toBeInTheDocument();
  });

  it("gates the second stage behind typing the phrase", () => {
    advanceToConfirm();
    const confirm = screen.getByRole("button", { name: new RegExp(`reset ${course.title}`, "i") });
    const input = screen.getByLabelText(/type reset progress to confirm/i);

    expect(confirm).toBeDisabled();
    fireEvent.change(input, { target: { value: "reset" } });
    expect(confirm).toBeDisabled();
    fireEvent.change(input, { target: { value: "reset progress" } });
    expect(confirm).toBeEnabled();
  });

  it("accepts the phrase regardless of case and surrounding space", () => {
    advanceToConfirm();
    fireEvent.change(screen.getByLabelText(/type reset progress to confirm/i), {
      target: { value: "  Reset Progress  " },
    });
    expect(screen.getByRole("button", { name: new RegExp(`reset ${course.title}`, "i") })).toBeEnabled();
  });

  it("clears progress once confirmed", async () => {
    await db.curriculumProgress.put({
      slug: firstSlug,
      manuallyCompletedAt: Date.now(),
      lastVisitedAt: Date.now(),
      dirty: false,
      syncedAt: null,
    });
    await useCurriculumProgressStore.getState().refresh();

    advanceToConfirm();
    fireEvent.change(screen.getByLabelText(/type reset progress to confirm/i), {
      target: { value: "reset progress" },
    });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`reset ${course.title}`, "i") }));

    await waitFor(() => {
      expect(useCurriculumProgressStore.getState().rowsBySlug.get(firstSlug)?.manuallyCompletedAt).toBeNull();
    });
  });

  it("reports the failure instead of closing when the streak cannot be saved", async () => {
    // A day banked locally but never acknowledged by the server. That is the
    // only state a failed push can actually cost anything in: the local table
    // survives the wipe, but it is cleared on sign-out, so a day that never
    // reached Clerk dies with this browser.
    await db.activeDays.put({ day: 20_500, syncedAt: null });
    resetPushImpl = async () => null;

    advanceToConfirm();
    fireEvent.change(screen.getByLabelText(/type reset progress to confirm/i), {
      target: { value: "reset progress" },
    });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`reset ${course.title}`, "i") }));

    // Progress is untouched on this path, so saying so is the point - a
    // silent close would leave the learner unsure what landed.
    await waitFor(() => expect(screen.getByText("Nothing was reset")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("resets anyway when every day is already banked, since nothing is at risk", async () => {
    // The complement of the case above, and the common one: recordToday has
    // already pushed today, so a reset needs no write at all and a dead
    // network is no reason to block the learner.
    await db.activeDays.put({ day: 20_500, syncedAt: Date.now() });
    resetPushImpl = async () => null;

    advanceToConfirm();
    fireEvent.change(screen.getByLabelText(/type reset progress to confirm/i), {
      target: { value: "reset progress" },
    });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`reset ${course.title}`, "i") }));

    await waitFor(() => expect(screen.queryByText("Nothing was reset")).not.toBeInTheDocument());
  });
});
