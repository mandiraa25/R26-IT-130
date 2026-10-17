import { resolvePatternArtwork } from "./patternSymbols";
import "../../styles/patternArtwork.css";

export default function PatternArtwork({ value, children }) {
  const artwork = resolvePatternArtwork(value);
  if (!artwork) return children ?? <span>{value}</span>;

  return <span
    className={`lx-pattern-artwork${artwork.length > 1 ? " lx-pattern-artwork--compound" : ""}`}
    role="img"
    aria-label={artwork.map(symbol => symbol.label).join(", ")}
    data-pattern-value={value}
  >
    {artwork.map((symbol, index) => {
      const rect = symbol.bounds;
      const size = Math.max(rect.width, rect.height) * 1.06;
      const width = rect.width / size * 100, height = rect.height / size * 100;
      // The square viewBox fits uniformly even when an answer tile is wide.
      // Its contents are untouched raster artwork, not replacement SVG icons.
      return <svg key={`${symbol.value}-${index}`} className="lx-pattern-artwork__cell" aria-hidden="true" data-pattern-symbol={symbol.value} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <foreignObject x={(100 - width) / 2} y={(100 - height) / 2} width={width} height={height}>
          <span className="lx-pattern-artwork__crop" style={{ clipPath: rect.clipPath }}>
            <img className="lx-pattern-artwork__image" src={symbol.src} alt="" draggable="false" style={{
              width: `${symbol.sheetWidth / rect.width * 100}%`, height: `${symbol.sheetHeight / rect.height * 100}%`,
              left: `${-rect.x / rect.width * 100}%`, top: `${-rect.y / rect.height * 100}%`,
            }} />
          </span>
        </foreignObject>
      </svg>;
    })}
  </span>;
}
