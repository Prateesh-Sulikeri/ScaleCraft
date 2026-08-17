"use client";

import { X } from "lucide-react";

type CenteredModalProps = {
  title: string;
  /** Rendered next to the title, e.g. a version badge - optional, absent for
   * plain-text callers like AboutButton. */
  titleAdornment?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  /** "default" (820px, most dialogs), "wide" (ShortcutsModal.tsx's
   * multi-column shortcut list needs the extra horizontal room a
   * single-column dialog like About/Release notes never does), or "full"
   * (AllActivityModal.tsx - a fixed near-viewport panel, so its own two
   * columns can each own their scroll rather than the panel resizing per
   * row count). */
  size?: "default" | "wide" | "full";
};

const PANEL_SIZE = {
  default: "max-h-[70vh] w-[820px]",
  wide: "max-h-[85vh] w-[min(1200px,94vw)]",
  full: "h-[88vh] w-[min(1320px,94vw)]",
};

/**
 * Backdrop + centered panel, the same convention as CreateComponentModal.tsx
 * - the shared shell for every Home dialog (AboutButton.tsx's static About
 * text, ReleaseNotesButton.tsx's structured version list) instead of each
 * hand-rolling its own backdrop+panel.
 */
export function CenteredModal({ title, titleAdornment, children, onClose, size = "default" }: CenteredModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div
        className={`fixed left-1/2 top-1/2 z-[var(--z-modal)] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl ${PANEL_SIZE[size]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {titleAdornment}
          </div>
          {/* Named after the dialog it closes - a page can hold more than one
              of these, and "Close" alone does not say which. */}
          <button onClick={onClose} aria-label={`Close ${title}`} className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
