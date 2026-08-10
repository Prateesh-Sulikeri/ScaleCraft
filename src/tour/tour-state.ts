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
 * - `paused`     — Escape'd out (or the tour's host surface disappeared,
 *                  see `pauseReason`); does NOT auto-start, but the pill
 *                  offers "Resume tour" at `stepIndex` rather than a
 *                  restart.
 * - `skipped`    — explicitly skipped; pill offers a fresh replay.
 * - `completed`  — finished; pill offers a fresh replay.
 */
export type TourRunState =
  | { status: "unseen" }
  | { status: "running"; stepIndex: number }
  | {
      status: "paused";
      stepIndex: number;
      /** `"user"` (or absent, for pauses persisted before this field
       * existed) — an explicit Escape/Skip-this-run action, offered back as
       * a resume pill. `"surface-loss"` — the tour's host surface vanished
       * out from under an active run (today: focus mode unmounting the
       * header/sidebar every `data-tour` anchor but the canvas lives in).
       * Distinguishing the two matters because only the second should
       * auto-resume the instant the surface comes back, rather than
       * stranding the learner on a pill for a pause they never asked for. */
      pauseReason?: "user" | "surface-loss";
    }
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

// A write from ANOTHER tab never notifies this module's own `listeners` set
// on its own — that set only ever grows from same-tab `useSyncExternalStore`
// subscriptions, and the native `storage` event (which DOES fire, but only
// in tabs that didn't make the write) was never listened for at all. One
// listener, module-scoped rather than per-tourId: `useTourState` already
// shares this single set across every tour, and the event itself carries no
// key we'd otherwise route by — a tab picks up any tour's cross-tab write on
// its next render via the same getSnapshot re-check same-tab writes trigger.
if (typeof window !== "undefined") {
  window.addEventListener("storage", () => {
    listeners.forEach((listener) => listener());
  });
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
    const { status, stepIndex, pauseReason } = parsed as { status?: unknown; stepIndex?: unknown; pauseReason?: unknown };
    if (status === "completed" || status === "skipped") return { status };
    if (status === "running") {
      return { status, stepIndex: typeof stepIndex === "number" && stepIndex >= 0 ? stepIndex : 0 };
    }
    if (status === "paused") {
      return {
        status,
        stepIndex: typeof stepIndex === "number" && stepIndex >= 0 ? stepIndex : 0,
        ...(pauseReason === "user" || pauseReason === "surface-loss" ? { pauseReason } : {}),
      };
    }
    return { status: "unseen" };
  } catch {
    return { status: "unseen" };
  }
}

/** `version` is purely additive - a door for the next change to this shape,
 * not read by anything yet. `parseTourState` already ignores unknown keys,
 * so today's clients (and today's already-persisted values, which have no
 * `version` at all) need no migration. */
export function serializeTourState(state: TourRunState): string {
  return JSON.stringify({ version: 1, ...state });
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
