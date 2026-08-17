"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { ReleaseNotesModal } from "@/app/ReleaseNotesModal";
import { isRecentRelease, LATEST_RELEASE } from "./release-info";

/**
 * Opens the changelog (ReleaseNotesModal). Home offers this once, on the alpha
 * announcement card - an earlier draft also put it beside the hero's primary
 * CTA, which was the same action to the same dialog sitting two inches away
 * from itself.
 *
 * `now` is null pre-mount, which is what keeps the NEW chip from rendering on
 * the server with a date the client might disagree with.
 */
export function SeeWhatsNewButton({ now }: { now: number | null }) {
  const [open, setOpen] = useState(false);
  const showNew = now != null && isRecentRelease(LATEST_RELEASE.date, now);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3.5 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
      >
        <Gift size={14} aria-hidden="true" />
        Check Updates
        {/* Accent blue, like every other UI element in the hero - and pointedly
         * not a `--mode-*` hue, since those are the mode-identity channel and
         * this chip is not about a mode. Hidden from the a11y tree: it would
         * otherwise read "See what's new New". */}
        {showNew && (
          <span
            aria-hidden="true"
            className="rounded-sm border border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] bg-hero-accent/12 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-hero-accent"
          >
            New
          </span>
        )}
      </button>
      {open && <ReleaseNotesModal onClose={() => setOpen(false)} />}
    </>
  );
}
