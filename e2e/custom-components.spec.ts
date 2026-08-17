import { test, expect, type Locator, type Page } from "@playwright/test";
import { openComponentPicker, placePendingComponent, resetCustomComponents, resetSandbox } from "./helpers";

/**
 * Custom components E2E - the create/edit/delete lifecycle and how a custom
 * component reaches the palette and the canvas. Component tests cover
 * CreateComponentModal in isolation; this layer exercises the real
 * persistence and palette integration.
 *
 * The previous version guarded every test on
 * `getByRole("button", { name: /create|new.*component|custom/i })` looked up
 * on the bare sandbox page. That button lives inside the component picker,
 * which nothing had opened, so all 28 guards were false and the file asserted
 * nothing. Where it did reach an assertion the assertion was empty anyway:
 * `expect(count === 0 || !isVisible).toBe(true)` is true when the modal is
 * open *and* when it is closed.
 */

const NAME = "E2E Rate Limiter";
const RENAMED = "E2E Throttler";

/** Creates one custom component through the real modal. */
async function createComponent(page: Page, label: string) {
  const picker = await openComponentPicker(page);
  await picker.getByRole("option", { name: /^New component/ }).click();

  const modal = page.getByRole("heading", { name: "New component" });
  await expect(modal).toBeVisible();

  await page.getByLabel("Label").fill(label);
  await page.getByLabel("Summary").fill("Sheds load past a threshold");
  await page.getByRole("button", { name: "Create component" }).click();

  await expect(modal).toBeHidden();
}

/** The picker row for a component, by its visible label. */
function optionFor(picker: Locator, label: string) {
  return picker.getByRole("option", { name: new RegExp(`^${label}:`) });
}

/** Reveals a custom row's edit/delete controls. They sit in the DOM but are
 *  `hidden group-hover/tile:flex` until the row is hovered or keyboard-active
 *  (ComponentPickerRow.tsx), so they are never visible on a cold lookup. */
async function revealRowControls(picker: Locator, label: string) {
  await optionFor(picker, label).hover();
}

test.describe("Custom Components - Creation", () => {
  test("create a new custom component and find it in the palette", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);

    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await expect(optionFor(picker, NAME)).toBeVisible();
  });

  test("a custom component can carry a config field", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);

    const picker = await openComponentPicker(page);
    await picker.getByRole("option", { name: /^New component/ }).click();
    await expect(page.getByRole("heading", { name: "New component" })).toBeVisible();

    await page.getByLabel("Label").fill(NAME);
    await page.getByLabel("Summary").fill("Sheds load past a threshold");

    await page.getByRole("button", { name: "Add field" }).click();
    await page.getByPlaceholder("fieldName").fill("burstLimit");

    await page.getByRole("button", { name: "Create component" }).click();
    await expect(page.getByRole("heading", { name: "New component" })).toBeHidden();

    // Reopening for edit is what proves the field was actually stored - the
    // old test filled inputs by positional index and asserted nothing at all.
    const reopened = await openComponentPicker(page);
    await revealRowControls(reopened, NAME);
    await reopened.getByRole("button", { name: `Edit ${NAME}` }).click();
    await expect(page.getByRole("heading", { name: "Edit component" })).toBeVisible();
    await expect(page.getByPlaceholder("fieldName")).toHaveValue("burstLimit");
  });

  test("a component with no label is rejected", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);

    const picker = await openComponentPicker(page);
    await picker.getByRole("option", { name: /^New component/ }).click();

    const heading = page.getByRole("heading", { name: "New component" });
    await expect(heading).toBeVisible();

    await page.getByRole("button", { name: "Create component" }).click();

    // The modal stays open rather than creating an unnamed component. The old
    // version branched on `isDisabled` and accepted either outcome.
    await expect(heading).toBeVisible();
  });
});

test.describe("Custom Components - Palette Integration", () => {
  test("a custom component offers edit and delete in the palette", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await revealRowControls(picker, NAME);
    await expect(picker.getByRole("button", { name: `Edit ${NAME}` })).toBeVisible();
    await expect(picker.getByRole("button", { name: `Delete ${NAME}` })).toBeVisible();
  });

  test("built-in components have no edit or delete controls", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);

    const picker = await openComponentPicker(page);

    await expect(picker.getByRole("option", { name: /^Client:/ })).toBeVisible();
    await expect(picker.getByRole("button", { name: "Edit Client" })).toHaveCount(0);
    await expect(picker.getByRole("button", { name: "Delete Client" })).toHaveCount(0);
  });

  test("the palette search finds a custom component by name", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await picker.getByRole("combobox").fill("Rate Limiter");

    await expect(optionFor(picker, NAME)).toBeVisible();
  });
});

test.describe("Custom Components - Editing", () => {
  test("editing a custom component renames it in the palette", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await revealRowControls(picker, NAME);
    await picker.getByRole("button", { name: `Edit ${NAME}` }).click();

    await expect(page.getByRole("heading", { name: "Edit component" })).toBeVisible();
    await page.getByLabel("Label").fill(RENAMED);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("heading", { name: "Edit component" })).toBeHidden();

    const reopened = await openComponentPicker(page);
    await expect(optionFor(reopened, RENAMED)).toBeVisible();
    await expect(optionFor(reopened, NAME)).toHaveCount(0);
  });

  test("the edit form opens pre-filled with the stored values", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await revealRowControls(picker, NAME);
    await picker.getByRole("button", { name: `Edit ${NAME}` }).click();

    await expect(page.getByLabel("Label")).toHaveValue(NAME);
    await expect(page.getByLabel("Summary")).toHaveValue("Sheds load past a threshold");
  });
});

test.describe("Custom Components - Usage and Deletion", () => {
  test("place a custom component on the canvas", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const nodes = page.locator(".react-flow__node");
    const before = await nodes.count();

    const picker = await openComponentPicker(page);
    await optionFor(picker, NAME).click();
    await placePendingComponent(page, NAME);

    await expect(nodes).toHaveCount(before + 1);
    await expect(nodes.filter({ hasText: NAME })).toHaveCount(1);
  });

  test("delete a custom component from the palette", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await revealRowControls(picker, NAME);
    await picker.getByRole("button", { name: `Delete ${NAME}` }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(optionFor(picker, NAME)).toHaveCount(0);
  });

  test("a custom component survives a page reload", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    await page.reload();

    const picker = await openComponentPicker(page);
    await expect(optionFor(picker, NAME)).toBeVisible();
  });
});

test.describe("Custom Components - Validation", () => {
  test("a placed custom component is included in validation", async ({ page }) => {
    await resetCustomComponents(page);
    await resetSandbox(page);
    await createComponent(page, NAME);

    const picker = await openComponentPicker(page);
    await optionFor(picker, NAME).click();
    await placePendingComponent(page, NAME);
    await expect(page.locator(".react-flow__node").filter({ hasText: NAME })).toHaveCount(1);

    await page.getByRole("button", { name: /validate/i }).click();

    // Dropped in unconnected, so the orphan rule has something to say about
    // it. That is the point: a custom component is a first-class participant,
    // which the old test asserted by way of `expect(true).toBe(true)`.
    const details = page.locator('[data-tour="validation-details"]');
    await expect(details).toBeVisible({ timeout: 20_000 });
    await expect(details).not.toContainText("No violations.");
  });
});
