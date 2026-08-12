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
  reporter: "list",
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
    timeout: 120_000,
  },
});
