import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.js",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Backend (npm start in ../backend, port 5000) and frontend (npm run dev,
  // port 5173) must already be running before the suite starts. Both are
  // plain long-lived dev servers here rather than Playwright-managed
  // webServer entries, since re-launching them from a fresh config on every
  // run raced with the already-running instances rather than reusing them.
});
