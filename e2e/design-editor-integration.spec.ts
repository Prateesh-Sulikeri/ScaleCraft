import { test, expect } from "@playwright/test";
import { resetChapterCanvas, savedIndicator, CHAPTER_STARTER_NODES } from "./helpers";

/**
 * Design Editor Integration E2E tests - full workflows that span multiple
 * screens: Learning Path → Chapter Reader → Design Editor → Exam → Results.
 * This layer exercises the cross-route orchestration and state persistence
 * that component tests can't validate.
 *
 * Exercises the real "chapter journey" that a learner takes:
 * 1. Browse Learning Path
 * 2. Read chapter lesson
 * 3. Design the solution on the canvas
 * 4. Take the exam to validate understanding
 * 5. View results and progression
 */

test.describe("Chapter Journey - Full Workflow", () => {
  test("complete a full chapter flow from learning path to exam", async ({ page }) => {
    // 1. Start at learning path, on this chapter's starter graph rather than
    // whatever the previous spec left in the shared account.
    await resetChapterCanvas(page);
    await page.goto("/building-blocks");
    await expect(page.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeVisible();

    // 2. Navigate to a chapter lesson
    await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");

    const lessonHeading = page.getByRole("heading", { level: 1 });
    await expect(lessonHeading).toBeVisible();

    // 3. Click "Begin exercise" to start design editor
    await page.getByRole("link", { name: /begin exercise/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer");

    // Canvas should be visible (not in lesson mode)
    const canvas = page.locator(".react-flow__pane");
    await expect(canvas).toBeVisible();

    // 4. Edit the design
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES);
    await nodes.first().click();
    await page.keyboard.press("Backspace");
    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);

    // 5. Save it, and confirm the header actually acknowledges the save
    // rather than just that a button existed.
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(savedIndicator(page)).toBeVisible();

    // 6. Validate, and read the result. The old version walked an
    // open-ended quiz loop guarded at every step, so it could finish having
    // clicked nothing and asserted nothing.
    await page.getByRole("button", { name: /validate/i }).click();
    await expect(page.locator('[data-tour="validation-details"]')).toBeVisible({ timeout: 20_000 });
  });

  test("autosave persists design changes without manual save", async ({ page }) => {
    await resetChapterCanvas(page);

    const nodes = page.locator(".react-flow__node");
    await nodes.first().click();
    await page.keyboard.press("Backspace");
    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);

    // No Save click here - that is the point of the test. The status text is
    // no use as a signal: "saved" is use-autosave's *resting* state, so
    // waiting for "Saved" passes instantly whether or not a write happened,
    // and the hook deliberately shows "saving" for only every Nth write.
    // So wait out the debounce (AUTOSAVE_DEBOUNCE_MS, 2s) and let the
    // post-reload count be the real assertion.
    await page.waitForTimeout(3000);

    await page.reload();

    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES - 1);
  });

  test("validation can be triggered in design editor", async ({ page }) => {
    await resetChapterCanvas(page);

    await page.getByRole("button", { name: /validate/i }).click();

    // The old body was `expect(true).toBe(true)` behind a guard - it asserted
    // nothing whether or not validation ran. The starter graph is
    // deliberately under-provisioned (one app server behind the balancer),
    // so Validate has a real violation to report.
    const details = page.locator('[data-tour="validation-details"]');
    await expect(details).toBeVisible({ timeout: 20_000 });
    await expect(details).toContainText(/single backend instance/i);
  });

  test("design editor is accessible from chapter", async ({ page }) => {
    // Start at design editor
    await page.goto("/building-blocks/3-4-load-balancer");

    // Canvas should be visible
    const canvas = page.locator(".react-flow__pane");
    await expect(canvas).toBeVisible();
  });
});

