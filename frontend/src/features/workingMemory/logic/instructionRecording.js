// Recorded instructions are independent of the background-music mute setting.
export function playInstructionRecording(src, onEnded, onError) {
  const audio = new Audio(src);
  let active = true;
  const stop = () => {
    active = false;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };
  const finish = callback => {
    if (!active) return;
    stop();
    callback();
  };
  audio.onended = () => finish(onEnded);
  audio.onerror = () => finish(onError);
  audio.play().catch(() => finish(onError));
  return stop;
}
