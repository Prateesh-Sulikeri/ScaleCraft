"use client";

import { useEscapeKey } from "@/lib/use-escape-key";

type AuthPromptDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

/** Styled in-app dialog, not native `window.confirm` (same precedent as
 * ExamConfirmSubmitDialog.tsx) - shown by useRequireAuthAction before it
 * redirects a signed-out visitor to sign-in, so the click doesn't bounce
 * them off the page with no explanation. Same copy and same dialog
 * regardless of which gated action triggered it (quiz, exercise, mark
 * complete) - one message covers all three. */
export function AuthPromptDialog({ onCancel, onConfirm }: AuthPromptDialogProps) {
  // Escape declines, matching the backdrop click - the safe half of a
  // choice that otherwise navigates away from the page.
  useEscapeKey(onCancel);

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)]" onClick={onCancel} />
      <div className="pointer-events-none fixed inset-0 z-[var(--z-modal)] grid place-items-center px-4">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Sign in required"
          className="pointer-events-auto w-80 max-w-full rounded-md border border-border bg-panel p-4 shadow-lg"
        >
          <p className="text-sm font-medium text-foreground">Sign in to continue</p>
          <p className="mt-1 text-xs text-foreground/60">
            You need an account to take quizzes, do exercises, and save your progress. You can keep reading without
            one.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border/40"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
            >
              Sign in / sign up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
