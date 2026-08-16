"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import type { NodeProps } from "@xyflow/react";
import { modeColorVar, modeIcon, modeLabel, modeTagline } from "@/lib/modes";
import type { ModeNodeType } from "@/app/HomeCanvas";
import { LoadingTransition } from "@/app/LoadingTransition";
import { ProgressBar } from "@/learning-path/ProgressBar";
import { useRequireAuthAction } from "@/auth/useRequireAuthAction";

const NODE_WIDTH = 300;
const NODE_HEIGHT = 310;

/** How long the branded transition holds before the real navigation fires —
 * a deliberate, fixed duration, not a reflection of actual network/route
 * readiness (see LoadingTransition.tsx: `next/link`'s `useLinkStatus` was
 * tried first, but Next.js prefetches viewport links by default, so an
 * already-prefetched route's "pending" window is often too short to ever
 * observe — the overlay would skip instead of holding for 2s). */
const TRANSITION_HOLD_MS = 700;

/** Ordinal position in the mode row, spec-sheet style ("01", "02", "03").
 * Mirrors MODE_ROW's own order in HomeCanvas.tsx. */
const MODE_ORDINAL: Record<ModeNodeType["data"]["mode"], string> = {
  "building-blocks": "01",
  "real-world-extraction": "02",
  sandbox: "03",
};

/** A small drafting-corner mark reinforcing one of the card's four corners.
 * Static at rest (DESIGN.md ties animation to a real state change, and
 * hover is one) - brightens to the mode's accent color on hover via `group`. */
