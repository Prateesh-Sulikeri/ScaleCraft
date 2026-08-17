"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { AuthPromptDialog } from "./AuthPromptDialog";

type UseRequireAuthAction = {
  requireAuth: (action: () => void) => void;
  /** Render this at the call site (anywhere - it's self-positioning via
   *  `fixed`, same as AuthPromptDialog/ExamConfirmSubmitDialog) whenever
   *  `requireAuth` is used. Null when there's nothing to show. */
  dialog: ReactNode;
};

/**
 * Release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md, "read without an
 * account") - most routes are public now, but a handful of actions on those
 * public pages still write progress (the Learning Path's mark-complete
 * toggle, the lesson reader's "Take the quiz" / "Begin exercise"). Those get
 * gated at the action, not the route (11.5) - this is the one place that
 * does it, so a signed-out click never reaches a mutator instead of every
 * call site re-deriving the check.
 *
 * A signed-out click no longer redirects straight to sign-in - it opens
 * AuthPromptDialog first, explaining why (they'd otherwise bounce off the
 * page with no context), and only redirects on confirm. Sends the visitor to
 * sign-in with the current page as the return destination (11.5's "preserve
 * intent" - land back on the chapter they were on, not the home canvas),
 * rather than replaying the click itself, which would need state to survive
 * a full OAuth redirect for no real benefit - the learner is back on the
 * exact row/card they clicked and can click again.
 */
export function useRequireAuthAction(): UseRequireAuthAction {
  const { isLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const pathname = usePathname();
  const [promptOpen, setPromptOpen] = useState(false);
  // A click that arrived before Clerk resolved, still waiting on it.
  const [clickHeld, setClickHeld] = useState(false);
  const heldAction = useRef<(() => void) | null>(null);
  const heldActionRun = useRef(false);

  // Runs the held click once the session resolves. Deliberately no setState
  // here - the signed-out outcome is derived below instead.
  useEffect(() => {
    if (!isLoaded || !clickHeld || heldActionRun.current) return;
    heldActionRun.current = true;
    const action = heldAction.current;
    heldAction.current = null;
    if (isSignedIn) action?.();
  }, [isLoaded, isSignedIn, clickHeld]);

  const requireAuth = (action: () => void) => {
    // `isSignedIn` is undefined until Clerk loads, so branching on it alone
    // shows "Sign in required" to a user who is in fact signed in. Same bug
    // ModeNode.tsx already guards against; this hook was missed. It holds
    // the click rather than falling through the way ModeNode does, because
    // these actions are progress *writes* - running one before the session
    // resolves just fails at the API.
    if (!isLoaded) {
      heldAction.current = action;
      heldActionRun.current = false;
      setClickHeld(true);
      return;
    }
    if (isSignedIn) {
      action();
      return;
    }
    setPromptOpen(true);
  };

  // A held click that resolved to signed-out prompts too, without the effect
  // needing to set state for it.
  const showPrompt = promptOpen || (clickHeld && isLoaded && !isSignedIn);

  const dismiss = () => {
    setPromptOpen(false);
    setClickHeld(false);
    heldAction.current = null;
  };

  const dialog = showPrompt ? (
    <AuthPromptDialog
      onCancel={dismiss}
      onConfirm={() => {
        dismiss();
        void redirectToSignIn({ redirectUrl: pathname });
      }}
    />
  ) : null;

  return { requireAuth, dialog };
}
