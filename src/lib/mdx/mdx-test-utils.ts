import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { MDXComponents } from "mdx/types";
import { compileLessonMdx } from "./compile-lesson-mdx";

/** Compile + run + render a lesson MDX source, as MdxContent.tsx would. */
export async function renderMdx(source: string, components?: MDXComponents): Promise<string> {
  const compiled = await compileLessonMdx(source);
  const mod = await run(compiled, runtime as Parameters<typeof run>[1]);
  return renderToStaticMarkup(createElement(mod.default, components ? { components } : undefined));
}
