import { notFound } from "next/navigation";
import { ChapterWorkspace } from "@/chapters/ChapterWorkspace";
import { findEntry } from "@/curriculum";

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const entry = findEntry("building-blocks", chapterSlug);
  // Unauthored or unknown slug: there is no workspace to render. The
  // Learning Path never links here (decision D2, RELEASE_3.0.0_LEARNING_
  // PATH.md), so this only catches a hand-typed or stale-bookmarked URL.
  if (!entry?.chapterDefinitionId) notFound();

  // key= is load-bearing, not cosmetic: navigating between two sibling
  // [chapterSlug] routes reuses the same component instance, which would
  // mean ChapterWorkspace's autosave-on-unmount cleanup never fires and the
  // outgoing chapter's edits get lost. Keying on the slug forces a real
  // unmount/mount per chapter switch, so that cleanup runs every time.
  return <ChapterWorkspace key={chapterSlug} mode="building-blocks" chapterSlug={chapterSlug} />;
}
