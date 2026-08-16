import Dexie, { type EntityTable, type Table } from "dexie";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";
import type { CustomComponentRecord } from "@/content/components/custom";
import type { AiSettings } from "@/ai/settings";
import type { AiCritique } from "@/ai/schema";
import type { QuizAnswer } from "@/chapters/quiz/evaluate";

/**
 * Sync bookkeeping carried on every synced local row (release 6.1.0-alpha
 * Phase 1, .claude/docs/pending-6.1.0-poa.md) — the fields last-write-wins
 * reconciliation (Phase 3) needs to tell "this device's edit" apart from
 * "what the server already has." `syncedAt` is the server's own `updatedAt`
 * from the last successful push or pull, never a client clock read — see
 * ARCHITECTURE.md's "Sync ordering" note for why client clocks are never
 * compared. `dirty: true` means the local row has an edit the server hasn't
 * acknowledged yet; it also gives offline-safety for free (Phase 1.3): a
 * flush pass just re-pushes every dirty row, no queue needed.
 */
export type SyncMeta = {
  syncedAt: number | null;
  dirty: boolean;
};

/**
 * Local-first persistence — see .claude/docs/ARCHITECTURE.md "Persistence"
 * and milestones 8-9 in MILESTONES.md. A manual Save writes here, debounced
 * autosave-on-edit (see persistence/use-autosave.ts) also writes here, and
 * the app restores from it on load. Cloud sync (milestone 10) remains
 * deferred.
 *
 * Stores the raw canvas state (nodes/edges as the canvas store holds them),
 * not the domain ArchitectureGraph — zones aren't part of ArchitectureGraph
 * (see canvas/types.ts) and would be silently dropped by a restore that
 * went through it.
 */
export type CanvasSave = SyncMeta & {
  id: string;
  updatedAt: number;
  nodes: AnyNodeType[];
  edges: ArchitectureEdgeType[];
};

/** Fixed key for now — no multi-slot UI yet, this just avoids a schema
 * migration once "sandbox saves and chapter attempts" (plural, per
 * MILESTONES.md milestone 8) actually need one. */
export const SANDBOX_SAVE_ID = "sandbox";

/** Per-chapter save slot (milestone 9 pulled forward for item I.3) — one
 * attempt per chapter, namespaced so a chapter id can never collide with
 * SANDBOX_SAVE_ID or another chapter's slot. */
export function chapterSaveId(chapterId: string): string {
  return `chapter:${chapterId}`;
}

/** One row per completed chapter — written when evaluateChapter() first
 * reports `passed: true` (see chapters/ChapterWorkspace.tsx). Records
 * completion only; building the unlock graph from this is explicitly out of
 * scope here (§8.6, deferred). */
export type ChapterProgress = SyncMeta & {
  chapterId: string;
  completedAt: number;
  matchedBlueprintId: string | null;
};

/** One row per completed Deep Check run, autosaved (see DeepCheckPanel.tsx)
 * — `saveId` reuses the same slot key as CanvasSave/ChapterProgress
 * (SANDBOX_SAVE_ID or chapterSaveId(id)) so a session's history is scoped to
 * whichever board/chapter produced it, not a single global list. `id` is
 * Dexie's auto-incrementing primary key (`++id` in the schema below), not a
 * caller-supplied string like the other tables — there's no natural
 * caller-known key for "the Nth review of this board." */
export type DeepCheckSession = SyncMeta & {
  id?: number;
  /** Stable client-generated id (crypto.randomUUID()), assigned once at
   * write time — separate from `id` above, which is Dexie's local
   * auto-increment key and device-local. Cloud sync (src/persistence/
   * cloud-sync.ts) keys on this instead, since `id` is meaningless across
   * devices. */
  syncId: string;
  saveId: string;
  createdAt: number;
  critique: AiCritique;
};

/** One row per saved AI configuration (see @/ai/profiles.ts) — supersedes
 * the single-row `aiSettings` table (schema v4-v5). `AiSettings`'s fields
 * plus a user-facing `name` and timestamps; `id` is a real per-profile
 * `crypto.randomUUID()`, not the old fixed `"default"` key. */
