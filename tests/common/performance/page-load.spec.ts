import { test, expect, type Page } from "@playwright/test";
import { describeCase } from "../../support/fixtures";

// Page-load measurements on the production build (vite preview), 3 cold runs per page.
// Each run uses a fresh browser context (no cache). Values come from the browser's
// Navigation/Paint/LCP/Resource timing entries.
// Video and trace recording change rendering and timing, so they are off for these runs.
test.use({ video: "off", trace: "off", screenshot: "off" });

const THRESHOLDS = { domContentLoaded: 2000, load: 3000, firstContentfulPaint: 2000, largestContentfulPaint: 2500 };

type Metrics = { run: number; attempts?: number; domContentLoaded: number; load: number; firstContentfulPaint: number; largestContentfulPaint: number; transferKB: number; requests: number };

async function measure(page: Page, path: string, run: number): Promise<Metrics> {
  await page.addInitScript(() => {
    (window as any).__lcp = 0;
    (window as any).__fcp = 0;
    new PerformanceObserver(list => { for (const e of list.getEntries()) (window as any).__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (e.name === "first-contentful-paint") (window as any).__fcp = e.startTime; }).observe({ type: "paint", buffered: true });
  });
  await page.goto(path, { waitUntil: "load" });
  // Paint entries arrive shortly after load. Do not poll the page meanwhile: calling
  // into a headless page before its first frame delays that frame. Wait once, then
  // once more if the paint has still not been reported.
  await page.waitForTimeout(3000);
  if (!(await page.evaluate(() => (window as any).__fcp > 0))) await page.waitForTimeout(2000);
  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const fcp = (window as any).__fcp || performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const bytes = (nav.transferSize || 0) + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    // A paint the browser never reported is NaN (shown as "not recorded"), never 0.
    return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, firstContentfulPaint: fcp || NaN, largestContentfulPaint: (window as any).__lcp || NaN, transferKB: bytes / 1024, requests: resources.length + 1 };
  });
  const round = (v: number) => Math.round(v);
  return { run, domContentLoaded: round(m.domContentLoaded), load: round(m.load), firstContentfulPaint: round(m.firstContentfulPaint), largestContentfulPaint: round(m.largestContentfulPaint), transferKB: round(m.transferKB), requests: m.requests };
}

const summarise = (runs: Metrics[]) => Object.fromEntries((["domContentLoaded", "load", "firstContentfulPaint", "largestContentfulPaint", "transferKB"] as const).map(key => {
  const values = runs.map(r => r[key]).filter(v => Number.isFinite(v));
  return [key, { min: Math.min(...values), avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length), max: Math.max(...values) }];
}));

for (const [id, name, path] of [["PERF-COM-01", "Sign in", "/"], ["PERF-COM-02", "Sign up", "/register"]] as const) {
  test.describe("Common › Performance › Page load", () => {
    test(`${id}: ${name} page loads within thresholds (3 runs)`, async ({ browser }) => {
      describeCase({ requirement: `${name} page loads quickly`, expected: `DCL < ${THRESHOLDS.domContentLoaded} ms, load < ${THRESHOLDS.load} ms, FCP < ${THRESHOLDS.firstContentfulPaint} ms, LCP < ${THRESHOLDS.largestContentfulPaint} ms (each run)`, priority: "Medium" });
      const runs: Metrics[] = [];
      for (let run = 1; run <= 3; run++) {
        // Headless Chromium occasionally reports no paint entry for a page it did draw;
        // such a run is repeated in a fresh context (up to 3 tries) and the tries are recorded.
        let result: Metrics | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
          result = { ...(await measure(await context.newPage(), path, run)), attempts: attempt };
          await context.close();
          if (Number.isFinite(result.firstContentfulPaint)) break;
        }
        runs.push(result!);
      }
      const summary = summarise(runs);
      await test.info().attach(`page-load-${path === "/" ? "sign-in" : "sign-up"}`, { body: JSON.stringify({ page: name, path, runs, summary, thresholds: THRESHOLDS }, null, 2), contentType: "application/json" });
      for (const r of runs) {
        expect.soft(r.domContentLoaded, `run ${r.run} DOMContentLoaded`).toBeLessThan(THRESHOLDS.domContentLoaded);
        expect.soft(r.load, `run ${r.run} load`).toBeLessThan(THRESHOLDS.load);
        expect.soft(Number.isFinite(r.firstContentfulPaint), `run ${r.run} FCP recorded`).toBe(true);
        expect.soft(r.firstContentfulPaint, `run ${r.run} FCP`).toBeLessThan(THRESHOLDS.firstContentfulPaint);
        expect.soft(Number.isFinite(r.largestContentfulPaint), `run ${r.run} LCP recorded`).toBe(true);
        expect.soft(r.largestContentfulPaint, `run ${r.run} LCP`).toBeLessThan(THRESHOLDS.largestContentfulPaint);
      }
    });
  });
}
