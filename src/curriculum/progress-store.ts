import { create } from "zustand";
import { db, type CurriculumProgress } from "@/persistence/db";
import type { ProgressInputs } from "./progress";

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

  /** Reads both Dexie tables into memory. Idempotent, safe to call from
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
  /** Lets a learner redo a chapter that was already COMPLETED by validation.
   *  Clears the manual flag *and* deletes the underlying db.chapterProgress
   *  row (the validation-pass record itself) — clearing only the manual flag
   *  would leave deriveStatus's OR immediately re-deriving COMPLETED from the
   *  still-present validation-pass row. lastVisitedAt is left untouched, so
   *  the chapter reverts to IN_PROGRESS (they've been there before), not
   *  NOT_STARTED. */
  resetChapter: (slug: string, chapterDefinitionId: string | null) => Promise<void>;
  /** Derived selector helper so callers never rebuild ProgressInputs by hand. */
  inputs: () => ProgressInputs;
};

function existingRow(rowsBySlug: Map<string, CurriculumProgress>, slug: string): CurriculumProgress {
  return rowsBySlug.get(slug) ?? { slug, manuallyCompletedAt: null, lastVisitedAt: null };
}

export const useCurriculumProgressStore = create<CurriculumProgressStore>((set, get) => ({
  hydrated: false,
  hydrating: false,
  validationPassedDefinitionIds: new Set(),
  rowsBySlug: new Map(),

  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });
    const [chapterProgressRows, curriculumProgressRows] = await Promise.all([
      db.chapterProgress.toArray(),
      db.curriculumProgress.toArray(),
    ]);
    set({
      hydrated: true,
      hydrating: false,
      validationPassedDefinitionIds: new Set(chapterProgressRows.map((r) => r.chapterId)),
      rowsBySlug: new Map(curriculumProgressRows.map((r) => [r.slug, r])),
    });
  },

  markVisited: async (slug) => {
    const row: CurriculumProgress = { ...existingRow(get().rowsBySlug, slug), lastVisitedAt: Date.now() };
    await db.curriculumProgress.put(row);
    set((state) => ({ rowsBySlug: new Map(state.rowsBySlug).set(slug, row) }));
  },

  setManualComplete: async (slug, complete) => {
    const row: CurriculumProgress = {
      ...existingRow(get().rowsBySlug, slug),
      manuallyCompletedAt: complete ? Date.now() : null,
    };
    await db.curriculumProgress.put(row);
    set((state) => ({ rowsBySlug: new Map(state.rowsBySlug).set(slug, row) }));
  },

  recordValidationPass: (chapterDefinitionId) => {
    set((state) => ({
      validationPassedDefinitionIds: new Set(state.validationPassedDefinitionIds).add(chapterDefinitionId),
    }));
  },

  resetChapter: async (slug, chapterDefinitionId) => {
    const row: CurriculumProgress = { ...existingRow(get().rowsBySlug, slug), manuallyCompletedAt: null };
    await Promise.all([
      db.curriculumProgress.put(row),
      chapterDefinitionId ? db.chapterProgress.delete(chapterDefinitionId) : Promise.resolve(),
    ]);
    set((state) => {
      const validationPassedDefinitionIds = new Set(state.validationPassedDefinitionIds);
      if (chapterDefinitionId) validationPassedDefinitionIds.delete(chapterDefinitionId);
      return { rowsBySlug: new Map(state.rowsBySlug).set(slug, row), validationPassedDefinitionIds };
    });
  },

  inputs: () => {
    const { validationPassedDefinitionIds, rowsBySlug } = get();
    return { validationPassedDefinitionIds, rowsBySlug };
  },
}));
