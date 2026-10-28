/*
 * FILE PURPOSE
 * Shared image preloading helpers used by the home page before entering Working Memory.
 * 
 * HOW IT CONNECTS
 * Dashboard calls warmImagesWhenIdle for popup, level-map and screening artwork. The returned cleanup cancels scheduled idle work.
 * 
 * THINGS TO REMEMBER
 * A Set avoids repeated warm requests. new Image starts the request; decode prepares display where supported. Preloading changes when images download, not question data, routes or game access.
 */

// Downloads and decodes images ahead of time so the next popup or screen
// appears at once when the child taps. Each URL is fetched only once.
const warmed = new Set();

export function warmImages(urls) {
  for (const url of urls) {
    if (!url || warmed.has(url)) continue;
    warmed.add(url);
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    image.decode?.().catch(() => {});
  }
}

// Runs warmImages when the browser is idle (after the current screen settles).
/*
 * FUNCTION: warmImagesWhenIdle - defer image warming until browser idle time.
 * Dashboard calls it after mounting; the return value cancels pending idle/timer work.
 * requestIdleCallback is preferred; an 800 ms timeout is the fallback.
 */
export function warmImagesWhenIdle(urls) {
  const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 800));
  const cancel = window.cancelIdleCallback || window.clearTimeout;
  const handle = idle(() => warmImages(urls));
  return () => cancel(handle);
}
