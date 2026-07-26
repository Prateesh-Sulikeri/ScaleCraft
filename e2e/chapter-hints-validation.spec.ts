import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for two non-negotiable product invariants from CLAUDE.md:
 * hints are opt-in and never auto-surfaced, and Validate's result (even a
 * passing "No violations.") is always shown, never hidden behind extra
 * clicks. Exercised against the real placeholder chapter content
 * (src/content/chapters/index.ts) in an actual browser, not a component
 * harness.
 */
test("a hint stays collapsed until revealed, and Validate always surfaces its result", async ({ page }) => {
  await page.goto("/building-blocks");

  await page.getByRole("button", { name: "Placeholder Chapter" }).click();
  await expect(page.getByText(/This is placeholder content for the first Building Blocks chapter/)).toBeVisible();

  // The hint's body text must not be in the DOM until explicitly revealed.
  const hintBody = "This is a placeholder hint";
  await expect(page.getByText(hintBody)).toHaveCount(0);
  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.getByText(hintBody)).toBeVisible();

  await page.getByRole("button", { name: "Validate" }).click();
  await expect(page.getByText("No violations.")).toBeVisible();
});
