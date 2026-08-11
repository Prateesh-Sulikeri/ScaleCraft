"use client";

import { useMarkdownFile } from "@/lib/use-markdown-file";
import { chapterRegistry } from "./chapters";
import { getLessonFileUrl } from "./chapters/lessons";
import type { ChapterDefinition } from "./chapters/types";
import { componentRegistry, getComponent as getComponentDefinition } from "./components/registry";
import { getComponentDocsEntry } from "./components/manifest";
import type { ComponentDefinition } from "./components/types";
import { getGlossaryTerm as getGlossaryTermDefinition } from "./concepts/registry";
import type { GlossaryTermDefinition } from "./concepts/types";

/**
 * The one API surface UI code goes through for curriculum/component content
 * - metadata lookup, doc/lesson body fetch, and cache all live behind this
 * module instead of scattered combinations of registry lookups +
 * useMarkdownFile calls. See .claude/docs/pending.md's Phase 2 "Content
 * access layer" for the plan this completes.
 */

export function getChapter(id: string): ChapterDefinition | undefined {
  return chapterRegistry.find((c) => c.id === id);
}

/** Same lookup as content/components/registry.ts's `getComponent` (built-ins
 * plus any user-created custom component) - re-exposed here so content-
 * consuming UI only needs one import. */
export function getComponent(id: string): ComponentDefinition | undefined {
  return getComponentDefinition(id);
}

/** Same lookup as content/concepts/registry.ts's `getGlossaryTerm` - re-exposed
 * here so content-consuming UI only needs one import. */
export function getGlossaryTerm(id: string): GlossaryTermDefinition | undefined {
  return getGlossaryTermDefinition(id);
}

/** A chapter's Chapter Reader body, fetched and cached client-side. Returns
 * null while loading, on 404, for an unknown chapterId, or for `undefined` -
 * callers fall back to `ChapterDefinition.problemStatement` themselves, same
 * as before this module existed. */
export function useChapterLesson(chapterId: string | undefined): string | null {
  const chapter = chapterId ? getChapter(chapterId) : undefined;
  return useMarkdownFile(chapter ? getLessonFileUrl(chapter.id) : undefined, chapter?.lessonVersion);
}

/** A component's optional `docsFile` body, fetched and cached client-side via
 * the manifest (not `ComponentDefinition` directly - see manifest.ts).
 * Returns null while loading, on 404, or when the component has no
 * `docsFile` at all, so the caller falls back to its inline `docs` string. */
export function useComponentDocs(componentId: string): string | null {
  const entry = getComponentDocsEntry(componentId);
  return useMarkdownFile(entry?.docsFile, entry?.docsVersion);
}

export type ContentSearchResult =
  | { type: "chapter"; id: string; title: string }
  | { type: "component"; id: string; label: string };

/**
 * Plain case-insensitive substring match over chapter title/problemStatement
 * and component label/summary - no UI wires this up yet (no search box
 * exists), same "build the primitive ahead of its consumer" pattern Phase 1
 * used for the empty examples/images content directories. Scoped to
 * built-in `componentRegistry`, not user-created custom components - those
 * are per-project data, not versioned content.
 */
export function search(query: string): ContentSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const chapterMatches: ContentSearchResult[] = chapterRegistry
    .filter((c) => c.title.toLowerCase().includes(q) || c.problemStatement.toLowerCase().includes(q))
    .map((c) => ({ type: "chapter", id: c.id, title: c.title }));

  const componentMatches: ContentSearchResult[] = componentRegistry
    .filter((c) => c.label.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q))
    .map((c) => ({ type: "component", id: c.id, label: c.label }));

  return [...chapterMatches, ...componentMatches];
}
