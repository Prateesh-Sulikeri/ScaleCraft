import { test, expect } from "@playwright/test";
import {
  resetSandbox,
  selectAllViaBoxDrag,
  viewportScale,
  connectNodes,
  SANDBOX_SEED_NODES,
  SANDBOX_SEED_EDGES,
} from "./helpers";

/**
 * Canvas interaction E2E tests - drag-drop, edge creation, node operations,
 * and validation integration in a real browser. Component-level tests exist
 * (Canvas.test.tsx, store.test.ts), but this layer exercises the full
 * React Flow DOM behavior: drag coordinates, handle positioning, validation
 * feedback tied to specific node selections.
 */

test.describe("Canvas - Component Placement", () => {
  test("canvas loads and is interactive", async ({ page }) => {
    await resetSandbox(page);

    await expect(page.locator(".react-flow__pane")).toBeVisible();
    // resetSandbox already asserts the seed count - the old version asserted
    // `count >= 0`, which no canvas state could ever fail.
  });

  test("delete a component node via keyboard (Backspace)", async ({ page }) => {
    await resetSandbox(page);
    const nodes = page.locator(".react-flow__node");

    await nodes.first().click();
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);

    await page.keyboard.press("Backspace");

    // Exactly one fewer. The old `newCount <= initialCount` was satisfied by
    // the delete silently doing nothing.
    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES - 1);
  });

  test("delete a component node via keyboard (Delete key)", async ({ page }) => {
    await resetSandbox(page);
    const nodes = page.locator(".react-flow__node");

    await nodes.nth(1).click();
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);

    await page.keyboard.press("Delete");

    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES - 1);
  });

  test("delete a node via right-click context menu", async ({ page }) => {
    await resetSandbox(page);
    const nodes = page.locator(".react-flow__node");

    await nodes.first().click({ button: "right" });

    // The single-node menu's own Delete, asserted rather than guarded - the
    // old `if (deleteBtn.count() > 0)` skipped the whole assertion whenever
    // the menu failed to open, which is exactly the failure worth catching.
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES - 1);
  });

  test("multi-select nodes and delete them together", async ({ page }) => {
    // The old version read the count at runtime and bailed via
    // `expect(true).toBe(true)` when it was under 2, so it could pass without
    // ever multi-selecting anything.
    await resetSandbox(page);
    const nodes = page.locator(".react-flow__node");

    await selectAllViaBoxDrag(page);

    // Right-clicking a *node* opens the single-node menu (onNodeContextMenu),
    // whose Delete removes just that one - the real cause of the old
    // "expected 2, received 3". The group delete lives on the selection
    // rect's menu (onSelectionContextMenu).
    await page.locator(".react-flow__nodesselection-rect").click({ button: "right" });
    await page.getByRole("button", { name: `Delete ${SANDBOX_SEED_NODES} components` }).click();

    await expect(nodes).toHaveCount(0);
  });

  // The single-node menu has no Duplicate at all (ContextMenu.tsx) - the old
  // test guarded on finding one, never did, and fell through to a literal
  // `expect(true).toBe(true)`. Duplicate exists only for a selection.
  test("duplicate a selection via context menu", async ({ page }) => {
    await resetSandbox(page);
    const nodes = page.locator(".react-flow__node");

    await selectAllViaBoxDrag(page);

    await page.locator(".react-flow__nodesselection-rect").click({ button: "right" });
    await page.getByRole("button", { name: `Duplicate ${SANDBOX_SEED_NODES} components` }).click();

    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES * 2);
  });
});

test.describe("Canvas - Edge Management", () => {
  test("create an edge between two nodes via handle drag", async ({ page }) => {
    await resetSandbox(page);

    const edges = page.locator(".react-flow__edge");
    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);

    // Client -> Database is the one pair the seed leaves unconnected. There
    // is no isValidConnection on the canvas, so the drag genuinely creates an
    // edge; the old `newCount >= initialCount` would have passed even if it
    // created nothing.
    const client = page.locator(".react-flow__node").filter({ hasText: "Client" }).first();
    const database = page.locator(".react-flow__node").filter({ hasText: "SQL Database" }).first();
    await connectNodes(page, client, database);

    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES + 1);
  });

  test("delete an edge via context menu", async ({ page }) => {
    await resetSandbox(page);

    const edges = page.locator(".react-flow__edge");
    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);

    // React Flow's straight edges have a zero-height SVG bounding box, which
    // fails Playwright's actionability check - force clicks the stroke.
    await edges.first().click({ button: "right", force: true });
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES - 1);
  });

  test("reverse an edge direction via context menu", async ({ page }) => {
    await resetSandbox(page);

    const edges = page.locator(".react-flow__edge");
    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);

    // React Flow labels each edge "Edge from <source> to <target>", so the
    // swap is directly observable. The old version only checked the edge
    // count was unchanged - which reversing and doing nothing both satisfy.
    const forward = page.getByRole("group", { name: "Edge from client-1 to lb-1" });
    const reversed = page.getByRole("group", { name: "Edge from lb-1 to client-1" });

    await expect(forward).toHaveCount(1);
    await forward.click({ button: "right", force: true });
    await page.getByRole("button", { name: "Reverse direction" }).click();

    await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);
    await expect(reversed).toHaveCount(1);
    await expect(forward).toHaveCount(0);
  });
});

