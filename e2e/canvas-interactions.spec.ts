import { test, expect } from "@playwright/test";
import {
  resetSandbox,
  selectAllViaBoxDrag,
  connectNodes,
  SANDBOX_SEED_NODES,
  SANDBOX_SEED_EDGES,
} from "./helpers";

/**
 * Real pointer geometry against React Flow's DOM, plus the validation engine
 * end to end. Everything else about the canvas (node/edge rendering, context
 * menus, config forms, selection state, keyboard deletes) is covered by
 * Canvas.test.tsx, ContextMenu.test.tsx, ConfigForm.test.tsx and
 * NodeConfigPopover.test.tsx - those run in milliseconds and don't need a
 * browser. Only what jsdom structurally can't do lives here.
 */

test("box-drag selects every node and the group menu deletes them together", async ({ page }) => {
  // Drag selection depends on real pointer coordinates and React Flow's
  // nodes-selection rect, neither of which jsdom produces.
  await resetSandbox(page);
  const nodes = page.locator(".react-flow__node");

  await selectAllViaBoxDrag(page);

  // Group delete lives on the selection rect's menu (onSelectionContextMenu).
  // A node right-click opens the single-node menu instead.
  await page.locator(".react-flow__nodesselection-rect").click({ button: "right" });
  await page.getByRole("button", { name: `Delete ${SANDBOX_SEED_NODES} components` }).click();

  await expect(nodes).toHaveCount(0);
});

test("dragging between handles creates an edge", async ({ page }) => {
  await resetSandbox(page);

  const edges = page.locator(".react-flow__edge");
  await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);

  // Connections complete on mouseup over the target handle, so this needs
  // real handle bounding boxes. Client -> Database is the one pair the seed
  // leaves unconnected.
  const client = page.locator(".react-flow__node").filter({ hasText: "Client" }).first();
  const database = page.locator(".react-flow__node").filter({ hasText: "SQL Database" }).first();
  await connectNodes(page, client, database);

  await expect(edges).toHaveCount(SANDBOX_SEED_EDGES + 1);
});

test("validation explains the violation it finds", async ({ page }) => {
  await resetSandbox(page);

  // Client straight to the database, which no-direct-client-database rejects.
  const client = page.locator(".react-flow__node").filter({ hasText: "Client" }).first();
  const database = page.locator(".react-flow__node").filter({ hasText: "SQL Database" }).first();
  await connectNodes(page, client, database);

  await page.getByRole("button", { name: /validate/i }).click();

  // The engine is a dynamic import, so the first Validate on a route can
  // outlast the default budget while that chunk compiles.
  const details = page.locator('[data-tour="validation-details"]');
  await expect(details).toBeVisible({ timeout: 20_000 });
  // The explanation, not just the verdict - CLAUDE.md treats a bare
  // "invalid" as a bug.
  await expect(details).not.toContainText("No violations.");
  await expect(details).toContainText(/client/i);
});
