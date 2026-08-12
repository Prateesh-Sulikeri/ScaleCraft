import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCurriculumProgressStore } from "./progress-store";
import { db, type CurriculumProgress, type ExamAttempt } from "@/persistence/db";

// Lets one test control exactly when the reconcile pass's remote fetch
// resolves, so it can prove markVisited's Dexie write genuinely waits for
// it (ordering), not just that the two happen to race to the right answer.
// Every other test gets the same "empty remote" behavior real fetch() falls
// back to in this environment (no server, caught in cloud-sync.ts's getSync)
// - this is a controllable stand-in for that, not a behavior change.
let hydrateAllCurriculumProgressImpl: () => Promise<CurriculumProgress[]> = () => Promise.resolve([]);
vi.mock("@/persistence/cloud-sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/persistence/cloud-sync")>();
  return {
    ...actual,
    hydrateAllCurriculumProgress: () => hydrateAllCurriculumProgressImpl(),
  };
});

function attempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    chapterDefinitionId: "bb-dummy-1",
    attemptNumber: 1,
    submittedAt: Date.now(),
    score: 100,
    answers: [{ questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true }],
    dirty: false,
    syncedAt: null,
    ...overrides,
  };
}

// A plain global singleton (same convention as custom-components-store.ts)
// backed by the shared Dexie db — reset both the in-memory store and the
// underlying tables between tests so they can't leak into one another.
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
  hydrateAllCurriculumProgressImpl = () => Promise.resolve([]);
});

