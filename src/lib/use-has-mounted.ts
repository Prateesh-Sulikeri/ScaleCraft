import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only after the client has taken over — the useSyncExternalStore-based
 * way to gate client-only rendering (e.g. next-themes' resolvedTheme) without
 * the classic `useState(false) + useEffect(() => setState(true))` pattern,
 * which react-hooks/set-state-in-effect now flags.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
