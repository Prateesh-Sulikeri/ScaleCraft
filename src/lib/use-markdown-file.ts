"use client";

import { useEffect, useState } from "react";

type CacheEntry = { version: number | undefined; content: string };

// Keyed by URL, not by caller - a component doc and a chapter lesson never
// collide since both live under distinct public/content/ subtrees, and
// repeat visits to the same path (at the same version) skip the network
// entirely.
const markdownFileCache = new Map<string, CacheEntry>();

function isFresh(path: string | undefined, version: number | undefined): boolean {
  if (!path) return false;
  const cached = markdownFileCache.get(path);
  return cached !== undefined && cached.version === version;
}

/**
 * Fetches a hand-authored Markdown file from `public/` - a plain
 * static-asset fetch, not a bundler import, since this repo has no raw-text
 * import loader configured and content needs to reach client components.
 * Shared by component docs (`ComponentDefinition.docsFile`/`docsVersion`)
 * and chapter lessons (`getLessonFileUrl`/`ChapterDefinition.lessonVersion`)
 * - one fetch+cache implementation instead of two. Returns null while
 * loading, on 404, or for an undefined path, so the caller falls back to
 * its own inline content.
 *
 * `version` is optional and defaults to `undefined` - a path with no
 * version set is cached forever once fetched, same as before this field
 * existed. Passing a version that differs from what's cached (an author
 * bumped it after editing the file) forces a refetch instead of serving the
 * stale copy for the rest of the session.
 */
export function useMarkdownFile(path: string | undefined, version?: number): string | null {
  const [content, setContent] = useState<string | null>(
    isFresh(path, version) ? (markdownFileCache.get(path!)?.content ?? null) : null,
  );

  useEffect(() => {
    if (!path || isFresh(path, version)) return;
    let cancelled = false;
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        markdownFileCache.set(path, { version, content: text });
        setContent(text);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  return content;
}
