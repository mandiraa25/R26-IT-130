import { defineConfig, devices } from "@playwright/test";
import { API_PORT, APP_PORT, APP_URL } from "./tests/support/env";

/*
 * LexiLand Playwright suite: Common parts + Working Memory.
 * Starts its own backend (test database, port 5055) and a production build of the
 * frontend (port 5186), so it never touches real data or the dev servers.
 * The older suite in frontend/tests keeps its own configs and is not run here.
 */
export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  globalTeardown: "./tests/support/global-teardown.ts",
  reporter: [
    ["html", { open: "never", outputFolder: "test-reports/html" }],
    ["json", { outputFile: "test-reports/results.json" }],
    ["junit", { outputFile: "test-reports/results.xml" }],
    ["list"],
  ],
  outputDir: "test-reports/artifacts",
  use: {
    baseURL: APP_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1366, height: 768 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } } }],
  webServer: [
    {
      command: "node tests/support/start-test-backend.cjs",
      // A protected route answers 401 without a token, which proves the API is up.
      url: `http://localhost:${API_PORT}/api/students/profile`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
    },
    {
      command: `cd frontend && npx vite build --outDir ../test-reports/app-build --emptyOutDir && npx vite preview --outDir ../test-reports/app-build --port ${APP_PORT} --strictPort`,
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
});
