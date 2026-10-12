"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { DOT_PLANE_STYLE } from "@/app/DraftingBackdrop";

let mermaidIdCounter = 0;

/** Blends two #rrggbb colours; `t` is the share of `b`. */
function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Mermaid's "base" theme fed from the app's tokens, so diagrams match the
 *  canvas instead of Mermaid's stock lavender. Read at render time: by then
 *  the theme class on <html> is current. */
function themeVariables() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => {
    const v = css.getPropertyValue(name).trim();
    if (/^#[0-9a-f]{3}$/i.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
    return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  };
  const bg = token("--background", "#0a0a0a");
  const fg = token("--foreground", "#ededed");
  const panel = token("--panel", "#141414");
  const node = mix(panel, fg, 0.04);
  return {
    background: bg,
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: "15px",
    primaryColor: node,
    primaryTextColor: fg,
    primaryBorderColor: mix(bg, fg, 0.35),
    secondaryColor: node,
    tertiaryColor: mix(bg, fg, 0.03),
    lineColor: mix(bg, fg, 0.5),
    textColor: fg,
    edgeLabelBackground: bg,
    clusterBkg: mix(bg, fg, 0.03),
    clusterBorder: mix(bg, fg, 0.2),
    noteBkgColor: node,
    noteTextColor: fg,
    noteBorderColor: mix(bg, fg, 0.35),
    actorBkg: node,
    actorBorder: mix(bg, fg, 0.35),
    actorTextColor: fg,
    signalColor: fg,
    signalTextColor: fg,
  };
}

/**
 * Dynamically imported so Mermaid's bundle weight is only paid when a doc
 * actually contains a ```mermaid fence. Re-renders on theme change since
 * Mermaid bakes colors into the generated SVG at render time rather than
 * via CSS custom properties.
 */
export function MermaidBlock({ code }: { code: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<string>(`docs-mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: themeVariables(),
        securityLevel: "strict",
        // Gantt sizes to its parent, which is detached at render time, so it
        // falls back to 300px. Pin it to the lesson prose column.
        gantt: { useWidth: 624, leftPadding: 110 },
      });
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, code);
        if (cancelled) return;
        // Clear any stale error from a previous attempt now that this one
        // succeeded — `error` is checked before `svg` in the render below,
        // so a lingering error would otherwise keep showing after a
        // successful re-render (e.g. the same block re-rendering on theme
        // change after an earlier failure).
        setError(null);
        setSvg(rendered);
      } catch (err) {
        if (cancelled) return;
        setSvg(null);
        setError(err instanceof Error ? err.message : "Failed to render diagram.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, resolvedTheme]);

  if (error) {
    return (
      <p className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-sm text-state-error">
        Couldn&apos;t render this diagram: {error}
      </p>
    );
  }

  if (!svg) {
    return (
      <div className="animate-pulse rounded-md border border-border bg-border/20 p-6 text-center text-xs text-foreground/40">
        Rendering diagram…
      </div>
    );
  }

  // Mermaid's own SVG output, not user/raw-HTML input.
  return (
    // Framed on the canvas's dot plane, so a diagram reads as a board.
    <div
      className="my-6 overflow-x-auto rounded-lg border border-border p-4 [&_svg]:mx-auto"
      style={DOT_PLANE_STYLE}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
