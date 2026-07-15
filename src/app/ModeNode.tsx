"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NodeProps } from "@xyflow/react";
import { modeColorVar, modeLabel, modeTagline } from "@/lib/modes";
import type { ModeNodeType } from "@/app/HomeCanvas";
import { LoadingTransition } from "@/app/LoadingTransition";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 150;

/** How long the branded transition holds before the real navigation fires —
 * a deliberate, fixed duration, not a reflection of actual network/route
 * readiness (see LoadingTransition.tsx: `next/link`'s `useLinkStatus` was
 * tried first, but Next.js prefetches viewport links by default, so an
 * already-prefetched route's "pending" window is often too short to ever
 * observe — the overlay would skip instead of holding for 2s). */
const TRANSITION_HOLD_MS = 1250;

/**
 * A mode "slot" on Home's canvas. The border is an animated-dash SVG rect —
 * the exact same treatment as ZoneNode (src/canvas/ZoneNode.tsx), reusing
 * xyflow's own `dashdraw` keyframe (loaded globally via layout.tsx's
 * `@xyflow/react/dist/style.css` import) rather than inventing a new
 * animation — just colored per mode (`modeColorVar`) instead of the fixed
 * zone magenta. Reads as "this is the same system as Sandbox's canvas," not
 * a bespoke landing-page component.
 *
 * Navigation lives on a real <Link>, not xyflow's onNodeClick — that's what
 * gives Sandbox native keyboard activation (Tab, Enter) and a visible focus
 * ring (the app's global `*:focus-visible` rule, see globals.css) for free.
 * The corresponding node in HomeCanvas.tsx sets `focusable: false` so xyflow
 * doesn't also add its own non-actionable tab stop around this.
 */
export function ModeNode({ data }: NodeProps<ModeNodeType>) {
  const { mode, href, status } = data;
  const color = modeColorVar[mode];
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // Modifier/non-primary clicks (open in new tab, etc.) get the browser's
  // native handling, unintercepted — only a plain left-click gets the
  // branded hold-then-navigate treatment. The real <Link href> stays intact
  // throughout (native keyboard focus/activation, a real URL to open in a
  // new tab), this only changes what a plain click does with it.
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setNavigating(true);
    window.setTimeout(() => router.push(href), TRANSITION_HOLD_MS);
  };

  const dashedBorder = (
    <svg
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
      className="pointer-events-none absolute inset-0"
    >
      <rect
        x={0.75}
        y={0.75}
        width={NODE_WIDTH - 1.5}
        height={NODE_HEIGHT - 1.5}
        rx={10}
        fill="none"
        stroke={`color-mix(in srgb, ${color} 80%, transparent)`}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        style={{ animation: "dashdraw 0.5s linear infinite" }}
      />
    </svg>
  );

  const body = (
    <>
      {dashedBorder}
      <div className="flex items-center justify-between gap-2">
        <h3 style={{ color }} className="text-base font-semibold">
          {modeLabel[mode]}
          {/* The one positive "this works" cue — the two disabled cards
           * are otherwise only distinguished by opacity + a badge, which
           * reads as an absence rather than a signal. */}
          {href && <span className="ml-1.5">&rarr;</span>}
        </h3>
        {status && (
          <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
            {status}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/70">{modeTagline[mode]}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT, "--accent": color } as CSSProperties}
        className="relative flex flex-col justify-center gap-2 rounded-lg border border-border bg-panel px-5 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {body}
        {navigating && <LoadingTransition label={`Crafting your ${modeLabel[mode]}…`} />}
      </Link>
    );
  }

  return (
    <div
      aria-disabled="true"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className="relative flex cursor-not-allowed flex-col justify-center gap-2 rounded-lg border border-border bg-panel px-5 opacity-50"
    >
      {body}
    </div>
  );
}
