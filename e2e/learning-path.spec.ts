import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for the Learning Path (RELEASE_3.0.0_LEARNING_PATH.md
 * Phase 3): the curriculum browser at /building-blocks and
 * /real-world-extraction, real routing into a chapter workspace, and a real
 * Dexie round-trip for manual completion. Component-level coverage already
 * exists (src/learning-path/*.test.tsx); this only exercises what jsdom
 * can't — real navigation and persistence across a reload.
 */

test("renders all 10 sections and 47 chapter rows for Building Blocks", async ({ page }) => {
  await page.goto("/building-blocks");
  await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();

  const sectionToggles = page.getByRole("button", { name: /^(part|group) /i });
  await expect(sectionToggles).toHaveCount(10);

  const rows = page.getByRole("img", { name: /completed|in progress|not started/i });
  await expect(rows).toHaveCount(47);
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
  const row = page.getByText("Communicating & Defending a Design");
  await expect(row).toBeVisible();
  await expect(page.getByRole("link", { name: /Communicating & Defending a Design/i })).toHaveCount(0);

  await row.click();
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
  await page.goto("/real-world-extraction");
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
