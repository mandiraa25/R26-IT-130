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
export function warmImagesWhenIdle(urls) {
  const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 800));
  const cancel = window.cancelIdleCallback || window.clearTimeout;
  const handle = idle(() => warmImages(urls));
  return () => cancel(handle);
}
