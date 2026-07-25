"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { releaseNotes } from "@/content/release-notes";

/**
 * Mounted once in the root layout (not per-page) so it's present no matter
 * which mode is active — Sandbox, Building Blocks, Real World Extraction, or
 * Home. Fixed bottom-left, the one screen corner not already claimed by
 * per-page chrome: react-flow's own zoom Controls were moved to
 * bottom-right in Canvas.tsx to free this spot, and Home's AboutButton
 * (page.tsx) was shifted up to stack above it rather than overlap.
 *
 * Same "modal with backdrop" convention as CreateComponentModal.tsx — a
 * short structured list (version + a few bullets), not long-form docs, so
 * DocsModal's draggable window would be overkill here.
 */
export function ReleaseNotesButton() {
  const [open, setOpen] = useState(false);
  const latest = releaseNotes[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Release notes"
        className="fixed bottom-6 left-6 z-[var(--z-canvas-overlay)] flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 shadow-lg hover:text-foreground"
      >
        <Megaphone size={14} />
        Release notes
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-[var(--z-modal)] flex max-h-[70vh] w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Release notes</h2>
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">
                  Alpha {latest.version}
                </span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/50 hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
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
                          <span className="text-foreground/40">–</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
