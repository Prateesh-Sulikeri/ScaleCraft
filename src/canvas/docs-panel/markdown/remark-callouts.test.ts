import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Blockquote, Paragraph, Text } from "mdast";
import { remarkCallouts } from "./remark-callouts";

function parse(markdown: string): Root {
  return unified().use(remarkParse).use(remarkCallouts).parse(markdown) as Root;
}

function run(markdown: string): Root {
  const processor = unified().use(remarkParse).use(remarkCallouts).use(remarkStringify);
  const tree = processor.parse(markdown);
  processor.runSync(tree);
  return tree as Root;
}

function firstBlockquote(tree: Root): Blockquote {
  const bq = tree.children.find((c) => c.type === "blockquote");
  if (!bq) throw new Error("no blockquote found");
  return bq as Blockquote;
}

describe("remarkCallouts", () => {
  it("tags a recognized marker and strips it from the paragraph text", () => {
    const tree = run("> [!WARNING]\n> Be careful here.");
    const bq = firstBlockquote(tree);
    expect((bq.data?.hProperties as Record<string, string>)?.["data-callout"]).toBe("WARNING");
    const paragraph = bq.children[0] as Paragraph;
    const text = paragraph.children[0] as Text;
    expect(text.value).toBe("Be careful here.");
  });

  it.each(["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"])("recognizes the %s marker", (kind) => {
    const tree = run(`> [!${kind}]\n> body`);
    const bq = firstBlockquote(tree);
    expect((bq.data?.hProperties as Record<string, string>)?.["data-callout"]).toBe(kind);
  });

  it("leaves an ordinary blockquote with no marker untouched", () => {
    const tree = run("> Just a normal quote.");
    const bq = firstBlockquote(tree);
    expect(bq.data?.hProperties).toBeUndefined();
    const paragraph = bq.children[0] as Paragraph;
    const text = paragraph.children[0] as Text;
    expect(text.value).toBe("Just a normal quote.");
  });

  it("ignores an unrecognized bracket marker", () => {
    const tree = run("> [!NOTREAL]\n> body");
    const bq = firstBlockquote(tree);
    expect(bq.data?.hProperties).toBeUndefined();
  });

  it("does nothing to a blockquote whose first child isn't a paragraph", () => {
    const tree = parse("> - a list item");
    const bq = firstBlockquote(tree);
    expect(() => remarkCallouts()(tree)).not.toThrow();
    expect(bq.data?.hProperties).toBeUndefined();
  });
});
