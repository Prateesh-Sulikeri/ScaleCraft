"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEscapeKey } from "@/lib/use-escape-key";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type MobileDrawerProps = {
  onClose: () => void;
  /** Names the panel for screen readers and the close button - not rendered
   *  as a visible heading, since callers (ReaderSidebar) already carry their
   *  own. */
  title: string;
  children: React.ReactNode;
  /** Edge the panel slides in from and stays pinned to. "left" for primary
   *  navigation (ReaderSidebar), "right" for secondary/contextual panels
   *  (a page's own ToC). */
  side?: "left" | "right";
};

const SIDE_CLASS: Record<"left" | "right", string> = {
  left: "left-0 border-r motion-safe:animate-[drawer-enter-left_200ms_ease-out]",
  right: "right-0 border-l motion-safe:animate-[drawer-enter-right_200ms_ease-out]",
};

/**
 * The off-canvas shell for the fixed-width sidebars that need the same
 * narrow-viewport treatment (pending-responsive.md Phase 2): slide-in panel +
 * backdrop + Escape to close, reusing the same hooks CenteredModal.tsx does.
 *
 * No `open` prop, on purpose, matching CenteredModal's own convention - the
 * caller conditionally mounts it (`{navOpen && <MobileDrawer .../>}`) rather
 * than always mounting and toggling visibility. useEscapeKey's stack is
 * ordered by mount time, so two drawers mounted unconditionally side by side
 * (a nav drawer and a ToC drawer, say) would have Escape always closing
 * whichever mounted last, regardless of which one is actually open - the
 * same reason every `{condition && <CenteredModal/>}` call site in the app
 * mounts on demand instead of passing a boolean through.
 *
 * Portaled to document.body for the same reason CenteredModal is - a host
 * page wrapped in PageEnter carries a lasting CSS transform (its enter
 * animation's `both` fill), and `position: fixed` resolves against that
 * ancestor instead of the viewport if rendered inline.
 */
export function MobileDrawer({ onClose, title, children, side = "left" }: MobileDrawerProps) {
  useEscapeKey(onClose);
  useBodyScrollLock();
  const mounted = useHasMounted();

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed inset-y-0 z-[var(--z-modal)] flex w-[min(300px,84vw)] flex-col overflow-hidden border-border bg-panel shadow-xl motion-reduce:animate-none ${SIDE_CLASS[side]}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:text-foreground"
        >
          <X size={16} />
        </button>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </>,
    document.body,
  );
}
