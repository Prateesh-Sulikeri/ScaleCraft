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
 * `activeId` is derived from scroll position on every callback, including the
 * ones where no heading is in the band - see the observer body. At the top of
 * a chapter that means no highlight, rather than whichever heading happened to
 * intersect last.
 *
 * The caller should still key this component on the chapter (see
 * ChapterReader.tsx) so it remounts, rather than re-rendering, on navigation -
 * that drops the previous chapter's observed elements and recorded positions
 * instead of carrying them into a different document.
 */
export function TableOfContents({ headings, targetRef }: TableOfContentsProps) {
  const items = headings.filter((h) => h.level >= 1);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = targetRef.current;
    if (!root || items.length === 0) return;

    const order = items.map((h) => h.id);
    // Which headings are in the band right now, and the last viewport top the
    // observer reported for each - a callback where nothing is in the band
    // needs those tops to tell "already scrolled past" from "not reached yet".
    const visible = new Set<string>();
    const tops = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          tops.set(e.target.id, e.boundingClientRect.top);
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }

        if (visible.size > 0) {
          // Topmost visible heading - reads as "the section you're currently
          // in" more faithfully than IntersectionObserver's own entry order.
          let topmost: string | null = null;
          for (const id of visible) {
            if (topmost === null || (tops.get(id) ?? 0) < (tops.get(topmost) ?? 0)) topmost = id;
          }
          setActiveId(topmost);
          return;
        }

        // Nothing in the band: fall back to the last heading that has scrolled
        // above the container's top edge, and to no highlight at all when none
        // has. Keeping the previous id here is what made a freshly opened
        // chapter highlight "Knowledge check" at scrollTop 0 - YourTurnCard's
        // static h2 is the only heading in the DOM until the lesson chunk
        // paints, so it intersects an otherwise empty article, and once the
        // body pushed it below the fold the empty-band callback left it set.
        const rootTop = root.getBoundingClientRect().top;
        let passed: string | null = null;
        for (const id of order) {
          const top = tops.get(id);
          if (top !== undefined && top < rootTop) passed = id;
        }
        setActiveId(passed);
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
