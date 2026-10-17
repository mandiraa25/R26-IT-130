import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";

let muted = localStorage.getItem("lexiland-wm-muted") === "true";
let active = false;
let audio;
const listeners = new Set();
const update = () => { if (!audio) { audio = new Audio("/audio/workingMemory/bgmusic.mp3"); audio.loop = true; audio.volume = .16; } if (active && !muted) audio.play().catch(() => {}); else audio.pause(); };
const subscribe = callback => { listeners.add(callback); return () => listeners.delete(callback); };

// Answer sounds are independent of the background music preference.
// Called by the answer controller once, directly from the child's submission.
export function playMemoryFeedbackSound(correct) {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  let context;
  const close = () => {
    try { context?.close()?.catch(() => {}); } catch { /* Audio is optional. */ }
  };
  try {
    context = new AudioContextClass();
    const play = () => {
      try {
        // Match the wrong-answer tone used by Phonological Awareness's
        // PACategory1–4: two descending sine notes with the same envelope.
        const notes = correct ? [523.25, 659.25, 783.99, 1046.5] : [220, 164.81];
        const spacing = correct ? .09 : .12;
        const duration = correct ? .28 : .25;
        const baseTime = context.currentTime;
        notes.forEach((frequency, index) => {
          const start = baseTime + index * spacing;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = correct ? "triangle" : "sine";
          oscillator.frequency.setValueAtTime(frequency, start);
          if (correct) {
            gain.gain.setValueAtTime(.001, start);
            gain.gain.linearRampToValueAtTime(.13, start + .015);
            gain.gain.exponentialRampToValueAtTime(.001, start + duration);
          } else {
            gain.gain.setValueAtTime(.25, start);
            gain.gain.exponentialRampToValueAtTime(.01, start + duration);
          }
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(start);
          oscillator.stop(start + duration);
        });
        window.setTimeout(close, ((notes.length - 1) * spacing + duration + .1) * 1000);
      } catch { close(); }
    };
    if (context.state === "suspended") context.resume().then(play).catch(close);
    else play();
  } catch { close(); }
}

export function useMemoryMusic() {
  const value = useSyncExternalStore(subscribe, () => muted);
  return { muted: value, toggle: () => { muted = !muted; localStorage.setItem("lexiland-wm-muted", String(muted)); update(); listeners.forEach(fn => fn()); } };
}
export function MemoryMusicRouteListener() {
  const { pathname } = useLocation();
  useEffect(() => { active = /^\/(improvement-wm|improvement-activity-wm|working-memory)\//.test(pathname); update(); }, [pathname]);
  useEffect(() => { const unlock = () => { if (active) update(); }; document.addEventListener("pointerdown", unlock); document.addEventListener("keydown", unlock); return () => { document.removeEventListener("pointerdown", unlock); document.removeEventListener("keydown", unlock); }; }, []);
  return null;
}
