import { useSyncExternalStore } from "react";

/** How often the shared clock advances. Coarse on purpose: the only consumer
 *  renders relative labels ("5m ago", "Yesterday"), so a second-by-second
 *  tick would re-render for a string that cannot change. */
const TICK_MS = 60_000;

const listeners = new Set<() => void>();
let snapshot = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function getSnapshot(): number {
  // Read lazily on first use rather than at module load, so the value is
  // captured when a component actually mounts, not whenever this module
  // happens to be imported. Stable between ticks, which is what
  // useSyncExternalStore requires - returning a fresh Date.now() per call
  // would loop forever.
  if (snapshot === 0) snapshot = Date.now();
  return snapshot;
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  timer ??= setInterval(() => {
    snapshot = Date.now();
    for (const listener of listeners) listener();
  }, TICK_MS);

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && timer != null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * The current time as React state - `null` on the server and during the first
 * (hydrating) client render, then a real timestamp that advances once a
 * minute.
 *
 * A clock is an external system, so it belongs in useSyncExternalStore rather
 * than `Date.now()` inline in a component (impure in render, and the compiler
 * lint rejects it) or a mount effect that sets state (also linted against -
 * see lib/use-has-mounted.ts, which this mirrors). The null server snapshot is
 * what keeps a server-rendered timestamp from disagreeing with the first
 * client paint.
 *
 * The interval exists only while something is subscribed, and is shared by
 * every subscriber - one timer per tab, not one per component.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
