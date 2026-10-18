import { defineConfig } from "@playwright/test";

// Isolated UI regression suite. Every API request is fulfilled in the browser;
// it never registers an account, submits to a server, or changes a database.
// Start the Vite frontend before running this config.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "level-one-ui.spec.js",
  timeout: 120_000,
  workers: 2,
  retries: 0,
  reporter: "list",
  outputDir: ".cache/level-one-ui-results",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1366, height: 768 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
