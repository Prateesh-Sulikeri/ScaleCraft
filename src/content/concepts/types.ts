export type GlossaryTermDefinition = {
  id: string;
  /** Shown as the popover heading - the canonical term name, not necessarily
   * identical to the inline text a `<Ref>` usage wraps. */
  title: string;
  /** Plain Markdown (not MDX), rendered via MarkdownRenderer as-is - a short
   * reference snippet, not a mini-lesson. */
  body: string;
};
