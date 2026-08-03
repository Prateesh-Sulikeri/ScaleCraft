import { notFound } from "next/navigation";
import { ChapterReader } from "@/chapters/ChapterReader";
import { findEntry } from "@/curriculum";
import { chapterRegistry } from "@/content/chapters";

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const entry = findEntry("building-blocks", chapterSlug);
  // Same guard as the canvas route's page.tsx — unauthored or unknown slugs
  // 404 rather than rendering an empty reader.
  if (!entry?.chapterDefinitionId) notFound();

  const chapter = chapterRegistry.find((c) => c.id === entry.chapterDefinitionId);
  if (!chapter) notFound();

  // ChapterReader fetches its own lesson markdown client-side (see
  // useMarkdownFile) - this route only needs to establish the slug is real.
  return <ChapterReader key={chapterSlug} mode="building-blocks" chapterSlug={chapterSlug} />;
}