function CornerMark({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const vertical = position[0] === "t" ? "top" : "bottom";
  const horizontal = position[1] === "l" ? "left" : "right";
  const borderSides =
    position === "tl"
      ? "border-t border-l"
      : position === "tr"
        ? "border-t border-r"
        : position === "bl"
          ? "border-b border-l"
          : "border-b border-r";
  return (
    <span
      aria-hidden="true"
      style={{ [vertical]: -1, [horizontal]: -1 } as CSSProperties}
      className={`pointer-events-none absolute h-2.5 w-2.5 border-[color:var(--border)] transition-colors duration-150 ease-out group-hover:border-[color:var(--accent)] ${borderSides}`}
    />
  );
}

/**
 * A mode "slot" on Home's canvas, styled as an engineering specification
 * sheet (ordinal, status badge, wireframe icon, dimension-line divider,
 * course-level progress) rather than a generic dashboard card. Reads as the
 * same technical-instrument register as the rest of the app, not a
 * bolted-on marketing card.
 *
 * Navigation lives on a real <Link>, not xyflow's onNodeClick. That's what
 * gives Sandbox native keyboard activation (Tab, Enter) and a visible focus
 * ring (the app's global `*:focus-visible` rule, see globals.css) for free.
 * The corresponding node in HomeCanvas.tsx sets `focusable: false` so xyflow
 * doesn't also add its own non-actionable tab stop around this.
 */
export function ModeNode({ data }: NodeProps<ModeNodeType>) {
  const { mode, href, status, progressLabel, percent } = data;
  const color = modeColorVar[mode];
  const Icon = modeIcon[mode];
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { requireAuth, dialog } = useRequireAuthAction();

  // Modifier/non-primary clicks (open in new tab, etc.) get the browser's
  // native handling, unintercepted — only a plain left-click gets the
  // branded hold-then-navigate treatment. The real <Link href> stays intact
  // throughout (native keyboard focus/activation, a real URL to open in a
  // new tab), this only changes what a plain click does with it.
  //
  // Sandbox alone keeps the held overlay — it mounts the heaviest canvas
  // (component registry, full validation engine wiring, no chapter to scope
  // it down), the actual case the overlay was built to mask. Building
  // Blocks/Real World Extraction land on the Learning Path first now (a
  // plain curriculum list, no canvas at all), too light to need a hold —
  // so those two fall through to the native, unintercepted Link click.
  //
  // Sandbox is also the only mode still route-gated ((protected)/layout.tsx's
  // auth.protect()) — a signed-out click used to hit that guard directly,
  // an unexplained hard bounce to Clerk's sign-in with no context, unlike
  // every other progress-writing action in the app (quiz launch, mark
  // complete, the exercise row in YourTurnCard.tsx), which shows
  // AuthPromptDialog first via useRequireAuthAction. Same treatment here:
  // a signed-out click never reaches the route guard, the dialog does.
  //
  // Gated on `isLoaded`, not just `isSignedIn` — Clerk's isSignedIn is
  // `undefined` (not `false`) for a brief window right after a page load
  // while the client SDK is still resolving the session, and a plain
  // `!isSignedIn` check can't tell that apart from "genuinely signed out."
  // A real user essentially never clicks in that window, but an automated
  // click immediately after page.goto() can - a signed-in visitor would
  // incorrectly see the sign-in prompt. While unresolved, falls through to
  // the normal navigation instead of guessing; a truly signed-out visitor
  // who slips through this narrow window still hits auth.protect()'s
  // existing hard-redirect backstop, same as before this dialog existed.
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href || mode !== "sandbox") return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (isLoaded && !isSignedIn) {
      requireAuth(() => {});
      return;
    }
    setNavigating(true);
    window.setTimeout(() => router.push(href), TRANSITION_HOLD_MS);
  };

  const body = (
    <>
      <CornerMark position="tl" />
      <CornerMark position="tr" />
      <CornerMark position="bl" />
      <CornerMark position="br" />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-foreground/35">{MODE_ORDINAL[mode]}</span>
        <span
          style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, color }}
          className="rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
        >
          {status ?? "sandbox"}
        </span>
      </div>

      <div
        style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, borderColor: color }}
        className="flex h-16 w-16 items-center justify-center rounded-md border"
      >
        <Icon size={28} style={{ color }} strokeWidth={1.5} />
      </div>

      <h3 style={{ color }} className="text-lg font-semibold tracking-tight">
        {modeLabel[mode]}
      </h3>
      <p className="w-full pb-3 line-clamp-2 text-sm leading-snug text-foreground/65">{modeTagline[mode]}</p>

      {/* Absorbs leftover vertical slack instead of the paragraph above
       * (flex-grow on a line-clamped element gets crushed below its own
       * text height by the flex algorithm) - keeps the divider/footer
       * anchored to the bottom edge across all three cards regardless of
       * how many lines each mode's tagline wraps to. */}
      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-px bg-[color:var(--border)]" />
        <span className="h-px flex-1 bg-[color:var(--border)]" />
        <span className="h-1.5 w-px bg-[color:var(--border)]" />
      </div>

      <div className="flex items-end justify-between gap-3">
        {percent != null || progressLabel ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {percent != null && (
              <div className="transition-opacity duration-150 group-hover:opacity-90">
                <ProgressBar
                  percent={percent}
                  size="sm"
                  accentColor={color}
                  label={`${modeLabel[mode]} progress: ${percent}%`}
                />
              </div>
            )}
            {progressLabel && <span className="text-[11px] text-foreground/50">{progressLabel} chapters</span>}
          </div>
        ) : (
          <span className="text-[11px] uppercase tracking-wide text-foreground/40">freeform</span>
        )}
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-sm text-foreground/60 transition-[transform,color,border-color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:border-[color:var(--accent)] group-hover:text-[color:var(--accent)] motion-reduce:group-hover:translate-x-0"
        >
          &rarr;
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <>
        <Link
          href={href}
          onClick={handleClick}
          style={{ width: NODE_WIDTH, height: NODE_HEIGHT, "--accent": color } as CSSProperties}
          className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-panel p-6 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {body}
          {navigating && <LoadingTransition label={`Crafting your ${modeLabel[mode]}…`} />}
        </Link>
        {/* A sibling of Link, not a child — React portals bubble events
         * through the React tree, not the DOM tree, so a click inside the
         * dialog (e.g. "Not now") would otherwise also reach Link's onClick
         * and immediately reopen what it just closed. Portaled to
         * document.body rather than rendered in place because this node
         * sits inside react-flow's transform-positioned wrapper, which
         * would turn AuthPromptDialog's `fixed` positioning into "fixed to
         * this node" instead of "fixed to the viewport" (same reasoning as
         * AnnotationEditor.tsx's portal). */}
        {dialog && createPortal(dialog, document.body)}
      </>
    );
  }

  return (
    <div
      aria-disabled="true"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT, "--accent": color } as CSSProperties}
      className="relative flex cursor-not-allowed flex-col gap-4 overflow-hidden rounded-lg border border-border bg-panel p-6 opacity-70"
    >
      {body}
    </div>
  );
}
