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
 * real DOM anchor). Skips level-1 headings - a lesson body shouldn't have
 * one (see lessons.ts's doc comment: ChapterReader already renders the
 * chapter title as the page's own h1), but this filters defensively
 * regardless. The "On this page" heading itself lives in ChapterReader.tsx,
 * not here - it needs to stay visible (alongside ThemeToggle) even on a
 * chapter with no subheadings, when this component renders nothing.
 */
export function TableOfContents({ headings, targetRef }: TableOfContentsProps) {
  const items = headings.filter((h) => h.level >= 2);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = targetRef.current;
    if (!root || items.length === 0) return;

    const elements = items.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

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

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
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
          <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
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
