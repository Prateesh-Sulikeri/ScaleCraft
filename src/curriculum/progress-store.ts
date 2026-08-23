import { create } from "zustand";
import { chapterSaveId, db, type ChapterProgress, type CurriculumProgress, type ExamAttempt } from "@/persistence/db";
import {
  deleteChapterProgressSync,
  deleteDeepCheckSessionSync,
  deleteExamAttemptsSync,
  deleteSaveSync,
  hydrateAllChapterProgress,
  hydrateAllCurriculumProgress,
  hydrateAllExamAttempts,
  syncCurriculumProgress,
  syncExamAttempt,
} from "@/persistence/cloud-sync";
import { reconcileRows } from "@/persistence/reconcile";
import { useSyncStatusStore } from "@/persistence/sync-status";
import {
  fetchPreservedStreakDays,
  mergeStreakDays,
  pushPreservedStreakDays,
} from "@/persistence/streak-days";
import { activityTimestamps, localDayIndex } from "@/home/home-data";
import { allEntries, getCourse } from "./index";
import type { CourseId } from "./types";
import type { ProgressInputs } from "./progress";

/** Replace-by-attemptNumber — mirrors Dexie's own replace-by-key `put`. */
function withExamAttempt(
  map: Map<string, ExamAttempt[]>,
  attempt: ExamAttempt,
): Map<string, ExamAttempt[]> {
  const next = new Map(map);
  const existing = next.get(attempt.chapterDefinitionId) ?? [];
  next.set(
    attempt.chapterDefinitionId,
    [...existing.filter((a) => a.attemptNumber !== attempt.attemptNumber), attempt],
  );
  return next;
}

/**
 * Curriculum progress is global to the user, not scoped per canvas — the
 * Learning Path and the workspace sidebar must see identical state — so this
 * is a plain module-level singleton (same convention as
 * canvas/custom-components-store.ts), not a provider like canvas/store.tsx.
 *
 * Every mutator writes Dexie *and* updates in-memory state in the same
 * action; `set` always constructs new Set/Map instances (zustand's default
 * equality is referential). Dexie is browser-only, so `hydrate()` must be
 * called from an effect, never at module scope, or SSR/vitest's node
 * environment will throw.
 */
