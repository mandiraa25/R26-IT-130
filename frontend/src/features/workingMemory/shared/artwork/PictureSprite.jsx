import { useState } from "react";

const crops = new Map();

// Some objects spill over their nominal sprite cells. Isolate the largest
// connected object within this cell so adjacent-object slivers cannot show.
// Only the original image's CSS crop changes; no asset pixels are rewritten.
export default function LevelThreeSprite({ item }) {
  const key = `${item.image}:${item.spriteIndex}`;
  const [style, setStyle] = useState(() => crops.get(key));
  const fit = event => {
    if (crops.has(key)) { setStyle(crops.get(key)); return; }
    const image = event.currentTarget;
    const cellWidth = image.naturalWidth / 6, cellHeight = image.naturalHeight / 6;
    const originX = Math.round(item.spriteIndex % 6 * cellWidth);
    const originY = Math.round(Math.floor(item.spriteIndex / 6) * cellHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cellWidth); canvas.height = Math.round(cellHeight);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, originX, originY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data;
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let largest = null;
    for (let start = 0; start < visited.length; start++) {
      if (visited[start] || pixels[start * 4 + 3] <= 16) continue;
      let head = 0, tail = 1, left = width, right = 0, top = height, bottom = 0;
      queue[0] = start; visited[start] = 1;
      while (head < tail) {
        const index = queue[head++], x = index % width, y = Math.floor(index / width);
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        const neighbors = [x > 0 ? index - 1 : -1, x < width - 1 ? index + 1 : -1, y > 0 ? index - width : -1, y < height - 1 ? index + width : -1];
        for (const next of neighbors) {
          if (next < 0 || visited[next] || pixels[next * 4 + 3] <= 16) continue;
          visited[next] = 1; queue[tail++] = next;
        }
      }
      if (!largest || tail > largest.count) largest = { count: tail, left, right, top, bottom };
    }
    if (!largest) return;
    const left = originX + Math.max(0, largest.left - 1);
    const top = originY + Math.max(0, largest.top - 1);
    const right = originX + Math.min(width, largest.right + 2);
    const bottom = originY + Math.min(height, largest.bottom + 2);
    const size = Math.max(right - left, bottom - top) * 1.08;
    const fitted = {
      width: `${image.naturalWidth / size * 100}%`, height: `${image.naturalHeight / size * 100}%`,
      left: `${((size - (right - left)) / 2 - left) / size * 100}%`,
      top: `${((size - (bottom - top)) / 2 - top) / size * 100}%`,
      clipPath: `inset(${top / image.naturalHeight * 100}% ${(image.naturalWidth - right) / image.naturalWidth * 100}% ${(image.naturalHeight - bottom) / image.naturalHeight * 100}% ${left / image.naturalWidth * 100}%)`,
    };
    crops.set(key, fitted); setStyle(fitted);
  };
  return <span className="lx-sprite-art" role="img" aria-label={item.alt}>
    <img src={item.image} alt="" draggable={false} onLoad={fit} style={style || { visibility: "hidden" }} />
  </span>;
}