export type AiProfile = AiSettings & {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

/** Single row, keyed `"default"` — which `aiProfiles` row Deep Check
 * currently uses. `profileId: null` means no profile exists yet (fresh
 * install, or every profile has been deleted). */
export type AiActiveProfile = {
  id: "default";
  profileId: string | null;
};

/** Learner-owned curriculum state, keyed by curriculum slug
 * (src/curriculum/manifest.ts). Deliberately SEPARATE from `chapterProgress`:
 * that table records what the *validation engine* proved (keyed by
 * ChapterDefinition id); this one records what the *learner* did (an explicit
 * manual completion, and when they last opened the chapter). Two distinct
 * facts with two distinct writers — ChapterStatus is derived from both by
 * curriculum/progress.ts's deriveStatus, which is the single place the two
 * are ever combined. Keyed by slug rather than definition id because an
 * unauthored chapter has no definition id but can still be manually marked
 * complete (a learner who read the chapter in the PDF). */
export type CurriculumProgress = SyncMeta & {
  slug: string;
  /** Learner's explicit "Mark complete" toggle. null = not manually completed. */
  manuallyCompletedAt: number | null;
  /** Last time the learner opened this chapter's workspace. Drives
   * IN_PROGRESS, and is what a future "Resume where I left off" will read. */
  lastVisitedAt: number | null;
};

/** One answered (or left-blank) question within a submitted exam attempt.
 * `answer: null` distinguishes "left blank at submit" (scored incorrect, but
 * rendered as "Not answered" rather than "Wrong") from an actual wrong
 * guess. */
export type ExamQuestionAnswer = {
  questionId: string;
  answer: QuizAnswer | null;
  correct: boolean;
};

/** One row per submitted exam attempt — unlimited per chapter until passed
 * (see curriculum/progress.ts). Keyed by [chapterDefinitionId+attemptNumber]
 * since attempt numbers are only unique within their chapter. Replaces the
 * old per-question `QuizProgress` mastery model (schema v8) — the exam-mode
 * pivot scores a submitted attempt, it doesn't track individual question
 * mastery over time (see .claude/docs/pending-quiz-ui.md addendum). */
export type ExamAttempt = SyncMeta & {
  chapterDefinitionId: string;
  attemptNumber: number;
  submittedAt: number;
  /** 0-100, rounded — same convention as ProgressSummary.percent. */
  score: number;
  answers: ExamQuestionAnswer[];
};

/** The stored shape of a custom component — `CustomComponentRecord` plus
 * sync bookkeeping. Kept separate from `CustomComponentRecord` itself since
 * that type is also the domain shape passed to `toComponentDefinition` and
 * rendered directly by the palette; those call sites have no business
 * knowing about `dirty`/`syncedAt`. */
export type CustomComponentRow = SyncMeta & CustomComponentRecord;

export class ScaleCraftDB extends Dexie {
  saves!: EntityTable<CanvasSave, "id">;
  /** User-created components (see CreateComponentModal.tsx /
   * content/components/custom.ts) — plain records, not live ComponentDefinitions
   * (a Zod schema instance isn't structured-clone-safe for IndexedDB;
   * toComponentDefinition rebuilds one at load time). */
  customComponents!: EntityTable<CustomComponentRow, "id">;
  chapterProgress!: EntityTable<ChapterProgress, "chapterId">;
  aiProfiles!: EntityTable<AiProfile, "id">;
  aiActiveProfile!: EntityTable<AiActiveProfile, "id">;
  deepCheckSessions!: EntityTable<DeepCheckSession, "id">;
  curriculumProgress!: EntityTable<CurriculumProgress, "slug">;
  /** Compound primary key — no single field identifies a row, so this is a
   * plain Table rather than an EntityTable. */
  examAttempts!: Table<ExamAttempt, [string, number]>;

  /** Name defaults to the real app database; overridable so tests can
   * exercise the full version chain (including the v6 migration) against an
   * isolated, uniquely-named IndexedDB database instead of the shared
   * `"scalecraft"` one — see db.test.ts's migration tests. */
  constructor(name: string = "scalecraft") {
    super(name);
    this.version(1).stores({
      saves: "id",
    });
    // First schema bump in this app — Dexie's own convention: list every
    // table that should exist at this version (not just the new one);
    // existing v1 installs auto-migrate forward with no data loss.
    this.version(2).stores({
      saves: "id",
      customComponents: "id",
    });
    this.version(3).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
    });
    this.version(4).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
    });
    this.version(5).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
      // Compound index on [saveId+createdAt] so history queries (newest
      // first, for a given board/chapter) don't need a full-table scan.
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    // Multi-profile AI settings: `aiSettings` (single fixed-key row) is
    // replaced by `aiProfiles` (many, real ids) + `aiActiveProfile` (which
    // one is in use). `aiSettings: null` is Dexie's delete-this-store
    // syntax. The upgrade callback below migrates a real prior
    // configuration into the user's first profile before the old store is
    // dropped — both the old and new stores are present in this version's
    // transaction, per Dexie's own migrate-then-drop convention.
    this.version(6)
      .stores({
        saves: "id",
        customComponents: "id",
        chapterProgress: "chapterId",
        aiSettings: null,
        aiProfiles: "id",
        aiActiveProfile: "id",
        deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      })
      .upgrade(async (trans) => {
        const old = await trans.table("aiSettings").get("default");
        // Only migrate a configuration the user actually set up — an
        // untouched default (enabled: false, empty key) has nothing worth
        // carrying forward, and should leave the same empty-profiles state
        // a brand-new user gets.
        if (!old || !old.enabled || !old.apiKey) return;
        const now = Date.now();
        const profile: AiProfile = {
          id: crypto.randomUUID(),
          name: "Default",
          providerId: old.providerId,
          model: old.model,
          apiKey: old.apiKey,
          depth: old.depth,
          tone: old.tone,
          level: old.level,
          createdAt: now,
          updatedAt: now,
          ...(old.baseUrl ? { baseUrl: old.baseUrl } : {}),
        };
        await trans.table("aiProfiles").add(profile);
        await trans.table("aiActiveProfile").put({ id: "default", profileId: profile.id });
      });
    // A new, empty table — no .upgrade() needed. Existing chapterProgress
    // rows (the validation-pass record) keep working untouched; this is a
    // second, additive fact, not a replacement (see CurriculumProgress
    // above).
    this.version(7).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
    });
    // Another new, empty table — same additive pattern as v7. The secondary
    // (non-unique) chapterDefinitionId index lets resetChapter delete every
    // question row for a chapter without a full-table scan.
    this.version(8).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
      quizProgress: "[chapterDefinitionId+questionId], chapterDefinitionId",
    });
    // The exam-mode pivot (.claude/docs/pending-quiz-ui.md addendum) drops
    // the per-question mastery model outright — no real user data exists yet
    // (pre-beta) and the model it backed no longer exists — and replaces it
    // with per-attempt scoring. `quizProgress: null` is Dexie's
    // delete-this-store syntax (same as v6's `aiSettings: null`); no upgrade
    // callback, since there is nothing worth carrying forward.
    this.version(9).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
      curriculumProgress: "slug",
      quizProgress: null,
      examAttempts: "[chapterDefinitionId+attemptNumber], chapterDefinitionId",
    });
    // 6.1.0 one-time reset. Identical shape to v9 — the bump exists purely to
    // run the clear below. Pre-6.1.0 local data was written before cloud sync
    // and before any account isolation existed, so on a browser that ever held
    // two accounts it is a mix of both (see pending-persistence-audit.md S2/S3).
    // There is no way to tell whose row is whose after the fact, so the only
    // safe move is to drop all of it and let users restart. Agreed with the
    // user 2026-08-12 at 3 total users.
    //
    // Runs as a Dexie upgrade rather than an app-mount effect on purpose:
    // opening the database runs this before any read resolves, so no component
    // can race it and observe the stale data first.
    //
    // aiProfiles is cleared too, despite being local-only and never synced —
    // it holds the AI provider API key, which is the single worst thing to
    // leak between accounts. Users re-enter their key once.
    this.version(10)
      .stores({
        saves: "id",
        customComponents: "id",
        chapterProgress: "chapterId",
        aiProfiles: "id",
        aiActiveProfile: "id",
        deepCheckSessions: "++id, saveId, [saveId+createdAt]",
        curriculumProgress: "slug",
        examAttempts: "[chapterDefinitionId+attemptNumber], chapterDefinitionId",
      })
      .upgrade(async (trans) => {
        await Promise.all(
          [
            "saves",
            "customComponents",
            "chapterProgress",
            "aiProfiles",
            "aiActiveProfile",
            "deepCheckSessions",
            "curriculumProgress",
            "examAttempts",
          ].map((table) => trans.table(table).clear()),
        );
      });
    // Phase 1 of the 6.1.0 POA — adds `syncedAt`/`dirty` (SyncMeta above) to
    // every synced row, the foundation reconciliation (Phase 3) is built on.
    // No upgrade callback: v10 just emptied every table, so there are no
    // existing rows to backfill. `syncId` gains an index on deepCheckSessions
    // so a sync response can look a row up and write its SyncMeta back
    // without a full-table scan (see cloud-sync.ts's syncDeepCheckSession).
    this.version(11).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiProfiles: "id",
      aiActiveProfile: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt], syncId",
      curriculumProgress: "slug",
      examAttempts: "[chapterDefinitionId+attemptNumber], chapterDefinitionId",
    });
  }
}

