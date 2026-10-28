/*
 * FILE PURPOSE
 * Reusable image renderer for authored pattern tokens, with a text/children fallback.
 *
 * HOW IT CONNECTS
 * PatternSymbol and ScreeningQuestions call this component. patternSymbols resolves the token and
 * grade/level image path; route params select the folder.
 * Direct source importers: ../../identification/ScreeningQuestions.jsx, ../GameLayout.jsx.
 * Local feature/style dependencies: patternSymbols.js, ../../styles/patternArtwork.css.
 *
 * THINGS TO REMEMBER
 * Compound tokens can produce several images. SVG viewBox cells keep image proportions. Unrecognized
 * text such as letters/numbers stays text. patternArtwork.css controls fitted cells; rendering does
 * not change the answer token.
 */

// VIVA: Render pattern tokens using grade/level illustrations with text fallback.
import { useParams } from "react-router-dom";
import { patternImageSrc, resolvePatternArtwork } from "./patternSymbols";
import "../../styles/patternArtwork.css";

/*
 * FUNCTION / COMPONENT: PatternArtwork
 * React renders this component when its parent uses <PatternArtwork /> or when its state/props change.
 * INPUT PROPS: { value, children }. These values/callbacks come from the parent; defaults apply when
 * omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function PatternArtwork({ value, children }) {
  // The image folder follows the page: /improvement-activity-wm/:grade/:levelNumber
  // uses that level's folder; the screening page (/working-memory/:grade) has no level.
  const { grade, levelNumber } = useParams();
  const artwork = resolvePatternArtwork(value);
  if (!artwork) return children ?? <span>{value}</span>;

  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <span
    className={`lx-pattern-artwork${artwork.length > 1 ? " lx-pattern-artwork--compound" : ""}`}
    role="img"
    aria-label={artwork.map(symbol => symbol.label).join(", ")}
    data-pattern-value={value}
  >
    {/* VIVA: Each resolved symbol occupies its own fitted artwork cell. */}
    {artwork.map((symbol, index) => {
      const size = Math.max(symbol.width, symbol.height) * 1.06;
      const width = symbol.width / size * 100, height = symbol.height / size * 100;
      // The square viewBox fits uniformly even when an answer tile is wide.
      // Each symbol is its own PNG, drawn at the size of its original crop box.
      return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <svg key={`${symbol.value}-${index}`} className="lx-pattern-artwork__cell" aria-hidden="true" data-pattern-symbol={symbol.value} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <foreignObject x={(100 - width) / 2} y={(100 - height) / 2} width={width} height={height}>
          <span className="lx-pattern-artwork__crop">
            <img className="lx-pattern-artwork__image" src={patternImageSrc(symbol, grade, levelNumber)} alt="" draggable="false" style={{ width: "100%", height: "100%", left: 0, top: 0 }} />
          </span>
        </foreignObject>
      </svg>;
    })}
  </span>;
}
