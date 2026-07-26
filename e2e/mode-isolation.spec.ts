import { test, expect } from "@playwright/test";

/**
 * Regression guard for .claude/docs/pending.md I.6: each mode (Sandbox,
 * Building Blocks, Real World Extraction) must get its own isolated canvas
 * store, so switching modes via real client-side SPA navigation (not a full
 * page reload, which would trivially reset everything regardless of the
 * bug) never leaks one mode's graph into another's.
 */
test("switching modes via client-side navigation never leaks canvas content between them", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Sandbox/ }).click();
  await page.waitForURL("**/sandbox");
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__node").filter({ hasText: "Client" })).toHaveCount(1);

  // Header logo is a plain <Link>, no branded transition hold.
  await page.getByRole("link", { name: "ScaleCraft" }).click();
  await page.waitForURL("http://localhost:3000/");

  await page.getByRole("link", { name: /Building Blocks/ }).click();
  await page.waitForURL("**/building-blocks");
  // No chapter selected yet, and nothing from Sandbox should have bled
  // through — the canvas underneath the Chapter List must be empty.
  await expect(page.locator(".react-flow__node")).toHaveCount(0);

  await page.getByRole("link", { name: "ScaleCraft" }).click();
  await page.waitForURL("http://localhost:3000/");

  await page.getByRole("link", { name: /Sandbox/ }).click();
  await page.waitForURL("**/sandbox");
  // Back in Sandbox: its own content must still be there, not reset to
  // empty and not replaced by Building Blocks' empty canvas.
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__node").filter({ hasText: "Client" })).toHaveCount(1);
});
