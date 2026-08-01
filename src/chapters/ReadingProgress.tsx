"use client";

import { useEffect, useState, type RefObject } from "react";

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

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollable = el.scrollHeight - el.clientHeight;
      setPercent(scrollable <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / scrollable) * 100)));
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [targetRef]);

  return (
    <div
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
