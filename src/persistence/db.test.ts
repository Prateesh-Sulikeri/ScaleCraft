import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import {
  db,
  ScaleCraftDB,
  SANDBOX_SAVE_ID,
  reconcileLocalStateForUser,
  type CanvasSave,
  type ChapterProgress,
  type CurriculumProgress,
  type CustomComponentRow,
  type DeepCheckSession,
  type ExamAttempt,
} from "./db";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";

describe("persistence db", () => {
  it("round-trips a canvas save through IndexedDB", async () => {
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n1" }];
    const save: CanvasSave = { id: SANDBOX_SAVE_ID, updatedAt: Date.now(), nodes, edges, dirty: false, syncedAt: null };

    await db.saves.put(save);
    const restored = await db.saves.get(SANDBOX_SAVE_ID);

    expect(restored).toEqual(save);
  });

  it("round-trips a custom component record through IndexedDB (schema v2)", async () => {
    const record: CustomComponentRow = {
      id: "custom-1",
      category: "networking",
      label: "Rate Limiter",
      icon: "gauge",
      summary: "Throttles requests per client",
      docs: "Limits request rate per client to protect downstream services.",
      hasInput: true,
      hasOutput: true,
      fields: [
        { kind: "number", name: "requestsPerSecond", label: "Requests Per Second", default: 100, min: 1 },
        {
          kind: "enum",
          name: "strategy",
          label: "Strategy",
          default: "token-bucket",
          options: ["token-bucket", "sliding-window"],
        },
      ],
      dirty: false,
      syncedAt: null,
    };

    await db.customComponents.put(record);
    const restored = await db.customComponents.get("custom-1");

    expect(restored).toEqual(record);
  });

  it("round-trips a chapter progress record through IndexedDB (schema v3)", async () => {
    const progress: ChapterProgress = {
      chapterId: "ch-1",
      completedAt: Date.now(),
      matchedBlueprintId: "cache-aside",
      dirty: false,
      syncedAt: null,
    };

    await db.chapterProgress.put(progress);
    let restored = await db.chapterProgress.get("ch-1");
    expect(restored).toEqual(progress);

    const updated: ChapterProgress = { ...progress, completedAt: progress.completedAt + 1000 };
    await db.chapterProgress.put(updated);
    restored = await db.chapterProgress.get("ch-1");
    expect(restored).toEqual(updated);
  });

  it("round-trips a deepCheckSession through IndexedDB with an auto-assigned id (schema v5)", async () => {
    const session: DeepCheckSession = {
      syncId: "sync-1",
      saveId: SANDBOX_SAVE_ID,
      createdAt: Date.now(),
      critique: { summary: "s", sections: [], tradeoffs: [] },
      dirty: false,
      syncedAt: null,
    };

    const id = await db.deepCheckSessions.add(session);
    const restored = await db.deepCheckSessions.get(id);
    expect(restored).toEqual({ ...session, id });
  });

  it("round-trips an aiProfiles record and the aiActiveProfile pointer through IndexedDB (schema v6)", async () => {
    const profile = {
      id: "profile-1",
      name: "Work",
      providerId: "xai" as const,
      model: "grok-4",
      apiKey: "sk-test",
      depth: "deep" as const,
      tone: "encouraging" as const,
      level: "advanced" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.aiProfiles.put(profile);
    expect(await db.aiProfiles.get("profile-1")).toEqual(profile);

    await db.aiActiveProfile.put({ id: "default", profileId: profile.id });
    expect(await db.aiActiveProfile.get("default")).toEqual({ id: "default", profileId: profile.id });
  });

  it("round-trips a curriculumProgress record through IndexedDB (schema v7)", async () => {
    const progress: CurriculumProgress = {
      slug: "1-2-load-balancing",
      manuallyCompletedAt: null,
      lastVisitedAt: Date.now(),
      dirty: false,
      syncedAt: null,
    };

    await db.curriculumProgress.put(progress);
    let restored = await db.curriculumProgress.get("1-2-load-balancing");
    expect(restored).toEqual(progress);

    const updated: CurriculumProgress = { ...progress, manuallyCompletedAt: Date.now() };
    await db.curriculumProgress.put(updated);
    restored = await db.curriculumProgress.get("1-2-load-balancing");
    expect(restored).toEqual(updated);
  });

  it("round-trips an examAttempts record through IndexedDB keyed by the compound primary key (schema v9)", async () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "bb-dummy-1",
      attemptNumber: 1,
      submittedAt: Date.now(),
      score: 100,
      answers: [{ questionId: "q1", answer: { kind: "single", optionId: "a" }, correct: true }],
      dirty: false,
      syncedAt: null,
    };

    await db.examAttempts.put(attempt);
    const restored = await db.examAttempts.get(["bb-dummy-1", 1]);
    expect(restored).toEqual(attempt);

    const rowsForDefinition = await db.examAttempts.where("chapterDefinitionId").equals("bb-dummy-1").toArray();
    expect(rowsForDefinition).toEqual([attempt]);
  });
});

