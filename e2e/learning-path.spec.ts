import { test, expect } from "@playwright/test";
import { resetSlugs } from "./helpers";

/**
 * The Learning Path's one e2e-only behaviour: a manual completion round-trips
 * through the cloud and is still there after a reload.
 *
 * Section/chapter rendering, collapse-expand, unauthored rows and the
 * download link all have component tests (LearningPath, SectionCard,
 * ChapterRow, ChapterStatusIcon, OverallProgress, DownloadCurriculumButton).
 * Asserting exact section/chapter counts here also broke on every curriculum
 * edit, which is the manifest's job to guard, not the browser's.
 */

const BITLY_SLUG = "rwe-t1-bitly-url-shortener";

test("a manual completion round-trips through the cloud and survives a reload", async ({ page }) => {
  // Load a page before the bare API call below - global.setup.ts's
  // storageState is captured once at the start of the whole suite, and
  // page.request replays those cookies with no refresh of its own. A page
  // load lets Clerk's client SDK refresh the session first.
  await page.goto("/real-world-extraction");

  // Reset server state before asserting, not after - a prior run's dirty
  // completion otherwise races the cloud hydrate on load
  // (pending-6.1.0-poa.md 9.2).
  await resetSlugs(page.request, [BITLY_SLUG]);

  const hydrated = page.waitForResponse(
    (r) => r.url().includes("/api/sync/curriculum-progress") && r.request().method() === "GET",
  );
  await page.reload();
  await hydrated;

  const row = page.locator("li").filter({ hasText: "Bitly" });
  const toggle = row.getByRole("button", { name: /mark.*complete/i });

  await expect(page.getByText("0 / 32 chapters", { exact: false })).toBeVisible();
  await toggle.click();
  await expect(page.getByText("1 / 32 chapters", { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 / 32 chapters", { exact: false })).toBeVisible();
  await expect(row.getByRole("button", { name: /mark.*incomplete/i })).toBeVisible();
});
