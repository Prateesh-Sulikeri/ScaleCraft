import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

/** The sandbox seed graph (src/app/(protected)/sandbox/page.tsx): client,
 *  load balancer, app server, database. */
export const SANDBOX_SEED_NODES = 4;
/** client -> lb -> app -> db. */
export const SANDBOX_SEED_EDGES = 3;

/** Opens /sandbox on the seed graph rather than whatever the previous spec
 *  saved - the suite shares one Clerk account, and since 6.1.0 that account's
 *  canvas lives server-side. The delete rides a loaded page so the request
 *  carries an already-refreshed Clerk session. */
export async function resetSandbox(page: Page) {
  await page.goto("/");
  await page.request.delete("/api/sync/saves?scopeId=sandbox");
  await page.goto("/sandbox");
  await expect(page.locator(".react-flow__node")).toHaveCount(SANDBOX_SEED_NODES);
}

/** The 3.4 Load Balancer chapter, which most workspace specs exercise.
 *  Its starter graph is client -> lb -> app -> db (src/content/chapters). */
export const CHAPTER_SLUG = "3-4-load-balancer";
export const CHAPTER_STARTER_NODES = 4;

/** Opens the chapter workspace on its starter graph. Chapter canvases are
 *  synced per account under `chapter:<id>` (db.ts's chapterSaveId), so
 *  without this a spec inherits whatever the last one saved. */
export async function resetChapterCanvas(page: Page) {
  await page.goto("/");
  await page.request.delete(`/api/sync/saves?scopeId=${encodeURIComponent("chapter:bb-" + CHAPTER_SLUG)}`);
  await page.goto(`/building-blocks/${CHAPTER_SLUG}`);
  await expect(page.locator(".react-flow__node")).toHaveCount(CHAPTER_STARTER_NODES);
}

/** Drags a connection from one node's source handle to another's target
 *  handle. React Flow completes a connection on mouseup over the *target
 *  handle*, so `dragTo(node)` aimed at the node body silently does nothing.
 *  Handles are classed by position: source is Right, target is Left
 *  (ComponentNode.tsx). */
export async function connectNodes(page: Page, source: Locator, target: Locator) {
  const from = (await source.locator(".react-flow__handle-right").first().boundingBox())!;
  const to = (await target.locator(".react-flow__handle-left").first().boundingBox())!;

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
  await page.mouse.up();
}

/** React Flow's current zoom, read off the viewport's transform matrix. */
export async function viewportScale(page: Page): Promise<number> {
  const transform = await page
    .locator(".react-flow__viewport")
    .evaluate((el) => getComputedStyle(el).transform);
  // "none" before the first transform is applied; otherwise matrix(a, ...)
  // where a is the horizontal scale.
  return transform === "none" ? 1 : Number(transform.match(/matrix\(([^,]+)/)?.[1] ?? 1);
}

/** Drag-selects every node. Canvas.tsx puts selection on left-drag and panning
 *  on middle-mouse, so a pane drag is a selection box. Ctrl-clicking nodes
 *  selects them too, but only a *drag* selection activates React Flow's
 *  nodes-selection rect - and that rect is what carries the group context
 *  menu (onSelectionContextMenu). */
export async function selectAllViaBoxDrag(page: Page) {
  const paneBox = (await page.locator(".react-flow__pane").boundingBox())!;
  await page.mouse.move(paneBox.x + 5, paneBox.y + 5);
  await page.mouse.down();
  await page.mouse.move(paneBox.x + paneBox.width - 5, paneBox.y + paneBox.height - 5, { steps: 15 });
  await page.mouse.up();

  // Wait on selection state rather than sleeping.
  await expect(page.locator(".react-flow__node.selected")).toHaveCount(SANDBOX_SEED_NODES);
  await expect(page.locator(".react-flow__nodesselection-rect")).toBeVisible();
}

/** Wipes curriculum-progress slugs straight on the server, so a spec never
 *  depends on what a previous run left behind. Shared by any spec that
 *  needs a clean slate for specific slugs before asserting on them. */
export async function resetSlugs(request: APIRequestContext, slugs: string[]) {
  for (const slug of slugs) {
    const res = await request.post("/api/sync/curriculum-progress", {
      data: { slug, manuallyCompletedAt: null, lastVisitedAt: null },
    });
    expect(res.status(), `reset ${slug}`).toBe(200);
  }
}

/** The header's save-state readout. Bare getByText("Saved") is ambiguous -
 *  three elements on the workspace match it. */
export function savedIndicator(page: Page): Locator {
  return page.getByRole("banner").getByText("Saved", { exact: true });
}
