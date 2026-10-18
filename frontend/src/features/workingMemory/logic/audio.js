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
export function playMemoryFeedbackSound(correct) {
  // Correct: four rising triangle notes. Wrong: the two descending sine notes
  // used by Phonological Awareness's PACategory1-4.
  if (correct) playTones([[523.25, 0], [659.25, .09], [783.99, .18], [1046.5, .27]], { type: "triangle", duration: .28, peak: .13, attack: .015 });
  else playTones([[220, 0], [164.81, .12]], { type: "sine", duration: .25, peak: .25, floor: .01 });
}

// A short two-tone "dial" beep for Number Memory keypad presses; each digit
// has its own pitch so the keys sound different. Square waves keep it distinct
// from the answer sounds (and let tests tell the two apart).
export function playKeypadTone(digit) {
  const n = Math.max(0, Math.min(9, Number(digit) || 0));
  playTones([[660 + n * 40, 0], [990 + n * 60, 0]], { type: "square", duration: .1, peak: .035, attack: .005 });
}

export function useMemoryMusic() {
  const value = useSyncExternalStore(subscribe, () => muted);
  return { muted: value, toggle: () => { muted = !muted; localStorage.setItem("lexiland-wm-muted", String(muted)); update(); listeners.forEach(fn => fn()); } };
}
export function MemoryMusicRouteListener() {
  const { pathname } = useLocation();
  useEffect(() => { active = /^\/(improvement-wm|improvement-activity-wm|working-memory)\//.test(pathname); update(); }, [pathname]);
  useEffect(() => { const unlock = () => { unlockGameSounds(); if (active) update(); }; document.addEventListener("pointerdown", unlock); document.addEventListener("keydown", unlock); return () => { document.removeEventListener("pointerdown", unlock); document.removeEventListener("keydown", unlock); }; }, []);
  return null;
}
