"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ExtractedHeading } from "./extract-headings";

type TableOfContentsProps = {
  headings: ExtractedHeading[];
  /** The article's own scrollable container - IntersectionObserver's root,
   *  so scrollspy tracks scroll position within it rather than the window
   *  (which never scrolls - see ReadingProgress.tsx's same note). */
  targetRef: RefObject<HTMLElement | null>;
};

/**
 * "On this page" list - scrollspy via IntersectionObserver against the
 * rendered heading ids (rehype-slug output, matched by extract-headings.ts
 * using the same github-slugger engine, so an id here always resolves to a
 * real DOM anchor). Includes every heading level: ChapterReader.tsx renders
 * `chapter.title` as the page's own h1 *outside* the markdown body, so any
 * h1 inside lesson markdown is real author content, not a duplicate of the
 * page title. The "On this page" heading itself lives in ChapterReader.tsx,
 * not here - it needs to stay visible (alongside ThemeToggle) even on a
 * chapter with no headings, when this component renders nothing.
 *
 * The caller must key this component on the chapter (see ChapterReader.tsx)
 * so it remounts, rather than re-rendering, on navigation. Without a remount,
 * `activeId` from the previous chapter can survive into the new one: if the
 * new chapter's first heading starts below the fold, the observer's first
 * callback finds nothing intersecting and leaves `activeId` untouched, and
 * many chapters share heading ids (e.g. the synthetic "knowledge-check" id
 * in extract-headings.ts), so the stale id can still match a real heading
 * in the new chapter and highlight the wrong section at scrollTop 0.
 */
export function TableOfContents({ headings, targetRef }: TableOfContentsProps) {
  const items = headings.filter((h) => h.level >= 1);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = targetRef.current;
    if (!root || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Topmost visible heading - reads as "the section you're currently
        // in" more faithfully than IntersectionObserver's own entry order.
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(topmost.target.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    // The lesson body (MarkdownRenderer/MdxContent) is a dynamically
    // imported chunk rendering markdown fetched client-side, so most heading
    // ids don't exist in the DOM yet on this first pass - only YourTurnCard's
    // static "knowledge-check" h2 does. Re-scanning is decoupled from the
    // `headings` dependency below (extracted from markdown *text*, which can
    // settle before the chunk finishes loading and painting), so watch the
    // container for growth and pick up newly-painted headings as they
    // appear, instead of relying on a single scan at effect-setup time.
    const observed = new Set<string>();
    const watchAvailableHeadings = () => {
      for (const h of items) {
        if (observed.has(h.id)) continue;
        const el = document.getElementById(h.id);
        if (!el) continue;
        observed.add(h.id);
        observer.observe(el);
      }
    };

    watchAvailableHeadings();

    const resizeObserver = new ResizeObserver(watchAvailableHeadings);
    for (const child of root.children) resizeObserver.observe(child);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
    // Re-run only when the container or the heading set changes - `items` is
    // a fresh array every render (derived from `headings`), so depending on
    // it directly would re-run the effect every render for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, headings]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: Math.max(0, h.level - 2) * 12 }}>
            <a
              href={`#${h.id}`}
              className={`block truncate transition-colors ${
                activeId === h.id ? "font-medium text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
