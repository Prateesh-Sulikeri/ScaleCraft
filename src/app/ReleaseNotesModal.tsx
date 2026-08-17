"use client";

import { releaseNotes } from "@/content/release-notes";
import { CenteredModal } from "./CenteredModal";

/**
 * The changelog dialog, extracted from the old ReleaseNotesButton so more
 * than one trigger can open it - Home's redesigned hero and its alpha
 * announcement card both offer "See what's new", and each owns its own open
 * state rather than sharing global state for a dialog.
 *
 * Shares CenteredModal with AboutModal.tsx rather than hand-rolling its own
 * backdrop+panel - one modal shell for every Home dialog.
 */
export function ReleaseNotesModal({ onClose }: { onClose: () => void }) {
  const latest = releaseNotes[0];

  return (
    <CenteredModal
      title="Release notes"
      titleAdornment={
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">
          Alpha {latest.version}
        </span>
      }
      onClose={onClose}
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
