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

/** Display names — Title Case per DESIGN_LANGUAGE.md's Color System table
 * ("Distributed Systems" as two words, not the raw hyphenated slug). */
export const categoryLabel: Record<ComponentCategory, string> = {
  networking: "Networking",
  compute: "Compute",
  data: "Data",
  caching: "Caching",
  messaging: "Messaging",
  "distributed-systems": "Distributed Systems",
};

/** Fixed display order, matching the DESIGN_LANGUAGE.md table row order. */
export const categoryOrder: ComponentCategory[] = [
  "networking",
  "compute",
  "data",
  "caching",
  "messaging",
  "distributed-systems",
];
