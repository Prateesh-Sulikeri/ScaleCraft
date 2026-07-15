"use client";

import { createPortal } from "react-dom";

type LoadingTransitionProps = {
  /** Shown under the mark, e.g. "Loading Sandbox…". */
  label: string;
};

/**
 * Purely presentational — a controlled overlay, shown for exactly as long
 * as the caller renders it. Deliberately NOT driven by `next/link`'s
 * `useLinkStatus()` (an earlier version was): Next.js prefetches viewport
 * links by default, so a click into an already-prefetched route often
 * never produces an observable "pending" window at all — the transition
 * would skip or flash instead of holding for a deliberate duration. See
 * ModeNode.tsx for the click-intercept + timed `router.push` that now
 * drives `visible` from the outside, guaranteeing the hold duration
 * regardless of how fast the underlying navigation actually is.
 */
export function LoadingTransition({ label }: LoadingTransitionProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          backgroundColor: "var(--foreground)",
          WebkitMaskImage: "url(/logo-mask.png)",
          maskImage: "url(/logo-mask.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
      <div className="relative h-0.5 w-40 overflow-hidden rounded-full bg-border">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-foreground/60 motion-safe:animate-[sweep_1.1s_ease-in-out_infinite] motion-reduce:w-full" />
      </div>
      <p className="text-sm text-foreground/60" role="status" aria-live="polite">
        {label}
      </p>
    </div>,
    document.body,
  );
}
