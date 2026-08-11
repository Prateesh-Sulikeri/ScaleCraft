"use client";

import { useEffect, useState } from "react";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXContent } from "mdx/types";
import { MARKDOWN_BODY_CLASSNAME } from "./markdown-plugins";
import { markdownComponents } from "./markdown-components";
import { mdxComponents } from "./mdx-components";

/**
 * Renders a lesson body already compiled server-side by
 * `/api/lessons/[chapterId]` (see compile-lesson-mdx.ts) - `run()` here only
 * evaluates already-compiled JS into React elements, it never parses
 * Markdown or walks the remark/rehype pipeline itself. That work happened
 * once, server-side, at compile time - this is the "cost gone from the
 * client" half of the MDX migration.
 */
export function MdxContent({ compiledSource }: { compiledSource: string }) {
  const [Content, setContent] = useState<MDXContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    run(compiledSource, runtime as Parameters<typeof run>[1]).then((mod) => {
      if (!cancelled) setContent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [compiledSource]);

  if (!Content) return null;

  return (
    <div className={MARKDOWN_BODY_CLASSNAME}>
      <Content components={{ ...markdownComponents, ...mdxComponents }} />
    </div>
  );
}