type CurriculumProgressStore = {
  hydrated: boolean;
  hydrating: boolean;
  validationPassedDefinitionIds: Set<string>;
  rowsBySlug: Map<string, CurriculumProgress>;
  /** Submitted exam attempts, by chapterDefinitionId — unlimited entries per
   *  chapter until passed, cleared only by resetChapter/resetCourse. */
  examAttemptsByDefinition: Map<string, ExamAttempt[]>;
  /** Local day indices carried across a progress reset, stored on the Clerk
   *  user's publicMetadata (persistence/streak-days.ts). Read by Home and the
   *  Learning Path header, which union it into the streak computation — see
   *  home-data.ts's activityDays. Empty for an account that has never
   *  reset. */
  preservedStreakDays: number[];

  /** Reads all three Dexie tables into memory. Idempotent, safe to call from
   *  every mounting surface — bails if already hydrated or in flight. */
  hydrate: () => Promise<void>;
  /** Same reconcile pass as `hydrate`, minus the already-hydrated bail. The
   *  store is a module singleton that outlives client-side navigation, so
   *  `hydrate`'s latch meant a tab reconciled exactly once per full page
   *  load and never saw another device's writes again. Callers: the pull
   *  triggers in RefreshFromCloud.tsx, the Learning Path's mount, and every
   *  mutator below (which composes a whole-row payload out of local state,
   *  so it has to be looking at the newest row before it writes - see
   *  markVisited). */
  refresh: () => Promise<void>;
  /** Called by ChapterWorkspace on mount. Writes lastVisitedAt (preserving
   *  any existing manuallyCompletedAt) and updates memory. */
  markVisited: (slug: string) => Promise<void>;
  /** The manual override toggle. `true` stamps Date.now(); `false` clears
   *  to null. */
  setManualComplete: (slug: string, complete: boolean) => Promise<void>;
  /** Called by ChapterWorkspace when evaluateChapter reports passed:true —
   *  mirrors the existing db.chapterProgress.put into this store's memory
   *  so the sidebar/Learning Path update without a reload. */
  recordValidationPass: (chapterDefinitionId: string) => void;
  /** Called by QuizLauncher when an exam is submitted. Dexie put +
   *  in-memory update in the same action, new Map instance (see store-level
   *  doc comment), replace-by-attemptNumber semantics matching Dexie's own
   *  replace-by-key `put`. */
  recordExamAttempt: (attempt: ExamAttempt) => Promise<void>;
  /** Lets a learner redo a chapter that was already COMPLETED by validation.
   *  Clears the manual flag *and* deletes the underlying db.chapterProgress
   *  row (the validation-pass record itself) — clearing only the manual flag
   *  would leave deriveStatus's OR immediately re-deriving COMPLETED from the
   *  still-present validation-pass row. Also deletes the chapter's
   *  examAttempts rows — redo means redo, a fresh set of attempts included.
   *  lastVisitedAt is left untouched, so the chapter reverts to IN_PROGRESS
   *  (they've been there before), not NOT_STARTED. */
  resetChapter: (slug: string, chapterDefinitionId: string | null) => Promise<void>;
  /** Wipes every chapter of one course back to NOT_STARTED — the Learning
   *  Path's "Reset progress". Scoped to that course, so resetting Building
   *  Blocks leaves Real World Extraction untouched. Clears completions,
   *  validation passes, exam attempts, each chapter's saved canvas and its
   *  Deep Check history. Snapshots the day streak *before* deleting
   *  anything; see resetCourse's body for why that ordering is
   *  load-bearing. */
  resetCourse: (courseId: CourseId) => Promise<void>;
  /** Derived selector helper so callers never rebuild ProgressInputs by hand. */
  inputs: () => ProgressInputs;
  /** In-memory only, no Dexie/cloud I/O — clears this account's rows out of
   *  the singleton on sign-out (close-out P1.1) so the next signed-out or
   *  signed-in-as-someone-else render can't still see them. Dexie itself is
   *  wiped separately by db.ts's clearLocalStateOnSignOut. */
  reset: () => void;
};

/** Reads Dexie, never the in-memory map. Every mutator below writes Dexie
 * first, so Dexie is always at least as fresh as memory — while memory is
 * empty until hydrate() resolves. Deriving a full-replace `put` payload from
 * an unhydrated store silently wiped whichever fields the caller wasn't
 * setting: opening a chapter directly (hard load on /chapters/<slug>, where
 * markVisited's effect runs before hydrate's) erased that chapter's
 * manuallyCompletedAt locally AND pushed the null to the cloud, destroying the
 * completion on every device. See pending-persistence-audit.md S1. */
async function existingRow(slug: string): Promise<CurriculumProgress> {
  return (
    (await db.curriculumProgress.get(slug)) ?? {
      slug,
      manuallyCompletedAt: null,
      lastVisitedAt: null,
      dirty: false,
      syncedAt: null,
    }
  );
}

function examAttemptKey(row: ExamAttempt): string {
  return `${row.chapterDefinitionId}:${row.attemptNumber}`;
}

function buildExamAttemptsMap(attempts: ExamAttempt[]): Map<string, ExamAttempt[]> {
  let map = new Map<string, ExamAttempt[]>();
  for (const attempt of attempts) map = withExamAttempt(map, attempt);
  return map;
}

/**
 * The actual reconcile pass — pulls all three tables' remote state, merges it
 * against local via the shared last-write-wins rule (reconcile.ts /
 * ARCHITECTURE.md "Sync ordering"), writes the rows the merge changed back to
 * Dexie, and populates in-memory state from the merged result. Replaces the
 * old hydrate-on-empty (decision 3, pending-cloud-sync.md), which only ever
 * pulled the cloud once on a genuinely empty table and never again — see
 * pending-6.1.0-poa.md Phase 3 / audit finding S4.
 */
