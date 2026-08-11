"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(hover: hover)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover)").matches;
}

/** True only on pointer devices that support real hover (mouse/trackpad) -
 * gates `<Ref>`'s hover-preview layer. Tap-to-open itself is never gated by
 * this - see Ref.tsx. */
export function usePointerHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
