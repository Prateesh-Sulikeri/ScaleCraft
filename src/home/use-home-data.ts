"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useNow } from "@/lib/use-now";
import { db, SANDBOX_SAVE_ID } from "@/persistence/db";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { ProgressInputs } from "@/curriculum/progress";
import type { CourseId } from "@/curriculum/types";
import {
  buildRecentActivity,
  computeStats,
  COURSE_IDS,
  courseProgress,
  resolveContinueTarget,
  type ActivityEntry,
  type ContinueTarget,
  type CourseProgress,
  type HomeStats,
} from "./home-data";

/** Rows the card shows before you open the dialog for the rest. */
const RECENT_ACTIVITY_PREVIEW = 3;

export type HomeData = {
  progressByCourse: Record<CourseId, CourseProgress>;
  continueTarget: ContinueTarget;
  /** The card's short list - the first RECENT_ACTIVITY_PREVIEW of `allActivity`. */
  activity: ActivityEntry[];
  /** Everything tracked, newest first, for the All activity dialog. Same rows,
   *  unclipped - the dialog is the only surface that shows the full history. */
  allActivity: ActivityEntry[];
  stats: HomeStats;
  /** The shared clock (lib/use-now.ts) - `null` on the server and the
   *  hydrating render, then a timestamp that advances once a minute so
   *  relative labels do not go stale in an open tab. */
  now: number | null;
  /** Clerk's tri-state collapsed to a boolean once loaded. Cards use it to
   *  distinguish "nothing here yet" from "sign in to track this". */
  isSignedIn: boolean;
};

/**
 * The one data read behind Home's dashboard. Every card takes its slice of
 * this as props rather than subscribing on its own - one hydrate pass, one
 * `now`, and a single place where "what does Home know" is defined.
 *
 * `refresh`, not `hydrate` (same reasoning as learning-path/LearningPath.tsx):
 * this component remounts on every client-side navigation back to Home, and
 * that is exactly when a learner expects to see what another device did.
 * `hydrate`'s already-hydrated bail would make it a no-op for the rest of the
 * tab's life.
 *
 * Signed-out visitors never hydrate at all (release 6.1.0-alpha Phase 11 -
 * Home is public, there are no anonymous local writes, and there is no point
 * 401ing against /api/sync/*). The store's untouched empty Set/Map already
 * renders every course at 0% with no activity, which is the correct
 * signed-out shape - so there is no separate loading branch and no hydration
 * mismatch to guard.
 */
export function useHomeData(): HomeData {
  const refresh = useCurriculumProgressStore((s) => s.refresh);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  // Days carried across a progress reset - unioned into the streak so a
  // reset costs completions but never the run. See persistence/streak-days.ts.
  const preservedStreakDays = useCurriculumProgressStore((s) => s.preservedStreakDays);
  const { isSignedIn } = useAuth();

  // null until the client takes over, so a server-rendered relative
  // timestamp can never disagree with the first client paint.
  const now = useNow();

  const [sandboxSaveAt, setSandboxSaveAt] = useState<number | null>(null);
  // Signed out there is nothing to read (Dexie is cleared on sign-out), so the
  // value is masked here instead of being reset from an effect.
  const sandboxUpdatedAt = isSignedIn ? sandboxSaveAt : null;

  useEffect(() => {
    if (!isSignedIn) return;
    void refresh();
  }, [refresh, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    // Dexie is browser-only, so this cannot run at module scope or during
    // SSR. A missing slot (never saved) is the normal case, not an error.
    void db.saves
      .get(SANDBOX_SAVE_ID)
      .then((save) => {
        if (!cancelled) setSandboxSaveAt(save?.updatedAt ?? null);
      })
      .catch(() => {
        if (!cancelled) setSandboxSaveAt(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition],
  );

  return useMemo(() => {
    const progressByCourse = Object.fromEntries(
      COURSE_IDS.map((courseId) => [courseId, courseProgress(courseId, inputs)]),
    ) as Record<CourseId, CourseProgress>;

    // Built once unclipped, then sliced: the card and the dialog must never
    // disagree about ordering, and the full list is at most a few dozen rows.
    const allActivity = buildRecentActivity(inputs, { sandboxUpdatedAt }, Number.POSITIVE_INFINITY);

    return {
      progressByCourse,
      continueTarget: resolveContinueTarget(inputs),
      activity: allActivity.slice(0, RECENT_ACTIVITY_PREVIEW),
      allActivity,
      stats: computeStats(inputs, now ?? 0, preservedStreakDays),
      now,
      isSignedIn: isSignedIn === true,
    };
  }, [inputs, sandboxUpdatedAt, now, isSignedIn, preservedStreakDays]);
}
