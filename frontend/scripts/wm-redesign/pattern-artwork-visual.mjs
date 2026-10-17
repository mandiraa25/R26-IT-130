import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = path.join(project, ".design-backups/pattern-check-before/qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1350 } });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const { default: React } = await import("/node_modules/.vite/deps/react.js");
    const client = await import("/node_modules/.vite/deps/react-dom_client.js");
    const { createRoot } = client.default ?? client;
    const { default: PatternArtwork } = await import("/src/features/workingMemory/shared/artwork/PatternArtwork.jsx");
    const { PATTERN_ARTWORK } = await import("/src/features/workingMemory/shared/artwork/patternSymbols.js");
    document.documentElement.style.cssText = "height:auto;overflow:visible;background:#fff7e6";
    document.body.style.cssText = "height:auto;overflow:visible;margin:0;background:#fff7e6";
    const host = document.createElement("main");
    document.body.replaceChildren(host);
    const tokens = Object.values(PATTERN_ARTWORK).map(symbol => symbol.value).concat("🔴🔺", "🔵🟦", "🔵🔺", "🔴🟦");
    createRoot(host).render(React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: "10px", padding: "16px" } },
      tokens.map(value => React.createElement("article", { key: value, style: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#fff", border: "1px solid #dec8a3", borderRadius: "16px", height: "170px", padding: "8px" } },
        React.createElement("div", { style: { width: "130px", height: "130px", display: "grid", placeItems: "center" } }, React.createElement(PatternArtwork, { value })),
        React.createElement("small", { style: { font: "14px sans-serif", color: "#48311e" } }, value),
      )),
    ));
  });
  await page.waitForSelector(".lx-pattern-artwork__image");
  const images = await page.evaluate(async () => {
    const images = [...document.querySelectorAll(".lx-pattern-artwork__image")];
    await Promise.all(images.map(image => image.decode()));
    return images.map(image => ({ width: image.naturalWidth, height: image.naturalHeight }));
  });
  assert.equal(images.length, 56);
  assert.ok(images.every(image => image.width === 1254 && image.height === 1254));
  await page.screenshot({ path: path.join(output, "artwork-contact-sheet.png"), fullPage: true });
  process.stdout.write("Rendered all 48 illustrations and 4 ordered pairs; all 56 image elements decoded.\n");
} finally {
  await browser.close();
}
