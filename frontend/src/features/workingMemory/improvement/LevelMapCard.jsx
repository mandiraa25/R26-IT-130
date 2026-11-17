/*
 * FILE PURPOSE
 * One reusable illustrated level button; the map creates four instances.
 *
 * HOW IT CONNECTS
 * LevelSelection supplies level, artwork, completed, locked, loading, si and onSelect. Clicking calls
 * onSelect(level); the parent decides access and navigation.
 * Direct source importers: LevelSelection.jsx.
 * Local feature/style dependencies: ../styles/levelMapCards.css.
 *
 * THINGS TO REMEMBER
 * The PNG already contains rabbit, scenery, frame and blank coloured controls. Live title, completion
 * count and PLAY/LOCKED labels sit above it. levelMapCards.css uses percentage positions. Loading
 * disables clicks; locked uses aria-disabled but remains clickable to explain the lock.
 */

// VIVA: One illustrated level card with completion count and play/locked label.
import { ChevronRight, LockKeyhole } from "lucide-react";
import "../styles/levelMapCards.css";

/*
 * FUNCTION / COMPONENT: LevelMapCard
 * React renders this component when its parent uses <LevelMapCard /> or when its state/props change.
 * INPUT PROPS: { level, artwork, completed, locked, loading, si, onSelect }. These values/callbacks
 * come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function LevelMapCard({ level, artwork, completed, locked, loading, si, onSelect }) {
  // VIVA: This reusable card receives display values and reports the selected
  // level through onSelect; it does not fetch progress or unlock games.
  const levelName = `${si ? "මට්ටම" : "Level"} ${level}`;
  const progressId = `wm-level-${level}-progress`;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <button
    type="button"
    className={`lx-level-card wm-level-card${locked ? " is-locked" : ""}`}
    onClick={() => onSelect(level)}
    disabled={loading}
    aria-disabled={locked}
    aria-label={`${levelName}${locked ? si ? ", අගුළු දමා ඇත" : ", locked" : ""}`}
    aria-describedby={progressId}
  >
    {/* VIVA: Card artwork and the live level title are here. */}
    <img className="wm-level-card__artwork" src={artwork} alt="" draggable="false" />
    <h2 className="wm-level-card__title">{si ? "මට්ටම" : "LEVEL"} {level}</h2>
    {/* VIVA: Saved completed-game count and the card action label are here. */}
    <span id={progressId} className="wm-level-card__progress">{/* UI SECTION: Card progress: a decorative star and the number of saved completed games out of four. */}
      <img src="/images/workingMemory/shared/feedback/star.webp" alt="" draggable="false" />
      <span>{completed} / 4 {si ? "ක්‍රීඩා" : "Games"}</span>
    </span>
    <span className="wm-level-card__cta">{/* UI SECTION: Card action label: PLAY or LOCKED sits over the coloured control in the PNG. The outer button owns clicks. */}
      {locked && <LockKeyhole aria-hidden="true" />}
      <span>{locked ? si ? "අගුළු දමා ඇත" : "LOCKED" : si ? "ක්‍රීඩා කරමු" : "PLAY"}</span>
      {!locked && <ChevronRight aria-hidden="true" strokeWidth={4} />}
    </span>
  </button>;
}
