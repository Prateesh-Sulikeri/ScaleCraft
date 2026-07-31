import "fake-indexeddb/auto";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeCanvas } from "./HomeCanvas";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
    examAttemptsByDefinition: new Map(),
  });
  await db.curriculumProgress.clear();
  await db.chapterProgress.clear();
  await db.examAttempts.clear();
});

beforeAll(() => {
  // jsdom has no ResizeObserver, and @xyflow/react needs one to ever mark a
  // node "measured" (see nodeHasDimensions in @xyflow/system) — without it,
  // every node renders permanently `visibility: hidden` and its content is
  // invisible to accessible-role queries. The callback only needs `target`
  // (see useResizeObserver in @xyflow/react), so firing it synchronously on
  // observe() is enough to make nodes measured immediately, with no real
  // layout/resize behavior needed.
  class ResizeObserverStub {
    #callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.#callback = callback;
    }
    observe(target: Element) {
      const contentRect = target.getBoundingClientRect();
      this.#callback([{ target, contentRect } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverStub;

  // jsdom also has no DOMMatrixReadOnly, which @xyflow/system uses to read
  // the viewport's current zoom (`m22`) off its computed transform whenever
  // node internals update. This is a static, non-interactive canvas (no
  // pan/zoom controls are even enabled), so a fixed identity-ish matrix is
  // all any of these tests need.
  class DOMMatrixReadOnlyStub {
    m22 = 1;
  }
  // @ts-expect-error test polyfill
  global.DOMMatrixReadOnly = DOMMatrixReadOnlyStub;

  // jsdom does no real layout, so every element's offsetWidth/offsetHeight/
  // getBoundingClientRect report 0 — @xyflow/system's getDimensions() reads
  // offsetWidth/offsetHeight (see its `updateNodeInternals`) and only marks
  // a node measured once both are non-zero. Faking a fixed, non-zero box
  // for every element is the standard workaround for exercising react-flow
  // outside a real browser; the exact numbers don't matter here since
  // nothing in these tests asserts on pixel geometry.
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", { configurable: true, value: 260 });
  Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", { configurable: true, value: 150 });
  window.HTMLElement.prototype.getBoundingClientRect = () =>
    ({ width: 260, height: 150, top: 0, left: 0, right: 260, bottom: 150, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
});

describe("HomeCanvas", () => {
  it("renders the title and all three mode cards as one composition", async () => {
    render(<HomeCanvas />);
    expect(screen.getByText("ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText("Design real systems. Understand every trade-off.")).toBeInTheDocument();
    // react-flow only marks a node's accessible content visible once it's
    // been measured (async, via the ResizeObserver stub above) — findBy*
    // waits for that instead of assuming it's already flushed by render().
    expect(await screen.findByRole("link", { name: /Building Blocks/ })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Real World Extraction/ })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Sandbox/ })).toBeInTheDocument();
  });

  it("routes each mode card's link to its own route", async () => {
    render(<HomeCanvas />);
    expect(await screen.findByRole("link", { name: /Building Blocks/ })).toHaveAttribute(
      "href",
      "/building-blocks",
    );
    expect(await screen.findByRole("link", { name: /Real World Extraction/ })).toHaveAttribute(
      "href",
      "/real-world-extraction",
    );
    expect(await screen.findByRole("link", { name: /Sandbox/ })).toHaveAttribute("href", "/sandbox");
  });

  it("shows real per-course progress for Building Blocks/RWE, and none for Sandbox", async () => {
    render(<HomeCanvas />);
    // Default store state (before hydrate() resolves) is already the
    // correct "not started" shape — no separate loading state to wait out.
    expect(await screen.findByText("0 / 47 chapters")).toBeInTheDocument();
    expect(await screen.findByText("0 / 32 chapters")).toBeInTheDocument();
    expect(screen.queryByText(/^0 \/ 0 chapters/)).not.toBeInTheDocument();
  });

  it("reflects a completed chapter as real progress after hydrate resolves", async () => {
    await db.chapterProgress.put({ chapterId: "bb-dummy-1", completedAt: Date.now(), matchedBlueprintId: null });
    render(<HomeCanvas />);
    expect(await screen.findByText("1 / 47 chapters")).toBeInTheDocument();
    expect(await screen.findByText("in progress")).toBeInTheDocument();
  });
});