/**
 * The v6 bump is the first one that migrates real data out of a store being
 * dropped (`aiSettings`), not just adds an empty one — worth a dedicated,
 * real version-to-version upgrade test rather than trusting the migrate-
 * then-drop logic by inspection alone. Each test opens its own uniquely
 * named database (via ScaleCraftDB's optional name param) so it can't
 * collide with `db`, the shared "scalecraft"-named singleton other tests in
 * this file already opened at v6.
 */
describe("scalecraft db v6 migration (aiSettings -> aiProfiles)", () => {
  // Mirrors db.ts's own v1-v5 chain exactly, to simulate a real pre-v6
  // install. Any drift here would make the "real migration" claim false, so
  // this must be kept in sync with db.ts's version history by hand.
  function legacyV5Schema(name: string): Dexie {
    const legacy = new Dexie(name);
    legacy.version(1).stores({ saves: "id" });
    legacy.version(2).stores({ saves: "id", customComponents: "id" });
    legacy.version(3).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId" });
    legacy.version(4).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId", aiSettings: "id" });
    legacy.version(5).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    return legacy;
  }

  async function withFreshDbName<T>(fn: (name: string) => Promise<T>): Promise<T> {
    const name = `scalecraft-migration-test-${crypto.randomUUID()}`;
    try {
      return await fn(name);
    } finally {
      await Dexie.delete(name);
    }
  }

  // The v6 upgrade callback used to be observable end to end: a configured
  // aiSettings row became the user's first profile. v10's reset (see db.ts)
  // now clears every table on the way past, so a v5 install opened at the
  // current schema lands empty no matter what it held. What still has to hold
  // is that the whole v1->v10 chain runs without throwing and that the dropped
  // store is really gone — the v6 callback's own logic is exercised on the way
  // through, it just has no surviving output. See pending-persistence-audit.md.
  it("runs the v6 aiSettings upgrade without throwing, then clears it at v10", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV5Schema(name);
      await legacy.open();
      await legacy.table("aiSettings").put({
        id: "default",
        enabled: true,
        providerId: "xai",
        model: "grok-4",
        apiKey: "sk-legacy",
        depth: "deep",
        tone: "encouraging",
        level: "advanced",
      });
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      // The legacy API key must not survive into the reset app — it is exactly
      // the value the reset exists to clear off shared browsers.
      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.get("default")).toBeUndefined();

      // The dropped store is really gone, not just unused.
      expect((upgraded as unknown as Record<string, unknown>).aiSettings).toBeUndefined();

      upgraded.close();
    });
  });

  it("migrates nothing when the prior aiSettings row was never actually configured", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV5Schema(name);
      await legacy.open();
      await legacy.table("aiSettings").put({
        id: "default",
        enabled: false,
        providerId: "anthropic",
        model: "claude-opus-5",
        apiKey: "",
        depth: "standard",
        tone: "direct",
        level: "intermediate",
      });
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.get("default")).toBeUndefined();

      upgraded.close();
    });
  });

  it("starts with no profiles and no active profile on a fresh install (no prior aiSettings row at all)", async () => {
    await withFreshDbName(async (name) => {
      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.get("default")).toBeUndefined();

      upgraded.close();
    });
  });
});

/**
 * The v7 bump only adds a new, empty table (no .upgrade() callback, unlike
 * v6) — but "no migration logic" is itself a claim worth a real
 * version-to-version test, not just trusting db.ts's own comment about it.
 */
describe("scalecraft db v7 migration (adds curriculumProgress)", () => {
  function legacyV6Schema(name: string): Dexie {
    const legacy = new Dexie(name);
    legacy.version(1).stores({ saves: "id" });
    legacy.version(2).stores({ saves: "id", customComponents: "id" });
    legacy.version(3).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId" });
    legacy.version(4).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId", aiSettings: "id" });
    legacy.version(5).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    legacy.version(6).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: null,
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    return legacy;
  }

  async function withFreshDbName<T>(fn: (name: string) => Promise<T>): Promise<T> {
    const name = `scalecraft-v7-migration-test-${crypto.randomUUID()}`;
    try {
      return await fn(name);
    } finally {
      await Dexie.delete(name);
    }
  }

  it("opens a v6 database at the current schema with every store present and cleared by v10", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV6Schema(name);
      await legacy.open();
      // Untyped on purpose - a v6-era row predates SyncMeta entirely, and
      // legacy.table() is an untyped Dexie.Table anyway.
      const existingProgress = {
        chapterId: "bb-dummy-1",
        completedAt: Date.now(),
        matchedBlueprintId: null,
      };
      await legacy.table("chapterProgress").put(existingProgress);
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      // Was "rows intact" before v10's reset landed.
      expect(await upgraded.chapterProgress.toArray()).toEqual([]);
      expect(await upgraded.curriculumProgress.toArray()).toEqual([]);

      upgraded.close();
    });
  });
});

