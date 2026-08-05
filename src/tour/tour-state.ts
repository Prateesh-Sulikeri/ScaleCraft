"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Where a learner actually is in a tour, persisted across reloads.
 *
 * Replaces the previous single `sc-tour-dismissed-<id>` boolean, which
 * couldn't distinguish "I pressed Escape to get this out of my face for a
 * second" from "never show me this again", and which threw away the step
 * index entirely — so a reload mid-tour restarted at step 1 while the canvas
 * kept every edit (Dexie autosave), leaving the tour and the board telling
 * two different stories (.claude/docs/pending.md tour punch list #9-#13).
 *
 * - `unseen`     — never started; auto-starts on load.
 * - `running`    — mid-tour; resumes at `stepIndex` on load.
 * - `paused`     — Escape'd out; does NOT auto-start, but the pill offers
 *                  "Resume tour" at `stepIndex` rather than a restart.
 * - `skipped`    — explicitly skipped; pill offers a fresh replay.
 * - `completed`  — finished; pill offers a fresh replay.
 */
export type TourRunState =
  | { status: "unseen" }
  | { status: "running"; stepIndex: number }
  | { status: "paused"; stepIndex: number }
  | { status: "skipped" }
  | { status: "completed" };

/** Distinct from every real persisted value so the server render (and the
 * first client render before hydration) can be told apart from a genuine
 * "never seen this tour" — neither the overlay nor the replay pill should
 * paint until localStorage has actually been read, or a returning learner
 * gets a flash of a tour they already finished. */
const SSR_SNAPSHOT = "__ssr__";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function tourStateKey(tourId: string) {
  return `sc-tour-${tourId}`;
}

/** Parses the raw localStorage string. Anything unrecognised (including the
 * legacy `sc-tour-dismissed-*` era's absence of this key) degrades to
 * `unseen` rather than throwing — a corrupt value should cost a learner a
 * repeated tour, not a crashed workspace. */
export function parseTourState(raw: string | null): TourRunState {
  if (!raw) return { status: "unseen" };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { status: "unseen" };
    const { status, stepIndex } = parsed as { status?: unknown; stepIndex?: unknown };
    if (status === "completed" || status === "skipped") return { status };
    if (status === "running" || status === "paused") {
      return { status, stepIndex: typeof stepIndex === "number" && stepIndex >= 0 ? stepIndex : 0 };
    }
    return { status: "unseen" };
  } catch {
    return { status: "unseen" };
  }
}

export function serializeTourState(state: TourRunState): string {
  return JSON.stringify(state);
}

/**
 * Reads/writes one tour's persisted run state. Same useSyncExternalStore
 * approach as lib/use-dismissed-flag.ts (localStorage writes don't fire a
 * same-tab storage event, so writes notify subscribers manually), but the
 * snapshot stays a raw string so it's referentially stable across reads —
 * parsing happens in a memo on top of it.
 *
 * `hydrated` is false until the client has actually read localStorage; every
 * caller gates both auto-start and the replay pill on it.
 */
export function useTourState(tourId: string): {
  state: TourRunState;
  hydrated: boolean;
  setState: (next: TourRunState) => void;
} {
  const key = tourStateKey(tourId);

  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => SSR_SNAPSHOT,
  );

  const hydrated = raw !== SSR_SNAPSHOT;
  const state = useMemo(() => (hydrated ? parseTourState(raw) : { status: "unseen" as const }), [raw, hydrated]);

  const setState = useCallback(
    (next: TourRunState) => {
      localStorage.setItem(key, serializeTourState(next));
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return { state, hydrated, setState };
}
