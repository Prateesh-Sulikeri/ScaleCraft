import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCurriculumProgressStore } from "./progress-store";
import { chapterSaveId, db, SANDBOX_SAVE_ID, type CurriculumProgress, type ExamAttempt } from "@/persistence/db";
import type { SyncResult } from "@/persistence/cloud-sync";
import { allEntries, getCourse } from "./index";
import { localDayIndex } from "@/home/home-data";

// Lets one test control exactly when the reconcile pass's remote fetch
// resolves, so it can prove markVisited's Dexie write genuinely waits for
// it (ordering), not just that the two happen to race to the right answer.
// All three hydrateAll* calls are mocked, not just curriculum progress -
// real fetch() fails in this environment (no server), and since Phase 6
// (pending-6.1.0-poa.md) that correctly aborts reconciliation rather than
// silently treating a failed fetch as "the cloud has nothing" - leaving
// chapterProgress/examAttempts unmocked would make every test hit that
// abort branch instead of exercising the real merge path.
let hydrateAllCurriculumProgressImpl: () => Promise<SyncResult<CurriculumProgress[]>> = () =>
  Promise.resolve({ ok: true, data: [] });
vi.mock("@/persistence/cloud-sync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/persistence/cloud-sync")>();
  return {
    ...actual,
    hydrateAllCurriculumProgress: () => hydrateAllCurriculumProgressImpl(),
    hydrateAllChapterProgress: () => Promise.resolve({ ok: true, data: [] }),
    hydrateAllExamAttempts: () => Promise.resolve({ ok: true, data: [] }),
  };
});

// The streak snapshot talks to /api/streak-days (Clerk publicMetadata), so
// it needs mocking for the same reason the cloud-sync hydrators do: real
// fetch() fails here. `pushImpl` is swappable so one test can prove the
// reset *aborts* rather than wiping progress when the snapshot cannot be
// saved - the ordering guarantee the whole design rests on.
let pushedDays: number[] | null = null;
let pushImpl: (days: readonly number[]) => Promise<number[] | null> = async (days) => {
  pushedDays = [...days];
  return [...days];
};
vi.mock("@/persistence/streak-days", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/persistence/streak-days")>();
  return {
    ...actual,
    fetchPreservedStreakDays: () => Promise.resolve([]),
    pushPreservedStreakDays: (days: readonly number[]) => pushImpl(days),
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
    preservedStreakDays: [],
  });
  await db.curriculumProgress.clear();
  await db.chapterProgress.clear();
  await db.examAttempts.clear();
  await db.saves.clear();
  await db.deepCheckSessions.clear();
  hydrateAllCurriculumProgressImpl = () => Promise.resolve({ ok: true, data: [] });
  pushedDays = null;
  pushImpl = async (days) => {
    pushedDays = [...days];
    return [...days];
  };
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

  // Phase 6, pending-6.1.0-poa.md - fixes audit S5: a failed remote fetch
  // must never be treated as "the server has nothing." Before this, getSync
  // collapsed a network error and a genuinely empty table into the same
  // `[]`, so a transient failure looked identical to "reconciled, nothing
  // there" - hydrated got set true anyway and never retried.
  it("hydrate() aborts without marking hydrated when a remote fetch fails, preserving local data", async () => {
    const completedAt = Date.now() - 100_000;
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: completedAt,
      lastVisitedAt: Date.now(),
      dirty: false,
      syncedAt: Date.now(),
    });
    hydrateAllCurriculumProgressImpl = () => Promise.resolve({ ok: false });

    await useCurriculumProgressStore.getState().hydrate();

    const state = useCurriculumProgressStore.getState();
    expect(state.hydrated).toBe(false);
    expect(state.rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt).toBe(completedAt);

    // A later call, once the network recovers, retries for real instead of
    // being stuck behind the earlier failure.
    hydrateAllCurriculumProgressImpl = () => Promise.resolve({ ok: true, data: [] });
    await useCurriculumProgressStore.getState().hydrate();
    expect(useCurriculumProgressStore.getState().hydrated).toBe(true);
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

    let releaseFetch: ((result: SyncResult<CurriculumProgress[]>) => void) | undefined;
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
    releaseFetch({
      ok: true,
      data: [
        { slug: "other-chapter", manuallyCompletedAt: null, lastVisitedAt: Date.now(), dirty: false, syncedAt: Date.now() },
      ],
    });
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

  it("refresh() reconciles again even when the store is already hydrated", async () => {
    await useCurriculumProgressStore.getState().hydrate();
    expect(useCurriculumProgressStore.getState().rowsBySlug.size).toBe(0);

    // Another device completes a chapter after this tab already hydrated.
    hydrateAllCurriculumProgressImpl = () =>
      Promise.resolve({
        ok: true,
        data: [
          {
            slug: "1-2-load-balancing",
            manuallyCompletedAt: Date.now(),
            lastVisitedAt: null,
            dirty: false,
            syncedAt: Date.now(),
          },
        ],
      });

    await useCurriculumProgressStore.getState().hydrate();
    expect(
      useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing"),
      "hydrate() is the ensure-once path and must stay a no-op",
    ).toBeUndefined();

    await useCurriculumProgressStore.getState().refresh();
    expect(
      useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt,
    ).not.toBeNull();
  });

  it("markVisited pulls the newest remote row before composing its write", async () => {
    // This tab hydrated when the chapter was not complete...
    await useCurriculumProgressStore.getState().hydrate();

    // ...another device then completed it. Without a forced reconcile,
    // markVisited would compose its full-row payload from the stale local
    // copy and push manuallyCompletedAt: null, erasing that completion.
    const completedAt = Date.now();
    hydrateAllCurriculumProgressImpl = () =>
      Promise.resolve({
        ok: true,
        data: [
          {
            slug: "1-2-load-balancing",
            manuallyCompletedAt: completedAt,
            lastVisitedAt: null,
            dirty: false,
            syncedAt: Date.now(),
          },
        ],
      });

    await useCurriculumProgressStore.getState().markVisited("1-2-load-balancing");

    const row = await db.curriculumProgress.get("1-2-load-balancing");
    expect(row?.manuallyCompletedAt).toBe(completedAt);
    expect(row?.lastVisitedAt).not.toBeNull();
  });

  // Close-out P1.1 - sign-out has to clear the singleton in memory, not just
  // Dexie, or the previous account's rows keep rendering on the now-public
  // Home canvas until a hard reload.
  it("reset() clears an already-hydrated store back to its unhydrated shape", async () => {
    hydrateAllCurriculumProgressImpl = () =>
      Promise.resolve({
        ok: true,
        data: [
          {
            slug: "1-2-load-balancing",
            manuallyCompletedAt: Date.now(),
            lastVisitedAt: null,
            dirty: false,
            syncedAt: Date.now(),
          },
        ],
      });
    await useCurriculumProgressStore.getState().hydrate();
    expect(useCurriculumProgressStore.getState().rowsBySlug.has("1-2-load-balancing")).toBe(true);

    useCurriculumProgressStore.getState().reset();

    const state = useCurriculumProgressStore.getState();
    expect(state.hydrated).toBe(false);
    expect(state.hydrating).toBe(false);
    expect(state.rowsBySlug.size).toBe(0);
    expect(state.validationPassedDefinitionIds.size).toBe(0);
    expect(state.examAttemptsByDefinition.size).toBe(0);
  });
});

