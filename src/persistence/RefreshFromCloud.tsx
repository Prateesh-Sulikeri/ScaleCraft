"use client";

import { useEffect } from "react";
import { useCustomComponentsStore } from "@/canvas/custom-components-store";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";

/** Two pulls in quick succession (a tab switch fires both `visibilitychange`
 *  and `focus`) collapse into one. Long enough to swallow that burst, short
 *  enough that alt-tabbing between two windows always re-reads. */
const MIN_INTERVAL_MS = 2_000;

/**
 * The read half of Phase 4.2's "sync on meaningful events, not on a timer"
 * (pending-6.1.0-poa.md) - FlushDirtyRows is the write half. Both are
 * mounted in src/app/(protected)/layout.tsx.
 *
 * Without this, the progress and custom-component stores are module
 * singletons that outlive client-side navigation, so their `hydrated` latch
 * meant a tab reconciled against the cloud exactly once per *full page load*
 * and never again. Two browsers open on the same account therefore never
 * converged short of an F5 - the symptom that started this.
 *
 * Deliberately does not touch `saves`. A canvas is reconciled per-scope on
 * mount (ChapterWorkspace / sandbox/page.tsx); swapping the graph out from
 * under a learner mid-edit because they alt-tabbed would be worse than the
 * staleness it fixes. Progress rows have no such live editing surface.
 */
export function RefreshFromCloud() {
  useEffect(() => {
    let lastRunAt = 0;
    const pull = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRunAt < MIN_INTERVAL_MS) return;
      lastRunAt = now;
      void useCurriculumProgressStore.getState().refresh();
      void useCustomComponentsStore.getState().refresh();
    };

    document.addEventListener("visibilitychange", pull);
    window.addEventListener("focus", pull);
    window.addEventListener("online", pull);
    return () => {
      document.removeEventListener("visibilitychange", pull);
      window.removeEventListener("focus", pull);
      window.removeEventListener("online", pull);
    };
  }, []);
  return null;
}
