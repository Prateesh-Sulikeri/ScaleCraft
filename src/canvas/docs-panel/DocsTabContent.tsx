"use client";

import { useLayoutEffect, useRef } from "react";
import { useCanvasStore } from "../store";
import { getComponent } from "@/content/components/registry";
import { useMarkdownFile } from "@/lib/use-markdown-file";
import { MarkdownRenderer } from "./markdown/MarkdownRenderer";

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
  const fileContent = useMarkdownFile(definition?.docsFile);

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
