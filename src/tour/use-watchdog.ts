"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once `resetKey` has accumulated `thresholdMs` of foreground time
 * while `enabled` — a learner who tab-switches away for twenty minutes on an
 * interactive step never trips this, only time the tab was actually visible
 * counts (pending-guided-tour.md's watchdog section, "foreground-time-only").
 *
 * One scheduled timeout carrying a remaining-time budget across visibility
 * toggles, not a poll loop: `visibilitychange` to hidden subtracts elapsed
 * time from the budget and clears the timeout; the next visible transition
 * reschedules with whatever's left. `resetKey` changing (a step change)
 * restarts the budget at `thresholdMs` and clears any prior fire.
 *
 * Two effects rather than one, kept deliberately separate: react-hooks/refs
 * disallows touching a ref during render, so the budget reset can't live
 * next to the `fired` state reset below (a plain setState, sanctioned during
 * render) — it has to be its own effect. Both run, in this declaration
 * order, before the scheduling effect on the same `resetKey` change, so the
 * timer always schedules against an already-reset budget.
 */
export function useWatchdog(enabled: boolean, resetKey: string, thresholdMs: number): boolean {
  const [firedFor, setFiredFor] = useState<{ key: string; fired: boolean }>({ key: resetKey, fired: false });
  if (firedFor.key !== resetKey) {
    setFiredFor({ key: resetKey, fired: false });
  }
  const fired = firedFor.key === resetKey && firedFor.fired;

  const remainingRef = useRef(thresholdMs);
  const runningSinceRef = useRef<number | null>(null);
  useEffect(() => {
    remainingRef.current = thresholdMs;
    runningSinceRef.current = null;
  }, [resetKey, thresholdMs]);

  useEffect(() => {
    if (!enabled) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function stop() {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (runningSinceRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - runningSinceRef.current));
        runningSinceRef.current = null;
      }
    }

    function start() {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      runningSinceRef.current = Date.now();
      timeoutId = setTimeout(() => {
        setFiredFor((prev) => (prev.key === resetKey ? { ...prev, fired: true } : prev));
      }, remainingRef.current);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") start();
      else stop();
    }

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, resetKey]);

  return fired;
}
