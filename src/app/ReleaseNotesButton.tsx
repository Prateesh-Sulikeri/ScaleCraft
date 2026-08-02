"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { releaseNotes } from "@/content/release-notes";
import { CenteredModal } from "./CenteredModal";

/**
 * Mounted only on the Home page (page.tsx) — release notes are a landing-page
 * affordance, not chrome that should follow the user into every mode. Fixed
 * bottom-left, the one screen corner not already claimed by per-page chrome:
 * react-flow's own zoom Controls were moved to bottom-right in Canvas.tsx to
 * free this spot, and Home's AboutButton (page.tsx) is shifted up to stack
 * above it rather than overlap.
 *
 * Shares CenteredModal with AboutButton.tsx rather than hand-rolling its own
 * backdrop+panel — one modal shell for every Home dialog instead of a
 * bespoke variant per button.
 */
export function ReleaseNotesButton() {
  const [open, setOpen] = useState(false);
  const latest = releaseNotes[0];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Release notes"
        className="fixed bottom-6 left-6 z-[var(--z-canvas-overlay)] flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 shadow-lg hover:text-foreground"
      >
        <Megaphone size={14} />
        Release notes
      </button>
    );
  }

  return (
    <CenteredModal
      title="Release notes"
      titleAdornment={
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">
          Alpha {latest.version}
        </span>
      }
      onClose={() => setOpen(false)}
    >
      <ul className="flex flex-col gap-5">
        {releaseNotes.map((note) => (
          <li key={note.version}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-foreground">{note.version}</span>
              <span className="text-xs text-foreground/50">{note.date}</span>
            </div>
            <ul className="mt-1.5 flex flex-col gap-1">
              {note.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm leading-relaxed text-foreground/80">
                  <span className="text-foreground/40">-</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </CenteredModal>
  );
}
