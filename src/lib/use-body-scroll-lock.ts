import { useEffect } from "react";

/**
 * Freezes the page behind an open overlay for as long as the caller is
 * mounted. Without it, a wheel gesture that starts over a modal - or one that
 * reaches the end of the modal's own scroll - chains through to the document
 * and scrolls the page underneath, which is what happened behind every
 * CenteredModal dialog.
 *
 * Ref-counted rather than a plain set/restore: two overlays can be open at
 * once (a dialog over the guided tour, a confirm over a dialog), and the first
 * one to unmount must not un-freeze the page while the second is still up.
 * Only the last release restores the original value.
 *
 * The scrollbar's width is paid back as padding so removing it doesn't shift
 * the page sideways under the backdrop.
 */
let lockCount = 0;
let restore: { overflow: string; paddingRight: string } | null = null;

export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      const { body } = document;
      restore = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      if (gutter > 0) {
        const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + gutter}px`;
      }
      body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && restore) {
        document.body.style.overflow = restore.overflow;
        document.body.style.paddingRight = restore.paddingRight;
        restore = null;
      }
    };
  }, [active]);
}
