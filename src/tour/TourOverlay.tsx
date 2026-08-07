"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TourStep, TourStepTarget } from "./types";

type Rect = { top: number; left: number; width: number; height: number };
type Size = { width: number; height: number };
type Pos = { top: number; left: number };
type Side = "top" | "bottom" | "left" | "right";

/** Whether the current step is waiting on a real user gesture, and if so
 * whether it's already happened — drives the Next button vs. the "try it"
 * status line, nothing else. */
export type TourInteractionState = "none" | "waiting" | "satisfied";

/**
 * An element's rect intersected with every clipping ancestor and the
 * viewport - i.e. the part of it a learner can actually see.
 *
 * A raw getBoundingClientRect reports where an element *would* be, not where
 * it's visible, so a target scrolled past its own panel's fold still yields
 * a full-size rect somewhere off-screen. That's what broke chapter 0.1 once
 * its lesson copy grew: the sidebar's hints block sits below the fold, and
 * the tour drew its spotlight down there - dimming the whole screen while
 * the card said "here" and pointed at nothing. Returning null when nothing
 * is visible makes that case degrade to the docked-card fallback instead of
 * an invisible ring.
 */
function visibleRect(el: Element): Rect | null {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;

  let { top, left, bottom, right } = r;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const style = getComputedStyle(p);
    if (style.overflowY === "visible" && style.overflowX === "visible") continue;
    const pr = p.getBoundingClientRect();
    if (style.overflowY !== "visible") {
      top = Math.max(top, pr.top);
      bottom = Math.min(bottom, pr.bottom);
    }
    if (style.overflowX !== "visible") {
      left = Math.max(left, pr.left);
      right = Math.min(right, pr.right);
    }
  }

  top = Math.max(top, 0);
  left = Math.max(left, 0);
  bottom = Math.min(bottom, window.innerHeight);
  right = Math.min(right, window.innerWidth);
  if (right - left <= 0 || bottom - top <= 0) return null;
  return { top, left, width: right - left, height: bottom - top };
}

function getRect(target: TourStepTarget | null): Rect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return visibleRect(el);
}

function unionRect(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let top = Infinity;
  let left = Infinity;
  let bottom = -Infinity;
  let right = -Infinity;
  for (const r of rects) {
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    bottom = Math.max(bottom, r.top + r.height);
    right = Math.max(right, r.left + r.width);
  }
  return { top, left, width: right - left, height: bottom - top };
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

/** Tracks the union of several `data-tour` targets' bounding rects live.
 *
 * Polls for the life of the step rather than for a fixed 2s window: a
 * spotlighted surface can appear at any point during a step, not just
 * shortly after it starts (the violations dropdown only exists once the
 * learner clicks Validate, which is the whole point of that step), and a
 * rect that stops being tracked is exactly how a resize mid-tour used to
 * strand the popover off-screen. Returns a referentially stable rect while
 * the measurement is unchanged, so the layout effects downstream don't
 * re-run on every poll tick. */
function measureTargets(key: string): Rect | null {
  const targets = key ? (key.split("|") as TourStepTarget[]) : [];
  return unionRect(targets.map(getRect).filter((r): r is Rect => r !== null));
}

/** Whether any part of the element is hidden by a clipping ancestor or the
 * viewport edge — i.e. whether scrolling it into view would change anything. */
function isClipped(el: Element): boolean {
  const full = el.getBoundingClientRect();
  const visible = visibleRect(el);
  if (!visible) return true;
  return (
    Math.round(visible.width) < Math.round(full.width) || Math.round(visible.height) < Math.round(full.height)
  );
}

/**
 * Brings each of a step's targets into view inside its own scroll container,
 * once, the first time that target exists.
 *
 * The lesson sidebar scrolls, so any anchor in it (the hints block, the
 * "Chapter complete" line, the Debrief) can start below the fold - and a
 * spotlight can't point at something the learner can't see. Scrolling once
 * per target rather than on every poll tick leaves them free to scroll back
 * afterwards without the tour yanking the panel around. The retry window
 * covers targets that mount a beat after the step opens.
 *
 * Only a clipped target is moved, and it's centred rather than scrolled the
 * minimum distance: "nearest" satisfies the measurement while leaving the
 * highlight flush against the panel edge, which still reads as cut off.
 */
function useScrollTargetsIntoView(key: string) {
  useEffect(() => {
    if (!key) return;
    const pending = new Set(key.split("|") as TourStepTarget[]);
    const attempt = () => {
      for (const target of [...pending]) {
        const el = document.querySelector(`[data-tour="${target}"]`);
        if (!el) continue;
        pending.delete(target);
        // Guarded: jsdom has no scrollIntoView, and a component test that
        // renders a real anchor shouldn't blow up on a purely visual nicety.
        if (isClipped(el) && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ block: "center", inline: "nearest" });
        }
      }
    };
    attempt();
    const interval = setInterval(attempt, 200);
    const stop = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [key]);
}

