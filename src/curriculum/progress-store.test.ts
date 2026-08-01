import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { useCurriculumProgressStore } from "./progress-store";
import { db, type ExamAttempt } from "@/persistence/db";

function attempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    chapterDefinitionId: "bb-dummy-1",
    attemptNumber: 1,
    submittedAt: Date.now(),
    score: 100,
    answers: [{ questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true }],
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
});

describe("curriculum progress store", () => {
  it("hydrate() reads all three Dexie tables into memory", async () => {
    await db.chapterProgress.put({ chapterId: "bb-dummy-1", completedAt: Date.now(), matchedBlueprintId: null });
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: null,
      lastVisitedAt: Date.now(),
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
    await db.chapterProgress.put({ chapterId: "late-write", completedAt: Date.now(), matchedBlueprintId: null });

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
});
