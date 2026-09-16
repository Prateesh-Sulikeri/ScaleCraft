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

/** Uppercase category code shown on the canvas card (DESIGN.md Node Card),
 * mirroring `modeShortCode` in src/lib/modes.ts. The word is what carries
 * category identity for anyone who can't separate the six hues - so it
 * renders in neutral ink, not the category color, which also keeps it above
 * 4.5:1 in both themes (--category-compute is 4.35:1 on dark panel). */
export const categoryShortCode: Record<ComponentCategory, string> = {
  networking: "NET",
  compute: "COMP",
  data: "DATA",
  caching: "CACHE",
  messaging: "MSG",
  "distributed-systems": "DIST",
};
