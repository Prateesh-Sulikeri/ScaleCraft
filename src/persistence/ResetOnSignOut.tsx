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
 * Only fires on a true->false transition, not on `isSignedIn` first
 * resolving to false for a visitor who was never signed in this session —
 * `wasSignedIn` starts at whatever useAuth() returns on mount (`undefined`
 * while loading), so a currently-signed-out visitor never trips it.
 */
export function ResetOnSignOut() {
  const { isSignedIn } = useAuth();
  const wasSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (wasSignedIn.current && isSignedIn === false) {
      useCurriculumProgressStore.getState().reset();
      useCustomComponentsStore.getState().reset();
      void clearLocalStateOnSignOut();
    }
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  return null;
}
