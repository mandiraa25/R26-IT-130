import { ChevronRight, LockKeyhole } from "lucide-react";
import "../styles/levelMapCards.css";

export default function LevelMapCard({ level, artwork, completed, locked, loading, si, onSelect }) {
  const levelName = `${si ? "මට්ටම" : "Level"} ${level}`;
  const progressId = `wm-level-${level}-progress`;
  return <button
    type="button"
    className={`lx-level-card wm-level-card${locked ? " is-locked" : ""}`}
    onClick={() => onSelect(level)}
    disabled={loading}
    aria-disabled={locked}
    aria-label={`${levelName}${locked ? si ? ", අගුළු දමා ඇත" : ", locked" : ""}`}
    aria-describedby={progressId}
  >
    <img className="wm-level-card__artwork" src={artwork} alt="" draggable="false" />
    <h2 className="wm-level-card__title">{si ? "මට්ටම" : "LEVEL"} {level}</h2>
    <span id={progressId} className="wm-level-card__progress">
      <img src="/images/workingMemory/shared/feedback/star.webp" alt="" draggable="false" />
      <span>{completed} / 4 {si ? "ක්‍රීඩා" : "Games"}</span>
    </span>
    <span className="wm-level-card__cta">
      {locked && <LockKeyhole aria-hidden="true" />}
      <span>{locked ? si ? "අගුළු දමා ඇත" : "LOCKED" : si ? "ක්‍රීඩා කරමු" : "PLAY"}</span>
      {!locked && <ChevronRight aria-hidden="true" strokeWidth={4} />}
    </span>
  </button>;
}
