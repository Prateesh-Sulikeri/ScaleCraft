import type { Blockquote, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const MARKER_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/;

/**
 * GitHub-style callouts (`> [!NOTE] ...`) — a small inline AST transform
 * rather than a separate plugin package: strips the marker from the
 * blockquote's first paragraph and tags the node with a `data-callout` hint
 * via hProperties, so the `blockquote` React override (see Callout.tsx) can
 * style it directly instead of re-parsing already-rendered React children.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const firstParagraph = node.children[0];
      if (!firstParagraph || firstParagraph.type !== "paragraph") return;
      const paragraph = firstParagraph as Paragraph;
      const firstChild = paragraph.children[0];
      if (!firstChild || firstChild.type !== "text") return;
      const text = firstChild as Text;
      const match = MARKER_RE.exec(text.value);
      if (!match) return;
      text.value = text.value.slice(match[0].length);
      node.data = {
        ...node.data,
        hProperties: { ...(node.data?.hProperties as object | undefined), "data-callout": match[1] },
      };
    });
  };
}
