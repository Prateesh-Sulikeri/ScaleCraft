"use client";

import { useEffect } from "react";

/** Bump to re-run the reset for a future release. Stored value is the last
 * epoch this browser has already been cleared for. */
const EPOCH = "6.1.0";
const EPOCH_KEY = "scalecraft:storage-epoch";

/** Everything this app writes to localStorage: tour run state (`sc-tour-*`),
 * the insert hint (`sc-insert-hint-dismissed`), the Deep Check panel width and
 * tour log (`scalecraft:*`). Prefix-matched rather than listed by name so a
 * key added later is not silently missed. */
const PREFIXES = ["sc-", "scalecraft:"];

/**
 * localStorage half of the 6.1.0 one-time reset. The Dexie half is a schema
 * version bump (see db.ts's version(10)) — that one is order-safe by
 * construction, this one runs on mount because none of these keys is
 * account-sensitive enough to matter if a component reads it one tick early
 * (see pending-persistence-audit.md S10).
 *
 * Mounted in src/app/(protected)/layout.tsx, replacing the removed
 * BackfillOnMount.
 */
export function LocalStorageReset() {
  useEffect(() => {
    try {
      if (localStorage.getItem(EPOCH_KEY) === EPOCH) return;
      const stale = Object.keys(localStorage).filter((key) =>
        PREFIXES.some((prefix) => key.startsWith(prefix)),
      );
      stale.forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(EPOCH_KEY, EPOCH);
    } catch {
      // Private-mode / disabled storage. Nothing to clear, nothing to do.
    }
  }, []);
  return null;
}
