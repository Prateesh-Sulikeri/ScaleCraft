import { isValidElement, type ReactNode } from "react";
import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { remarkCallouts } from "./remark-callouts";

/**
 * Shared remark/rehype pipeline and component overrides for both Markdown
 * renderers - react-markdown (MarkdownRenderer.tsx, all non-MDX content) and
 * the compiled-MDX path (MdxContent.tsx, MDX-format chapter lessons only).
 * One config so the two pipelines never drift in output/styling.
 */

// Extends hast-util-sanitize's GitHub-derived default schema (already
// allow-lists details/summary/img/code[className]) with the one attribute
// remarkCallouts adds — content here is first-party-authored (see
// ComponentDefinition.docs), so this is defense-in-depth rather than a hard
// requirement, and future-proofs custom-component-authored docs text.
export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), "data-callout"],
  },
};

export const remarkPlugins: PluggableList = [remarkGfm, remarkCallouts];
export const rehypePlugins: PluggableList = [rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSlug];

// MDX-only variant, used by compile-lesson-mdx.ts. Both rehypeRaw and
// rehypeSanitize exist solely because react-markdown parses HTML as opaque
// raw text and needs help turning it into (then vetting) real elements -
// neither concern applies to MDX, which parses HTML/JSX tags into real
// nodes natively (that's the format's whole premise, see mdx-js/mdx-jsx).
// rehypeRaw's serialize-and-reparse round trip can't handle MDX's
// mdxJsxFlowElement/mdxJsxTextElement nodes and throws; rehypeSanitize
// doesn't recognize them either and silently drops them. Sanitizing is also
// moot for MDX specifically - lesson content is first-party-authored, never
// user input (same reasoning the schema above already gives), and an author
// can embed an arbitrary React component directly, which no hast sanitizer
// could gate anyway. Keep only rehypeSlug (heading-anchor ids, unrelated to
// either concern).
export const mdxRehypePlugins: PluggableList = [rehypeSlug];

/** Exported for direct unit testing - react-markdown's actual output for a
 * fenced code block only ever hands this a single string, so the array/
 * element recursion branches below are defensive and not exercisable
 * through real markdown content alone. */
export function codeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(codeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return codeText(node.props.children);
  return "";
}

// Tailwind's preflight reset neutralizes heading font-size/weight and
// strips list-style/table borders — everything below re-adds real
// typographic styling for the elements that don't already get a custom
// component override (code/pre/blockquote/a do; headings, paragraphs,
// lists, tables, and <hr> don't), using this app's own tokens rather than
// pulling in @tailwindcss/typography's separate opinionated defaults.
export const MARKDOWN_BODY_CLASSNAME = [
  "max-w-none text-base leading-7 text-foreground/85",
  "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1:first-child]:mt-0",
  "[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-child]:mt-0",
  "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_h4]:mb-1 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground",
  "[&_p]:mb-3",
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
  // GFM task list items (`- [ ]`) already have a checkbox — drop the bullet
  // so they don't get both.
  "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_input[type=checkbox]]:mr-2",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border-b-2 [&_th]:border-border [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-b [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5",
  "[&_img]:mb-3 [&_img]:rounded-md",
  "[&_details]:mb-3 [&_details]:rounded-md [&_details]:border [&_details]:border-border [&_details]:p-3",
  "[&_summary]:cursor-pointer [&_summary]:font-medium",
].join(" ");

/** The Chapter Reader's long-form scale. The docs panel and quiz panes keep
 *  the compact body above; a full lesson needs more air between sections. */
export const LESSON_BODY_CLASSNAME = [
  "max-w-none text-[17px] leading-[1.75] text-foreground/85",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&>h1]:mb-4 [&>h1]:mt-14 [&>h1]:text-[1.75rem] [&>h1]:font-semibold [&>h1]:tracking-tight [&>h1]:text-foreground [&>h1:first-child]:mt-0",
  "[&>h2]:mb-4 [&>h2]:mt-14 [&>h2]:scroll-mt-8 [&>h2]:text-balance [&>h2]:text-[1.5rem] [&>h2]:font-semibold [&>h2]:leading-snug [&>h2]:tracking-tight [&>h2]:text-foreground [&>h2:first-child]:mt-0",
  "[&>h3]:mb-3 [&>h3]:mt-9 [&>h3]:scroll-mt-8 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground",
  "[&>h4]:mb-2 [&>h4]:mt-6 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-foreground",
  "[&>p]:mb-5",
  "[&>ul]:mb-5 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mb-5 [&>ol]:list-decimal [&>ol]:pl-6 [&_li]:mb-2 [&_li]:pl-1 [&_li::marker]:text-foreground/40",
  "[&_li>ul]:mt-2 [&_li>ul]:list-[circle] [&_li>ul]:pl-6 [&_li>ol]:mt-2 [&_li>ol]:list-decimal [&_li>ol]:pl-6 [&_li>p]:mb-2",
  "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_input[type=checkbox]]:mr-2",
  "[&>hr]:my-10 [&>hr]:border-border",
  // Tables carry most comparisons in a lesson: a quiet header band, top-
  // aligned cells, and the first column read as the row's label.
  "[&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px] [&_table]:leading-relaxed",
  "[&_th]:border-b [&_th]:border-border [&_th]:bg-border/25 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-bottom [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-foreground/75",
  "[&_td]:border-b [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top",
  "[&_td:first-child]:font-medium [&_td:first-child]:text-foreground",
  "[&_img]:my-6 [&_img]:rounded-md",
  "[&>details]:mb-5 [&>details]:rounded-md [&>details]:border [&>details]:border-border [&>details]:p-4",
  "[&_summary]:cursor-pointer [&_summary]:font-medium",
].join(" ");