function useTrackedUnionRect(targets: (TourStepTarget | null)[]): Rect | null {
  // Collapsed to a string so the effect below has one primitive dependency
  // rather than an array whose identity changes every render.
  const key = targets.filter(Boolean).join("|");
  const [rect, setRect] = useState<Rect | null>(() => measureTargets(key));

  useScrollTargetsIntoView(key);

  useEffect(() => {
    const update = () =>
      setRect((prev) => {
        const next = measureTargets(key);
        return sameRect(prev, next) ? prev : next;
      });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const interval = setInterval(update, 200);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      clearInterval(interval);
    };
  }, [key]);

  return rect;
}

const SPOTLIGHT_PADDING = 8;
const POPOVER_GAP = 12;
// The highlight ring's own width. `ring-2` paints outside the element box,
// so a hole flush against a screen edge has an invisible ring on that side —
// the spotlight around the full-height lesson sidebar showed one vertical
// line and nothing else. Holes are held this far inside the viewport so all
// four edges are drawn.
const RING_WIDTH = 2;
// Keeps the popover off the physical screen edge on every viewport this
// audits (.claude/docs/pending.md's manual click-through requirement) —
// without this a flipped/shifted popover can still land flush against an
// edge, which reads as clipped even when technically in-bounds.
const VIEWPORT_MARGIN = 16;

/**
 * Above this share of the viewport, a "spotlight" stops being a highlight.
 *
 * The canvas is 70%+ of the viewport on every desktop size, so ringing it
 * told the learner nothing (four consecutive steps drew the identical
 * full-panel outline) while simultaneously making the popover unplaceable:
 * no side of a near-fullscreen hole has room for the card, and the old
 * "whichever side has the most space" fallback deliberately didn't clamp,
 * landing it at x = -16 — off-screen at every size from 1280x720 to
 * 2560x1440. A target this broad is now rendered ambiently instead: no
 * dimming, no ring, nothing blocked, card docked in a corner. See
 * .claude/docs/pending.md tour punch list #4, #5, #20, #22.
 */
const BROAD_TARGET_AREA_RATIO = 0.45;

/** Pads a measured rect out into the spotlight hole, then holds it inside
 * the viewport so the ring around it is a closed rectangle rather than one
 * or two stray lines at the screen edge. */
export function spotlightHole(rect: Rect | null, viewport: Size): Rect | null {
  if (!rect) return null;
  const top = rect.top - SPOTLIGHT_PADDING;
  const left = rect.left - SPOTLIGHT_PADDING;
  const bottom = rect.top + rect.height + SPOTLIGHT_PADDING;
  const right = rect.left + rect.width + SPOTLIGHT_PADDING;
  // A zero viewport only happens before the first measurement (SSR/initial
  // state); clamping against it would collapse every hole to nothing.
  if (viewport.width <= 0 || viewport.height <= 0) {
    return { top, left, width: right - left, height: bottom - top };
  }
  const clamped = {
    top: Math.max(top, RING_WIDTH),
    left: Math.max(left, RING_WIDTH),
    bottom: Math.min(bottom, viewport.height - RING_WIDTH),
    right: Math.min(right, viewport.width - RING_WIDTH),
  };
  return {
    top: clamped.top,
    left: clamped.left,
    width: Math.max(0, clamped.right - clamped.left),
    height: Math.max(0, clamped.bottom - clamped.top),
  };
}

