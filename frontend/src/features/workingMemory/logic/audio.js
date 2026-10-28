/*
 * FILE PURPOSE
 * Shared background music store, route listener and synthesized game sounds.
 *
 * HOW IT CONNECTS
 * App.jsx mounts MemoryMusicRouteListener once. MemoryNav and ImprovementPage use useMemoryMusic.
 * ImprovementPage plays answer sounds; NumberMemoryGame plays keypad tones.
 * Direct source importers: ../../../App.jsx, ../improvement/games/NumberMemoryGame.jsx,
 * ../improvement/ImprovementPage.jsx, ../shared/GameLayout.jsx.
 *
 * THINGS TO REMEMBER
 * One looping Audio element plays bgmusic.mp3 on Working Memory routes. localStorage remembers
 * background mute. One AudioContext creates short tones. Explicit answer/keypad sounds are independent
 * of background music mute. Cleanup removes route listener gesture handlers.
 */

import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";

let muted = localStorage.getItem("lexiland-wm-muted") === "true";
let active = false;
let audio;
const listeners = new Set();
const update = () => { if (!audio) { audio = new Audio("/audio/workingMemory/bgmusic.mp3"); audio.loop = true; audio.volume = .16; } if (active && !muted) audio.play().catch(() => {}); else audio.pause(); };
const subscribe = callback => { listeners.add(callback); return () => listeners.delete(callback); };

// Short game sounds (answer feedback, keypad taps) share one AudioContext.
// Creating a new context for every sound was slow and could fail: browsers
// cap how many contexts a page may open and start each one suspended. The
// shared context is resumed on the child's first tap (see unlockGameSounds).
let soundContext = null;
const getSoundContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!soundContext || soundContext.state === "closed") {
    try { soundContext = new AudioContextClass(); } catch { soundContext = null; }
  }
  return soundContext;
};
export function unlockGameSounds() {
  const context = getSoundContext();
  if (context?.state === "suspended") context.resume().catch(() => {});
}

// Plays notes ([frequency, startOffsetSeconds]) with a short envelope.
function playTones(notes, { type = "sine", duration = .25, peak = .2, attack = 0, floor = .001 } = {}) {
  const context = getSoundContext();
  if (!context) return;
  const play = () => {
    try {
      const baseTime = context.currentTime;
      notes.forEach(([frequency, offset]) => {
        const start = baseTime + offset;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (attack) {
          gain.gain.setValueAtTime(.001, start);
          gain.gain.linearRampToValueAtTime(peak, start + attack);
        } else gain.gain.setValueAtTime(peak, start);
        gain.gain.exponentialRampToValueAtTime(floor, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(start);
        oscillator.stop(start + duration);
      });
    } catch { /* Sound is optional. */ }
  };
  if (context.state === "suspended") context.resume().then(play).catch(() => {});
  else play();
}

// Answer sounds are independent of the background music preference.
// Called by the answer controller once, directly from the child's submission.
/*
 * FUNCTION: playMemoryFeedbackSound - play one synthesized correct/incorrect cue.
 * The shared improvement answer controller calls this after accepting a response.
 * Correct uses rising notes; incorrect uses two descending notes. It does not read
 * background muted, and it never changes scores. playTones owns audio-node cleanup.
 */
export function playMemoryFeedbackSound(correct) {
  // Correct: four rising triangle notes. Wrong: the two descending sine notes
  // used by Phonological Awareness's PACategory1-4.
  if (correct) playTones([[523.25, 0], [659.25, .09], [783.99, .18], [1046.5, .27]], { type: "triangle", duration: .28, peak: .13, attack: .015 });
  else playTones([[220, 0], [164.81, .12]], { type: "sine", duration: .25, peak: .25, floor: .01 });
}

// A short two-tone "dial" beep for Number Memory keypad presses; each digit
// has its own pitch so the keys sound different. Square waves keep it distinct
// from the answer sounds (and let tests tell the two apart).
/*
 * FUNCTION: playKeypadTone - play the digit-specific short keypad sound.
 * NumberMemoryGame calls it from the digit button before filling an answer slot.
 * The input is clamped to 0-9; square-wave notes keep keypad and answer cues distinct.
 */
export function playKeypadTone(digit) {
  const n = Math.max(0, Math.min(9, Number(digit) || 0));
  playTones([[660 + n * 40, 0], [990 + n * 60, 0]], { type: "square", duration: .1, peak: .035, attack: .005 });
}

export function useMemoryMusic() {
  // VIVA: useSyncExternalStore lets many components observe this shared module
  // preference. Toggling background music does not mute explicit answer sounds.
  const value = useSyncExternalStore(subscribe, () => muted);
  return { muted: value, toggle: () => { muted = !muted; localStorage.setItem("lexiland-wm-muted", String(muted)); update(); listeners.forEach(fn => fn()); } };
}
/*
 * FUNCTION / COMPONENT: MemoryMusicRouteListener
 * React renders this component when its parent uses <MemoryMusicRouteListener /> or when its
 * state/props change.
 * This component has no explicit props; its body shows the hooks or fixed values it uses.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export function MemoryMusicRouteListener() {
  // VIVA: One route listener starts/stops shared background audio and unlocks
  // browser audio on a pointer/key gesture, avoiding a player per game component.
  const { pathname } = useLocation();
  /*
   * EFFECT: After React renders
   * Synchronize this component with browser state or external work after rendering; the existing
   * callback shows the exact side effects.
   * DEPENDENCIES: [pathname]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => { active = /^\/(improvement-wm|improvement-activity-wm|working-memory)\//.test(pathname); update(); }, [pathname]);
  /*
   * EFFECT: After React renders
   * Manage DOM focus/keyboard/scroll behaviour while this screen/dialog is mounted, and restore it in
   * cleanup.
   * DEPENDENCIES: [] means mount once; a returned cleanup runs on unmount.
   */
  useEffect(() => { const unlock = () => { unlockGameSounds(); if (active) update(); }; document.addEventListener("pointerdown", unlock); document.addEventListener("keydown", unlock); return () => { document.removeEventListener("pointerdown", unlock); document.removeEventListener("keydown", unlock); }; }, []);
  return null;
}
