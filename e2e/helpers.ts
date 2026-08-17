import { expect, type APIRequestContext, type APIResponse, type Locator, type Page } from "@playwright/test";

/** Loads the app and waits until Clerk has actually established the session.
 *  `page.goto()` resolves before the client SDK refreshes the session cookie,
 *  so an API request fired straight after can come back 401 - intermittently,
 *  which is worse than never. The user menu only renders once signed in, so
 *  it is a real readiness signal. */
export async function gotoSignedIn(page: Page, url = "/") {
  await page.goto(url);
  await expect(page.getByRole("button", { name: "Open user menu" })).toBeVisible();
}

/** Issues a sync-API call against a page whose session is ready, retrying
 *  once through a reload if it still comes back 401. Always asserts the
 *  final status: a silently-swallowed 401 leaves the reset undone and
 *  surfaces later as an unrelated spec seeing another spec's data. */
export async function syncRequest(
  page: Page,
  send: () => Promise<APIResponse>,
  what: string,
): Promise<APIResponse> {
  let res = await send();
  if (res.status() === 401) {
    await page.reload();
    await expect(page.getByRole("button", { name: "Open user menu" })).toBeVisible();
    res = await send();
  }
  expect(res.status(), what).toBe(200);
  return res;
}

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
  const clear = () =>
    syncRequest(page, () => page.request.delete("/api/sync/saves?scopeId=sandbox"), "clear sandbox save");

  await gotoSignedIn(page);
  await clear();
  await page.goto("/sandbox");

  // The sandbox canvas syncs on every autosave (no syncOnManualSave: false on
  // its useAutosave), so the previous spec's push can land *after* the delete
  // above - its context is torn down, but the request is already in flight
  // server-side. One re-clear absorbs that; failing here otherwise shows up as
  // an unrelated spec asserting 4 nodes and getting 3.
  const nodes = page.locator(".react-flow__node");
  try {
    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES, { timeout: 5_000 });
  } catch {
    await clear();
    await page.reload();
    await expect(nodes).toHaveCount(SANDBOX_SEED_NODES);
  }
}

/** The 3.4 Load Balancer chapter, which most workspace specs exercise.
 *  Its starter graph is client -> lb -> app -> db (src/content/chapters). */
export const CHAPTER_SLUG = "3-4-load-balancer";
export const CHAPTER_STARTER_NODES = 4;

/** Opens the chapter workspace on its starter graph. Chapter canvases are
 *  synced per account under `chapter:<id>` (db.ts's chapterSaveId), so
 *  without this a spec inherits whatever the last one saved. */
export async function resetChapterCanvas(page: Page) {
  await gotoSignedIn(page);
  await syncRequest(
    page,
    () =>
      page.request.delete(
        `/api/sync/saves?scopeId=${encodeURIComponent("chapter:bb-" + CHAPTER_SLUG)}`,
      ),
    "clear chapter save",
  );
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

/** The 3.4 chapter's quiz length (src/content/chapters/index.ts). */
export const CHAPTER_QUIZ_QUESTIONS = 5;

/** Clears this account's attempts for the chapter under test. Attempts are
 *  synced per account and examLocked() flips the launcher to "View your
 *  result" once one passes, so without this the exam becomes unopenable
 *  after the first passing run. */
export async function resetExamAttempts(page: Page) {
  await gotoSignedIn(page);
  await syncRequest(
    page,
    () =>
      page.request.delete(
        `/api/sync/exam-attempts?chapterDefinitionId=${encodeURIComponent("bb-" + CHAPTER_SLUG)}`,
      ),
    "reset exam attempts",
  );
}

/** Wipes this account's custom components. They sync per account, so
 *  otherwise every run inherits the ones the last run created and the
 *  palette counts drift. */
export async function resetCustomComponents(page: Page) {
  await gotoSignedIn(page);
  const res = await syncRequest(
    page,
    () => page.request.get("/api/sync/custom-components"),
    "list custom components",
  );
  const { components } = (await res.json()) as { components: { id: string }[] };
  for (const { id } of components) {
    await syncRequest(
      page,
      () => page.request.delete(`/api/sync/custom-components?id=${encodeURIComponent(id)}`),
      `delete custom component ${id}`,
    );
  }
}

/** Opens the component picker over the sandbox canvas (pane right-click). */
export async function openComponentPicker(page: Page): Promise<Locator> {
  // Wait for the canvas to have rendered its nodes first. Right after a
  // reload the pane exists before React Flow has hydrated, and the
  // right-click is swallowed - the picker then never opens.
  await expect(page.locator(".react-flow__node").first()).toBeVisible();

  await page.locator(".react-flow__pane").click({ button: "right", position: { x: 20, y: 20 } });
  const picker = page.getByRole("dialog", { name: "Add a component" });
  await expect(picker).toBeVisible();
  return picker;
}

/** Completes a component placement armed by selecting it in the picker.
 *  Selection only sets pendingComponentPlacement; Canvas.tsx then puts a
 *  full-screen overlay over the pane to capture the positioning click, so
 *  clicking `.react-flow__pane` is intercepted and never lands. */
export async function placePendingComponent(page: Page, label: string) {
  await expect(page.getByText(`Click to place ${label}`)).toBeVisible();
  await page
    .locator("div.absolute.inset-0.cursor-pointer")
    .click({ position: { x: 250, y: 250 } });
}
