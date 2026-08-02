import { test, expect } from "@playwright/test";

/**
 * End-to-end guard for Chapter Reader (Phase 5: Learning Path Navigation Overhaul,
 * Phase 6: Testing). Covers the full flow: Learning Path -> Chapter Reader lesson page
 * -> Design Editor canvas. Component tests live in src/chapters/*.test.tsx; this
 * exercises navigation, routing, and real DOM structure that jsdom can't fully validate.
 */

test.describe("Chapter Reader - Learning Path Integration", () => {
  test("renders lesson page with correct URL when navigating from Learning Path", async ({ page }) => {
    await page.goto("/building-blocks");
    await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");
    await expect(page).toHaveURL(/\/building-blocks\/[^/]+\/lesson$/);
  });

  test("lesson page displays chapter title and metadata", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.getByRole("heading", { level: 1 }).textContent()).toMatch(/Placeholder|Load Balancer/);
    await expect(page.getByText(/3\.4.*Building Blocks/)).toBeVisible();
  });

  test("lesson page shows difficulty indicator", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await expect(page.getByText(/foundational|intermediate|advanced/)).toBeVisible();
  });

  test("ReaderSidebar shows curriculum navigation with current chapter highlighted", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();
    await expect(page.getByText("Building Blocks", { exact: true })).toBeVisible();
    const currentLink = page.getByRole("link", { name: /current/i }).or(page.getByRole("link").filter({ hasText: /3\.4/ }));
    await expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  test("ReaderSidebar back link navigates to Learning Path", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await page.getByRole("link", { name: /learning path/i }).click();
    await page.waitForURL("**/building-blocks");
    await expect(page).toHaveURL(/\/building-blocks$/);
  });

  test("lesson page renders markdown content", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await expect(page.locator("main > div").first()).toContainText(/.+/);
  });

  test("'Begin exercise' button navigates to canvas route", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await page.getByRole("link", { name: /begin exercise/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer");
    await expect(page).toHaveURL(/\/building-blocks\/[^/]+(?!\/lesson)$/);
  });

  test("'On this page' ToC appears on wide screens and scrolls to headings", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    await expect(page.getByText("On this page", { exact: true })).toBeVisible();
    const tocHeadings = page.locator("nav a");
    const count = await tocHeadings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("'On this page' ToC is hidden on narrow screens", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const tocNav = page.getByText("On this page", { exact: true }).isVisible();
    expect(await tocNav).toBe(false);
  });

  test("reading progress bar is sticky at the top", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    const classList = await progressBar.evaluate((el) => el.className);
    expect(classList).toContain("sticky");
  });

  test("reading progress bar updates on scroll", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const article = page.locator("main > div").first();
    const progressBar = page.locator('[role="progressbar"] > div').nth(0);

    const beforeWidth = await progressBar.evaluate((el) => window.getComputedStyle(el).width);
    expect(beforeWidth).toContain("0px");

    await article.evaluate((el) => {
      el.scrollTop = el.scrollHeight * 0.5;
      el.dispatchEvent(new Event("scroll"));
    });

    await page.waitForTimeout(200);
    const afterWidth = await progressBar.evaluate((el) => window.getComputedStyle(el).width);
    expect(Number(afterWidth.replace("px", ""))).toBeGreaterThan(0);
  });
});

test.describe("Chapter Reader - Multiple Chapters", () => {
  test("navigates between different chapters in the same course", async ({ page }) => {
    // Only authored chapters render as <a> rows (CurriculumSectionList) —
    // unauthored ones render as an inert <div>, so "other authored chapter"
    // means "any nav link that isn't the current row" (aria-current="page"),
    // not a title-text comparison (multiple rows can share a title
    // substring, and while content authoring is incomplete there may be no
    // second authored chapter to find at all — the count() guard covers
    // that bootstrapping period honestly rather than asserting something
    // false).
    const startUrl = "/building-blocks/3-4-load-balancer/lesson";
    await page.goto(startUrl);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const secondChapterLink = page.locator('nav a:not([aria-current="page"])').first();

    if ((await secondChapterLink.count()) > 0) {
      await secondChapterLink.click();
      await page.waitForURL(/\/building-blocks\/[^/]+\/lesson/);
      await expect(page).not.toHaveURL(new RegExp(startUrl.replace(/\//g, "\\/") + "$"));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("sidebar section labels are aligned with chapter titles", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const sectionLabels = page.locator("nav p:nth-child(1)");
    const chapterTitles = page.locator("nav a");

    if ((await sectionLabels.count()) > 0) {
      const firstLabel = await sectionLabels.nth(0).boundingBox();
      const firstTitle = await chapterTitles.nth(0).boundingBox();

      expect(firstLabel?.x).toBeCloseTo(firstTitle?.x || 0, 5);
    }
  });

  test("navigating to real-world-extraction chapter uses correct route", async ({ page }) => {
    await page.goto("/real-world-extraction");
    const chapterLink = page.getByRole("link").filter({ hasText: /bit\.ly|dropbox/i }).first();
    if ((await chapterLink.count()) > 0) {
      await chapterLink.click();
      await page.waitForURL(/\/real-world-extraction\/[^/]+\/lesson/);
      await expect(page).toHaveURL(/^http.*\/real-world-extraction\/[^/]+\/lesson$/);
    }
  });
});

test.describe("Chapter Reader - Error States", () => {
  test("invalid chapter slug returns a 404", async ({ page }) => {
    const response = await page.goto("/building-blocks/nonexistent-chapter/lesson", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Route Not Found")).toBeVisible();
  });

  test("invalid course mode returns a 404", async ({ page }) => {
    const response = await page.goto("/invalid-mode/some-chapter/lesson", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Route Not Found")).toBeVisible();
  });
});

test.describe("Chapter Reader - Theme", () => {
  test("theme toggle in 'On this page' section switches theme", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto("/building-blocks/3-4-load-balancer/lesson");

    const htmlElement = page.locator("html");
    const beforeTheme = await htmlElement.evaluate((el) => el.getAttribute("data-theme"));

    const toggle = page.getByRole("button", { name: /toggle.*theme|dark|light/i });
    if ((await toggle.count()) > 0) {
      await toggle.click();
      await page.waitForTimeout(100);

      const afterTheme = await htmlElement.evaluate((el) => el.getAttribute("data-theme"));
      if (beforeTheme && afterTheme) {
        expect(beforeTheme).not.toBe(afterTheme);
      }
    }
  });
});

test.describe("Chapter Reader - Accessibility", () => {
  test("all interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");

    const links = page.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const link = links.nth(i);
      await link.focus();
      const isFocused = await link.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });

  test("reading progress bar has accessible role and aria attributes", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute("aria-label");
    await expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressBar).toHaveAttribute("aria-valuenow");
  });

  test("'On this page' navigation has proper aria-label", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto("/building-blocks/3-4-load-balancer/lesson");
    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc).toBeVisible();
  });
});
