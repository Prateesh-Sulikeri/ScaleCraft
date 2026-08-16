import { clerk } from "@clerk/testing/playwright";
import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

/**
 * Multi-device cloud sync (release 6.1.0-alpha, pending-6.1.0-poa.md).
 *
 * Two fully isolated browser contexts = two devices: separate IndexedDB,
 * separate localStorage, same Clerk account. That is what two browser
 * profiles / Chrome vs. Edge actually test, minus the manual driving.
 *
 * Reads MULTI_DEVICE_EMAIL/PASSWORD, falling back to the standard E2E user.
 */

const EMAIL = process.env.MULTI_DEVICE_EMAIL ?? process.env.E2E_CLERK_USER_EMAIL!;
const PASSWORD = process.env.MULTI_DEVICE_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD!;

/** Slugs this spec owns. Reset server-side at the top of each test so a run
 *  never depends on what a previous run left behind. */
const SLUG_LIFECYCLE = "0-4-the-system-design-lifecycle";
const TITLE_LIFECYCLE = /The System Design Lifecycle/i;
const SLUG_WHAT_IS = "0-2-what-is-system-design";
const TITLE_WHAT_IS = /What is System Design\?/i;
const SLUG_INTERVIEW = "0-3-interview-design-vs-production-engineering";
const TITLE_INTERVIEW = /Interview Design vs\. Production Engineering/i;
const SLUG_LOAD_BALANCER = "3-4-load-balancer";
const TITLE_LOAD_BALANCER = /Load Balancer/i;

type Device = {
  name: string;
  context: BrowserContext;
  page: Page;
  consoleErrors: string[];
  failedRequests: string[];
};

const openDevices: Device[] = [];

