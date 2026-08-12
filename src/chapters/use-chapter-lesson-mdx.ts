"use client";

import { useEffect, useState } from "react";

export type ChapterLessonMdx = {
  raw: string;
  beforeCompiled: string;
  nextCompiled: string | null;
};

type CacheEntry = { version: number | undefined; data: ChapterLessonMdx };

// Same per-path-and-version freshness convention as useMarkdownFile - a
// chapter without a lessonVersion bump is cached forever once fetched.
const cache = new Map<string, CacheEntry>();
const inFlightLoads = new Map<string, Promise<ChapterLessonMdx>>();

function isFresh(chapterId: string | undefined, version: number | undefined): boolean {
  if (!chapterId) return false;
  const cached = cache.get(chapterId);
  return cached !== undefined && cached.version === version;
}

function loadKey(chapterId: string, version: number | undefined): string {
  return `${chapterId}\u0000${version ?? ""}`;
}

/** Preloads the server-compiled MDX payload so the reader can render it as
 * soon as navigation completes. Concurrent callers share one compilation. */
export function preloadChapterLessonMdx(chapterId: string | undefined, version?: number): Promise<void> {
  if (!chapterId || isFresh(chapterId, version)) return Promise.resolve();

  const key = loadKey(chapterId, version);
  let load = inFlightLoads.get(key);
  if (!load) {
    load = fetch(`/api/lessons/${chapterId}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<ChapterLessonMdx>;
      })
      .then((data) => {
        cache.set(chapterId, { version, data });
        return data;
      })
      .finally(() => inFlightLoads.delete(key));
    inFlightLoads.set(key, load);
  }

  return load.then(() => undefined);
}

/** `lessonFormat: "mdx"` counterpart of useChapterLesson - fetches the
 * pre-compiled lesson body from `/api/lessons/[chapterId]` instead of a raw
 * `.md` static asset. Returns null while loading, on 404, or for an
 * undefined chapterId - same fallback contract as useChapterLesson, so
 * ChapterReader's `lessonMarkdown ?? chapter?.problemStatement` still works
 * unchanged. */
export function useChapterLessonMdx(chapterId: string | undefined, version?: number): ChapterLessonMdx | null {
  const [data, setData] = useState<ChapterLessonMdx | null>(
    isFresh(chapterId, version) ? (cache.get(chapterId!)?.data ?? null) : null,
  );

  useEffect(() => {
    if (!chapterId || isFresh(chapterId, version)) return;
    let cancelled = false;
    preloadChapterLessonMdx(chapterId, version)
      .then(() => {
        if (cancelled) return;
        setData(cache.get(chapterId)?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId, version]);

  return data;
}
