"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { clearLocalStateOnSignOut } from "@/persistence/db";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { useCustomComponentsStore } from "@/canvas/custom-components-store";

/**
 * Close-out P1.1 (pending-6.1.0-poa.md) — Phase 11 made reading public but
 * gave sign-out nowhere to put the previous account's state: the progress
 * and custom-components stores are module singletons that survive the
 * client-side navigation Clerk's default sign-out does, so the now-public
 * Home canvas kept rendering the signed-out account's completions. Mounted
 * in the root layout next to LocalStateGate, same as FlushDirtyRows /
 * RefreshFromCloud — reacts to Clerk's client-side `isSignedIn` rather than
 * relying on a document load that Phase 11 no longer guarantees happens.
 *
 * Fires the first time `isSignedIn` reads `false` after having been `true`
 * at some earlier point — not a strict last-render `true -> false` check.
 * Clerk's `isSignedIn` can pass back through `undefined` (loading) mid
 * sign-out before settling on `false`; a literal previous-render comparison
 * would see `true -> undefined` (no match, skipped) then `undefined ->
 * false` (also no match) and never fire at all, which is exactly the "still
 * there until a hard reload" bug this component exists to prevent.
 * `wasEverSignedIn` only ever moves forward within one sign-in/out cycle,
 * and `hasReset` stops a `false` render from re-running this after the
 * first one; both re-arm the moment `isSignedIn` reads `true` again, so a
 * second sign-out in the same tab is caught too. A visitor who was never
 * signed in this session never trips it — `wasEverSignedIn` starts `false`.
 */
export function ResetOnSignOut() {
  const { isSignedIn } = useAuth();
  const wasEverSignedIn = useRef(false);
  const hasReset = useRef(false);

  useEffect(() => {
    if (isSignedIn === true) {
      wasEverSignedIn.current = true;
      hasReset.current = false;
      return;
    }
    if (isSignedIn === false && wasEverSignedIn.current && !hasReset.current) {
      hasReset.current = true;
      useCurriculumProgressStore.getState().reset();
      useCustomComponentsStore.getState().reset();
      void clearLocalStateOnSignOut();
    }
  }, [isSignedIn]);

  return null;
}
