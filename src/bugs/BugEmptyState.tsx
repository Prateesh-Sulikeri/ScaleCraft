"use client";

import { Bug } from "lucide-react";

/**
 * Shown instead of an empty table. Centered and deliberately sparse - there
 * is exactly one thing to do here, and framing it as a table with no rows
 * would imply the list is the point when the action is.
 */
export function BugEmptyState({ onReportNew }: { onReportNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/35"
      >
        <Bug size={18} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No bugs reported yet</p>
        <p className="max-w-xs text-sm leading-relaxed text-foreground/55">
          Found something broken or wrong? Tell us what happened and it lands with the author directly.
        </p>
      </div>
      <button
        type="button"
        onClick={onReportNew}
        className="mt-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
      >
        Report a bug
      </button>
    </div>
  );
}
