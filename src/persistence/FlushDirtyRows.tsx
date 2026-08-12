"use client";

import { useEffect } from "react";
import { flushDirtyRows } from "@/persistence/flush-dirty";

/**
 * Phase 1.3 (pending-6.1.0-poa.md) - flushes every dirty row on mount and
 * whenever the browser regains connectivity. Fire-and-forget, same as every
 * other sync call in this app (see cloud-sync.ts's module doc comment) - a
 * failed flush just leaves rows dirty for the next one.
 *
 * Mounted in src/app/(protected)/layout.tsx, alongside LocalStateGate.
 */
export function FlushDirtyRows() {
  useEffect(() => {
    void flushDirtyRows();
    const onOnline = () => void flushDirtyRows();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return null;
}
