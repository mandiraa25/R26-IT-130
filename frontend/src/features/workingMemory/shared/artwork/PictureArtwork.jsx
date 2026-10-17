import { useState } from "react";

const pictureBounds = new Map();

// Fit the visible artwork rather than the PNG's often very large transparent
// canvas. This only positions the original image; no pixels are edited.
export default function PictureArtwork({ src, alt }) {
  const [style, setStyle] = useState(() => pictureBounds.get(src));
  const fitPicture = (event) => {
    if (pictureBounds.has(src)) { setStyle(pictureBounds.get(src)); return; }
    const image = event.currentTarget;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = Math.max(1, Math.round(256 * image.naturalHeight / image.naturalWidth));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 16) {
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    if (right < left) return;
    const width = right - left + 1, height = bottom - top + 1;
    const size = Math.max(width, height) * 1.08;
    const fitted = {
      width: `${canvas.width / size * 100}%`, height: `${canvas.height / size * 100}%`,
      left: `${((size - width) / 2 - left) / size * 100}%`,
      top: `${((size - height) / 2 - top) / size * 100}%`,
    };
    pictureBounds.set(src, fitted);
    setStyle(fitted);
  };
  return <span className="wm-screen__picture-figure lx-fitted-art"><img src={src} alt={alt} style={style} onLoad={fitPicture} /></span>;
}
