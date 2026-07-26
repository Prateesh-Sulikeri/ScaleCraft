import { test, expect } from "@playwright/test";

/**
 * Real-browser IndexedDB persistence — src/persistence/db.ts's `db.saves`
 * table, written by Sandbox's explicit Save button (src/app/sandbox/page.tsx's
 * `handleSave`). This is the one layer the unit/component suite can't
 * meaningfully exercise (fake-indexeddb proves the Dexie calls work, not that
 * a real browser reload actually restores from it).
 */
test("an explicit Save persists a canvas edit across a full page reload", async ({ page }) => {
  await page.goto("/sandbox");

  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(4);
  await expect(nodes.filter({ hasText: "Client" })).toHaveCount(1);

  // Select the seed "Client" node and delete it via React Flow's own
  // deleteKeyCode handling (Canvas.tsx), not the component picker.
  await nodes.filter({ hasText: "Client" }).click();
  await page.keyboard.press("Backspace");
  await expect(nodes).toHaveCount(3);
  await expect(nodes.filter({ hasText: "Client" })).toHaveCount(0);

  await page.getByRole("button", { name: "Save" }).click();

  await page.reload();

  const nodesAfterReload = page.locator(".react-flow__node");
  await expect(nodesAfterReload).toHaveCount(3);
  await expect(nodesAfterReload.filter({ hasText: "Client" })).toHaveCount(0);
});
