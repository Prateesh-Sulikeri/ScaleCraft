import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for the Learning Path (RELEASE_3.0.0_LEARNING_PATH.md
 * Phase 3): the curriculum browser at /building-blocks and
 * /real-world-extraction, real routing into a chapter workspace, and a real
 * Dexie round-trip for manual completion. Component-level coverage already
 * exists (src/learning-path/*.test.tsx); this only exercises what jsdom
 * can't — real navigation and persistence across a reload.
 */

test("renders all 7 sections and 26 chapter rows for Building Blocks", async ({ page }) => {
  await page.goto("/building-blocks");
  await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();

  const sectionToggles = page.getByRole("button", { name: /^unit /i });
  await expect(sectionToggles).toHaveCount(7);

  const rows = page.getByRole("img", { name: /completed|in progress|not started/i });
  await expect(rows).toHaveCount(26);
});

test("a section collapses and expands", async ({ page }) => {
  await page.goto("/building-blocks");
  const unit0Toggle = page.getByRole("button", { name: /unit 0/i });

  await expect(page.getByText("Client, Server, Database")).toBeVisible();
  await unit0Toggle.click();
  await expect(page.getByText("Client, Server, Database")).toBeHidden();
  await unit0Toggle.click();
  await expect(page.getByText("Client, Server, Database")).toBeVisible();
});

test("an unauthored row is not a link and does not navigate on click", async ({ page }) => {
  await page.goto("/building-blocks");
  const row = page.getByText("Client, Server, Database");
  await expect(row).toBeVisible();
  await expect(page.getByRole("link", { name: /Client, Server, Database/i })).toHaveCount(0);

  await row.click();
  await expect(page).toHaveURL(/\/building-blocks$/);
});

test("1.2 Load Balancing navigates to its chapter workspace route", async ({ page }) => {
  await page.goto("/building-blocks");
  await page.getByRole("link", { name: /1\.2.*Load Balancing/i }).click();
  await page.waitForURL("**/building-blocks/1-2-load-balancing");
  await expect(page.getByRole("heading", { name: "Placeholder Chapter" })).toBeVisible();
});

test("the manual complete toggle flips a row to COMPLETED, bumps overall percentage, and survives a reload", async ({
  page,
}) => {
  await page.goto("/real-world-extraction");
  const row = page.locator("li").filter({ hasText: "bit.ly" });
  const toggle = row.getByRole("button", { name: /mark.*complete/i });

  await expect(page.getByText("0 / 5 chapters", { exact: false })).toBeVisible();
  await toggle.click();
  await expect(page.getByText("1 / 5 chapters", { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 / 5 chapters", { exact: false })).toBeVisible();
  await expect(row.getByRole("button", { name: /mark.*incomplete/i })).toBeVisible();
});

test("the Download Curriculum link points at the PDF with a download attribute", async ({ page }) => {
  await page.goto("/building-blocks");
  const link = page.getByRole("link", { name: /download curriculum/i });
  await expect(link).toHaveAttribute("href", "/docs/The_Crafters_Guide_to_System_Design.pdf");
  await expect(link).toHaveAttribute("download", "");
});
