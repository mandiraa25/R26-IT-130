import { useEffect, useRef } from "react";
import { Lock, Play } from "lucide-react";
const BOARD = "/images/workingMemory/shared/boards/level-map";
const THUMBNAILS = "/images/workingMemory/shared/icons/games";
const GAMES = [
  { key: "pattern", name: "Pattern", si: "රටා", colour: "#ff9700", dark: "#dc6600" },
  { key: "words", name: "Picture Game", si: "පින්තූර", colour: "#1cdb13", dark: "#079f16" },
  { key: "instructions", name: "Instructions", si: "උපදෙස්", colour: "#ff388c", dark: "#d51561" },
  { key: "numbers", name: "Numbers", si: "අංක", colour: "#963dff", dark: "#6520dc" },
];
export default function LevelMenu({ level, progress, onSelect, onLocked, onClose, notice, si }) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    // Making the map inert can blur its trigger before this effect runs.
    const previous = document.activeElement?.closest(".lx-level-card")
      || document.querySelectorAll(".lx-level-card")[Number(level) - 1]
      || document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("button")?.focus();
    const keydown = event => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const controls = [...dialog.current.querySelectorAll("button:not(:disabled)")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus(); };
  }, [level]);
  return <div className="lx-menu-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialog} className="lx-menu-board lx-popup-board" role="dialog" aria-modal="true" aria-labelledby="lx-popup-title">
      <img className="lx-popup-board-art" src={`${BOARD}/popup-vine-board.webp`} alt="" draggable="false" />
      <h2 id="lx-popup-title" className="lx-popup-title">{si ? "මට්ටම" : "Level"} {level}</h2>
      <button type="button" className="lx-popup-close" onClick={onClose} aria-label={si ? "ක්‍රීඩා මෙනුව වසන්න" : "Close game menu"}><img src="/images/dashboard/activity-popup/close-wooden.png" alt="" draggable="false" /></button>
      <div className="lx-popup-games">{GAMES.map(game => {
        const unlocked = progress.find(item => item.subCategoryKey === game.key)?.isUnlocked;
        return <button key={game.key} type="button" className={`lx-popup-game ${unlocked ? "" : "is-locked"}`} style={{ "--game-c": game.colour, "--game-d": game.dark }} onClick={() => unlocked ? onSelect(game.key) : onLocked()} aria-label={`${si ? game.si : game.name}${unlocked ? "" : ", locked"}`}>
          <img className="lx-popup-thumbnail" src={`${THUMBNAILS}/thumb-${game.key}.webp`} alt="" draggable="false" />
          <span className="lx-popup-game-label">{si ? game.si : game.name}</span>
          <span className="lx-popup-play" aria-hidden="true">{unlocked ? <Play fill="white" /> : <Lock />}</span>
        </button>;
      })}</div>
      <p className="lx-popup-notice" role="status">{notice}</p>
    </section>
  </div>;
}