test.describe("Design Editor - Configuration", () => {
  test("open component config panel and modify settings", async ({ page }) => {
    await resetChapterCanvas(page);

    // Assert the precondition rather than guarding on it: the old
    // `if (count > 0)` let this pass having asserted nothing.
    const nodes = page.locator(".react-flow__node-component");
    await expect(nodes.first()).toBeVisible();

    // The config popover opens on double-click (Canvas.tsx's
    // onNodeDoubleClick) or the context menu's Configure. A single click
    // only selects, so the old version was asserting against a panel that
    // had never opened.
    await nodes.first().dblclick();

    // The popover's own labelled field. `[class*='panel']` matched every
    // bg-panel utility in the toolbar instead (17 elements, strict-mode
    // violation).
    const instanceName = page.getByLabel("Instance name");
    await expect(instanceName).toBeVisible();

    await instanceName.fill("modified-value");
    await expect(instanceName).toHaveValue("modified-value");
  });

  test("config changes are persisted in component", async ({ page }) => {
    await resetChapterCanvas(page);

    const loadBalancer = page
      .locator(".react-flow__node-component")
      .filter({ hasText: "Load Balancer" })
      .first();
    await loadBalancer.dblclick();

    // ConfigForm labels each field off its config key, so `algorithm` reads
    // as "Algorithm". The old version called selectOption("value_2") - a
    // value no config field has ever offered - behind three nested guards,
    // so it never ran.
    const algorithm = page.getByLabel("Algorithm");
    await expect(algorithm).toHaveValue("round-robin");
    await algorithm.selectOption("least-connections");
    await expect(algorithm).toHaveValue("least-connections");

    // Reopen the popover: edits commit to the store on change, so the value
    // has to survive the form being torn down and rebuilt.
    await page.keyboard.press("Escape");
    await expect(algorithm).toBeHidden();

    await loadBalancer.dblclick();
    await expect(page.getByLabel("Algorithm")).toHaveValue("least-connections");
  });

  test("view component documentation in inspector", async ({ page }) => {
    await resetChapterCanvas(page);

    const nodes = page.locator(".react-flow__node-component");
    await expect(nodes.first()).toBeVisible();
    await nodes.first().dblclick();

    await page.getByRole("button", { name: "Docs" }).click();

    // Docs open as a tab in the docs panel (the store's openDocTab), never a
    // modal - which is why `[class*='modal']` could never match however long
    // it waited. The panel's own controls are the real signal.
    await expect(page.getByRole("button", { name: "Minimize documentation panel" })).toBeVisible();
  });
});

test.describe("Design Editor - Chapter-Specific Validation", () => {
  test("chapter validation checks required components", async ({ page }) => {
    await resetChapterCanvas(page);

    // The starter graph carries all four required components, so the sidebar
    // reports them satisfied while Validate still flags the under-provisioned
    // balancer. The old version matched /required|must|need/ anywhere on the
    // page and skipped its assertion entirely when that found nothing.
    await expect(
      page.getByText(`${CHAPTER_STARTER_NODES} / ${CHAPTER_STARTER_NODES} required components present`),
    ).toBeVisible();

    await page.getByRole("button", { name: /validate/i }).click();
    await expect(page.locator('[data-tour="validation-details"]')).toContainText(
      /single backend instance/i,
      { timeout: 20_000 },
    );
  });

  test("chapter reports a required component once it is removed", async ({ page }) => {
    await resetChapterCanvas(page);

    // Deleting the database drops the required-component tally. The old test
    // only checked that a Validate button existed, behind a guard that made
    // even that optional.
    await page
      .locator(".react-flow__node-component")
      .filter({ hasText: "SQL Database" })
      .first()
      .click();
    await page.keyboard.press("Backspace");

    await expect(
      page.getByText(`${CHAPTER_STARTER_NODES - 1} / ${CHAPTER_STARTER_NODES} required components present`),
    ).toBeVisible();
  });
});

test.describe("Design Editor - UX Flows", () => {
  test("component search/filter works in a palette", async ({ page }) => {
    await resetChapterCanvas(page);

    // The picker opens on a pane right-click (Canvas.tsx onPaneContextMenu).
    // The old version looked for `[class*='palette'], [class*='picker']` on a
    // page where the picker was never opened, so both its guards were false.
    await page.locator(".react-flow__pane").click({ button: "right", position: { x: 20, y: 20 } });

    const picker = page.getByRole("dialog", { name: "Add a component" });
    await expect(picker).toBeVisible();

    const options = picker.getByRole("option");
    const unfiltered = await options.count();
    expect(unfiltered).toBeGreaterThan(1);

    await picker.getByRole("combobox").fill("client");

    await expect.poll(() => options.count()).toBeLessThan(unfiltered);
    await expect(options.first()).toContainText(/client/i);
  });

  test("right-click context menu shows relevant options", async ({ page }) => {
    await resetChapterCanvas(page);

    await page.locator(".react-flow__node").first().click({ button: "right" });

    // Named items. `[class*='menu']` matched loosely enough that the old
    // guard could skip every assertion, and the one real check it had was
    // `expect(count > 0).toBe(true)` on a locator it never scoped to the menu.
    for (const name of ["Configure", "Open Documentation", "Delete"]) {
      await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
    }
  });

  test("keyboard shortcuts work for common operations", async ({ page }) => {
    await resetChapterCanvas(page);
    const nodes = page.locator(".react-flow__node");

    // Ctrl+D duplicates the selection and Ctrl+Z undoes it. There is no
    // Ctrl+C/Ctrl+V in use-canvas-shortcuts.ts at all - the old test pressed
    // those, then asserted `countAfter >= initialCount`, which covers every
    // outcome including the keys doing nothing.
    await nodes.first().click();
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);

    await page.keyboard.press("Control+d");
    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES + 1);

    await page.keyboard.press("Control+z");
    await expect(nodes).toHaveCount(CHAPTER_STARTER_NODES);
  });
});
