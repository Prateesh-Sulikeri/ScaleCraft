"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

let mermaidIdCounter = 0;

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
      mermaid.initialize({ startOnLoad: false, theme: resolvedTheme === "light" ? "default" : "dark" });
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
  return <div className="overflow-x-auto [&_svg]:mx-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}
