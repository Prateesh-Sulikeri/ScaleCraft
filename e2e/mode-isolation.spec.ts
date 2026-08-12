import { test, expect } from "@playwright/test";

/**
 * Regression guard: each mode (Sandbox, Building Blocks, Real World
 * Extraction) must get its own isolated canvas store, so switching modes via
 * real client-side SPA navigation (not a full page reload, which would
 * trivially reset everything regardless of the bug) never leaks one mode's
 * graph into another's. Building Blocks now routes through the Learning Path
 * (RELEASE_3.0.0_LEARNING_PATH.md Phase 4) before reaching a canvas at all —
 * the invariant being guarded is unchanged, only the navigation path is.
 */
test("switching modes via client-side navigation never leaks canvas content between them", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Sandbox/ }).click();
  await page.waitForURL("**/sandbox");
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__node").filter({ hasText: "Client" })).toHaveCount(1);

  // Header logo is a plain <Link>, no branded transition hold. Exact match:
  // by default getByRole does substring matching, and an authored chapter
  // row link's accessible name ("0.1 Welcome to ScaleCraft") also contains
  // "ScaleCraft".
  await page.getByRole("link", { name: "ScaleCraft", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/");

  await page.getByRole("link", { name: /Building Blocks/ }).click();
  await page.waitForURL("**/building-blocks");
  // The Learning Path has no canvas at all now (Phase 4) — assert it's the
  // curriculum browser, then navigate into a real chapter workspace and
  // confirm nothing from Sandbox bled through there either.
  await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();
  await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");
  await expect(page.locator(".react-flow__node")).toHaveCount(0);

  // The Reader page has no AppHeader (DESIGN.md) — its own back-link goes
  // to the Learning Path, which is where the home "ScaleCraft" link lives.
  await page.getByRole("link", { name: "Learning Path" }).click();
  await page.waitForURL("**/building-blocks");
  await page.getByRole("link", { name: "ScaleCraft", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/");

  await page.getByRole("link", { name: /Sandbox/ }).click();
  await page.waitForURL("**/sandbox");
  // Back in Sandbox: its own content must still be there, not reset to
  // empty and not replaced by Building Blocks' empty canvas.
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__node").filter({ hasText: "Client" })).toHaveCount(1);
});