async function performHydrate(
  set: (partial: Partial<CurriculumProgressStore>) => void,
): Promise<void> {
  const [localChapterProgress, localCurriculumProgress, localExamAttempts] = await Promise.all([
    db.chapterProgress.toArray(),
    db.curriculumProgress.toArray(),
    db.examAttempts.toArray(),
  ]);
  const [remoteChapterProgress, remoteCurriculumProgress, remoteExamAttempts, preservedStreakDays] = await Promise.all([
    hydrateAllChapterProgress(),
    hydrateAllCurriculumProgress(),
    hydrateAllExamAttempts(),
    // Not part of the reconcile pass below: this has no local table to merge
    // against and no last-write-wins semantics (it unions, server-side), so
    // a failed fetch degrades to [] instead of aborting - the streak reads
    // low for one render rather than blocking every other table's merge.
    fetchPreservedStreakDays(),
  ]);

  if (!remoteChapterProgress.ok || !remoteCurriculumProgress.ok || !remoteExamAttempts.ok) {
    // Abort (Phase 6, pending-6.1.0-poa.md - fixes audit S5): a failed
    // fetch must never look like "the server has nothing" and let a stale
    // local row win a merge it was never checked against. Populate from
    // local only, and leave `hydrated` false (not set here, still its
    // create() default) so the next hydrate() call - the next mount or
    // navigation - retries for real instead of being permanently stuck
    // behind a transient network error.
    set({
      hydrating: false,
      validationPassedDefinitionIds: new Set(localChapterProgress.map((r) => r.chapterId)),
      rowsBySlug: new Map(localCurriculumProgress.map((r) => [r.slug, r])),
      examAttemptsByDefinition: buildExamAttemptsMap(localExamAttempts),
      preservedStreakDays,
    });
    return;
  }

  const chapterProgress = reconcileRows(localChapterProgress, remoteChapterProgress.data, (r) => r.chapterId);
  const curriculumProgress = reconcileRows(localCurriculumProgress, remoteCurriculumProgress.data, (r) => r.slug);
  const examAttempts = reconcileRows(localExamAttempts, remoteExamAttempts.data, examAttemptKey);

  const discarded = chapterProgress.discarded + curriculumProgress.discarded + examAttempts.discarded;
  if (discarded > 0) useSyncStatusStore.getState().recordDiscarded(discarded);

  await Promise.all([
    chapterProgress.toWrite.length > 0 ? db.chapterProgress.bulkPut(chapterProgress.toWrite) : Promise.resolve(),
    curriculumProgress.toWrite.length > 0
      ? db.curriculumProgress.bulkPut(curriculumProgress.toWrite)
      : Promise.resolve(),
    examAttempts.toWrite.length > 0 ? db.examAttempts.bulkPut(examAttempts.toWrite) : Promise.resolve(),
  ]);

  set({
    hydrated: true,
    hydrating: false,
    validationPassedDefinitionIds: new Set(chapterProgress.merged.map((r: ChapterProgress) => r.chapterId)),
    rowsBySlug: new Map(curriculumProgress.merged.map((r: CurriculumProgress) => [r.slug, r])),
    examAttemptsByDefinition: buildExamAttemptsMap(examAttempts.merged),
    preservedStreakDays,
  });
}

/** In-flight dedup only — NOT the "already hydrated" check, which reads
 * `get().hydrated` instead. Cleared once the call settles, so it can never
 * leak a stale promise across a store reset (tests reset `hydrated`/
 * `hydrating` via setState between cases, which is what actually matters). */
let inFlightHydrate: Promise<void> | null = null;