test.describe("Canvas - Validation Integration", () => {
  test("validating the clean seed graph reports no violations", async ({ page }) => {
    await resetSandbox(page);

    await page.locator(".react-flow__node").filter({ hasText: "Client" }).first().click();
    await page.getByRole("button", { name: /validate/i }).click();

    // Validation opens its dedicated details popover. The seed graph is
    // valid, so the panel reports that rather than a rule violation.
    const validationDetails = page.locator('[data-tour="validation-details"]');
    await expect(validationDetails).toBeVisible();
    await expect(validationDetails).toContainText("No violations.");
  });

  test("validation explains a violation it finds", async ({ page }) => {
    await resetSandbox(page);

    // Wire Client straight to the database, which no-direct-client-database
    // rejects - the old test never created a violation at all, then asserted
    // `panelVisible || violationVisible`, which any rendered page satisfies.
    const client = page.locator(".react-flow__node").filter({ hasText: "Client" }).first();
    const database = page.locator(".react-flow__node").filter({ hasText: "SQL Database" }).first();
    await connectNodes(page, client, database);

    await page.getByRole("button", { name: /validate/i }).click();

    const validationDetails = page.locator('[data-tour="validation-details"]');
    await expect(validationDetails).toBeVisible();
    // The explanation, not just the verdict - CLAUDE.md treats a bare
    // "invalid" as a bug.
    await expect(validationDetails).not.toContainText("No violations.");
    await expect(validationDetails).toContainText(/client/i);
  });

  test("a node stays selectable after validating", async ({ page }) => {
    await resetSandbox(page);

    await page.getByRole("button", { name: /validate/i }).click();

    await page.locator(".react-flow__node").first().click();
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
  });
});

test.describe("Canvas - Zoom and Pan", () => {
  test("zoom controls are visible", async ({ page }) => {
    await resetSandbox(page);

    const controls = page.locator(".react-flow__controls");
    await expect(controls).toBeVisible();
    // Named, not counted - `count > 0` passed no matter which controls
    // were actually rendered.
    for (const name of ["Zoom In", "Zoom Out", "Fit View"]) {
      await expect(controls.getByRole("button", { name })).toBeVisible();
    }
  });

  test("zoom in button increases zoom level", async ({ page }) => {
    await resetSandbox(page);

    const before = await viewportScale(page);
    await page.getByRole("button", { name: "Zoom In" }).click();

    // The actual transform, not just "the canvas is still visible" - which
    // stayed true whether or not the button did anything.
    await expect.poll(() => viewportScale(page)).toBeGreaterThan(before);
  });

  test("zoom out button decreases zoom level", async ({ page }) => {
    await resetSandbox(page);

    const before = await viewportScale(page);
    await page.getByRole("button", { name: "Zoom Out" }).click();

    await expect.poll(() => viewportScale(page)).toBeLessThan(before);
  });

  test("fit view button restores the zoom level it started at", async ({ page }) => {
    await resetSandbox(page);

    // Establish the baseline from an explicit Fit View: the mount-time one
    // may not have landed yet, and reading before it does gives a bare 1.
    await page.getByRole("button", { name: "Fit View" }).click();
    const fitted = await viewportScale(page);

    await page.getByRole("button", { name: "Zoom In" }).click();
    await expect.poll(() => viewportScale(page)).toBeGreaterThan(fitted);

    await page.getByRole("button", { name: "Fit View" }).click();
    await expect.poll(() => viewportScale(page)).toBeCloseTo(fitted, 2);
  });
});

test.describe("Canvas - Selection and Configuration", () => {
  test("click a node to select it", async ({ page }) => {
    await resetSandbox(page);

    await page.locator(".react-flow__node").first().click();
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
  });

  test("edit a node's config and see it update", async ({ page }) => {
    await resetSandbox(page);

    // Double-click, not click: the config popover opens on onNodeDoubleClick.
    // The old version single-clicked, found no inputs on the page, and its
    // `if (formInputs.count() > 0)` skipped every assertion.
    await page
      .locator(".react-flow__node-component")
      .filter({ hasText: "Load Balancer" })
      .first()
      .dblclick();

    const instanceName = page.getByLabel("Instance name");
    await expect(instanceName).toBeVisible();

    await instanceName.fill("edge-router");
    await expect(instanceName).toHaveValue("edge-router");
    // The rendered node picks the new name up, not just the form field.
    await expect(page.locator(".react-flow__node").filter({ hasText: "edge-router" })).toHaveCount(1);
  });

  test("click an edge to select it", async ({ page }) => {
    await resetSandbox(page);

    // force: straight edges have a zero-height SVG bbox that fails
    // Playwright's actionability check on a plain click
    await page.locator(".react-flow__edge").first().click({ force: true });

    await expect(page.locator(".react-flow__edge.selected")).toHaveCount(1);
  });
});
