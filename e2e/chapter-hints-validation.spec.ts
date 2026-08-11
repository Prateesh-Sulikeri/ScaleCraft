import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for two non-negotiable product invariants from CLAUDE.md:
 * hints are opt-in and never auto-surfaced, and Validate's result is always
 * shown, never hidden behind extra clicks. Exercised against the real
 * placeholder chapter content (src/content/chapters/index.ts) in an actual
 * browser, not a component harness.
 *
 * The placeholder chapter (bb-dummy-1) requires three components
 * (client/load-balancer/app-server); its starter graph places only the
 * client, so Validate on a fresh canvas legitimately reports Load Balancer
 * and Application Server as missing rather than "No violations." —
 * required-component presence became a real, surfaced check as part of
 * Track 2's chapter-mastery work (previously presence-only and never
 * actually connected to what Validate showed). This test only needs to
 * prove the panel unconditionally shows a result, not specifically a
 * passing one.
 */
test("a hint stays collapsed until revealed, and Validate always surfaces its result", async ({ page }) => {
  await page.goto("/building-blocks");

  await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");
  await expect(page.getByRole("heading", { name: "Load Balancer" })).toBeVisible();

  // Hints/Validate live on the Design Editor workspace, not the Reader
  // page (RELEASE_3.0.0_LEARNING_PATH.md Phase 4) — follow the CTA through.
  await page.getByRole("link", { name: /begin exercise/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer");

  // The hint's body text must not be in the DOM until explicitly revealed.
  const hintBody = /Validate names what\'s connected and what isn\'t\./i;
  await expect(page.getByText(hintBody)).toHaveCount(0);
  await page.getByRole("button", { name: "Show hint" }).first().click();
  await expect(page.getByText(hintBody)).toBeVisible();

  await page.getByRole("button", { name: "Validate" }).click();
  await expect(page.getByText(/Load Balancer distributes to a single backend instance\./i)).toBeVisible();
});
