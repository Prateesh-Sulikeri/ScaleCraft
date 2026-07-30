import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for two non-negotiable product invariants from CLAUDE.md:
 * hints are opt-in and never auto-surfaced, and Validate's result is always
 * shown, never hidden behind extra clicks. Exercised against the real
 * placeholder chapter content (src/content/chapters/index.ts) in an actual
 * browser, not a component harness.
 *
 * The placeholder chapter (bb-dummy-1) requires three components
 * (client/load-balancer/app-server) the starter graph deliberately starts
 * without, so Validate on a fresh canvas legitimately reports those as
 * missing rather than "No violations." — required-component presence became
 * a real, surfaced check as part of Track 2's chapter-mastery work
 * (previously presence-only and never actually connected to what Validate
 * showed). This test only needs to prove the panel unconditionally shows a
 * result, not specifically a passing one.
 */
test("a hint stays collapsed until revealed, and Validate always surfaces its result", async ({ page }) => {
  await page.goto("/building-blocks");

  await page.getByRole("link", { name: /1\.2.*Load Balancing/i }).click();
  await page.waitForURL("**/building-blocks/1-2-load-balancing");
  await expect(page.getByText(/This is placeholder content for the first Building Blocks chapter/)).toBeVisible();

  // The hint's body text must not be in the DOM until explicitly revealed.
  const hintBody = "This is a placeholder hint";
  await expect(page.getByText(hintBody)).toHaveCount(0);
  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.getByText(hintBody)).toBeVisible();

  await page.getByRole("button", { name: "Validate" }).click();
  await expect(page.getByText("Client is required for this chapter but isn't on the canvas.")).toBeVisible();
});