describe("resetCourse", () => {
  // A slug that really exists in the manifest, so the test exercises the same
  // lookup the dialog does rather than a fixture the code path never sees.
  const bbEntries = allEntries(getCourse("building-blocks"));
  const bbSlugs = bbEntries.map((e) => e.slug);
  const rweSlugs = allEntries(getCourse("real-world-extraction")).map((e) => e.slug);
  // A real authored chapter's definition id - resetCourse only deletes ids
  // the manifest actually lists, so a made-up one would silently survive and
  // the assertion would be testing nothing.
  const bbDefinitionId = bbEntries.find((e) => e.chapterDefinitionId != null)!.chapterDefinitionId!;

  const seedVisited = async (slug: string, at: number) =>
    db.curriculumProgress.put({
      slug,
      manuallyCompletedAt: null,
      lastVisitedAt: at,
      dirty: false,
      syncedAt: null,
    });

  it("wipes the named course back to NOT_STARTED", async () => {
    const slug = bbSlugs[0];
    await seedVisited(slug, Date.now());
    await db.chapterProgress.put({
      chapterId: bbDefinitionId,
      completedAt: Date.now(),
      matchedBlueprintId: null,
      dirty: false,
      syncedAt: null,
    });
    await db.examAttempts.put(attempt({ chapterDefinitionId: bbDefinitionId }));

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    const row = useCurriculumProgressStore.getState().rowsBySlug.get(slug);
    expect(row?.lastVisitedAt).toBeNull();
    expect(row?.manuallyCompletedAt).toBeNull();
    // Nulled rather than deleted - /api/sync/curriculum-progress has no
    // DELETE, and a deleted local row would just be pulled back.
    expect(await db.curriculumProgress.get(slug)).toBeTruthy();
    expect(await db.chapterProgress.count()).toBe(0);
    expect(await db.examAttempts.count()).toBe(0);
  });

  it("leaves the other course untouched", async () => {
    const bb = bbSlugs[0];
    const rwe = rweSlugs[0];
    const rweVisitedAt = Date.now();
    await seedVisited(bb, Date.now());
    await seedVisited(rwe, rweVisitedAt);

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    expect(useCurriculumProgressStore.getState().rowsBySlug.get(bb)?.lastVisitedAt).toBeNull();
    expect(useCurriculumProgressStore.getState().rowsBySlug.get(rwe)?.lastVisitedAt).toBe(rweVisitedAt);
  });

  it("preserves the streak days of the wiped activity", async () => {
    const day = 20_500;
    const at = day * 86_400_000 + 12 * 3_600_000; // midday, so no timezone edge
    await seedVisited(bbSlugs[0], at);

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    // The timestamp is gone, but the day it fell on survived the wipe -
    // which is the entire point of the snapshot.
    expect(useCurriculumProgressStore.getState().rowsBySlug.get(bbSlugs[0])?.lastVisitedAt).toBeNull();
    expect(pushedDays).toContain(localDayIndex(at));
    expect(useCurriculumProgressStore.getState().preservedStreakDays).toContain(localDayIndex(at));
  });

  it("snapshots days from BOTH courses, so resetting the second cannot drop the first's", async () => {
    const bbAt = 20_500 * 86_400_000 + 12 * 3_600_000;
    const rweAt = 20_501 * 86_400_000 + 12 * 3_600_000;
    await seedVisited(bbSlugs[0], bbAt);
    await seedVisited(rweSlugs[0], rweAt);

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    expect(pushedDays).toEqual(
      expect.arrayContaining([localDayIndex(bbAt), localDayIndex(rweAt)]),
    );
  });

  it("aborts without deleting anything when the streak cannot be saved", async () => {
    const slug = bbSlugs[0];
    const visitedAt = Date.now();
    await seedVisited(slug, visitedAt);
    await db.examAttempts.put(attempt({ chapterDefinitionId: bbDefinitionId }));
    pushImpl = async () => null; // network failure

    await expect(useCurriculumProgressStore.getState().resetCourse("building-blocks")).rejects.toThrow();

    // Progress intact. Losing the streak is worse than a reset the learner
    // can simply retry, so the wipe must not proceed past a failed snapshot.
    expect((await db.curriculumProgress.get(slug))?.lastVisitedAt).toBe(visitedAt);
    expect(await db.examAttempts.count()).toBe(1);
  });

  it("deletes the saved canvas for each of the course's chapters", async () => {
    const saveId = chapterSaveId(bbDefinitionId);
    await db.saves.put({ id: saveId, updatedAt: Date.now(), nodes: [], edges: [], dirty: false, syncedAt: null });

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    // A save left behind would silently reload the old solution the next
    // time the Design Editor opened - the opposite of starting over.
    expect(await db.saves.get(saveId)).toBeUndefined();
  });

  it("deletes Deep Check sessions belonging to those saves", async () => {
    const saveId = chapterSaveId(bbDefinitionId);
    await db.deepCheckSessions.put({
      syncId: "sync-1",
      saveId,
      createdAt: Date.now(),
      critique: {} as never,
      dirty: false,
      syncedAt: null,
    });

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    // Critiques of a graph that no longer exists are orphans.
    expect(await db.deepCheckSessions.where("saveId").equals(saveId).count()).toBe(0);
  });

  it("leaves the Sandbox canvas alone - it belongs to no course", async () => {
    await db.saves.put({
      id: SANDBOX_SAVE_ID,
      updatedAt: Date.now(),
      nodes: [],
      edges: [],
      dirty: false,
      syncedAt: null,
    });

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    expect(await db.saves.get(SANDBOX_SAVE_ID)).toBeTruthy();
  });

  it("leaves the other course's saved canvases alone", async () => {
    const rweDefinitionId = allEntries(getCourse("real-world-extraction")).find(
      (e) => e.chapterDefinitionId != null,
    )!.chapterDefinitionId!;
    const rweSaveId = chapterSaveId(rweDefinitionId);
    await db.saves.put({ id: rweSaveId, updatedAt: Date.now(), nodes: [], edges: [], dirty: false, syncedAt: null });

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    expect(await db.saves.get(rweSaveId)).toBeTruthy();
  });

  it("merges the server's day set back in, picking up another device's reset", async () => {
    const at = 20_500 * 86_400_000 + 12 * 3_600_000;
    await seedVisited(bbSlugs[0], at);
    pushImpl = async (days) => [...days, 19_000]; // a day only the server knew

    await useCurriculumProgressStore.getState().resetCourse("building-blocks");

    expect(useCurriculumProgressStore.getState().preservedStreakDays).toContain(19_000);
  });
});