describe("curriculum progress store", () => {
  it("hydrate() reads all three Dexie tables into memory", async () => {
    await db.chapterProgress.put({ chapterId: "bb-dummy-1", completedAt: Date.now(), matchedBlueprintId: null, dirty: false, syncedAt: null });
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: null,
      lastVisitedAt: Date.now(),
      dirty: false,
      syncedAt: null,
    });
    const seeded = attempt();
    await db.examAttempts.put(seeded);

    await useCurriculumProgressStore.getState().hydrate();

    const state = useCurriculumProgressStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.validationPassedDefinitionIds.has("bb-dummy-1")).toBe(true);
    expect(state.rowsBySlug.get("1-2-load-balancing")?.lastVisitedAt).toBeTypeOf("number");
    expect(state.examAttemptsByDefinition.get("bb-dummy-1")).toEqual([seeded]);
  });

  it("hydrate() is idempotent — a second call does not re-read or clear state", async () => {
    await useCurriculumProgressStore.getState().hydrate();
    await db.chapterProgress.put({ chapterId: "late-write", completedAt: Date.now(), matchedBlueprintId: null, dirty: false, syncedAt: null });

    await useCurriculumProgressStore.getState().hydrate();

    // Second call bailed (already hydrated), so the late Dexie write never
    // made it into memory.
    expect(useCurriculumProgressStore.getState().validationPassedDefinitionIds.has("late-write")).toBe(false);
  });

  it("markVisited writes lastVisitedAt to Dexie and memory, preserving an existing manuallyCompletedAt", async () => {
    const slug = "0-1-client-server-database";
    await useCurriculumProgressStore.getState().setManualComplete(slug, true);

    await useCurriculumProgressStore.getState().markVisited(slug);

    const row = useCurriculumProgressStore.getState().rowsBySlug.get(slug);
    expect(row?.lastVisitedAt).toBeTypeOf("number");
    expect(row?.manuallyCompletedAt).toBeTypeOf("number");

    const persisted = await db.curriculumProgress.get(slug);
    expect(persisted).toEqual(row);
  });

  it("setManualComplete(true) then (false) round-trips through Dexie and clears to null", async () => {
    const slug = "checkpoint-r1-a-site-that-stays-up";

    await useCurriculumProgressStore.getState().setManualComplete(slug, true);
    expect(useCurriculumProgressStore.getState().rowsBySlug.get(slug)?.manuallyCompletedAt).toBeTypeOf("number");
    expect((await db.curriculumProgress.get(slug))?.manuallyCompletedAt).toBeTypeOf("number");

    await useCurriculumProgressStore.getState().setManualComplete(slug, false);
    expect(useCurriculumProgressStore.getState().rowsBySlug.get(slug)?.manuallyCompletedAt).toBeNull();
    expect((await db.curriculumProgress.get(slug))?.manuallyCompletedAt).toBeNull();
  });

  it("recordValidationPass updates only in-memory state (chapterProgress.put stays the caller's job)", async () => {
    useCurriculumProgressStore.getState().recordValidationPass("bb-dummy-1");

    expect(useCurriculumProgressStore.getState().validationPassedDefinitionIds.has("bb-dummy-1")).toBe(true);
    expect(await db.chapterProgress.get("bb-dummy-1")).toBeUndefined();
  });

  it("inputs() returns the current sets/maps in ProgressInputs shape", () => {
    useCurriculumProgressStore.getState().recordValidationPass("bb-dummy-1");
    const inputs = useCurriculumProgressStore.getState().inputs();
    expect(inputs.validationPassedDefinitionIds.has("bb-dummy-1")).toBe(true);
    expect(inputs.rowsBySlug).toBeInstanceOf(Map);
    expect(inputs.examAttemptsByDefinition).toBeInstanceOf(Map);
  });

  it("recordExamAttempt writes to Dexie and memory, keyed by [chapterDefinitionId+attemptNumber]", async () => {
    const seeded = attempt();
    await useCurriculumProgressStore.getState().recordExamAttempt(seeded);

    expect(useCurriculumProgressStore.getState().examAttemptsByDefinition.get("bb-dummy-1")).toEqual([seeded]);
    const persisted = await db.examAttempts.get(["bb-dummy-1", 1]);
    expect(persisted?.score).toBe(100);
  });

  it("recordExamAttempt for a second attempt number keeps the first attempt", async () => {
    await useCurriculumProgressStore.getState().recordExamAttempt(attempt({ attemptNumber: 1, score: 40 }));
    await useCurriculumProgressStore.getState().recordExamAttempt(attempt({ attemptNumber: 2, score: 90 }));

    const attempts = useCurriculumProgressStore.getState().examAttemptsByDefinition.get("bb-dummy-1");
    expect(attempts?.map((a) => a.attemptNumber)).toEqual([1, 2]);
  });

  it("recordExamAttempt replaces an existing attempt with the same attemptNumber", async () => {
    await useCurriculumProgressStore.getState().recordExamAttempt(attempt({ attemptNumber: 1, score: 40 }));
    await useCurriculumProgressStore.getState().recordExamAttempt(attempt({ attemptNumber: 1, score: 90 }));

    const attempts = useCurriculumProgressStore.getState().examAttemptsByDefinition.get("bb-dummy-1");
    expect(attempts).toHaveLength(1);
    expect(attempts?.[0].score).toBe(90);
  });

  it("resetChapter deletes the chapter's examAttempts rows, in Dexie and memory", async () => {
    await useCurriculumProgressStore.getState().recordExamAttempt(attempt());
    useCurriculumProgressStore.getState().recordValidationPass("bb-dummy-1");

    await useCurriculumProgressStore.getState().resetChapter("1-2-load-balancing", "bb-dummy-1");

    expect(useCurriculumProgressStore.getState().examAttemptsByDefinition.get("bb-dummy-1")).toBeUndefined();
    expect(await db.examAttempts.get(["bb-dummy-1", 1])).toBeUndefined();
  });

  it("resetChapter with a null chapterDefinitionId does not touch examAttempts", async () => {
    const seeded = attempt();
    await useCurriculumProgressStore.getState().recordExamAttempt(seeded);

    await useCurriculumProgressStore.getState().resetChapter("some-slug", null);

    expect(useCurriculumProgressStore.getState().examAttemptsByDefinition.get("bb-dummy-1")).toEqual([seeded]);
  });

  // Regression: the mutators used to build their `put` payload from the
  // in-memory map, which is empty until hydrate() resolves. A hard load
  // straight onto /chapters/<slug> runs markVisited's effect before
  // hydrate's, so this wiped the completion locally and synced the null up.
  // See pending-persistence-audit.md S1.
  it("markVisited preserves manuallyCompletedAt when the store is not hydrated", async () => {
    const completedAt = Date.now() - 100_000;
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: completedAt,
      lastVisitedAt: null,
      dirty: false,
      syncedAt: null,
    });

    // beforeEach leaves the store unhydrated, which is the bug's precondition.
    await useCurriculumProgressStore.getState().markVisited("1-2-load-balancing");

    const row = await db.curriculumProgress.get("1-2-load-balancing");
    expect(row?.manuallyCompletedAt).toBe(completedAt);
    expect(row?.lastVisitedAt).not.toBeNull();
  });

  // Phase 3.3, pending-6.1.0-poa.md: "the single most important test in the
  // release" - proves the ready-promise gate is a real block on the
  // in-flight reconcile, not just a coincidence of both settling to the
  // right answer. A markVisited call fired while a slow remote fetch is
  // still in flight must not touch Dexie until that fetch (and the merge it
  // feeds) has actually finished - otherwise it's building its `put`
  // payload from a `existingRow` read that could race the reconcile's own
  // writeback, which is exactly how S1 happened the first time.
  it("markVisited's Dexie write waits for an in-flight reconcile to fully resolve before touching Dexie", async () => {
    const completedAt = Date.now() - 100_000;
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: completedAt,
      lastVisitedAt: null,
      dirty: false,
      syncedAt: null,
    });

    let releaseFetch: ((rows: CurriculumProgress[]) => void) | undefined;
    hydrateAllCurriculumProgressImpl = () =>
      new Promise((resolve) => {
        releaseFetch = resolve;
      });

    const putSpy = vi.spyOn(db.curriculumProgress, "put");
    const markVisitedPromise = useCurriculumProgressStore.getState().markVisited("1-2-load-balancing");

    // Wait until the reconcile pass has actually reached the remote fetch
    // (its local Dexie reads go through fake-indexeddb's real async layer,
    // not just microtasks, so this can take more than a couple of ticks) -
    // without letting that fetch resolve yet. If the gate isn't real, the
    // write already happened by the time we get here.
    while (!releaseFetch) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(putSpy).not.toHaveBeenCalled();

    // Remote comes back with a DIFFERENT row (another chapter, synced from
    // another device) - reconciling it must not disturb the row markVisited
    // is about to touch.
    releaseFetch([
      { slug: "other-chapter", manuallyCompletedAt: null, lastVisitedAt: Date.now(), dirty: false, syncedAt: Date.now() },
    ]);
    await markVisitedPromise;

    expect(putSpy).toHaveBeenCalledTimes(1);
    const row = await db.curriculumProgress.get("1-2-load-balancing");
    expect(row?.manuallyCompletedAt).toBe(completedAt);
    expect(row?.lastVisitedAt).not.toBeNull();
    expect((await db.curriculumProgress.get("other-chapter"))?.lastVisitedAt).not.toBeNull();

    putSpy.mockRestore();
  });

  it("setManualComplete preserves lastVisitedAt when the store is not hydrated", async () => {
    const lastVisitedAt = Date.now() - 100_000;
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: null,
      lastVisitedAt,
      dirty: false,
      syncedAt: null,
    });

    await useCurriculumProgressStore.getState().setManualComplete("1-2-load-balancing", true);

    const row = await db.curriculumProgress.get("1-2-load-balancing");
    expect(row?.lastVisitedAt).toBe(lastVisitedAt);
    expect(row?.manuallyCompletedAt).not.toBeNull();
  });
});
