/*
 * FILE PURPOSE
 * Reusable picture renderer that fits the visible part of transparent PNGs into a frame.
 *
 * HOW IT CONNECTS
 * ScreeningQuestions re-exports this as ScreeningPicture; MemoryPicture also uses it. onLoad measures
 * alpha bounds and remembers the resulting style by src.
 * Direct source importers: ../../identification/ScreeningQuestions.jsx, ../GameLayout.jsx.
 *
 * THINGS TO REMEMBER
 * style is presentation state only. A 256-pixel canvas finds nontransparent bounds; it does not
 * rewrite the image file. pictureBounds caches the fit. wm-screen__picture-figure/lx-fitted-art
 * styling is in identificationScreens.css/contentRefinement.css.
 */

// VIVA: Fit picture artwork using cached visible alpha bounds inside its frame.
import { useState } from "react";

const pictureBounds = new Map();

// Fit the visible artwork rather than the PNG's often very large transparent
// canvas. This only positions the original image; no pixels are edited.
/*
 * FUNCTION / COMPONENT: PictureArtwork
 * React renders this component when its parent uses <PictureArtwork /> or when its state/props change.
 * INPUT PROPS: { src, alt }. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function PictureArtwork({ src, alt }) {
  /*
   * REMEMBER: style
   * Measured image fitting style cached by image URL. onLoad updates it to fit visible artwork rather
   * than transparent margins.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [style, setStyle] = useState(() => pictureBounds.get(src));
  /*
   * FUNCTION: fitPicture
   * Measure nontransparent image bounds and apply cached fitting styles.
   * WHEN: The picture img onLoad event calls this.
   * HOW / RESULT: Scans a small canvas alpha channel, caches the calculated width/height/offsets by src
   * and updates visual state.
   */
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
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <span className="wm-screen__picture-figure lx-fitted-art">{/* VIVA: The original picture is positioned inside this fitted frame. */}<img src={src} alt={alt} style={style} onLoad={fitPicture} /></span>;
}
