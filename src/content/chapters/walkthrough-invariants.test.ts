import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { renderMdx } from "@/lib/mdx/mdx-test-utils";
import { mdxComponents } from "@/canvas/docs-panel/markdown/mdx-components";
import { normalizeWalkthrough } from "@/chapters/walkthrough/normalize";
import type { WalkthroughProps } from "@/chapters/walkthrough/types";

/**
 * Guards the diagram-authoring pipeline (.claude/docs/pending-diagram-pipeline.md):
 * every <Walkthrough> embedded in shipped lesson content must normalize with
 * zero issues. Runs on every `npm test`, forever, and covers diagrams that
 * don't exist yet - the point is to turn silent authoring mistakes (a typo'd
 * componentId, an unresolved highlight id) into a red test instead of a
 * vanished node a learner just never sees.
 */

const REPO_ROOT = join(__dirname, "..", "..", "..");
const LESSONS_DIR = join(REPO_ROOT, "public", "content", "chapters");

const mdxFiles = readdirSync(LESSONS_DIR).filter((file) => file.endsWith(".mdx"));

describe("walkthrough authoring invariants", () => {
  it("there is at least one .mdx chapter to check (guards against a vacuous suite)", () => {
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  for (const file of mdxFiles) {
    it(`${file}: every <Walkthrough> normalizes with zero issues`, async () => {
      const source = readFileSync(join(LESSONS_DIR, file), "utf-8");
      const captured: WalkthroughProps[] = [];

      // The stub prevents jsdom-dependent rendering entirely - only the
      // props MDX passed down matter here, not what they'd paint.
      await renderMdx(source, {
        ...mdxComponents,
        Walkthrough: (props: WalkthroughProps) => {
          captured.push(props);
          return null;
        },
      });

      captured.forEach((props, index) => {
        const { issues } = normalizeWalkthrough(props);
        expect(
          issues,
          `${file}, diagram #${index}:\n${issues.map((issue) => `  ${issue.code}: ${issue.message}`).join("\n")}`,
        ).toEqual([]);

        if (props.algorithms) {
          expect(
            props.algorithms.length,
            `${file}, diagram #${index}: declares ${props.algorithms.length} algorithm(s) - a 1-entry dropdown is dead content`,
          ).toBeGreaterThanOrEqual(2);
        }
      });
    });
  }
});