export const db = new ScaleCraftDB();

const STORAGE_EPOCH_KEY = "scalecraft:storage-epoch";
const STORAGE_EPOCH = "6.1.0";
const USER_ID_KEY = "scalecraft:userId";
const LOCAL_STORAGE_PREFIXES = ["sc-", "scalecraft:"];

function clearLocalStoragePrefixed(exceptKeys: string[]) {
  Object.keys(localStorage)
    .filter(
      (key) =>
        LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix)) &&
        !exceptKeys.includes(key),
    )
    .forEach((key) => localStorage.removeItem(key));
}

let currentUserId: string | null = null;

/**
 * Release 6.1.0-alpha Phase 2 (pending-6.1.0-poa.md) — tells the `ready`
 * check below which account is signed in. Called synchronously from
 * LocalStateGate's render body, not a useEffect: LocalStateGate is mounted
 * first under ProtectedLayout, so React finishes calling it before any
 * descendant component even begins rendering, let alone runs an effect that
 * could query Dexie. That is a stronger guarantee than mount-effect order
 * (rejected for this precise reason — see the POA's Phase 2 checklist), and
 * it costs nothing extra since this is a plain variable assignment.
 *
 * Tests that talk to the `db` singleton directly never call this, so
 * `currentUserId` stays null and the `ready` handler below is a no-op for
 * them — unchanged behavior, no hang.
 */
