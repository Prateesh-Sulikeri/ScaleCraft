import { create } from "zustand";
import { db, type CurriculumProgress, type ExamAttempt } from "@/persistence/db";
import {
  deleteChapterProgressSync,
  deleteExamAttemptsSync,
  hydrateAllChapterProgress,
  hydrateAllCurriculumProgress,
  hydrateAllExamAttempts,
  syncCurriculumProgress,
  syncExamAttempt,
} from "@/persistence/cloud-sync";
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
   *  chapter until passed, cleared only by resetChapter. */
  examAttemptsByDefinition: Map<string, ExamAttempt[]>;

  /** Reads all three Dexie tables into memory. Idempotent, safe to call from
   *  every mounting surface — bails if already hydrated or in flight. */
  hydrate: () => Promise<void>;
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
  /** Derived selector helper so callers never rebuild ProgressInputs by hand. */
  inputs: () => ProgressInputs;
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
  return (await db.curriculumProgress.get(slug)) ?? { slug, manuallyCompletedAt: null, lastVisitedAt: null };
}

export const useCurriculumProgressStore = create<CurriculumProgressStore>((set, get) => ({
  hydrated: false,
  hydrating: false,
  validationPassedDefinitionIds: new Set(),
  rowsBySlug: new Map(),
  examAttemptsByDefinition: new Map(),

  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });
    // Hydrate-on-empty (decision 3, pending-cloud-sync.md), per table: a
    // fresh device has none of these three tables populated locally yet, so
    // an empty local table pulls everything for the user from the cloud
    // once before continuing. No merge - only fires when the table is
    // genuinely empty.
    let [chapterProgressRows, curriculumProgressRows, examAttemptRows] = await Promise.all([
      db.chapterProgress.toArray(),
      db.curriculumProgress.toArray(),
      db.examAttempts.toArray(),
    ]);
    if (chapterProgressRows.length === 0) {
      const remote = await hydrateAllChapterProgress();
      if (remote.length > 0) {
        await db.chapterProgress.bulkAdd(remote);
        chapterProgressRows = remote;
      }
    }
    if (curriculumProgressRows.length === 0) {
      const remote = await hydrateAllCurriculumProgress();
      if (remote.length > 0) {
        await db.curriculumProgress.bulkAdd(remote);
        curriculumProgressRows = remote;
      }
    }
    if (examAttemptRows.length === 0) {
      const remote = await hydrateAllExamAttempts();
      if (remote.length > 0) {
        await db.examAttempts.bulkAdd(remote);
        examAttemptRows = remote;
      }
    }
    let examAttemptsByDefinition = new Map<string, ExamAttempt[]>();
    for (const attempt of examAttemptRows) {
      examAttemptsByDefinition = withExamAttempt(examAttemptsByDefinition, attempt);
    }
    set({
      hydrated: true,
      hydrating: false,
      validationPassedDefinitionIds: new Set(chapterProgressRows.map((r) => r.chapterId)),
      rowsBySlug: new Map(curriculumProgressRows.map((r) => [r.slug, r])),
      examAttemptsByDefinition,
    });
  },

  markVisited: async (slug) => {
    const row: CurriculumProgress = { ...(await existingRow(slug)), lastVisitedAt: Date.now() };
    await db.curriculumProgress.put(row);
    void syncCurriculumProgress(row);
    set((state) => ({ rowsBySlug: new Map(state.rowsBySlug).set(slug, row) }));
  },

  setManualComplete: async (slug, complete) => {
    const row: CurriculumProgress = {
      ...(await existingRow(slug)),
      manuallyCompletedAt: complete ? Date.now() : null,
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
    await db.examAttempts.put(attempt);
    void syncExamAttempt(attempt);
    set((state) => ({
      examAttemptsByDefinition: withExamAttempt(state.examAttemptsByDefinition, attempt),
    }));
  },

  resetChapter: async (slug, chapterDefinitionId) => {
    const row: CurriculumProgress = { ...(await existingRow(slug)), manuallyCompletedAt: null };
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

  inputs: () => {
    const { validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition } = get();
    return { validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition };
  },
}));