/**
 * The v9 bump is the second store-drop-and-replace bump (after v6's
 * aiSettings -> aiProfiles) — quizProgress rows from a real v8 install must
 * really disappear, not just go untyped, and examAttempts must come up
 * present and empty with no upgrade callback (the exam-mode pivot carries
 * nothing forward — see .claude/docs/pending-quiz-ui.md addendum).
 */
describe("scalecraft db v9 migration (quizProgress -> examAttempts)", () => {
  function legacyV8Schema(name: string): Dexie {
    const legacy = new Dexie(name);
    legacy.version(1).stores({ saves: "id" });
    legacy.version(2).stores({ saves: "id", customComponents: "id" });
    legacy.version(3).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId" });
    legacy.version(4).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId", aiSettings: "id" });
    legacy.version(5).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    legacy.version(6).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: null,
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    legacy.version(7).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
    });
    legacy.version(8).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
      quizProgress: "[chapterDefinitionId+questionId], chapterDefinitionId",
    });
    return legacy;
  }

  async function withFreshDbName<T>(fn: (name: string) => Promise<T>): Promise<T> {
    const name = `scalecraft-v9-migration-test-${crypto.randomUUID()}`;
    try {
      return await fn(name);
    } finally {
      await Dexie.delete(name);
    }
  }

  it("opens a v8 database at the current schema with quizProgress gone and everything cleared by v10", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV8Schema(name);
      await legacy.open();
      // Untyped on purpose - a v8-era row predates SyncMeta entirely, and
      // legacy.table() is an untyped Dexie.Table anyway.
      const existingProgress = {
        slug: "1-2-load-balancing",
        manuallyCompletedAt: null,
        lastVisitedAt: Date.now(),
      };
      await legacy.table("curriculumProgress").put(existingProgress);
      await legacy.table("quizProgress").put({
        chapterDefinitionId: "bb-dummy-1",
        questionId: "q1",
        answeredCorrectlyAt: Date.now(),
      });
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      // Was "rows intact" before v10's reset landed.
      expect(await upgraded.curriculumProgress.toArray()).toEqual([]);
      expect(await upgraded.examAttempts.toArray()).toEqual([]);
      expect((upgraded as unknown as Record<string, unknown>).quizProgress).toBeUndefined();

      upgraded.close();
    });
  });
});

/**
 * The 6.1.0 one-time reset (db.ts's version(10)). Pre-6.1.0 local data was
 * written with no account isolation at all, so on a shared browser it is a mix
 * of two users' rows with no way to tell them apart after the fact — see
 * .claude/docs/pending-persistence-audit.md S2/S3. Every table goes, including
 * the never-synced aiProfiles, because that one holds the AI provider API key.
 *
 * Asserted against a v9 install specifically: that is the version real users
 * are on going into this release.
 */
describe("scalecraft db v10 reset (6.1.0 one-time clear)", () => {
  function legacyV9Schema(name: string): Dexie {
    const legacy = new Dexie(name);
    legacy.version(9).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
      examAttempts: "[chapterDefinitionId+attemptNumber], chapterDefinitionId",
    });
    return legacy;
  }

  it("clears every table, including the local-only AI profile holding the API key", async () => {
    const name = `scalecraft-v10-reset-test-${crypto.randomUUID()}`;
    try {
      const legacy = legacyV9Schema(name);
      await legacy.open();
      await Promise.all([
        legacy.table("saves").put({ id: "sandbox", updatedAt: Date.now(), nodes: [], edges: [] }),
        legacy.table("chapterProgress").put({ chapterId: "bb-1", completedAt: Date.now(), matchedBlueprintId: null }),
        legacy.table("curriculumProgress").put({ slug: "1-1", manuallyCompletedAt: Date.now(), lastVisitedAt: null }),
        legacy.table("examAttempts").put({
          chapterDefinitionId: "bb-1",
          attemptNumber: 1,
          submittedAt: Date.now(),
          score: 90,
          answers: [],
        }),
        legacy.table("aiProfiles").put({
          id: crypto.randomUUID(),
          name: "Default",
          providerId: "anthropic",
          model: "claude-opus-5",
          apiKey: "sk-should-not-survive",
          depth: "standard",
          tone: "direct",
          level: "intermediate",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ]);
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      expect(await upgraded.saves.toArray()).toEqual([]);
      expect(await upgraded.customComponents.toArray()).toEqual([]);
      expect(await upgraded.chapterProgress.toArray()).toEqual([]);
      expect(await upgraded.curriculumProgress.toArray()).toEqual([]);
      expect(await upgraded.examAttempts.toArray()).toEqual([]);
      expect(await upgraded.deepCheckSessions.toArray()).toEqual([]);
      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.toArray()).toEqual([]);

      upgraded.close();
    } finally {
      await Dexie.delete(name);
    }
  });

  it("leaves a fresh install alone — no upgrade runs, tables come up empty", async () => {
    const name = `scalecraft-v10-fresh-test-${crypto.randomUUID()}`;
    try {
      const fresh = new ScaleCraftDB(name);
      await fresh.open();
      await fresh.saves.put({ id: "sandbox", updatedAt: Date.now(), nodes: [], edges: [], dirty: false, syncedAt: null });
      fresh.close();

      // Reopening must not re-run the clear — the upgrade is version-gated,
      // not a wipe-on-every-open.
      const reopened = new ScaleCraftDB(name);
      await reopened.open();
      expect(await reopened.saves.toArray()).toHaveLength(1);
      reopened.close();
    } finally {
      await Dexie.delete(name);
    }
  });
});

