import { test, expect, type Locator, type Page } from "@playwright/test";
import { resetSandbox } from "./helpers";

/**
 * Deep Check panel E2E - opening it, moving between its views, and closing
 * it. Component tests cover DeepCheckButton/DeepCheckPanel in isolation.
 *
 * Deliberately does not run an analysis. A real provider call is slow,
 * costs money, and returns different prose every time, so there is nothing
 * stable to assert about its output at this layer - which is exactly how the
 * previous version of this file ended up with eleven tests that asserted
 * nothing: every one wrapped in `if (deepCheckButton.count() > 0)` on a
 * locator that matched a page-wide /deep.*check|analyze|ai.*analysis/ regex,
 * with bodies that bottomed out in `expect(true).toBe(true)` (one test's
 * entire body was that line and a goto). What is worth guarding here is the
 * panel's own deterministic behaviour, which is what this covers.
 */

async function openDeepCheck(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Deep Check" }).click();
  const panel = page.getByTestId("deep-check-panel");
  await expect(panel).toBeVisible();
  return panel;
}

test.describe("Deep Check - Launch and UI", () => {
  test("the Deep Check button opens the panel", async ({ page }) => {
    await resetSandbox(page);

    const button = page.getByRole("button", { name: "Deep Check" });
    await expect(button).toBeVisible();
    // Never HTML-disabled by design (DeepCheckButton.tsx §10.5): with no
    // usable profile the click still has to land somewhere.
    await expect(button).toBeEnabled();

    await openDeepCheck(page);
  });

  test("the panel offers its Help, History and AI Profiles views", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    // exact: the empty state also renders "Read Help", which a substring
    // match on "Help" picks up as well.
    for (const name of ["Help", "History", "AI Profiles", "Close"]) {
      await expect(panel.getByRole("button", { name, exact: true })).toBeVisible();
    }
  });

  test("Close dismisses the panel", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    await panel.getByRole("button", { name: "Close" }).click();

    await expect(panel).toBeHidden();
  });
});

test.describe("Deep Check - Views", () => {
  test("the AI Profiles view opens and titles itself", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    await panel.getByRole("button", { name: "AI Profiles" }).click();

    await expect(panel.getByRole("heading", { name: "AI Profiles" })).toBeVisible();
  });

  test("the History view opens and titles itself", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    await panel.getByRole("button", { name: "History" }).click();

    await expect(panel.getByRole("heading", { name: "Deep Check History" })).toBeVisible();
  });

  test("Back returns from a sub-view to the review", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    await panel.getByRole("button", { name: "AI Profiles" }).click();
    await expect(panel.getByRole("heading", { name: "AI Profiles" })).toBeVisible();

    await panel.getByRole("button", { name: "Back to review" }).click();

    // The per-view controls only render on the review, so their return is
    // the signal that the sub-view was left.
    await expect(panel.getByRole("button", { name: "AI Profiles" })).toBeVisible();
  });

  test("without an AI profile the panel says so and points at setup", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    // The e2e account has no profile configured, so this is the review
    // view's steady state rather than a transient one.
    await expect(panel.getByText(/No AI profile is set up yet/i)).toBeVisible();
    await expect(panel.getByRole("button", { name: "Set Up AI Profile" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Read Help" })).toBeVisible();
  });

  test("'Set Up AI Profile' from the empty state opens the profiles view", async ({ page }) => {
    await resetSandbox(page);
    const panel = await openDeepCheck(page);

    await panel.getByRole("button", { name: "Set Up AI Profile" }).click();

    await expect(panel.getByRole("heading", { name: "AI Profiles" })).toBeVisible();
  });
});

test.describe("Deep Check - Coexistence with validation", () => {
  test("Validate and Deep Check are both available on the sandbox", async ({ page }) => {
    await resetSandbox(page);

    await expect(page.getByRole("button", { name: /validate/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Deep Check" })).toBeVisible();
  });
});
