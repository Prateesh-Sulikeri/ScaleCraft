import { useSyncExternalStore } from "react";

// Shared across every key deliberately, not a per-key map — localStorage
// writes don't fire a same-tab storage event on their own, so `dismiss()`
// has to manually notify subscribers to make useSyncExternalStore re-check
// its snapshot. With only a handful of dismissible hints expected, an
// unrelated key's dismiss causing one extra (still-correct) re-check on
// another subscriber isn't worth a per-key listener map to avoid.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * A one-time-dismiss flag backed by localStorage — "has the user already
 * dismissed this hint, ever" (not per-session state). Same
 * useSyncExternalStore approach as use-has-mounted.ts rather than the
 * classic `useState(false) + useEffect(() => setState(...))` pattern,
 * which react-hooks/set-state-in-effect flags and which would also cause a
 * visible flash (hint renders, then disappears a tick later) on a client
 * that already dismissed it. The server snapshot is `true` (dismissed/
 * hidden) so nothing needs a hydration-mismatch guard — a hint that isn't
 * shown until localStorage is checked is a strictly safer default than one
 * that might flash on then off.
 */
export function useDismissedFlag(key: string): [dismissed: boolean, dismiss: () => void] {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) === "1",
    () => true,
  );
  const dismiss = () => {
    localStorage.setItem(key, "1");
    listeners.forEach((listener) => listener());
  };
  return [dismissed, dismiss];
}