function isBroadTarget(rect: Rect | null, viewport: Size): boolean {
  if (!rect) return false;
  const viewportArea = viewport.width * viewport.height;
  if (viewportArea <= 0) return false;
  return (rect.width * rect.height) / viewportArea > BROAD_TARGET_AREA_RATIO;
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const ALL_SIDES: Side[] = ["top", "bottom", "left", "right"];

/** Positions the popover for one already-chosen side. The axis toward/away
 * from `hole` uses the exact "just clear of the hole" position, which is
 * what guarantees the popover never covers the thing it's explaining; the
 * cross axis is shifted to stay in view. Both axes are clamped to the
 * viewport by the caller as a last resort — an on-screen card that slightly
 * overlaps its target beats a perfectly-placed one the learner can't see,
 * and with broad targets now handled ambiently this clamp almost never has
 * anything to do. */
function positionForSide(side: Side, hole: Rect, popover: Size, viewport: Size): Pos {
  const clampCross = (value: number, size: number, viewportSize: number) =>
    Math.min(Math.max(value, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, viewportSize - size - VIEWPORT_MARGIN));

  switch (side) {
    case "top":
      return { top: hole.top - popover.height - POPOVER_GAP, left: clampCross(hole.left, popover.width, viewport.width) };
    case "left":
      return { top: clampCross(hole.top, popover.height, viewport.height), left: hole.left - popover.width - POPOVER_GAP };
    case "right":
      return {
        top: clampCross(hole.top, popover.height, viewport.height),
        left: hole.left + hole.width + POPOVER_GAP,
      };
    case "bottom":
    default:
      return {
        top: hole.top + hole.height + POPOVER_GAP,
        left: clampCross(hole.left, popover.width, viewport.width),
      };
  }
}

function clampToViewport(pos: Pos, popover: Size, viewport: Size): Pos {
  const clamp = (value: number, size: number, viewportSize: number) =>
    Math.min(Math.max(value, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, viewportSize - size - VIEWPORT_MARGIN));
  return {
    top: clamp(pos.top, popover.height, viewport.height),
    left: clamp(pos.left, popover.width, viewport.width),
  };
}

/**
 * Chooses where the popover sits, given its REAL measured size.
 *
 * Three cases, in order: no anchor at all (welcome/wrap-up steps) centers
 * the card; a broad anchor — one too large for any side to have room, see
 * BROAD_TARGET_AREA_RATIO — docks it to the bottom-right corner, since
 * "beside the canvas" isn't a place that exists; anything else tries the
 * authored placement, then its opposite, then the two cross-axis sides, and
 * takes the first that genuinely fits. The full 4-way fallback is what
 * handles a wide-but-not-full-width target: tight top/bottom margins with
 * generous left/right ones (or vice versa) need the cross axis considered
 * too, not just the requested axis's two sides.
 */
export function computePopoverPosition(
  anchor: Rect | null,
  placement: TourStep["placement"],
  popover: Size,
  viewport: Size,
  /** What to do with no usable anchor. "center" belongs only to a step that
   * declared no target at all — a deliberately blocking welcome/wrap-up card
   * over a full backdrop. A step that DID declare a target whose element
   * isn't in the DOM right now must dock instead: the app behind it is live
   * and un-dimmed, and the middle of the screen is the worst possible place
   * to park a card there. That's the "stuck in the middle" report — picking a
   * component in the picker arms click-to-place and closes the picker, so the
   * step's own target disappeared and the card recentred onto the canvas the
   * learner then had to click. */
  fallback: "center" | "dock" = "center",
): Pos {
  const dock = () =>
    clampToViewport(
      {
        top: viewport.height - popover.height - VIEWPORT_MARGIN,
        left: viewport.width - popover.width - VIEWPORT_MARGIN,
      },
      popover,
      viewport,
    );

  if (!anchor) {
    if (fallback === "dock") return dock();
    return {
      top: (viewport.height - popover.height) / 2,
      left: (viewport.width - popover.width) / 2,
    };
  }

  if (isBroadTarget(anchor, viewport)) return dock();

  const space: Record<Side, number> = {
    top: anchor.top,
    bottom: viewport.height - (anchor.top + anchor.height),
    left: anchor.left,
    right: viewport.width - (anchor.left + anchor.width),
  };
  const needed: Record<Side, number> = {
    top: popover.height + POPOVER_GAP,
    bottom: popover.height + POPOVER_GAP,
    left: popover.width + POPOVER_GAP,
    right: popover.width + POPOVER_GAP,
  };

  const preferred: Side = placement ?? "bottom";
  const order: Side[] = [preferred, OPPOSITE[preferred], ...ALL_SIDES.filter((s) => s !== preferred && s !== OPPOSITE[preferred])];

  const side = order.find((s) => space[s] >= needed[s]) ?? order.reduce((best, s) => (space[s] > space[best] ? s : best));

  return clampToViewport(positionForSide(side, anchor, popover, viewport), popover, viewport);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type TourOverlayProps = {
  step: TourStep;
  stepIndex: number;
  stepCount: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** Escape / "Pause" — leaves the run resumable at this step, unlike Skip.
   * Escape conventionally means "close this", not "never show me this
   * again" (punch list #11/#12). */
  onPause: () => void;
  interactionState: TourInteractionState;
};

/**
 * Four-rectangle spotlight technique: the backdrop is split into up to four
 * divs framing the spotlit rect, leaving the rect itself uncovered so the
 * real element underneath stays clickable — this is what lets an interactive
 * step's real gesture (a click on the actual Validate button, say) land on
 * that button rather than on an intercepting overlay. The spotlit rect is
 * the union of `target` and any `spotlightAlso` anchors, so a control and
 * the surface it opens stay lit together (punch list #2: the violations
 * dropdown was dimmed and covered by the very step telling the learner to
 * go read it).
 *
 * A target too broad to be worth spotlighting (the canvas, at 70%+ of the
 * viewport) drops the backdrop entirely and docks the card instead — see
 * BROAD_TARGET_AREA_RATIO. Portals to `document.body` (ComponentPicker.tsx's
 * same pattern) so it always paints above the app regardless of where
 * TourController happens to be mounted in the tree.
 */
export function TourOverlay({
  step,
  stepIndex,
  stepCount,
  onNext,
  onBack,
  onSkip,
  onPause,
  interactionState,
}: TourOverlayProps) {
  const spotlightTargets = useMemo(
    () => [step.target, ...(step.spotlightAlso ?? [])],
    [step.target, step.spotlightAlso],
  );
  const rect = useTrackedUnionRect(spotlightTargets);
  // Only tracked separately when it actually differs — sharing the same rect
  // reference (not just equal value) is what keeps the popover-position
  // layout effect below from re-running on every render.
  const anchorTargets = useMemo(
    () => [step.popoverAnchor && step.popoverAnchor !== step.target ? step.popoverAnchor : null],
    [step.popoverAnchor, step.target],
  );
  const anchorRectDistinct = useTrackedUnionRect(anchorTargets);

  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<Pos | null>(null);
  const [viewport, setViewport] = useState<Size>(() =>
    typeof window === "undefined"
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight },
  );

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const hole = useMemo(() => spotlightHole(rect, viewport), [rect, viewport]);
  const anchorHole = useMemo(() => spotlightHole(anchorRectDistinct, viewport), [anchorRectDistinct, viewport]);

  // A target broad enough to be meaningless as a highlight is rendered
  // ambiently: no dimming, no ring, nothing blocked. A step with no target
  // at all still dims — that's the deliberate "stop and read this" framing
  // of the welcome/wrap-up cards, not an accident of measurement.
  const spotlightIsBroad = isBroadTarget(hole, viewport);
  const dims = step.target === null || (hole !== null && !spotlightIsBroad);
  const showsHole = dims && hole !== null;

  // What the popover actually positions against — the distinct secondary
  // anchor when the step declared one, else the primary hole (unless that's
  // the broad kind, which docks instead).
  const positionAnchorHole = anchorHole ?? hole;

  // Only a blocking step with nothing to do in the app behind it can honestly
  // claim to be modal — and only there is trapping focus safe. An interactive
  // step needs the learner to reach the real control (that's the entire
  // point), so trapping would lock a keyboard user out of the gesture the
  // step is asking for (punch list #15).
  const isModal = dims && !step.waitFor;

  // A step that declared any anchor at all must never fall back to centering
  // — see computePopoverPosition's `fallback` parameter.
  const unanchoredFallback = step.target === null && !step.popoverAnchor ? "center" : "dock";

  const reposition = useCallback(() => {
    const el = popoverRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPopoverPos(
      computePopoverPosition(
        positionAnchorHole,
        step.placement,
        { width, height },
        { width: window.innerWidth, height: window.innerHeight },
        unanchoredFallback,
      ),
    );
  }, [positionAnchorHole, step.placement, unanchoredFallback]);

  // Runs in a layout effect so the very first paint already shows the
  // corrected position (no visible jump from an initial guess). step.body is
  // a dep too — two steps can share a target/placement but differ enough in
  // copy length to change the popover's rendered height.
  useLayoutEffect(() => {
    reposition();
  }, [reposition, step.id, step.body, viewport.width, viewport.height]);

  // Moves focus into the card on every step change, so a screen reader
  // announces the new step and a keyboard user starts inside the dialog
  // rather than on whatever the page had focused (previously: BODY, with the
  // header one Tab away — punch list #15/#16).
  useEffect(() => {
    popoverRef.current?.focus({ preventScroll: true });
  }, [step.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onPause();
        return;
      }
      if (event.key === "Enter" && interactionState === "none") {
        // Don't hijack Enter when it's already going to a real control
        // inside the card (Back/Skip) — that would fire two actions at once.
        // The target can be `window` itself, which is not a Node, so the
        // instanceof guard has to come before any contains() call.
        const target = event.target;
        if (target instanceof HTMLElement && popoverRef.current?.contains(target) && target.tagName === "BUTTON") return;
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === "Tab" && isModal) {
        const card = popoverRef.current;
        if (!card) return;
        const focusable = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) {
          event.preventDefault();
          card.focus({ preventScroll: true });
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (event.shiftKey && (active === first || active === card || active === null || !card.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onPause, onNext, interactionState, isModal]);

  // pointer-events-auto here, not on the outer wrapper — the wrapper spans
  // the full viewport (`inset-0`) regardless of where its children are
  // drawn, so if IT owned the hit-testing, it would intercept clicks over
  // the hole too even though no rectangle is rendered there, silently
  // breaking every interactive step's real gesture. Each backdrop div opts
  // back into catching clicks individually instead.
  const backdropClass = "motion-reduce:transition-none pointer-events-auto fixed bg-black/50 transition-all duration-200";

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[var(--z-tour)]"
      role="dialog"
      aria-modal={isModal}
      aria-label={step.title}
      data-tour-step={step.id}
      data-tour-ambient={dims ? undefined : "true"}
    >
      {showsHole && hole ? (
        <>
          <div className={backdropClass} style={{ top: 0, left: 0, right: 0, height: Math.max(hole.top, 0) }} />
          <div className={backdropClass} style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div className={backdropClass} style={{ top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height }} />
          <div className={backdropClass} style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed rounded-md ring-2 ring-foreground/70"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />
        </>
      ) : dims ? (
        <div className={backdropClass} style={{ inset: 0 }} />
      ) : null}

      {/* A second, purely decorative ring for `popoverAnchor` — not a
       * click-through hole, just a visual pointer toward the control the
       * popover is describing this step. Suppressed when the primary
       * spotlight already drew a ring, so a step never shows two rings with
       * nothing saying which one is actionable (punch list #22). */}
      {anchorHole && !showsHole && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-md ring-2 ring-foreground/70"
          style={{ top: anchorHole.top, left: anchorHole.left, width: anchorHole.width, height: anchorHole.height }}
        />
      )}

      <div
        ref={popoverRef}
        tabIndex={-1}
        className="pointer-events-auto fixed w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-md border border-border bg-panel p-4 shadow-lg outline-none"
        style={popoverPos ? { top: popoverPos.top, left: popoverPos.left } : { top: 0, left: 0, visibility: "hidden" }}
      >
        <p className="text-xs font-semibold text-foreground/50">
          {stepIndex + 1} / {stepCount}
        </p>
        <h2 className="mt-1 text-sm font-semibold">{step.title}</h2>
        <p className="mt-2 text-sm whitespace-pre-line text-foreground/80">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={onSkip} className="text-xs text-foreground/60 hover:text-foreground">
            Skip tour
          </button>
          <div className="flex items-center gap-3">
            {stepIndex > 0 && (
              <button onClick={onBack} className="text-xs text-foreground/60 hover:text-foreground">
                Back
              </button>
            )}
            {interactionState === "none" ? (
              <button
                onClick={onNext}
                className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-border"
              >
                {stepIndex === stepCount - 1 ? "Done" : "Next"}
              </button>
            ) : (
              <p role="status" className="text-xs text-foreground/50">
                {interactionState === "satisfied" ? "Nice - continuing…" : "Try it to continue"}
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-foreground/40">Esc pauses - resume from the pill anytime.</p>
      </div>
    </div>,
    document.body,
  );
}
