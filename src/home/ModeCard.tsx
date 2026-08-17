"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { modeColorVar, modeIcon, modeLabel, modeShortCode, modeTagline, type AppMode } from "@/lib/modes";
import { LoadingTransition } from "@/app/LoadingTransition";
import { ProgressBar } from "@/learning-path/ProgressBar";
import { useRequireAuthAction } from "@/auth/useRequireAuthAction";
import type { CourseProgress } from "./home-data";

/** How long the branded transition holds before the real navigation fires -
 *  a deliberate, fixed duration, not a reflection of actual route readiness
 *  (see LoadingTransition.tsx: an already-prefetched route's "pending"
 *  window is often too short to ever observe). */
const TRANSITION_HOLD_MS = 700;

type ModeCardProps = {
  mode: AppMode;
  href: string;
  /** Omitted for Sandbox: freeform, nothing to complete, so no progress to
   *  report - the footer shows a "free-form" metadata line instead. */
  progress?: CourseProgress;
};

/** A thin flanking-tick dimension line - the drafting motif the workspace and
 *  the old canvas home both use, kept as the card's internal divider.
 *
 *  On card hover the rule is measured out left to right in the mode's accent
 *  and the two ticks brighten to meet it - the drafting gesture the motif is
 *  already borrowed from, so the motion says "this card" rather than
 *  decorating it. The sweep is a `scaleX` on a 1px overlay, which the
 *  compositor handles without layout or paint, and it runs only while
 *  pointed at.
 *
 *  Arbitrary `[transform:scaleX()]` rather than Tailwind's `scale-x-*`: v4
 *  routes those through the standalone `scale` property, the same trap the
 *  translate note on ModeCard describes. Setting `transform` outright keeps
 *  it inside `transition-transform` whichever way v4 resolves the utility.
 *
 *  Under `motion-reduce` the line lands filled instead of pinning at zero -
 *  it carries the accent, unlike the card's purely decorative lift, so the
 *  reduced-motion treatment is "instant", not "absent". */
function DimensionLine() {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      <span className="h-1.5 w-px bg-[color:var(--border)] transition-colors duration-200 ease-out group-hover:bg-[color:var(--accent)]" />
      <span className="relative h-px flex-1 bg-[color:var(--border)]">
        <span className="absolute inset-0 origin-left [transform:scaleX(0)] bg-[color:var(--accent)] transition-transform duration-300 ease-out group-hover:[transform:scaleX(1)] motion-reduce:transition-none" />
      </span>
      <span className="h-1.5 w-px bg-[color:var(--border)] transition-colors duration-200 ease-out group-hover:bg-[color:var(--accent)]" />
    </div>
  );
}

/**
 * One of Home's three mode cards. This is the HTML successor to the old
 * ModeNode - the same anatomy (mode-colored icon tile, short code badge,
 * title, tagline, dimension-line divider, course progress paired with an
 * arrow affordance), minus the react-flow node wrapper the dashboard layout
 * no longer needs.
 *
 * Navigation lives on a real <Link>, which is what gives every card native
 * keyboard activation, a real URL to open in a new tab, and the app's global
 * focus ring for free.
 *
 * Sandbox alone keeps the held overlay: it mounts the heaviest canvas
 * (component registry, full validation engine wiring, no chapter to scope it
 * down), the actual case the overlay was built to mask. The two course cards
 * land on a Learning Path first - a plain curriculum list, no canvas at all -
 * so those fall through to a native, unintercepted Link click.
 *
 * Sandbox is also the only mode still route-gated ((protected)/layout.tsx's
 * auth.protect()), so a signed-out click gets AuthPromptDialog first rather
 * than an unexplained hard bounce to Clerk - the same treatment every other
 * progress-writing action in the app gets via useRequireAuthAction.
 *
 * Both hover transitions below list `translate`, not `transform`: Tailwind
 * v4 implements `-translate-y-*` / `translate-x-*` via the standalone
 * `translate` CSS property, so a bracketed transition list naming only
 * `transform` never animates them and the lift snapped instead of easing.
 * (The plain `transition-transform` utility does cover translate; an
 * explicit property list does not.)
 */
