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
  // Half the runner's cores compiling different routes at once is what pushes
  // those first hits over the timeout - fewer workers, less compile contention.
  workers: process.env.CI ? 2 : undefined,
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
