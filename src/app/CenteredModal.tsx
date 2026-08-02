"use client";
"use client";

import { X } from "lucide-react";

type CenteredModalProps = {
  title: string;
  /** Rendered next to the title, e.g. a version badge - optional, absent for
   * plain-text callers like AboutButton. */
  titleAdornment?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

/**
 * Backdrop + centered panel, the same convention as CreateComponentModal.tsx
 * - the shared shell for every Home dialog (AboutButton.tsx's static About
 * text, ReleaseNotesButton.tsx's structured version list) instead of each
 * hand-rolling its own backdrop+panel.
 */
export function CenteredModal({ title, titleAdornment, children, onClose }: CenteredModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[var(--z-modal)] flex max-h-[70vh] w-[820px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {titleAdornment}
          </div>
          <button onClick={onClose} aria-label="Close docs" className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
