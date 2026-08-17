import { test, expect } from "@playwright/test";
import { resetChapterCanvas, savedIndicator, CHAPTER_STARTER_NODES } from "./helpers";

/**
 * The chapter journey across real routes, and autosave across a real reload.
 *
 * Config panels, docs tabs, palette search, context menus and keyboard
 * shortcuts all have component tests (ConfigForm, NodeConfigPopover,
 * ComponentPicker, ContextMenu, use-canvas-shortcuts) - they don't need a
 * browser. What does: multi-route navigation and persistence that survives a
 * page load.
 */

test("a learner goes Learning Path -> lesson -> canvas, edits, saves and validates", async ({
  page,
}) => {
  await resetChapterCanvas(page);
  await page.goto("/building-blocks");
  await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();

  await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: /begin exercise/i }).click();
  await page.waitForURL("**/building-blocks/3-4-load-balancer");
  await expect(page.locator(".react-flow__pane")).toBeVisible();

  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES);
  await nodes.first().click();
  await page.keyboard.press("Backspace");
  await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(savedIndicator(page)).toBeVisible();

  await page.getByRole("button", { name: /validate/i }).click();
  const details = page.locator('[data-tour="validation-details"]');
  await expect(details).toBeVisible({ timeout: 20_000 });
  // The starter graph is deliberately under-provisioned, so Validate has a
  // real violation to explain.
  await expect(details).toContainText(/single backend instance/i);
});

test("autosave persists a design change without a manual save", async ({ page }) => {
  await resetChapterCanvas(page);

  const nodes = page.locator(".react-flow__node");
  await nodes.first().click();
  await page.keyboard.press("Backspace");
  await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);

  // No Save click - that is the point. The status text is no use as a signal:
  // "saved" is use-autosave's resting state, so waiting on it passes whether
  // or not a write happened. Wait out the debounce (AUTOSAVE_DEBOUNCE_MS, 2s)
  // and let the post-reload count be the assertion.
  await page.waitForTimeout(3000);
  await page.reload();

  await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);
});
