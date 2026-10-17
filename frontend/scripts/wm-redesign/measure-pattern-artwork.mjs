import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read alpha geometry only. Run separately from prepare-pattern-artwork.mjs.
// Original generated PNG/WebP pixels are never edited by this measurement step.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const sheets = {};
try {
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  for (const name of ["objects-a", "objects-b", "shapes"]) {
    sheets[name] = await page.evaluate(async name => {
      const image = new Image();
      image.src = `/images/workingMemory/pattern/symbols/${name}.png`;
      await image.decode();
      const width = image.naturalWidth, height = image.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, width, height).data;
      const visited = new Int32Array(width * height);
      const queue = new Int32Array(width * height);
      const components = [];
      let componentId = 0;
      for (let start = 0; start < visited.length; start++) {
        if (visited[start] || pixels[start * 4 + 3] < 8) continue;
        let begin = 0, end = 1, area = 0;
        componentId++;
        queue[0] = start;
        visited[start] = componentId;
        let left = width, top = height, right = 0, bottom = 0;
        while (begin < end) {
          const index = queue[begin++], x = index % width, y = Math.floor(index / width);
          area++;
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
          const adjacent = [];
          if (x > 0) adjacent.push(index - 1);
          if (x + 1 < width) adjacent.push(index + 1);
          if (y > 0) adjacent.push(index - width);
          if (y + 1 < height) adjacent.push(index + width);
          for (const next of adjacent) {
            if (visited[next] || pixels[next * 4 + 3] < 8) continue;
            visited[next] = componentId;
            queue[end++] = next;
          }
        }
        if (area > 1000) components.push({ left, top, right, bottom, area, componentId });
      }
      components.sort((a, b) => b.area - a.area);
      const icons = components.slice(0, 16);
      const cells = Array(16).fill(null);
      const cellIcons = Array(16).fill(null);
      for (const icon of icons) {
        const column = Math.floor((icon.left + icon.right) / 2 / width * 4);
        const row = Math.floor((icon.top + icon.bottom) / 2 / height * 4);
        const index = row * 4 + column;
        if (cells[index]) throw new Error(`${name}: two dominant objects share cell ${index}`);
        const x = Math.max(0, icon.left - 3), y = Math.max(0, icon.top - 3);
        cells[index] = {
          x, y,
          width: Math.min(width - 1, icon.right + 3) - x + 1,
          height: Math.min(height - 1, icon.bottom + 3) - y + 1,
        };
        cellIcons[index] = icon;
      }
      if (cells.some(cell => !cell)) throw new Error(`${name}: expected 16 connected illustrations`);
      // Two animals can have overlapping rectangular bounds while their actual
      // silhouettes remain separate. A CSS-only outline excludes the neighbour.
      cells.forEach((cell, index) => {
        const intersects = cells.some((other, otherIndex) => otherIndex !== index
          && cell.x < other.x + other.width && cell.x + cell.width > other.x
          && cell.y < other.y + other.height && cell.y + cell.height > other.y);
        if (!intersects) return;
        const leftEdge = [], rightEdge = [];
        for (let y = cell.y; y < cell.y + cell.height; y += 6) {
          let left = width, right = -1;
          for (let line = y; line < Math.min(y + 6, cell.y + cell.height); line++) {
            for (let x = cell.x; x < cell.x + cell.width; x++) {
              if (visited[line * width + x] !== cellIcons[index].componentId) continue;
              left = Math.min(left, x); right = Math.max(right, x);
            }
          }
          if (right < left) continue;
          const x1 = Math.max(0, (left - 3 - cell.x) / cell.width * 100);
          const x2 = Math.min(100, (right + 4 - cell.x) / cell.width * 100);
          const y1 = (y - cell.y) / cell.height * 100;
          const y2 = Math.min(100, (y + 6 - cell.y) / cell.height * 100);
          const point = (x, row) => `${x.toFixed(3)}% ${row.toFixed(3)}%`;
          leftEdge.push(point(x1, y1), point(x1, y2));
          rightEdge.push(point(x2, y1), point(x2, y2));
        }
        cell.clipPath = `polygon(${leftEdge.concat(rightEdge.reverse()).join(",")})`;
      });
      return { width, height, cells };
    }, name);
    process.stdout.write(`${name}: ${sheets[name].width}x${sheets[name].height}, ${sheets[name].cells.length} complete illustration bounds\n`);
  }
  const target = path.join(project, "src/features/workingMemory/shared/artwork/patternSymbolBounds.json");
  await writeFile(target, `${JSON.stringify(sheets, null, 2)}\n`);
} finally {
  await browser.close();
}
