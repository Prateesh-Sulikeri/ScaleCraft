import { test, expect } from "@playwright/test";
import { resetSlugs } from "./helpers";

/**
 * End-to-end guard for the Learning Path (RELEASE_3.0.0_LEARNING_PATH.md
 * Phase 3): the curriculum browser at /building-blocks and
 * /real-world-extraction, real routing into a chapter workspace, and a real
 * Dexie round-trip for manual completion. Component-level coverage already
 * exists (src/learning-path/*.test.tsx); this only exercises what jsdom
 * can't — real navigation and persistence across a reload.
 */

// The Learning Path's curriculum manifest is static (src/curriculum/manifest.ts) -
// section/chapter counts render from it synchronously and don't depend on the
// progress store's cloud hydrate, so these two counts are not racy the way the
// manual-complete-toggle test below is (see pending-6.1.0-poa.md 9.2).
const BITLY_SLUG = "rwe-t1-bitly-url-shortener";

test("renders all 10 sections and 40 chapter rows for Building Blocks", async ({ page }) => {
  await page.goto("/building-blocks");
  await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();

  const sectionToggles = page.getByRole("button", { name: /^(part|group) /i });
  await expect(sectionToggles).toHaveCount(10);

  // 40, not 47 - Release 6.1.0-alpha Phase 10 condensed Part 1 from 11
  // chapters to 4 (47 - 11 + 4 = 40). See pending-6.1.0-poa.md Phase 10.
  const rows = page.getByRole("img", { name: /completed|in progress|not started/i });
  await expect(rows).toHaveCount(40);
});

test("a section collapses and expands", async ({ page }) => {
  await page.goto("/building-blocks");
  const part0Toggle = page.getByRole("button", { name: /part 0/i });

  await expect(page.getByText("Welcome to ScaleCraft")).toBeVisible();
  await part0Toggle.click();
  await expect(page.getByText("Welcome to ScaleCraft")).toBeHidden();
  await part0Toggle.click();
  await expect(page.getByText("Welcome to ScaleCraft")).toBeVisible();
});

test("an unauthored row is not a link and does not navigate on click", async ({ page }) => {
  await page.goto("/building-blocks");
  // Find any row that is marked "Coming soon" (unauthored) and assert
  // clicking it does not navigate away from the Learning Path.
  const comingSoonRow = page.locator('div').filter({ hasText: 'Coming soon' }).first();
  await expect(comingSoonRow).toBeVisible();

  await comingSoonRow.click();
  await expect(page).toHaveURL(/\/building-blocks$/);
});

test("3.4 Load Balancer navigates to its chapter lesson (Chapter Reader) route", async ({ page }) => {
  await page.goto("/building-blocks");
  await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");
  await expect(page.getByRole("heading", { name: "Load Balancer" })).toBeVisible();
});

test("the manual complete toggle flips a row to COMPLETED, bumps overall percentage, and survives a reload", async ({
  page,
}) => {
  // Load a page before the bare API call below - global.setup.ts's
  // storageState snapshot is captured once at the very start of the whole
  // suite, and page.request replays those cookies as-is with no refresh of
  // its own. A page load lets Clerk's client SDK (mounted on every route via
  // the root layout) refresh the session first; a bare API call this far
  // into a multi-minute run can otherwise hit a session that's expired
  // since that snapshot was taken and 401.
  await page.goto("/real-world-extraction");

  // Reset server state before asserting, not after - a prior run's dirty
  // completion otherwise races the cloud hydrate on load (pending-6.1.0-poa.md
  // 9.2): local starts empty ("0/32"), then the reconcile pull can flip it to
  // "1/32" mid-test if this row was left completed by an earlier run.
  await resetSlugs(page.request, [BITLY_SLUG]);

  const hydrated = page.waitForResponse(
    (r) => r.url().includes("/api/sync/curriculum-progress") && r.request().method() === "GET",
  );
  await page.reload();
  await hydrated;

  const row = page.locator("li").filter({ hasText: "Bitly" });
  const toggle = row.getByRole("button", { name: /mark.*complete/i });

  await expect(page.getByText("0 / 32 chapters", { exact: false })).toBeVisible();
  await toggle.click();
  await expect(page.getByText("1 / 32 chapters", { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 / 32 chapters", { exact: false })).toBeVisible();
  await expect(row.getByRole("button", { name: /mark.*incomplete/i })).toBeVisible();
});

test("the Download Curriculum link points at the PDF with a download attribute", async ({ page }) => {
  await page.goto("/building-blocks");
  const link = page.getByRole("link", { name: /download curriculum/i });
  await expect(link).toHaveAttribute("href", "/docs/The_Crafters_Guide_to_System_Design.pdf");
  await expect(link).toHaveAttribute("download", "");
});