export function ModeCard({ mode, href, progress }: ModeCardProps) {
  const color = modeColorVar[mode];
  const Icon = modeIcon[mode];
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { requireAuth, dialog } = useRequireAuthAction();

  // Modifier/non-primary clicks (open in new tab, etc.) keep the browser's
  // native handling. Gated on `isLoaded`, not just `isSignedIn`: Clerk's
  // isSignedIn is `undefined` for a brief window after a page load while the
  // session resolves, and `!isSignedIn` cannot tell that apart from
  // "genuinely signed out" - a click in that window would wrongly prompt a
  // signed-in visitor. While unresolved this falls through to normal
  // navigation; a truly signed-out visitor still hits auth.protect()'s
  // redirect backstop.
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (mode !== "sandbox") return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (isLoaded && !isSignedIn) {
      requireAuth(() => {});
      return;
    }
    setNavigating(true);
    window.setTimeout(() => router.push(href), TRANSITION_HOLD_MS);
  };

  return (
    <>
      {/* Two boxes, deliberately. The <Link> is the hit area and never moves;
       * the inner div is the visual, and the hover lift transforms only that.
       * With the lift on the link itself, resting the pointer exactly on the
       * card's top or bottom edge slid the element out from under the cursor,
       * which un-hovered it, which slid it back - the card oscillated for as
       * long as the pointer sat on that line. A hit area that never moves
       * cannot do that, and the designed motion survives. */}
      <Link href={href} onClick={handleClick} style={{ "--accent": color } as CSSProperties} className="group block rounded-lg">
        <div className="relative flex h-full flex-col gap-3 rounded-lg border border-border bg-panel p-4 transition-[border-color,box-shadow,translate] duration-150 ease-out group-hover:-translate-y-0.5 group-hover:border-[color:color-mix(in_srgb,var(--accent)_45%,var(--border))] group-hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,0.35)] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <div className="flex items-start justify-between gap-3">
            {/* Tint and badge border read from --accent as classes rather than
             * inline style so each can carry a hover state; the icon's own
             * color stays inline, since it never changes. Both deepen on
             * hover - a paint on a 40px box and a 1px border, no geometry,
             * so nothing here can reflow the card. */}
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors duration-200 ease-out group-hover:bg-[color:color-mix(in_srgb,var(--accent)_20%,transparent)]">
              <Icon size={20} style={{ color }} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <span
              style={{ color }}
              className="rounded-sm border border-[color:color-mix(in_srgb,var(--accent)_40%,transparent)] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide transition-colors duration-200 ease-out group-hover:border-[color:color-mix(in_srgb,var(--accent)_75%,transparent)]"
            >
              {modeShortCode[mode]}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 style={{ color }} className="text-[17px] font-semibold tracking-tight">
              {modeLabel[mode]}
            </h3>
            <p className="text-sm leading-snug text-foreground/65">{modeTagline[mode]}</p>
          </div>

          {/* Absorbs leftover vertical slack so the divider and footer stay
           * anchored to the bottom edge across all three cards, regardless of
           * how many lines each tagline wraps to. */}
          <div className="min-h-2 flex-1" />

          <DimensionLine />

          <div className="flex items-end justify-between gap-3">
            {progress ? (
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2 text-[11px] text-foreground/50">
                  <span>
                    {progress.completed} / {progress.total} chapters
                  </span>
                  <span className="font-mono text-foreground/60">{progress.percent}%</span>
                </div>
                <ProgressBar
                  percent={progress.percent}
                  size="sm"
                  accentColor={color}
                  label={`${modeLabel[mode]} progress: ${progress.percent}%`}
                />
              </div>
            ) : (
              <span className="text-[11px] uppercase tracking-wide text-foreground/40">Free-Form</span>
            )}
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground/60 transition-[translate,color,border-color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:border-[color:var(--accent)] group-hover:text-[color:var(--accent)] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            >
              <ArrowRight size={15} />
            </span>
          </div>

          {navigating && <LoadingTransition label={`Crafting your ${modeLabel[mode]}…`} />}
        </div>
      </Link>
      {/* A sibling of Link, not a child - React portals bubble events through
       * the React tree, so a click inside the dialog ("Not now") would
       * otherwise also reach Link's onClick and immediately reopen what it
       * just closed. AuthPromptDialog is `fixed` and self-positioning, and
       * this card is no longer inside a transformed react-flow wrapper, so it
       * needs no portal of its own. */}
      {dialog}
    </>
  );
}
