// Builds test-reports/summary.md from test-reports/results.json (Playwright JSON reporter).
// Only numbers recorded in that run are used.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "../..");
const RESULTS = path.join(ROOT, "test-reports/results.json");
const OUT = path.join(ROOT, "test-reports/summary.md");
if (!fs.existsSync(RESULTS)) { console.error("test-reports/results.json not found; run the tests first."); process.exit(1); }
const report = JSON.parse(fs.readFileSync(RESULTS, "utf8"));

const SECTIONS = [
  ["common/unit", "Common — Unit"], ["common/api", "Common — API"], ["common/e2e", "Common — E2E"], ["common/performance", "Common — Performance"],
  ["working-memory/unit", "Working Memory — Unit"], ["working-memory/api", "Working Memory — API"], ["working-memory/e2e", "Working Memory — E2E"],
];

const rows = [];
const walk = (suite, file) => {
  const here = suite.file || file;
  for (const spec of suite.specs || []) for (const t of spec.tests || []) {
    const result = t.results?.[t.results.length - 1] || {};
    const [id, ...rest] = spec.title.split(": ");
    const note = type => t.annotations?.find(a => a.type === type)?.description || "";
    const status = t.status === "expected" ? "Passed" : t.status === "skipped" ? "Skipped" : t.status === "flaky" ? "Flaky" : "Failed";
    const error = (result.errors?.[0]?.message || result.error?.message || "").replace(/\u001b\[[0-9;]*m/g, "").split("\n").map(l => l.trim()).filter(Boolean).slice(0, 3).join(" ");
    rows.push({ file: here.replace(/\\/g, "/"), id: rest.length ? id : "", title: rest.length ? rest.join(": ") : spec.title, expected: note("expected"), priority: note("priority"), requirement: note("requirement"), status, duration: result.duration || 0, error, attachments: result.attachments || [] });
  }
  for (const child of suite.suites || []) walk(child, here);
};
for (const suite of report.suites || []) walk(suite, suite.file || "");

const sectionOf = row => SECTIONS.find(([key]) => row.file.includes(key))?.[1] || "Other";
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");
const esc = s => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const secs = ms => `${(ms / 1000).toFixed(2)} s`;

const totals = SECTIONS.map(([, name]) => {
  const list = rows.filter(r => sectionOf(r) === name);
  const passed = list.filter(r => r.status === "Passed").length;
  const failed = list.filter(r => r.status === "Failed").length;
  return { name, total: list.length, passed, failed, skipped: list.length - passed - failed };
});
const all = { total: rows.length, passed: rows.filter(r => r.status === "Passed").length, failed: rows.filter(r => r.status === "Failed").length };

// Attachments (page loads and API timings).
const readAttachment = a => {
  try {
    if (a.body) return JSON.parse(Buffer.from(a.body, "base64").toString("utf8"));
    if (a.path && fs.existsSync(a.path)) return JSON.parse(fs.readFileSync(a.path, "utf8"));
  } catch { /* not JSON */ }
  return null;
};
const pageLoads = [], apiTimes = [];
for (const r of rows) for (const a of r.attachments) {
  if (a.name?.startsWith("page-load-")) { const data = readAttachment(a); if (data) pageLoads.push(data); }
  if (a.name === "api-response-times") { const data = readAttachment(a); if (data) apiTimes.push(...data); }
}

const started = report.stats?.startTime ? new Date(report.stats.startTime) : null;
const md = [];
md.push("# LexiLand — Test Summary (Common + Working Memory)", "");
md.push(`Run: ${started ? started.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "unknown"} · Duration: ${secs(report.stats?.duration || 0)} · Tool: Playwright ${report.config?.version || ""} (Chromium) · Test database: lexiland_playwright_test`, "");
md.push("## Totals by section", "", "| Section | Total | Passed | Failed | Skipped | Pass rate |", "|---|---:|---:|---:|---:|---:|");
for (const t of totals) md.push(`| ${t.name} | ${t.total} | ${t.passed} | ${t.failed} | ${t.skipped} | ${pct(t.passed, t.total)} |`);
md.push(`| **All** | **${all.total}** | **${all.passed}** | **${all.failed}** | **${all.total - all.passed - all.failed}** | **${pct(all.passed, all.total)}** |`, "");

md.push("## Page load (production build, 3 cold runs each)", "");
for (const p of pageLoads) {
  md.push(`### ${p.page} (\`${p.path}\`)`, "", "| Metric | Min | Avg | Max | Threshold |", "|---|---:|---:|---:|---:|");
  const label = { domContentLoaded: "DOMContentLoaded (ms)", load: "Load (ms)", firstContentfulPaint: "First Contentful Paint (ms)", largestContentfulPaint: "Largest Contentful Paint (ms)", transferKB: "Transfer size (KB)" };
  for (const [key, name] of Object.entries(label)) {
    const s = p.summary[key];
    md.push(`| ${name} | ${s.min} | ${s.avg} | ${s.max} | ${p.thresholds[key] ? `< ${p.thresholds[key]}` : "—"} |`);
  }
  const retried = p.runs.filter(r => (r.attempts || 1) > 1);
  md.push("", `Per run (ms): ${p.runs.map(r => `run ${r.run}: DCL ${r.domContentLoaded}, load ${r.load}, FCP ${r.firstContentfulPaint}, LCP ${r.largestContentfulPaint}`).join("; ")}.`);
  if (retried.length) md.push(`${retried.length} run(s) were repeated because headless Chromium reported no paint entry on the first try (tries: ${retried.map(r => `run ${r.run} = ${r.attempts}`).join(", ")}).`);
  md.push("");
}
if (apiTimes.length) {
  md.push("### Authentication API response time", "", "| Call | Min (ms) | Avg (ms) | Max (ms) |", "|---|---:|---:|---:|");
  for (const call of [...new Set(apiTimes.map(t => t.call))]) {
    const v = apiTimes.filter(t => t.call === call).map(t => t.ms);
    md.push(`| ${call} | ${Math.min(...v)} | ${Math.round(v.reduce((a, b) => a + b, 0) / v.length)} | ${Math.max(...v)} |`);
  }
  md.push("");
}

md.push("## Test cases", "", "| ID | Title | Section | Expected result | Priority | Status | Duration |", "|---|---|---|---|---|---|---:|");
for (const r of rows) md.push(`| ${r.id} | ${esc(r.title)} | ${sectionOf(r)} | ${esc(r.expected)} | ${r.priority} | ${r.status === "Passed" ? "✅ Passed" : r.status === "Failed" ? "❌ Failed" : r.status} | ${secs(r.duration)} |`);
md.push("");

const failures = rows.filter(r => r.status === "Failed");
md.push("## Defects found", "");
if (!failures.length) md.push("No failing test cases in this run.");
else {
  md.push("| # | Test | Requirement | Observed |", "|---:|---|---|---|");
  failures.forEach((r, i) => md.push(`| ${i + 1} | ${r.id} ${esc(r.title)} | ${esc(r.requirement)} | ${esc(r.error).slice(0, 300)} |`));
}
md.push("");

md.push("## Conclusion", "");
md.push(`This run executed ${all.total} automated test cases covering the Common layer (sign-up, sign-in, logout, JWT-protected routes, the dashboard and shared validation utilities) and the Working Memory component (sequence and span rules, answer checking, scoring and mastery, the screening and improvement APIs, and full browser sessions). ${all.passed} passed and ${all.failed} failed, a pass rate of ${pct(all.passed, all.total)}. ${failures.length ? `The ${failures.length} failing case${failures.length === 1 ? "" : "s"} are recorded as defects above; the application logic was not altered to make them pass.` : ""} Page-load figures were measured on the production build against a local server and are therefore indicative rather than representative of deployed network conditions.`);
md.push("", "Three components are not yet covered and will be added in the same structure: **Phonological Awareness**, **Reading Processing** and **Speech Processing**.", "");

fs.writeFileSync(OUT, md.join("\n"));
console.log(`summary written: ${path.relative(ROOT, OUT)} (${all.passed}/${all.total} passed)`);
