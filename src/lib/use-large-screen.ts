import { useSyncExternalStore } from "react";

/**
 * Below this, the app refuses to render — see MVP_SCOPE.md's "Desktop-first"
 * call: the drag/connect/configure interaction model isn't built for a
 * phone/tablet-touch screen yet ("Mobile/touch-optimized canvas" is
 * explicitly a later phase, not a bug).
 *
 * A single width threshold can't tell "an iPad at 768px" apart from "a
 * desktop Chrome window resized to 768px" — they report the identical
 * `innerWidth`, so a shrunk desktop window would pass the same test a real
 * tablet does. The two need different minimums, split by primary pointer
 * (`pointer: coarse` = touch-primary, `pointer: fine` = mouse/trackpad —
 * see adapt.md's "detect input method, not just screen size"):
 * - Touch-primary devices (tablets): iPad-and-up, matching Tailwind's own
 *   `md` breakpoint / the conventional tablet-starts-at-768 line.
 * - Mouse/trackpad-primary devices (desktop/laptop): a genuinely large
 *   window, not just tablet-width — matches the conventional
 *   desktop-starts-at-1024 line, so someone floating/resizing a browser
 *   window down to iPad-width on a desktop still gets blocked.
 */
export const TABLET_MIN_WIDTH = 768;
export const DESKTOP_MIN_WIDTH = 1024;

function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

function isLargeScreen(): boolean {
  const width = window.innerWidth;
  // The device's shorter physical dimension, orientation-independent (an
  // iPhone Pro Max is 932px wide sideways, but its short side is still
  // ~430px) — closes the "rotate a phone to landscape" loophole a viewport
  // width check alone would miss.
  const deviceMin = Math.min(window.screen.width, window.screen.height);

  if (isCoarsePointer()) {
    return width >= TABLET_MIN_WIDTH && deviceMin >= TABLET_MIN_WIDTH;
  }
  return width >= DESKTOP_MIN_WIDTH;
}

function subscribe(callback: () => void) {
  const pointerQuery = window.matchMedia("(pointer: coarse)");
  window.addEventListener("resize", callback);
  window.addEventListener("orientationchange", callback);
  // Covers a 2-in-1 switching between keyboard/mouse and tablet mode
  // mid-session, not just resize/rotation.
  pointerQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("orientationchange", callback);
    pointerQuery.removeEventListener("change", callback);
  };
}

/** Re-evaluates live on resize, orientation change, and pointer-type change —
 * not just a one-time check at load. */
export function useIsLargeScreen(): boolean {
  return useSyncExternalStore(subscribe, isLargeScreen, () => true);
}

/** Primitive (not derived per-render from `window` directly) so it's safe to
 * read during render — only for the blocked screen's own diagnostic text. */
export function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => DESKTOP_MIN_WIDTH,
  );
}

/** Also just for the blocked screen's diagnostic text — which minimum applied. */
export function useRequiredWidth(): number {
  return useSyncExternalStore(
    subscribe,
    () => (isCoarsePointer() ? TABLET_MIN_WIDTH : DESKTOP_MIN_WIDTH),
    () => DESKTOP_MIN_WIDTH,
  );
}
