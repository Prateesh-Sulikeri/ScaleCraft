import { defineConfig, devices } from "@playwright/test";

/**
 * Real-browser integration tests — the layer vitest/jsdom can't reach:
 * actual IndexedDB persistence across a reload, and full-page navigation
 * (the branded mode-transition hold in ModeNode.tsx). Scoped to a small set
 * of high-value journeys, not exhaustive UI coverage — that's what the
 * unit/component suite (`npm test`) is for. See .claude/docs/pending.md I.7.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI also writes an HTML report so the upload-artifact step on failure has
  // something to collect - "list" alone writes nothing to disk.
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // CI runs against a cold `next dev`, which compiles each route on first hit.
  // The default 30s budget is spent compiling rather than testing on the
  // heavier routes, so give CI room; local (warm server) keeps the tight one.
  timeout: process.env.CI ? 90_000 : 30_000,
  expect: { timeout: process.env.CI ? 15_000 : 5_000 },
  // One worker, everywhere. The whole suite shares a single Clerk account, and
  // since 6.1.0 that account's canvas/progress state lives server-side and is
  // reconciled into any page that's open - so two specs running at once write
  // each other's data. sandbox-persistence saves a 3-node sandbox while
  // mode-isolation asserts the 4-node seed; design-editor mutates the 3.4
  // chapter canvas while chapter-hints-validation validates it. Both failed
  // that way, intermittently, depending on interleaving. Per-spec cleanup
  // can't fix it: the conflicting write lands mid-test, after the cleanup ran.
  // Also subsumes the old CI-only reason for capping workers (route-compile
  // contention against a cold `next dev`).
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "global setup", testMatch: /global\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["global setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
