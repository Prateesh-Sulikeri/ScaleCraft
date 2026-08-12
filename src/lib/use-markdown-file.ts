"use client";

import { useEffect, useState } from "react";

type CacheEntry = { version: number | undefined; content: string };

// Keyed by URL, not by caller - a component doc and a chapter lesson never
// collide since both live under distinct public/content/ subtrees, and
// repeat visits to the same path (at the same version) skip the network
// entirely.
const markdownFileCache = new Map<string, CacheEntry>();
const inFlightLoads = new Map<string, Promise<string>>();

function isFresh(path: string | undefined, version: number | undefined): boolean {
  if (!path) return false;
  const cached = markdownFileCache.get(path);
  return cached !== undefined && cached.version === version;
}

function loadKey(path: string, version: number | undefined): string {
  return `${path}\u0000${version ?? ""}`;
}

/** Start fetching a Markdown asset before the component that renders it has
 * mounted. The hook below shares both this in-flight request and its cache,
 * so a route transition can do the network work behind its loading overlay. */
export function preloadMarkdownFile(path: string | undefined, version?: number): Promise<void> {
  if (!path || isFresh(path, version)) return Promise.resolve();

  const key = loadKey(path, version);
  let load = inFlightLoads.get(key);
  if (!load) {
    load = fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((content) => {
        markdownFileCache.set(path, { version, content });
        return content;
      })
      .finally(() => inFlightLoads.delete(key));
    inFlightLoads.set(key, load);
  }

  return load.then(() => undefined);
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
    preloadMarkdownFile(path, version)
      .then(() => {
        if (cancelled) return;
        setContent(markdownFileCache.get(path)?.content ?? null);
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
