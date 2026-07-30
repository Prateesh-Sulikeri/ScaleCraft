import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { useCurriculumProgressStore } from "./progress-store";
import { db } from "@/persistence/db";

// A plain global singleton (same convention as custom-components-store.ts)
// backed by the shared Dexie db — reset both the in-memory store and the
// underlying tables between tests so they can't leak into one another.
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

describe("curriculum progress store", () => {
  it("hydrate() reads both Dexie tables into memory", async () => {
    await db.chapterProgress.put({ chapterId: "bb-dummy-1", completedAt: Date.now(), matchedBlueprintId: null });
    await db.curriculumProgress.put({
      slug: "1-2-load-balancing",
      manuallyCompletedAt: null,
      lastVisitedAt: Date.now(),
    });

    await useCurriculumProgressStore.getState().hydrate();

    const state = useCurriculumProgressStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.validationPassedDefinitionIds.has("bb-dummy-1")).toBe(true);
    expect(state.rowsBySlug.get("1-2-load-balancing")?.lastVisitedAt).toBeTypeOf("number");
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
  });
});
