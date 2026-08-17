import { test, expect } from "@playwright/test";
import {
  openComponentPicker,
  placePendingComponent,
  resetCustomComponents,
  resetSandbox,
  SANDBOX_SEED_NODES,
} from "./helpers";

/**
 * One round trip: create a custom component through the real modal, prove it
 * survives a page load, and place it on the canvas.
 *
 * The create/edit/delete form behaviour, palette row controls and search all
 * have component tests (CreateComponentModal, ComponentPickerRow,
 * ComponentPicker, custom-components-store). What they can't prove is that a
 * created component actually round-trips through the cloud and comes back
 * placeable after a reload.
 */

const NAME = "E2E Rate Limiter";

test("a custom component survives a reload and can be placed on the canvas", async ({ page }) => {
  await resetCustomComponents(page);
  await resetSandbox(page);

  const picker = await openComponentPicker(page);
  await picker.getByRole("option", { name: /^New component/ }).click();

  const modal = page.getByRole("heading", { name: "New component" });
  await expect(modal).toBeVisible();
  await page.getByLabel("Label").fill(NAME);
  await page.getByLabel("Summary").fill("Sheds load past a threshold");
  await page.getByRole("button", { name: "Create component" }).click();
  await expect(modal).toBeHidden();

  await page.reload();

  // Against the seed constant, not a live count taken here - React Flow has
  // not hydrated yet this soon after a reload, so counting now reads 0.
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(SANDBOX_SEED_NODES);

  const reopened = await openComponentPicker(page);
  const option = reopened.getByRole("option", { name: new RegExp(`^${NAME}:`) });
  await expect(option).toBeVisible();

  await option.click();
  await placePendingComponent(page, NAME);

  await expect(nodes).toHaveCount(SANDBOX_SEED_NODES + 1);
  await expect(nodes.filter({ hasText: NAME })).toHaveCount(1);
});
