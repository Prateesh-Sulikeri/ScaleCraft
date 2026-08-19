"use client";

import { useSyncExternalStore } from "react";

/**
 * The unread-bug count behind the Report a Bug badge, held in one module-level
 * store rather than per-button state.
 *
 * Two buttons can be mounted at once (the focus-mode bar keeps the header's
 * alive behind it), and the modal's own list is a fresher source of the same
 * number than the badge endpoint is. A shared store means all of them show one
 * number: reading a report inside the modal clears the badge on the button
 * that opened it, with no prop threading between unrelated trees.
 *
 * Deliberately not a React context: the buttons live in five different page
 * headers with no common ancestor short of the root layout, and a provider up
 * there would re-render the whole app on a count change.
 */

/** null = not fetched yet, which renders as no badge rather than a zero. */
let count: number | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setUnreadBugCount(next: number) {
  if (count === next) return;
  count = next;
  emit();
}

/** Test seam - module state outlives a render tree, so a suite that set a
 *  count would otherwise leak it into the next case. */
export function resetUnreadBugCount() {
  count = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return count;
}

/** Server snapshot is always null: the count is per-user and unknowable at
 *  render time, and a badge in the HTML would flash the wrong number. */
function getServerSnapshot(): number | null {
  return null;
}

export function useUnreadBugCount(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
