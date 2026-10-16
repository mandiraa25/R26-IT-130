import { defineConfig } from "@playwright/test";

// Isolated UI verification: all API writes are mocked; no test accounts or
// changes to a running database are needed. Start the frontend before running.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "screening-ui.spec.js",
  timeout: 120_000,
  workers: 2,
  reporter: "list",
  outputDir: ".cache/screening-ui-results",
  use: { baseURL: "http://127.0.0.1:5173", viewport: { width: 1366, height: 768 }, reducedMotion: "reduce", screenshot: "only-on-failure" },
});
