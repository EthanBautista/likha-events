import { defineConfig, devices } from "@playwright/test";

// Set TEST_PORT to give each parallel worktree its own preview server.
const port = Number(process.env.TEST_PORT ?? 4322);

// Browser tests run against the production build, served locally by `astro preview`.
// The content-gate tests run their own builds and need no browser.
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    actionTimeout: 5_000,
  },
  projects: [
    { name: "desktop", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "phone", testDir: "tests/e2e", use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } } },
    { name: "content-gate", testDir: "tests/build" },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
