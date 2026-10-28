// Runs the Playwright suite, then always builds test-reports/summary.md
// (even when tests fail), and exits with Playwright's exit code.
import { spawnSync } from "node:child_process";

const extra = process.argv.slice(2);
const run = spawnSync("npx", ["playwright", "test", ...extra], { stdio: "inherit", shell: true });
spawnSync(process.execPath, ["tests/support/build-summary.mjs"], { stdio: "inherit" });
process.exit(run.status ?? 1);