describe("account isolation (Phase 2, pending-6.1.0-poa.md)", () => {
  const EPOCH_KEY = "scalecraft:storage-epoch";
  const USER_ID_KEY = "scalecraft:userId";
  const OTHER_ACCOUNT_KEY = "sc-tour-seen";

  function primeAsAlreadyOnCurrentEpoch(userId: string) {
    localStorage.setItem(EPOCH_KEY, "6.1.0");
    localStorage.setItem(USER_ID_KEY, userId);
  }

  afterEach(() => {
    localStorage.clear();
  });

  it("wipes every Dexie table and sc-/scalecraft: localStorage keys when the signed-in user changes", async () => {
    const name = `scalecraft-account-isolation-test-${crypto.randomUUID()}`;
    try {
      const instance = new ScaleCraftDB(name);
      await instance.open();
      await instance.saves.put({
        id: SANDBOX_SAVE_ID,
        updatedAt: Date.now(),
        nodes: [],
        edges: [],
        dirty: false,
        syncedAt: null,
      });
      localStorage.setItem(OTHER_ACCOUNT_KEY, "true");
      primeAsAlreadyOnCurrentEpoch("user-a");

      await reconcileLocalStateForUser(instance, "user-b");

      expect(await instance.saves.toArray()).toEqual([]);
      expect(localStorage.getItem(OTHER_ACCOUNT_KEY)).toBeNull();
      expect(localStorage.getItem(USER_ID_KEY)).toBe("user-b");
      // Same-release epoch key survives an account-change wipe — it isn't
      // account data, re-clearing it would just re-trigger the Phase 0 pass
      // for no reason.
      expect(localStorage.getItem(EPOCH_KEY)).toBe("6.1.0");

      instance.close();
    } finally {
      await Dexie.delete(name);
    }
  });

  it("does not wipe when the same user reconciles again", async () => {
    const name = `scalecraft-account-isolation-test-${crypto.randomUUID()}`;
    try {
      const instance = new ScaleCraftDB(name);
      await instance.open();
      await instance.saves.put({
        id: SANDBOX_SAVE_ID,
        updatedAt: Date.now(),
        nodes: [],
        edges: [],
        dirty: false,
        syncedAt: null,
      });
      primeAsAlreadyOnCurrentEpoch("user-a");

      await reconcileLocalStateForUser(instance, "user-a");

      expect(await instance.saves.toArray()).toHaveLength(1);

      instance.close();
    } finally {
      await Dexie.delete(name);
    }
  });

  it("does not wipe on a fresh install with no stored user yet", async () => {
    const name = `scalecraft-account-isolation-test-${crypto.randomUUID()}`;
    try {
      const instance = new ScaleCraftDB(name);
      await instance.open();
      await instance.saves.put({
        id: SANDBOX_SAVE_ID,
        updatedAt: Date.now(),
        nodes: [],
        edges: [],
        dirty: false,
        syncedAt: null,
      });
      localStorage.setItem(EPOCH_KEY, "6.1.0"); // already on-epoch, no stored userId

      await reconcileLocalStateForUser(instance, "user-a");

      expect(await instance.saves.toArray()).toHaveLength(1);
      expect(localStorage.getItem(USER_ID_KEY)).toBe("user-a");

      instance.close();
    } finally {
      await Dexie.delete(name);
    }
  });
});
