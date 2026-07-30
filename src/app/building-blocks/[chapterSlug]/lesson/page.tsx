import { notFound } from "next/navigation";
import { ChapterReader } from "@/chapters/ChapterReader";
import { findEntry } from "@/curriculum";
import { chapterRegistry } from "@/content/chapters";
import { getLessonMarkdown } from "@/content/chapters/lessons";
import { extractHeadings } from "@/chapters/extract-headings";

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const entry = findEntry("building-blocks", chapterSlug);
  // Same guard as the canvas route's page.tsx — unauthored or unknown slugs
  // 404 rather than rendering an empty reader.
  if (!entry?.chapterDefinitionId) notFound();

  const chapter = chapterRegistry.find((c) => c.id === entry.chapterDefinitionId);
  if (!chapter) notFound();

  // Falls back to the chapter's problemStatement rather than rendering
  // blank if a ChapterDefinition is authored before its lesson file is.
  const markdown = getLessonMarkdown(chapter.id) ?? chapter.problemStatement;
  const headings = extractHeadings(markdown);

  return (
    <ChapterReader
      key={chapterSlug}
      mode="building-blocks"
      chapterSlug={chapterSlug}
      markdown={markdown}
      headings={headings}
    />
  );
}
