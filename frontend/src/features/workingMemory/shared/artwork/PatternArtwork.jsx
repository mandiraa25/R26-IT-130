import { useParams } from "react-router-dom";
import { patternImageSrc, resolvePatternArtwork } from "./patternSymbols";
import "../../styles/patternArtwork.css";

export default function PatternArtwork({ value, children }) {
  // The image folder follows the page: /improvement-activity-wm/:grade/:levelNumber
  // uses that level's folder; the screening page (/working-memory/:grade) has no level.
  const { grade, levelNumber } = useParams();
  const artwork = resolvePatternArtwork(value);
  if (!artwork) return children ?? <span>{value}</span>;

  return <span
    className={`lx-pattern-artwork${artwork.length > 1 ? " lx-pattern-artwork--compound" : ""}`}
    role="img"
    aria-label={artwork.map(symbol => symbol.label).join(", ")}
    data-pattern-value={value}
  >
    {artwork.map((symbol, index) => {
      const size = Math.max(symbol.width, symbol.height) * 1.06;
      const width = symbol.width / size * 100, height = symbol.height / size * 100;
      // The square viewBox fits uniformly even when an answer tile is wide.
      // Each symbol is its own PNG, drawn at the size of its original crop box.
      return <svg key={`${symbol.value}-${index}`} className="lx-pattern-artwork__cell" aria-hidden="true" data-pattern-symbol={symbol.value} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <foreignObject x={(100 - width) / 2} y={(100 - height) / 2} width={width} height={height}>
          <span className="lx-pattern-artwork__crop">
            <img className="lx-pattern-artwork__image" src={patternImageSrc(symbol, grade, levelNumber)} alt="" draggable="false" style={{ width: "100%", height: "100%", left: 0, top: 0 }} />
          </span>
        </foreignObject>
      </svg>;
    })}
  </span>;
}
