"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type ReadingProgressProps = {
  /** The article's own scrollable container, not window - the app has no
   *  page-level scroll (body is h-full/overflow-hidden), so every scrollable
   *  region owns its own, same convention as LearningPath.tsx's scrollRef. */
  targetRef: RefObject<HTMLElement | null>;
};

/**
 * A slim reading-progress bar pinned to the top of the article's own
 * scrollable container (sticky, not page-fixed) - lives inside the reading
 * pane itself as the article's first child, not the right rail, so it reads
 * as part of the article rather than a separate nav element.
 */
export function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const [percent, setPercent] = useState(0);
  // So the resize observer below can skip this bar's own (fixed-height)
  // root node when it walks `el`'s children looking for the growing
  // content sibling.
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const recompute = () => {
      const scrollable = el.scrollHeight - el.clientHeight;
      setPercent(scrollable <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / scrollable) * 100)));
    };

    recompute();
    el.addEventListener("scroll", recompute);

    // Async-resizing content (Mermaid diagrams, images) can grow the
    // article after the last scroll event, silently staling `percent`
    // against the old scrollHeight. `el` itself is the fixed-height
    // scrollable viewport, so its own box never changes — observe its
    // other children (the actual growing content) instead.
    const resizeObserver = new ResizeObserver(recompute);
    for (const child of el.children) {
      if (child !== barRef.current) resizeObserver.observe(child);
    }

    return () => {
      el.removeEventListener("scroll", recompute);
      resizeObserver.disconnect();
    };
  }, [targetRef]);

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="sticky top-0 z-10 h-0.5 w-full bg-border"
    >
      <div
        className="h-full bg-state-valid transition-[width] duration-150 motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
