import type { MDXComponents } from "mdx/types";
import { Walkthrough } from "@/chapters/walkthrough/Walkthrough";
import { Ref } from "@/chapters/glossary/Ref";

/**
 * Custom JSX tags authors can embed directly in lesson `.mdx` files (e.g.
 * `<Walkthrough nodes={...} edges={...} steps={...} />`,
 * `<Ref id="round-robin">round robin</Ref>`), on top of
 * markdown-components.tsx's HTML-tag overrides. Kept as a separate map
 * rather than folded into `markdownComponents`: that one is typed
 * `Components` from react-markdown, keyed by literal HTML tag names only -
 * it would need an unsafe cast to accept keys react-markdown could never
 * actually invoke (it only fires on real HTML tags, never custom JSX
 * names). This map is where future MDX-only tags belong too.
 */
export const mdxComponents: MDXComponents = {
  Walkthrough,
  Ref,
};