async function openDevice(browser: Browser, name: string): Promise<Device> {
  // An argument-less newContext() inherits the project's storageState (the
  // shared E2E user), which is the opposite of a fresh device.
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${name}] ${msg.text()}`);
  });
  page.on("requestfailed", (req) => {
    failedRequests.push(`[${name}] ${req.method()} ${req.url()} :: ${req.failure()?.errorText}`);
  });
  page.on("response", (res) => {
    if (res.url().includes("/api/sync/") && !res.ok()) {
      failedRequests.push(`[${name}] HTTP ${res.status()} ${res.request().method()} ${res.url()}`);
    }
  });
  page.on("websocket", (ws) => {
    ws.on("socketerror", (err) => failedRequests.push(`[${name}] WS error ${ws.url()} :: ${err}`));
  });

  await page.goto("/sign-in");
  await clerk.signIn({
    page,
    signInParams: { strategy: "password", identifier: EMAIL, password: PASSWORD },
  });
  await page.goto("/");
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));

  const device = { name, context, page, consoleErrors, failedRequests };
  openDevices.push(device);
  return device;
}

function row(page: Page, title: RegExp) {
  return page.locator("li").filter({ hasText: title }).first();
}

async function statusOf(page: Page, title: RegExp): Promise<string> {
  const icon = row(page, title).getByRole("img", { name: /completed|in progress|not started/i });
  return (await icon.getAttribute("aria-label")) ?? "";
}

async function markComplete(device: Device, title: RegExp) {
  const push = device.page.waitForResponse(
    (r) => r.url().includes("/api/sync/curriculum-progress") && r.request().method() === "POST",
  );
  await row(device.page, title)
    .getByRole("button", { name: /mark.*complete/i })
    .click();
  expect((await push).status(), `${device.name} push to cloud`).toBe(200);
  await expect.poll(() => statusOf(device.page, title)).toMatch(/completed/i);
}

/** Wipes the slugs this spec touches straight on the server. */
async function resetSlugs(device: Device, slugs: string[]) {
  for (const slug of slugs) {
    const res = await device.page.request.post("/api/sync/curriculum-progress", {
      data: { slug, manuallyCompletedAt: null, lastVisitedAt: null },
    });
    expect(res.status(), `reset ${slug}`).toBe(200);
  }
}

test.describe("multi-device sync", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  test.afterEach(async () => {
    for (const d of openDevices.splice(0)) {
      console.log(
        `\n--- ${d.name}: ${d.consoleErrors.length} console errors, ${d.failedRequests.length} failed requests ---\n` +
          [...d.consoleErrors, ...d.failedRequests].join("\n"),
      );
      await d.context.close();
    }
  });

  test("a fresh device pulls what another device already wrote", async ({ browser }) => {
    const a = await openDevice(browser, "A");
    await resetSlugs(a, [SLUG_LIFECYCLE]);

    await a.page.goto("/building-blocks");
    await expect(a.page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await statusOf(a.page, TITLE_LIFECYCLE)).toMatch(/not started|in progress/i);
    await markComplete(a, TITLE_LIFECYCLE);

    const b = await openDevice(browser, "B");
    await b.page.goto("/building-blocks");
    await expect(b.page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .poll(() => statusOf(b.page, TITLE_LIFECYCLE), {
        message: "fresh device B should pull A's completion",
        timeout: 15_000,
      })
      .toMatch(/completed/i);
  });

  test("a warm device picks up a change after a hard reload", async ({ browser }) => {
    const a = await openDevice(browser, "A");
    const b = await openDevice(browser, "B");
    await resetSlugs(a, [SLUG_WHAT_IS]);

    await b.page.goto("/building-blocks");
    await expect.poll(() => statusOf(b.page, TITLE_WHAT_IS)).toMatch(/not started|in progress/i);

    await a.page.goto("/building-blocks");
    await markComplete(a, TITLE_WHAT_IS);

    await b.page.reload();
    await expect(b.page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .poll(() => statusOf(b.page, TITLE_WHAT_IS), {
        message: "warm device B should pull A's change on reload",
        timeout: 15_000,
      })
      .toMatch(/completed/i);
  });

  test("a warm device picks up a change on client-side navigation", async ({ browser }) => {
    const a = await openDevice(browser, "A");
    const b = await openDevice(browser, "B");
    await resetSlugs(a, [SLUG_INTERVIEW]);

    await b.page.goto("/building-blocks");
    await expect.poll(() => statusOf(b.page, TITLE_INTERVIEW)).toMatch(/not started|in progress/i);

    await a.page.goto("/building-blocks");
    await markComplete(a, TITLE_INTERVIEW);

    // B leaves the Learning Path and comes back, all client-side - no full
    // page load, which is how a learner actually moves around the app.
    await b.page.getByRole("link", { name: TITLE_LIFECYCLE }).first().click();
    await b.page.waitForURL("**/0-4-the-system-design-lifecycle/**");
    await b.page.getByRole("link", { name: /learning path/i }).first().click();
    await b.page.waitForURL("**/building-blocks");
    await expect(b.page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .poll(() => statusOf(b.page, TITLE_INTERVIEW), {
        message: "device B should pull A's change when it navigates back to the Learning Path",
        timeout: 15_000,
      })
      .toMatch(/completed/i);
  });

  test("a device sitting on the Learning Path picks up a change when refocused", async ({
    browser,
  }) => {
    const a = await openDevice(browser, "A");
    const b = await openDevice(browser, "B");
    await resetSlugs(a, [SLUG_LIFECYCLE]);

    await b.page.goto("/building-blocks");
    await expect.poll(() => statusOf(b.page, TITLE_LIFECYCLE)).toMatch(/not started|in progress/i);

    await a.page.goto("/building-blocks");
    await markComplete(a, TITLE_LIFECYCLE);

    // The two-windows-side-by-side case: B never navigates or reloads, it is
    // just brought back to the foreground.
    await b.page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });
    await b.page.bringToFront();

    await expect
      .poll(() => statusOf(b.page, TITLE_LIFECYCLE), {
        message: "device B should pull A's change when the window is refocused",
        timeout: 20_000,
      })
      .toMatch(/completed/i);
  });

  test("chapter validation progress written by one device reaches the other", async ({
    browser,
  }) => {
    const a = await openDevice(browser, "A");
    const definitionId = "bb-3-4-load-balancer";

    // The exact payload ChapterWorkspace's syncChapterProgress sends on a
    // passing Submit.
    await a.page.request.delete(
      `/api/sync/chapter-progress?chapterId=${encodeURIComponent(definitionId)}`,
    );
    const post = await a.page.request.post("/api/sync/chapter-progress", {
      data: { chapterId: definitionId, completedAt: Date.now(), matchedBlueprintId: null },
    });
    expect(post.status(), "POST /api/sync/chapter-progress").toBe(200);

    const b = await openDevice(browser, "B");
    const read = await b.page.request.get(
      `/api/sync/chapter-progress?chapterId=${encodeURIComponent(definitionId)}`,
    );
    expect(read.status()).toBe(200);
    expect((await read.json()).progress, "device B reads A's chapter progress").not.toBeNull();

    // And it must land in B's local cache, not just be readable over HTTP.
    await b.page.goto("/building-blocks");
    await expect(b.page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .poll(
        () =>
          b.page.evaluate(
            () =>
              new Promise<string>((resolve) => {
                const open = indexedDB.open("scalecraft");
                open.onsuccess = () => {
                  const idb = open.result;
                  if (!idb.objectStoreNames.contains("chapterProgress")) return resolve("no-store");
                  const all = idb
                    .transaction("chapterProgress", "readonly")
                    .objectStore("chapterProgress")
                    .getAll();
                  all.onsuccess = () =>
                    resolve(
                      JSON.stringify(all.result.map((r: { chapterId: string }) => r.chapterId)),
                    );
                  all.onerror = () => resolve("read-error");
                };
                open.onerror = () => resolve("open-error");
              }),
          ),
        { message: "device B's Dexie should hold A's chapterProgress row", timeout: 15_000 },
      )
      .toContain(definitionId);
  });

  test("an offline edit flushes to the cloud and reaches the other device", async ({ browser }) => {
    const a = await openDevice(browser, "A");
    await resetSlugs(a, [SLUG_WHAT_IS]);

    await a.page.goto("/building-blocks");
    await expect(a.page.getByRole("heading", { level: 1 })).toBeVisible();
    await a.context.setOffline(true);
    await row(a.page, TITLE_WHAT_IS)
      .getByRole("button", { name: /mark.*complete/i })
      .click();
    await expect.poll(() => statusOf(a.page, TITLE_WHAT_IS)).toMatch(/completed/i);
    await a.context.setOffline(false);
    await a.page.evaluate(() => window.dispatchEvent(new Event("online")));

    await expect
      .poll(
        async () => {
          const res = await a.page.request.get(`/api/sync/curriculum-progress?slug=${SLUG_WHAT_IS}`);
          return (await res.json()).progress?.manuallyCompletedAt ?? null;
        },
        { message: "an offline edit should flush to the cloud once back online", timeout: 20_000 },
      )
      .not.toBeNull();

    const b = await openDevice(browser, "B");
    await b.page.goto("/building-blocks");
    await expect
      .poll(() => statusOf(b.page, TITLE_WHAT_IS), { timeout: 15_000 })
      .toMatch(/completed/i);
  });

  test("a stale device opening a chapter does not erase the other device's completion", async ({
    browser,
  }) => {
    const a = await openDevice(browser, "A");
    const b = await openDevice(browser, "B");
    await resetSlugs(a, [SLUG_LOAD_BALANCER]);

    // B loads the chapter's lesson - its progress store hydrates here and
    // then never refreshes for the rest of the session.
    await b.page.goto(`/building-blocks/${SLUG_LOAD_BALANCER}/lesson`);
    await expect(b.page.getByRole("heading", { level: 1 })).toBeVisible();

    // A completes the same chapter.
    await a.page.goto("/building-blocks");
    await markComplete(a, TITLE_LOAD_BALANCER);
    const before = await a.page.request.get(
      `/api/sync/curriculum-progress?slug=${SLUG_LOAD_BALANCER}`,
    );
    expect((await before.json()).progress.manuallyCompletedAt).not.toBeNull();

    // B, still stale, walks into the Design Editor - client-side, so its
    // store is never re-read. ChapterWorkspace's markVisited then pushes a
    // whole row built from B's stale local copy.
    await b.page.locator(`a[href="/building-blocks/${SLUG_LOAD_BALANCER}"]`).first().click();
    await b.page.waitForURL(`**/building-blocks/${SLUG_LOAD_BALANCER}`);
    await b.page.waitForResponse(
      (r) => r.url().includes("/api/sync/curriculum-progress") && r.request().method() === "POST",
    );

    const after = await a.page.request.get(
      `/api/sync/curriculum-progress?slug=${SLUG_LOAD_BALANCER}`,
    );
    expect(
      (await after.json()).progress.manuallyCompletedAt,
      "B's visit must not wipe A's completion from the cloud",
    ).not.toBeNull();
  });

  test("a sandbox canvas saved on one device loads on the other", async ({ browser }) => {
    const a = await openDevice(browser, "A");
    await a.page.request.delete("/api/sync/saves?scopeId=sandbox");

    await a.page.goto("/sandbox");
    const nodes = a.page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(4);
    await nodes.filter({ hasText: "Client" }).click();
    await a.page.keyboard.press("Backspace");
    await expect(nodes).toHaveCount(3);

    const push = a.page.waitForResponse(
      (r) => r.url().includes("/api/sync/saves") && r.request().method() === "POST",
    );
    await a.page.getByRole("button", { name: "Save" }).click();
    expect((await push).status(), "device A save push").toBe(200);

    const b = await openDevice(browser, "B");
    await b.page.goto("/sandbox");
    await expect(b.page.locator(".react-flow__node"), "device B should load A's saved canvas")
      .toHaveCount(3, { timeout: 15_000 });
  });
});
