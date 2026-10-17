import { defineConfig } from "@playwright/test";

// These suites intercept API requests and never create real student records.
// Start Vite first with npm run dev -- --host 127.0.0.1.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["level-one-ui.spec.js", "level-two-ui.spec.js", "level-three-ui.spec.js", "level-four-ui.spec.js", "screening-ui.spec.js"],
  timeout: 120_000,
  workers: 3,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: ".cache/wm-reorganization/playwright-results.json" }]],
  outputDir: ".cache/wm-reorganization/playwright-artifacts",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1366, height: 768 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
