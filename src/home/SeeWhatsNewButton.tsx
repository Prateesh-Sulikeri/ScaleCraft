"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ReleaseNotesModal } from "@/app/ReleaseNotesModal";
import { isRecentRelease, LATEST_RELEASE } from "./release-info";

/**
 * Release chip above the hero headline - opens the changelog
 * (ReleaseNotesModal). It replaced the hero's alpha announcement card, which
 * spent half the hero on news; the board preview owns that space now.
 *
 * `now` is null pre-mount, which keeps the NEW marker from rendering on the
 * server with a date the client might disagree with.
 */
export function SeeWhatsNewButton({ now }: { now: number | null }) {
  const [open, setOpen] = useState(false);
  const showNew = now != null && isRecentRelease(LATEST_RELEASE.date, now);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2.5 rounded-full border border-[color:color-mix(in_srgb,var(--hero-accent)_30%,var(--border))] bg-panel py-1 pl-1 pr-3 text-xs text-foreground/70 transition-colors duration-150 ease-out hover:border-[color:color-mix(in_srgb,var(--hero-accent)_60%,var(--border))] hover:text-foreground"
      >
        <span className="rounded-full bg-hero-accent/12 px-2 py-0.5 font-mono text-[11px] text-hero-accent">
          v{LATEST_RELEASE.version}
        </span>
        <span>
          Alpha is live <span className="px-0.5 text-foreground/50">·</span> What&apos;s new
        </span>
        {/* Hidden from the a11y tree, or the name reads "What's new New". */}
        {showNew && (
          <span
            aria-hidden="true"
            className="rounded-sm border border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-hero-accent"
          >
            New
          </span>
        )}
        <ArrowRight
          size={12}
          aria-hidden="true"
          className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </button>
      {open && <ReleaseNotesModal onClose={() => setOpen(false)} />}
    </>
  );
}
