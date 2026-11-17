/*
 * FILE PURPOSE
 * Selected-level popup showing the four improvement games.
 *
 * HOW IT CONNECTS
 * LevelSelection imports the default LevelMenu component and supplies one level of saved progress plus
 * onSelect/onLocked/onClose callbacks. onSelect leads to ImprovementPage through the activity route.
 * Direct source importers: LevelSelection.jsx.
 *
 * THINGS TO REMEMBER
 * GAMES holds labels, colours and image keys, not unlock rules. progress supplies isUnlocked. Refs and
 * effects manage focus, Escape, Tab and scroll restoration. popupMap.css positions the illustrated
 * board and thumbnail controls. The close artwork is shared with the dashboard popup.
 */

// VIVA: Selected-level dialog containing four game choices and lock notices.
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
/*
 * FUNCTION / COMPONENT: LevelMenu
 * React renders this component when its parent uses <LevelMenu /> or when its state/props change.
 * INPUT PROPS: { level, progress, onSelect, onLocked, onClose, notice, si }. These values/callbacks
 * come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function LevelMenu({ level, progress, onSelect, onLocked, onClose, notice, si }) {
  // VIVA: Props supply one level's four saved game states. This popup displays
  // isUnlocked; the backend, rather than this component, changes progression.
  /*
   * REMEMBER: dialog
   * The game-menu dialog DOM reference. Its first button receives focus and Tab stays inside until
   * closing.
   * Changing .current is immediate and does not cause a render.
   */
  const dialog = useRef(null);
  /*
   * REMEMBER: close
   * Latest onClose callback stored in a ref so the modal key listener can call the current handler.
   * Changing .current is immediate and does not cause a render.
   */
  const close = useRef(onClose);
  /*
   * EFFECT: After React renders
   * Synchronize this component with browser state or external work after rendering; the existing
   * callback shows the exact side effects.
   * DEPENDENCIES: [onClose]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => { close.current = onClose; }, [onClose]);
  /*
   * EFFECT: After React renders
   * Manage DOM focus/keyboard/scroll behaviour while this screen/dialog is mounted, and restore it in
   * cleanup.
   * DEPENDENCIES: [level]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => {
    // Making the map inert can blur its trigger before this effect runs.
    // VIVA: The effect manages modal focus, Escape/Tab and scroll locking;
    // its cleanup restores the surrounding page when the popup closes.
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
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="lx-menu-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    {/* VIVA: The illustrated popup board, title and close control are here. */}
    <section ref={dialog} className="lx-menu-board lx-popup-board" role="dialog" aria-modal="true" aria-labelledby="lx-popup-title">
      <img className="lx-popup-board-art" src={`${BOARD}/popup-vine-board.webp`} alt="" draggable="false" />
      <h2 id="lx-popup-title" className="lx-popup-title">{si ? "මට්ටම" : "Level"} {level}</h2>
      <button type="button" className="lx-popup-close" onClick={onClose} aria-label={si ? "ක්‍රීඩා මෙනුව වසන්න" : "Close game menu"}><img src="/images/dashboard/activity-popup/close-wooden.png" alt="" draggable="false" /></button>
      {/* VIVA: Each game card displays its saved unlocked or locked state. */}
      <div className="lx-popup-games">{/* UI SECTION: Game menu: map four games to thumbnail buttons, using saved isUnlocked to select play or lock behaviour. */}{GAMES.map(game => {
        const unlocked = progress.find(item => item.subCategoryKey === game.key)?.isUnlocked;
        return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <button key={game.key} type="button" className={`lx-popup-game ${unlocked ? "" : "is-locked"}`} style={{ "--game-c": game.colour, "--game-d": game.dark }} onClick={() => unlocked ? onSelect(game.key) : onLocked()} aria-label={`${si ? game.si : game.name}${unlocked ? "" : ", locked"}`}>
          <img className="lx-popup-thumbnail" src={`${THUMBNAILS}/thumb-${game.key}.webp`} alt="" draggable="false" />
          <span className="lx-popup-game-label">{si ? game.si : game.name}</span>
          <span className="lx-popup-play" aria-hidden="true">{unlocked ? <Play fill="white" /> : <Lock />}</span>
        </button>;
      })}</div>
      <p className="lx-popup-notice" role="status">{notice}</p>
    </section>
  </div>;
}
