import type { ComponentCategory } from "@/content/components/types";

/**
 * Maps categories to the Tailwind tokens defined in globals.css. Keep in
 * sync with .claude/docs/DESIGN_LANGUAGE.md ("Color system").
 */
export const categoryColorVar: Record<ComponentCategory, string> = {
  networking: "var(--category-networking)",
  compute: "var(--category-compute)",
  data: "var(--category-data)",
  caching: "var(--category-caching)",
  messaging: "var(--category-messaging)",
  "distributed-systems": "var(--category-distributed-systems)",
};
