import { defineConfig, devices } from "@playwright/test";

/**
 * Per-tool smoke tests run against the production build (SPEC §14).
 * `pnpm build` must run before `pnpm test:e2e`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // Deterministic unit-system default (UK/metric); imperial behaviour
    // has its own explicit test in tdee.spec.ts.
    locale: "en-GB",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "pnpm exec next start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
