import { describe, it, expect } from "vitest";
import { extractHeadings } from "./extract-headings";

describe("extractHeadings", () => {
  it("extracts all heading levels including h1", () => {
    const md = `# Top
## Section
### Subsection
#### Detail
##### Deep
###### Deeper`;
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(6);
    expect(headings[0]).toEqual({ id: "top", text: "Top", level: 1 });
    expect(headings[1]).toEqual({ id: "section", text: "Section", level: 2 });
    expect(headings[2]).toEqual({ id: "subsection", text: "Subsection", level: 3 });
  });

  it("ignores headings inside fenced code blocks", () => {
    const md = `## Real Section
\`\`\`
## Fake Inside Fence
\`\`\`
## Another Real`;
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(2);
    expect(headings.map((h) => h.text)).toEqual(["Real Section", "Another Real"]);
  });

  it("toggles fence state on both ``` and ~~~", () => {
    const md = `## Before
\`\`\`
## Inside backticks
\`\`\`
## Between
~~~
## Inside tildes
~~~
## After`;
    const headings = extractHeadings(md);
    expect(headings.map((h) => h.text)).toEqual(["Before", "Between", "After"]);
  });

  it("handles fence markers with leading/trailing whitespace", () => {
    const md = `## Real
  \`\`\`
## Fenced
  \`\`\`
## Real Again`;
    const headings = extractHeadings(md);
    expect(headings.map((h) => h.text)).toEqual(["Real", "Real Again"]);
  });

  it("generates consistent ids matching github-slugger behavior", () => {
    const md = `## Hello World
## hello world
## Hello WORLD`;
    const headings = extractHeadings(md);
    expect(headings[0].id).toBe("hello-world");
    expect(headings[1].id).toBe("hello-world-1");
    expect(headings[2].id).toBe("hello-world-2");
  });

  it("trims heading text before slugging", () => {
    const md = `##   Padded Heading`;
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("Padded Heading");
  });

  it("preserves heading level correctly", () => {
    const md = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
    const headings = extractHeadings(md);
    headings.forEach((h, i) => {
      expect(h.level).toBe(i + 1);
    });
  });

  it("returns empty array for markdown with no headings", () => {
    const md = `Just some text
and more text
but no headings`;
    const headings = extractHeadings(md);
    expect(headings).toEqual([]);
  });

  it("handles nested fence blocks correctly", () => {
    const md = `## Real
\`\`\`
## Fenced
\`\`\`
## Still outside
\`\`\`
nested ~~~ inside backticks
\`\`\`
## Real Again`;
    const headings = extractHeadings(md);
    expect(headings.map((h) => h.text)).toEqual(["Real", "Still outside", "Real Again"]);
  });

  it("requires space after hash for valid heading", () => {
    const md = `# Valid
#
#NoSpaceAfterHash
## Valid Again`;
    const headings = extractHeadings(md);
    expect(headings.map((h) => h.text)).toEqual(["Valid", "Valid Again"]);
  });

  it("handles special characters in heading text", () => {
    const md = `## Special: Characters & Symbols!
## Code \`inline\` here
## Quote "marks" work`;
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0].text).toBe("Special: Characters & Symbols!");
  });

  it("strips trailing hashes from heading text", () => {
    const md = `## Heading with hashes # ## ###`;
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("Heading with hashes # ##");
  });

  it("extracts from markdown with mixed content", () => {
    const md = `# Main Title
Some intro text here.

## First Section
Section content with **bold** and *italic*.

\`\`\`javascript
// code block
function test() {}
## This should not be extracted
\`\`\`

## Second Section
More content.

# Another H1
Final heading.`;
    const headings = extractHeadings(md);
    const texts = headings.map((h) => h.text);
    expect(texts).toContain("Main Title");
    expect(texts).toContain("First Section");
    expect(texts).toContain("Second Section");
    expect(texts).toContain("Another H1");
    expect(texts).not.toContain("This should not be extracted");
  });
});
