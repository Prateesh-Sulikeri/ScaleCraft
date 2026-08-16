"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { flushDirtyRows } from "@/persistence/flush-dirty";

/**
 * Phase 1.3 (pending-6.1.0-poa.md) - flushes every dirty row on mount and
 * whenever the browser regains connectivity. Fire-and-forget, same as every
 * other sync call in this app (see cloud-sync.ts's module doc comment) - a
 * failed flush just leaves rows dirty for the next one.
 *
 * Mounted in src/app/layout.tsx (root) since Phase 11 made most routes
 * public - gates on `isSignedIn` itself rather than relying on a gated
 * layout to decide whether it should run at all. A signed-out visitor never
 * has a dirty row (Phase 11: no anonymous local writes), so this is a no-op
 * for them by construction, but the explicit check avoids firing a fetch
 * against /api/sync/* that would only 401.
 */
export function FlushDirtyRows() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;
    void flushDirtyRows();
    const onOnline = () => void flushDirtyRows();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [isSignedIn]);
  return null;
}
