import { chromium } from "@playwright/test";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Delivery-format export only: preserve full PNG dimensions and transparency.
// Run measure-pattern-artwork.mjs separately to update display crop metadata.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(project, "public/images/workingMemory/pattern/symbols");
const browser = await chromium.launch({ headless: true });
let before = 0, after = 0;
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  for (const name of ["objects-a", "objects-b", "shapes"]) {
    const source = path.join(directory, `${name}.png`);
    const original = await readFile(source);
    const encoded = await page.evaluate(async name => {
      const image = new Image();
      image.src = `/images/workingMemory/pattern/symbols/${name}.png`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      return canvas.toDataURL("image/webp", 0.94).split(",")[1];
    }, name);
    const target = path.join(directory, `${name}.webp`);
    await writeFile(target, Buffer.from(encoded, "base64"));
    before += original.length;
    after += (await stat(target)).size;
  }
  process.stdout.write(`Pattern WebP delivery: ${before} -> ${after} bytes; original PNGs preserved.\n`);
} finally {
  await browser.close();
}
