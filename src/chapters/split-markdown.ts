/**
 * Splits a lesson body at its "## Next" heading so ChapterReader can slot
 * YourTurnCard between the intro and the "what's next" section. Shared by
 * both lesson formats (legacy Markdown, rendered client-side, and MDX,
 * compiled server-side in the lesson-mdx route) - operates on raw source
 * text either way, never on rendered/compiled output.
 */
export function splitMarkdownAtNextSection(markdown: string) {
  const lines = markdown.split("\n");
  const FENCE_RE = /^(```|~~~)/;
  let inFence = false;
  let nextIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (FENCE_RE.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const headingMatch = /^(#{1,6})\s+(.+?)\s*#*$/.exec(lines[index]);
    if (!headingMatch) continue;

    const headingText = headingMatch[2].trim();
    if (headingText === "Next") {
      nextIndex = index;
      break;
    }
  }

  if (nextIndex === -1) {
    return { beforeNext: markdown, nextSection: "", hasNextSection: false };
  }

  return {
    beforeNext: lines.slice(0, nextIndex).join("\n").trimEnd(),
    nextSection: lines.slice(nextIndex).join("\n").trimStart(),
    hasNextSection: true,
  };
}
