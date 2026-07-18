"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCanvasStore } from "../store";
import { getComponent } from "@/content/components/registry";
import { MarkdownRenderer } from "./markdown/MarkdownRenderer";

// Keyed by docsFile URL, not componentId — avoids re-fetching the same
// static asset every time a tab is reopened or switched back to.
const docsFileCache = new Map<string, string>();

/** Fetches a component's optional `docsFile` (see types.ts) from `public/`
 * — a plain static-asset fetch, not a bundler import, since this repo has
 * no raw-text import loader configured and `docs`/`docsFile` both need to
 * reach client components. Returns null while loading, on 404, or when
 * there's no docsFile at all, so the caller falls back to `docs`. */
function useDocsFileContent(docsFile: string | undefined): string | null {
  const [content, setContent] = useState<string | null>(
    docsFile ? (docsFileCache.get(docsFile) ?? null) : null,
  );

  useEffect(() => {
    // No remount-free case to handle here: each DocsTabContent instance is
    // keyed by componentId (see DocsPanel.tsx), so a docsFile change always
    // comes with a fresh mount — the useState initializer above already
    // covers the cached case, so this effect only ever needs to fetch.
    if (!docsFile || docsFileCache.has(docsFile)) return;
    let cancelled = false;
    fetch(docsFile)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        docsFileCache.set(docsFile, text);
        setContent(text);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [docsFile]);

  return content;
}

/**
 * The active tab's scrollable reading pane. Scroll position is written back
 * to the store rAF-throttled (not on every scroll event) and restored on
 * tab switch/panel restore — this is the piece the old floating docs
 * windows never had (position lived in a component that unmounted on
 * minimize), so switching tabs or minimizing/restoring now keeps your
 * exact reading position.
 */
export function DocsTabContent({ componentId }: { componentId: string }) {
  const setDocTabScroll = useCanvasStore((s) => s.setDocTabScroll);
  const scrollTop = useCanvasStore(
    (s) => s.docsPanel.tabs.find((t) => t.componentId === componentId)?.scrollTop ?? 0,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = scrollTop;
    // Only re-run when switching tabs, not on every scrollTop update this
    // same tab writes back — otherwise every throttled write would fight
    // the user's own live scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId]);

  const handleScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (containerRef.current) setDocTabScroll(componentId, containerRef.current.scrollTop);
    });
  };

  const definition = getComponent(componentId);
  const fileContent = useDocsFileContent(definition?.docsFile);

  return (
    <div ref={containerRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto p-4">
      {!definition ? (
        <p className="text-sm text-foreground/60">This component&apos;s documentation is no longer available.</p>
      ) : (
        // No app-generated title here — the tab itself (see DocsTabBar.tsx)
        // already shows the component name, and a hand-authored docsFile
        // brings its own heading; hardcoding one here just duplicated it.
        <MarkdownRenderer content={fileContent ?? definition.docs} />
      )}
    </div>
  );
}
