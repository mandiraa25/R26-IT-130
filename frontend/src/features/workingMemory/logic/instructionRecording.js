/*
 * FILE PURPOSE
 * Small recorded-audio player with a cleanup function and completion/error callbacks.
 *
 * HOW IT CONNECTS
 * InstructionsGame calls playInstructionRecording with the matched URL, then keeps its returned stop
 * function in a ref.
 * Direct source importers: ../improvement/games/InstructionsGame.jsx.
 *
 * THINGS TO REMEMBER
 * The active flag makes end/error callbacks run at most once. Cleanup pauses media, detaches callbacks
 * and clears its source. Error calls the caller-supplied fallback; this helper does not choose speech
 * or score answers.
 */

// Recorded instructions are independent of the background-music mute setting.
/*
 * FUNCTION: playInstructionRecording
 * Play a recording with one end/error completion and return a stop callback.
 * WHEN: InstructionsGame calls this for a matched recording URL.
 * HOW / RESULT: Errors trigger the caller fallback; stopping prevents stale callbacks and releases the
 * media source.
 */
export function playInstructionRecording(src, onEnded, onError) {
  // VIVA: Return cleanup to the caller. End/error callbacks run at most once;
  // media errors let InstructionsGame fall back to browser speech.
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
