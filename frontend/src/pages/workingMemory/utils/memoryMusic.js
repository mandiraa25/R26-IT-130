import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";

let muted = localStorage.getItem("lexiland-wm-muted") === "true";
let active = false;
let audio;
const listeners = new Set();
const update = () => { if (!audio) { audio = new Audio("/audio/workingMemory/bgmusic.mp3"); audio.loop = true; audio.volume = .16; } if (active && !muted) audio.play().catch(() => {}); else audio.pause(); };
const subscribe = callback => { listeners.add(callback); return () => listeners.delete(callback); };
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
