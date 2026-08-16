import type { NextConfig } from "next";

// Close-out P1.2 (pending-6.1.0-poa.md) — Phase 10 absorbed these eleven
// Part 1 slugs into four condensed chapters but never redirected the old
// ones, so every bookmark and every citation link from the separate private
// textbook (ScaleCraft's one integration point with it) 404s. Permanent
// (308): the old slugs are never coming back, and permanent is what tells
// the textbook's links and any crawler to stop asking.
const RETIRED_BUILDING_BLOCKS_SLUGS: Record<string, string> = {
  "1-1-understanding-the-problem": "1-1-framing-the-problem",
  "1-2-functional-requirements": "1-1-framing-the-problem",
  "1-3-non-functional-requirements": "1-1-framing-the-problem",
  "1-4-estimating-scale": "1-1-framing-the-problem",
  "1-5-numbers-every-engineer-should-know": "1-1-framing-the-problem",
  "1-6-drawing-the-first-architecture": "1-2-designing-the-system",
  "1-7-identifying-bottlenecks": "1-2-designing-the-system",
  "1-9-deep-dive-methodology": "1-2-designing-the-system",
  "1-8-engineering-trade-offs": "1-3-defending-the-design",
  "1-10-communicating-and-defending-a-design": "1-3-defending-the-design",
  "1-11-driving-a-system-design-interview": "1-4-driving-the-interview",
};

const nextConfig: NextConfig = {
  // Next's own dev-mode route/bundler badge (bottom-left) — not a
  // ScaleCraft UI element, and it already disappears in production, but
  // it's confusable with a real app affordance during dev. Revisit once
  // there's an actual settings/user menu to put in that corner.
  devIndicators: false,

  async redirects() {
    return Object.entries(RETIRED_BUILDING_BLOCKS_SLUGS).flatMap(([oldSlug, newSlug]) => [
      {
        source: `/building-blocks/${oldSlug}`,
        destination: `/building-blocks/${newSlug}`,
        permanent: true,
      },
      {
        source: `/building-blocks/${oldSlug}/lesson`,
        destination: `/building-blocks/${newSlug}/lesson`,
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
