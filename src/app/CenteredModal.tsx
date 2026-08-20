"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type CenteredModalProps = {
  title: string;
  /** Rendered next to the title, e.g. a version badge - optional, absent for
   * plain-text callers like AboutButton. */
  titleAdornment?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  /** "default" (820px, most dialogs), "wide" (ShortcutsModal.tsx's
   * multi-column shortcut list needs the extra horizontal room a
   * single-column dialog like Release notes never does), "viewport"
   * (AboutModal.tsx - a fixed near-viewport panel whose content scales to
   * fit rather than scrolling), or "full" (AllActivityModal.tsx - also fixed,
   * but its two columns each own their scroll). */
  size?: "default" | "wide" | "viewport" | "full";
  /** Drops the title bar and floats the close control over the content
   * instead, and hands the content area its own padding and overflow. For
   * dialogs that carry their own headline (AboutModal.tsx), where the chrome
   * title would just repeat it. `title` is still required - it names the
   * close button for screen readers. */
  hideHeader?: boolean;
};

const PANEL_SIZE = {
  default: "max-h-[70vh] w-[820px]",
  wide: "max-h-[85vh] w-[min(1200px,94vw)]",
  viewport: "h-[min(940px,95vh)] w-[min(1340px,96vw)]",
  full: "h-[88vh] w-[min(1320px,94vw)]",
};

/**
 * Backdrop + centered panel, the same convention as CreateComponentModal.tsx
 * - the shared shell for every Home dialog (AboutButton.tsx's static About
 * text, ReleaseNotesButton.tsx's structured version list) instead of each
 * hand-rolling its own backdrop+panel.
 */
export function CenteredModal({
  title,
  titleAdornment,
  children,
  onClose,
  size = "default",
  hideHeader = false,
}: CenteredModalProps) {
  /* Named after the dialog it closes - a page can hold more than one of
     these, and "Close" alone does not say which. */
  const closeLabel = `Close ${title}`;

  /* Every dialog on this shell used to let a wheel gesture over the panel
     scroll the page behind it. */
  useBodyScrollLock();

  /* Portalled to <body>, not rendered in place. `position: fixed` resolves
     against the nearest transformed ancestor rather than the viewport, and
     Home wraps its whole page in PageEnter.tsx, whose `page-enter` animation
     runs with `both` - so its `transform: translateY(0)` sticks around after
     the animation ends. Every dialog opened from Home was therefore being
     laid out inside Home's scrolling column and clipped by it, which read as
     the header cutting off the top of the panel. A portal takes the dialog
     out of that subtree entirely, so no page's layout can reach it. */
  const dialog = (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div
        className={`fixed left-1/2 top-1/2 z-[var(--z-modal)] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl ${PANEL_SIZE[size]}`}
      >
        {hideHeader ? (
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 z-10 text-foreground/50 hover:text-foreground"
          >
            <X size={18} />
          </button>
        ) : (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{title}</h2>
              {titleAdornment}
            </div>
            <button onClick={onClose} aria-label={closeLabel} className="text-foreground/50 hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        )}
        {/* Chromeless callers own their padding and overflow - AboutModal
            scales its content to the panel instead of scrolling inside it.
            overscroll-contain keeps a scroll that bottoms out inside the panel
            from chaining to the page behind it. */}
        <div className={hideHeader ? "flex min-h-0 flex-1 flex-col" : "flex-1 overflow-y-auto overscroll-contain p-4"}>
          {children}
        </div>
      </div>
    </>
  );

  /* Every caller mounts this on a click, so there is no server pass to
     mismatch - but guard anyway rather than assume it. */
  return typeof document === "undefined" ? null : createPortal(dialog, document.body);
}
