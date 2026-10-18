import path from "node:path";
import fs from "node:fs";

const ROOT = path.join(process.cwd(), "test-results", "screenshots");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Returns a `shot(page, label)` function scoped to one test, saving numbered
 * screenshots into test-results/screenshots/<category>/<test-title>/.
 * Every call captures a full-page screenshot regardless of pass/fail, so a
 * folder builds up a visual record of the whole test case, not just failures.
 */
export function makeStepper(testInfo, category) {
  const segments = Array.isArray(category) ? category : [category];
  const dir = path.join(ROOT, ...segments.map(slugify), slugify(testInfo.title));
  fs.mkdirSync(dir, { recursive: true });
  let step = 0;

  return async function shot(page, label) {
    step += 1;
    const file = path.join(dir, `${String(step).padStart(2, "0")}-${slugify(label)}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };
}
