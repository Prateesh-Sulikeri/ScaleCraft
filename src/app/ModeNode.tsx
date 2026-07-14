"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { NodeProps } from "@xyflow/react";
import { modeColorVar, modeLabel, modeTagline } from "@/lib/modes";
import type { ModeNodeType } from "@/app/HomeCanvas";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 150;

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
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT, "--accent": color } as CSSProperties}
        className="relative flex flex-col justify-center gap-2 rounded-lg bg-panel px-5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)]"
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      aria-disabled="true"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className="relative flex cursor-not-allowed flex-col justify-center gap-2 rounded-lg bg-panel px-5 opacity-50"
    >
      {body}
    </div>
  );
}
