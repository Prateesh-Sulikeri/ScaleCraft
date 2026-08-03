"use client";

import { useEffect, useState } from "react";

// Keyed by URL, not by caller - a component doc and a chapter lesson never
// collide since both live under distinct public/content/ subtrees, and
// repeat visits to the same path skip the network entirely.
const markdownFileCache = new Map<string, string>();

/**
 * Fetches a hand-authored Markdown file from `public/` - a plain
 * static-asset fetch, not a bundler import, since this repo has no raw-text
 * import loader configured and content needs to reach client components.
 * Shared by component docs (`ComponentDefinition.docsFile`) and chapter
 * lessons (`getLessonFileUrl`) - one fetch+cache implementation instead of
 * two. Returns null while loading, on 404, or for an undefined path, so the
 * caller falls back to its own inline content.
 */
export function useMarkdownFile(path: string | undefined): string | null {
  const [content, setContent] = useState<string | null>(
    path ? (markdownFileCache.get(path) ?? null) : null,
  );

  useEffect(() => {
    // No remount-free case to handle here: every current caller keys its
    // component by the same id the path is derived from, so a path change
    // always comes with a fresh mount - the useState initializer above
    // already covers the cached case, so this effect only ever needs to fetch.
    if (!path || markdownFileCache.has(path)) return;
    let cancelled = false;
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        markdownFileCache.set(path, text);
        setContent(text);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return content;
}
