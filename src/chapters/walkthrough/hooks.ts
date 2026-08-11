"use client";

import { useCallback, useSyncExternalStore, type RefObject } from "react";

/** Subscription for a value that can never change after load. */
const NEVER_CHANGES = () => () => {};

// Local, not shared - same "kept local since nothing else needs it yet"
// convention as src/app/not-found.tsx's own copy of this hook. The packet is
// driven by requestAnimationFrame, not CSS, so a motion-reduce: Tailwind
// class can't gate it the way the rest of this app handles reduced motion.
// matchMedia is guarded, not assumed: jsdom (and any non-browser render
// path) doesn't implement it, and an unguarded call there is a hard crash
// rather than a degraded animation.
function subscribeReducedMotion(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotion() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

/**
 * Fullscreen for one element, tracked off the browser's own
 * `fullscreenchange` event rather than a local boolean - Esc and the
 * browser's own exit affordance both leave fullscreen without going through
 * our button, and a local-only flag would desync on either.
 *
 * `supported` is false in jsdom and in any browser where the API is absent
 * or blocked; callers hide the button rather than render one that no-ops.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const subscribe = useCallback((callback: () => void) => {
    document.addEventListener("fullscreenchange", callback);
    return () => document.removeEventListener("fullscreenchange", callback);
  }, []);

  const isFullscreen = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement === ref.current,
    () => false,
  );

  // Read through the same store rather than an effect + state: the answer is
  // a property of the environment, never changes after load, and the server
  // snapshot must be false so SSR and the first client render agree.
  const supported = useSyncExternalStore(
    NEVER_CHANGES,
    () => typeof document.exitFullscreen === "function",
    () => false,
  );

  const toggle = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    // Both calls return a promise that rejects when the gesture wasn't
    // user-initiated or the document disallows fullscreen; nothing to
    // recover, and an unhandled rejection would surface as a console error.
    if (document.fullscreenElement === element) void document.exitFullscreen?.().catch(() => {});
    else if (typeof element.requestFullscreen === "function") void element.requestFullscreen().catch(() => {});
  }, [ref]);

  return { isFullscreen, supported, toggle };
}
