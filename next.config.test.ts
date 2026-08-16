import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

// Close-out P1.2 (pending-6.1.0-poa.md) — Phase 10 absorbed eleven Part 1
// slugs into four condensed chapters. This locks the resulting redirect
// table down so a future slug change can't quietly drop one and leave a
// bookmark or a textbook citation 404ing again.
const RETIRED_SLUGS_TO_TARGETS: Record<string, string> = {
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

describe("next.config redirects (retired Part 1 slugs)", () => {
  it("maps every retired slug and its /lesson variant, permanently", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    for (const [oldSlug, newSlug] of Object.entries(RETIRED_SLUGS_TO_TARGETS)) {
      const page = redirects!.find((r) => r.source === `/building-blocks/${oldSlug}`);
      const lesson = redirects!.find((r) => r.source === `/building-blocks/${oldSlug}/lesson`);

      expect(page, `missing redirect for ${oldSlug}`).toMatchObject({
        destination: `/building-blocks/${newSlug}`,
        permanent: true,
      });
      expect(lesson, `missing /lesson redirect for ${oldSlug}`).toMatchObject({
        destination: `/building-blocks/${newSlug}/lesson`,
        permanent: true,
      });
    }
  });

  it("emits exactly two redirects per retired slug and nothing else", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toHaveLength(Object.keys(RETIRED_SLUGS_TO_TARGETS).length * 2);
  });
});