export function registerCurrentUserId(userId: string) {
  currentUserId = userId;
}

/**
 * Close-out P1.1 (pending-6.1.0-poa.md) — sign-out had nowhere to put the
 * signed-in account's local state: Dexie and the sc-/scalecraft:
 * localStorage keys are browser-wide, so they survived the client-side
 * navigation Clerk's default sign-out does to the now-public home page.
 * Treats local state as a disposable cache (this release's core decision,
 * same licence reconcileLocalStateForUser already relies on) — the cloud
 * refills it on next sign-in, so wiping here costs nothing. Clearing
 * STORAGE_EPOCH_KEY/USER_ID_KEY along with everything else is fine: the next
 * sign-in's reconcileLocalStateForUser treats a missing epoch the same as a
 * stale one and re-stamps both.
 */
export async function clearLocalStateOnSignOut(): Promise<void> {
  currentUserId = null;
  await Promise.all(db.tables.map((table) => table.clear()));
  clearLocalStoragePrefixed([]);
}

/**
 * Release 6.1.0-alpha Phase 2 — account isolation (audit S2/S10). The Dexie
 * database and the sc-/scalecraft: localStorage keys are browser-wide, not
 * account-scoped, so a second account signing in on a browser previously
 * used by another inherited that account's saves, progress, exam attempts,
 * custom components and Deep Check history.
 *
 * Pulled out of the `ready` handler below so it's directly callable with an
 * isolated `ScaleCraftDB` instance in tests, without needing to fight Dexie's
 * once-per-open `ready` timing. `db.tables` is used instead of a hardcoded
 * table list (unlike v10's, which was a one-time migration tied to that
 * exact schema) so a table added later is covered automatically.
 */
export async function reconcileLocalStateForUser(target: ScaleCraftDB, userId: string): Promise<void> {
  let storedEpoch: string | null;
  let storedUserId: string | null;
  try {
    storedEpoch = localStorage.getItem(STORAGE_EPOCH_KEY);
    storedUserId = localStorage.getItem(USER_ID_KEY);
  } catch {
    return; // Private mode / disabled storage — nothing to check or clear.
  }

  if (storedEpoch !== STORAGE_EPOCH) {
    // 6.1.0 one-time reset (Phase 0) — localStorage half. The Dexie half
    // already ran via the version(10) upgrade; this key never made it into
    // that migration since it predates the schema-version approach.
    clearLocalStoragePrefixed([]);
  } else if (storedUserId !== null && storedUserId !== userId) {
    await Promise.all(target.tables.map((table) => table.clear()));
    clearLocalStoragePrefixed([STORAGE_EPOCH_KEY]);
  }

  try {
    localStorage.setItem(STORAGE_EPOCH_KEY, STORAGE_EPOCH);
    localStorage.setItem(USER_ID_KEY, userId);
  } catch {
    // Private mode / disabled storage.
  }
}

/**
 * `db.on("ready", ..., true)` fires once per db-open (sticky so it can fire
 * again if the connection is ever closed and reopened) and blocks every
 * caller's query until it resolves — the same "runs before any read"
 * guarantee the v10 epoch reset gets from living inside a Dexie version
 * upgrade, applied here to a runtime check instead of a one-time migration.
 */
db.on(
  "ready",
  async () => {
    if (currentUserId === null) return;
    await reconcileLocalStateForUser(db, currentUserId);
  },
  true,
);