export const useCurriculumProgressStore = create<CurriculumProgressStore>((set, get) => ({
  hydrated: false,
  hydrating: false,
  validationPassedDefinitionIds: new Set(),
  rowsBySlug: new Map(),
  examAttemptsByDefinition: new Map(),
  preservedStreakDays: [],

  hydrate: () => {
    if (get().hydrated) return Promise.resolve();
    return get().refresh();
  },

  refresh: () => {
    if (inFlightHydrate) return inFlightHydrate;
    set({ hydrating: true });
    inFlightHydrate = performHydrate(set).finally(() => {
      inFlightHydrate = null;
    });
    return inFlightHydrate;
  },

  markVisited: async (slug) => {
    // refresh, not hydrate: the row this composes is a full-row overwrite
    // (the sync API has no partial update), so writing one built from a
    // stale local copy silently erases whatever another device changed in
    // the meantime - opening a chapter would un-complete it everywhere.
    await get().refresh();
    const row: CurriculumProgress = {
      ...(await existingRow(slug)),
      lastVisitedAt: Date.now(),
      dirty: true,
      syncedAt: null,
    };
    await db.curriculumProgress.put(row);
    void syncCurriculumProgress(row);
    set((state) => ({ rowsBySlug: new Map(state.rowsBySlug).set(slug, row) }));
  },

  setManualComplete: async (slug, complete) => {
    await get().refresh(); // full-row overwrite, see markVisited
    const row: CurriculumProgress = {
      ...(await existingRow(slug)),
      manuallyCompletedAt: complete ? Date.now() : null,
      dirty: true,
      syncedAt: null,
    };
    await db.curriculumProgress.put(row);
    void syncCurriculumProgress(row);
    set((state) => ({ rowsBySlug: new Map(state.rowsBySlug).set(slug, row) }));
  },

  recordValidationPass: (chapterDefinitionId) => {
    set((state) => ({
      validationPassedDefinitionIds: new Set(state.validationPassedDefinitionIds).add(chapterDefinitionId),
    }));
  },

  recordExamAttempt: async (attempt) => {
    await get().hydrate();
    await db.examAttempts.put(attempt);
    void syncExamAttempt(attempt);
    set((state) => ({
      examAttemptsByDefinition: withExamAttempt(state.examAttemptsByDefinition, attempt),
    }));
  },

  resetChapter: async (slug, chapterDefinitionId) => {
    await get().refresh(); // full-row overwrite, see markVisited
    const row: CurriculumProgress = {
      ...(await existingRow(slug)),
      manuallyCompletedAt: null,
      dirty: true,
      syncedAt: null,
    };
    await Promise.all([
      db.curriculumProgress.put(row),
      chapterDefinitionId ? db.chapterProgress.delete(chapterDefinitionId) : Promise.resolve(),
      chapterDefinitionId
        ? db.examAttempts.where("chapterDefinitionId").equals(chapterDefinitionId).delete()
        : Promise.resolve(),
    ]);
    void syncCurriculumProgress(row);
    if (chapterDefinitionId) {
      void deleteChapterProgressSync(chapterDefinitionId);
      void deleteExamAttemptsSync(chapterDefinitionId);
    }
    set((state) => {
      const validationPassedDefinitionIds = new Set(state.validationPassedDefinitionIds);
      if (chapterDefinitionId) validationPassedDefinitionIds.delete(chapterDefinitionId);
      const examAttemptsByDefinition = new Map(state.examAttemptsByDefinition);
      if (chapterDefinitionId) examAttemptsByDefinition.delete(chapterDefinitionId);
      return {
        rowsBySlug: new Map(state.rowsBySlug).set(slug, row),
        validationPassedDefinitionIds,
        examAttemptsByDefinition,
      };
    });
  },

  resetCourse: async (courseId) => {
    await get().refresh(); // full-row overwrites below, see markVisited

    // Snapshot the streak BEFORE anything is deleted. The day streak is
    // derived from exactly the timestamps this function is about to destroy
    // (home-data.ts's activityTimestamps), so once the wipe lands there is
    // nothing left to reconstruct it from - and Clerk has no day-series to
    // fall back on either (see db.ts's StreakDays). Snapshot the whole
    // account's day set, not just this course's: unioning is idempotent, and
    // taking the wider set means a later reset of the *other* course cannot
    // drop days this one already covered.
    const days = new Set(get().preservedStreakDays);
    for (const ts of activityTimestamps(get().inputs())) {
      if (ts > 0) days.add(localDayIndex(ts));
    }
    const preservedStreakDays = [...days].sort((a, b) => a - b);

    // Awaited, and awaited *first* - the one blocking call in this action.
    // Everything below deletes the timestamps the streak is derived from, so
    // if the snapshot has not landed by then the streak is unrecoverable.
    // A failed push therefore aborts the reset rather than proceeding: losing
    // the streak is a worse outcome than a reset the learner can simply
    // retry, and leaving progress intact keeps the two consistent.
    const saved = await pushPreservedStreakDays(preservedStreakDays);
    if (saved === null) {
      throw new Error("Could not save your streak, so nothing was reset. Check your connection and try again.");
    }
    set({ preservedStreakDays: mergeStreakDays(preservedStreakDays, saved) });

    const entries = allEntries(getCourse(courseId));
    const slugs = entries.map((entry) => entry.slug);
    const definitionIds = entries
      .map((entry) => entry.chapterDefinitionId)
      .filter((id): id is string => id != null);

    // curriculumProgress rows are nulled rather than deleted: /api/sync/
    // curriculum-progress has no DELETE, and a locally-deleted row would
    // just be pulled back on the next reconcile. Both timestamps null reads
    // as NOT_STARTED to deriveStatus and as "no progress" to
    // hasAnyProgress, which is exactly the intended end state.
    const rows: CurriculumProgress[] = await Promise.all(
      slugs.map(async (slug) => ({
        ...(await existingRow(slug)),
        manuallyCompletedAt: null,
        lastVisitedAt: null,
        dirty: true,
        syncedAt: null,
      })),
    );

    // The canvas each chapter was solved on, plus any Deep Check critiques
    // of it. A saved graph for a chapter that now reads Not started is
    // stale - it would silently reload the old solution the next time the
    // learner opens the Design Editor, which is the opposite of starting
    // over. Deep Check sessions are keyed by saveId, so deleting the save
    // without them would leave critiques of a graph that no longer exists.
    // The sandbox save is untouched: it belongs to no course.
    const saveIds = definitionIds.map(chapterSaveId);
    const deepCheckSyncIds = (
      await db.deepCheckSessions.where("saveId").anyOf(saveIds).toArray()
    )
      .map((session) => session.syncId)
      .filter((syncId): syncId is string => !!syncId);

    await Promise.all([
      db.curriculumProgress.bulkPut(rows),
      db.chapterProgress.bulkDelete(definitionIds),
      db.examAttempts.where("chapterDefinitionId").anyOf(definitionIds).delete(),
      db.saves.bulkDelete(saveIds),
      db.deepCheckSessions.where("saveId").anyOf(saveIds).delete(),
    ]);

    for (const row of rows) void syncCurriculumProgress(row);
    for (const id of definitionIds) {
      void deleteChapterProgressSync(id);
      void deleteExamAttemptsSync(id);
    }
    for (const saveId of saveIds) void deleteSaveSync(saveId);
    for (const syncId of deepCheckSyncIds) void deleteDeepCheckSessionSync(syncId);

    set((state) => {
      const nextRows = new Map(state.rowsBySlug);
      for (const row of rows) nextRows.set(row.slug, row);
      const validationPassedDefinitionIds = new Set(state.validationPassedDefinitionIds);
      const examAttemptsByDefinition = new Map(state.examAttemptsByDefinition);
      for (const id of definitionIds) {
        validationPassedDefinitionIds.delete(id);
        examAttemptsByDefinition.delete(id);
      }
      return { rowsBySlug: nextRows, validationPassedDefinitionIds, examAttemptsByDefinition };
    });
  },

  inputs: () => {
    const { validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition } = get();
    return { validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition };
  },

  reset: () => {
    set({
      hydrated: false,
      hydrating: false,
      validationPassedDefinitionIds: new Set(),
      rowsBySlug: new Map(),
      examAttemptsByDefinition: new Map(),
      preservedStreakDays: [],
    });
  },
}));
