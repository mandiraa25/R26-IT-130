/*
 * FILE PURPOSE
 * Reusable visual building blocks for screening, level map and all improvement games.
 *
 * HOW IT CONNECTS
 * MemoryStage wraps screens; MemoryNav draws header controls; MemoryBoard wraps game content;
 * MemoryTracker shows question progress. Other exports supply headings, timers, buttons, numbers,
 * pictures and bunnies.
 * Direct source importers: ../identification/ScreeningIntro.jsx,
 * ../identification/ScreeningQuestions.jsx, ../improvement/ActivityScreen.jsx,
 * ../improvement/games/InstructionsGame.jsx, ../improvement/games/NumberMemoryGame.jsx,
 * ../improvement/games/PatternGame.jsx, ../improvement/games/PictureMemoryGame.jsx,
 * ../improvement/LevelSelection.jsx, ActivityResults.jsx, Feedback.jsx, LevelCompletion.jsx.
 * Local feature/style dependencies: ../logic/audio.js, ../styles/memoryUI.css,
 * artwork/PictureArtwork.jsx, artwork/PatternArtwork.jsx, ../config/levelThemes.js.
 *
 * THINGS TO REMEMBER
 * These are the actual equivalents of GameHeader, VineBoard, QuestionTracker, BunnyMascot and
 * ThoughtBubble in this project. MemoryBunny returns both bunny image and optional thought bubble.
 * memoryUI.css defines base styles; screen-specific CSS can override them. Stage is designed at
 * 1600x900 and fitted to the browser.
 */

// VIVA: Reusable stage, navigation, board, trackers, controls and artwork wrappers.
import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMemoryMusic } from "../logic/audio";
import "../styles/memoryUI.css";
import PictureArtwork from "./artwork/PictureArtwork";
import PatternArtwork from "./artwork/PatternArtwork";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import { WoodenMusicToggle, WoodenStarCounter } from "../../../components/common/WoodenNavControls";

import { UI, LEVEL_THEMES } from "../config/levelThemes";
const warmedImages = new Set();
/*
 * FUNCTION / COMPONENT: MemoryStage
 * Shared outer scene: keeps the same design coordinates on different browser sizes.
 * PROPS: level selects colours/background; background overrides the theme image;
 * className adds screen selectors; children is the screen content placed inside the stage.
 * RETURNS: A full-window background image and a centered 1600x900 design stage.
 * useLayoutEffect sets scale=min(windowWidth/1600, windowHeight/900) before paint.
 * The resize listener updates that fit. CSS is memoryUI.css; callers add screen overrides.
 */
export function MemoryStage({ level = 1, children, className = "", background }) {
  // VIVA: Layout effects fit the 1600x900 design to the browser before paint;
  // level themes and CSS variables change artwork without changing game rules.
  /*
   * REMEMBER: ref
   * The design-stage DOM reference. The layout effect writes a scale transform when the browser size
   * changes.
   * Changing .current is immediate and does not cause a render.
   */
  const ref = useRef(null);
  const { i18n } = useTranslation();
  /*
   * EFFECT: Before the browser paints
   * Fit the 1600x900 design stage before paint. The resize listener recalculates the smaller
   * window-width/window-height scale; cleanup removes that listener.
   * DEPENDENCIES: [] means mount once; a returned cleanup runs on unmount.
   */
  useLayoutEffect(() => {
    const fit = () => { if (ref.current) ref.current.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1600, innerHeight / 900)})`; };
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const theme = LEVEL_THEMES[Number(level)] || LEVEL_THEMES[1];
  /*
   * EFFECT: After React renders
   * Preload artwork before the child reaches its next screen; it changes download timing, not answers.
   * DEPENDENCIES: [level, theme.button]. A changed dependency reruns the effect; its prior cleanup runs
   * first.
   */
  useEffect(() => {
    const sources = [`${UI}/boards/vine/wm-vine-board.webp`, `${UI}/boards/navigation/nav-tracker.png`, `${UI}/bunny/bunny.webp`, "/images/workingMemory/shared/boards/how-to-play/wm-level1-how-to-board.png", `/images/workingMemory/pictures/cards/pic-l${level}-back.png`, `${UI}/buttons/btn-${theme.button}.png`];
    for (const src of sources) {
      if (warmedImages.has(src)) continue;
      warmedImages.add(src);
      const image = new Image(); image.src = src;
      image.decode().catch(() => warmedImages.delete(src));
    }
  }, [level, theme.button]);
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className={`lx-viewport ${className}`} lang={i18n.language} data-level={level} style={{ "--lx-accent": theme.accent, "--lx-dark": theme.dark, "--lx-light": theme.light, "--lx-number": `url('${UI}/buttons/btn-${theme.button}.png')` }}>
    {/* VIVA: Full-screen background and the scaled game stage are here. */}
    <img className="lx-background" src={background || `${UI}/backgrounds/bg-level${level}.webp`} alt="" />
    <div className="lx-stage" ref={ref}>{children}</div>
  </div>;
}
/*
 * FUNCTION / COMPONENT: MemoryButton
 * One reusable button appearance instead of copied button markup in every game.
 * PROPS: children is the label/icon; variant selects primary, play or secondary CSS;
 * className adds a local override; remaining props forward onClick, disabled and accessibility.
 * RETURNS: A real button styled by .lx-button and .lx-button--<variant> in memoryUI.css.
 * The caller owns the click logic; this component does not check answers.
 */
export function MemoryButton({ children, variant = "primary", className = "", ...props }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <button type="button" {...props} className={`lx-button lx-button--${variant} ${className}`}>{children}</button>;
}
/*
 * FUNCTION / COMPONENT: MemoryNav
 * Reusable header shared by the map and activity screens.
 * PROPS: title is the left label; onBack is the back action; stars is a displayed total;
 * language enables the switch; controls can hide star/music controls; map changes back labeling.
 * RETURNS: Back/title on the left and stars/music/optional language on the right.
 * useMemoryMusic provides one shared mute preference; this header does not calculate rewards.
 * memoryUI.css supplies base positions; popupMap.css adjusts the level-map header.
 */
export function MemoryNav({ title, onBack, stars = 0, language = false, map = false, controls = true }) {
  // VIVA: Navigation receives star totals and back behavior as props. The music
  // hook shares one persisted mute preference across Working Memory screens.
  const { muted, toggle } = useMemoryMusic();
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <header className="lx-nav">
    {/* VIVA: Back/title sit left; stars, music and optional language sit right. */}
    <div className="lx-nav-left">
      <button className="lx-nav-icon" type="button" onClick={onBack} aria-label={map ? "Back to dashboard" : "Back to game menu"}><img src={`${UI}/buttons/navigation/nav-back.png`} alt="" /></button>
      <div className="lx-nav-title">{title}</div>
    </div>
    <div className="lx-nav-right">
      {controls && <>
        <WoodenStarCounter className="lx-nav-stars" value={stars} />
        <WoodenMusicToggle className="lx-nav-icon" muted={muted} onToggle={toggle} ariaLabel={muted ? "Unmute music" : "Mute music"} />
      </>}
      {language && <LanguageSwitcher variant="woodland" className="lx-nav-language" />}
    </div>
  </header>;
}
/*
 * FUNCTION / COMPONENT: MemoryTracker
 * Reusable question progress display driven by actual question IDs and recorded answers.
 * PROPS: current is one-based for the visible question; total is the question count;
 * responses are recorded answers and questionIds identifies the shuffled question at each position.
 * RETURNS: An ordered list of current, answered and upcoming steps, with correctness markers.
 * The tracker never advances the question itself. The controller changes index/results.
 * memoryUI.css defines the strip/steps; improvementLayout.css adjusts five-question alignment.
 */
export function MemoryTracker({ current = 1, total = 5, responses = [], questionIds = [] }) {
  // VIVA: Match results by question ID when supplied, so shuffled questions keep
  // their own correct/incorrect marker instead of borrowing another answer.
  const activeIndex = Math.max(0, Math.min(total - 1, current - 1));
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <ol className={`lx-tracker ${total > 5 ? "lx-tracker--long" : ""}`} aria-label={`Question ${activeIndex + 1} of ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const response = questionIds[i] === undefined ? responses[i] : responses.find(answer => answer.questionId === questionIds[i]);
      const done = Boolean(response);
      const result = done ? response.isCorrect === false ? "is-incorrect" : "is-correct" : "";
      const isCurrent = i === activeIndex;
      const state = [isCurrent && "is-current", done && "is-done", result, !done && !isCurrent && "is-upcoming"].filter(Boolean).join(" ");
      return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <li key={questionIds[i] ?? i} className={`lx-step ${state}`} style={{ "--step-index": i }} data-question-id={questionIds[i]} aria-current={isCurrent ? "step" : undefined} aria-label={`Question ${i + 1}${done ? `: completed, ${result === "is-correct" ? "correct" : "incorrect"}` : isCurrent ? ": current" : ": upcoming"}`}>
        {total > 5 && <><img src={`${UI}/buttons/btn-orange.png`} alt="" /><span>{i + 1}</span></>}{done && <b aria-hidden="true">{result === "is-correct" ? "✓" : "✗"}</b>}
      </li>;
    })}
  </ol>;
}
/*
 * FUNCTION / COMPONENT: MemoryBunny
 * Reusable guide mascot and optional thought bubble.
 * PROPS: message is the guidance text chosen by gameConfig and the current phase.
 * RETURNS: An optional .lx-thought aside plus the shared bunny.webp illustration.
 * The bunny picture and text are separate layers, so language can change without editing artwork.
 * Change .lx-bunny and .lx-thought in memoryUI.css or the relevant screen override to move them.
 */
export function MemoryBunny({ message }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>{message && <aside className="lx-thought"><p>{message}</p><i /><i /></aside>}<img className="lx-bunny" src={`${UI}/bunny/bunny.webp`} alt="" /></>;
}
/*
 * FUNCTION / COMPONENT: MemoryBoard
 * Reusable illustrated vine frame shared by question and result screens.
 * PROPS: children supplies the actual question/results; className adds a screen-specific selector;
 * remaining props forward accessibility/data attributes onto the board section.
 * RETURNS: .lx-board with an inner .lx-board-content container.
 * The vine is a background image in memoryUI.css. Board content padding belongs to CSS;
 * the game components supply live text/buttons rather than drawing the board artwork.
 */
export function MemoryBoard({ children, className = "", ...props }) {
  // VIVA: This section is the reusable board; callers supply the visible content.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <><section {...props} className={`lx-board ${className}`}><div className="lx-board-content">{children}</div></section></>;
}
/*
 * FUNCTION / COMPONENT: MemoryHeading
 * Shared question title with optional read-aloud control.
 * PROPS: children is the visible prompt; onListen is the parent speech callback.
 * RETURNS: .lx-question-heading and, when available, a speaker button.
 * The component displays the prompt; speech and any listening-phase changes belong to the caller.
 */
export function MemoryHeading({ children, onListen }) {
  // VIVA: The question heading optionally includes its read-aloud button.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <h1 className="lx-question-heading"><span>{children}</span>{onListen && <button type="button" className="lx-speaker" onClick={onListen} aria-label="Listen to the question"><img src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" /></button>}</h1>;
}
/*
 * FUNCTION / COMPONENT: MemoryTimer
 * Display-only reveal countdown and progress bar.
 * PROPS: count is seconds remaining; max is the initial duration.
 * RETURNS: TIME LEFT text and an inner bar whose width is count/max as a percentage.
 * This component does not start a timer. ImprovementPage owns the interval and phase transition.
 * memoryUI.css supplies the basic bar; improvementLayout.css adjusts its size/spacing.
 */
export function MemoryTimer({ count, max }) {
  // VIVA: This is a display only; the controller's effect owns the countdown.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="lx-timer" role="timer" aria-label={`${count} seconds remaining`}><span>TIME LEFT: {count}s</span><div><i style={{ width: `${Math.max(0, count / max) * 100}%` }} /></div></div>;
}
/*
 * FUNCTION / COMPONENT: MemoryNumber
 * Reusable illustrated number button used for revealed digits and keypad entries.
 * PROPS: children is a digit (or empty for concealed cards); className adds visual states;
 * remaining props forward disabled, onClick, tabIndex and aria labels.
 * RETURNS: A .lx-number button using the theme button image through --lx-number.
 * NumberMemoryGame decides whether it is a study digit or an interactive recall key.
 */
export function MemoryNumber({ children, className = "", ...props }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <button type="button" {...props} className={`lx-number ${className}`}>{children}</button>;
}
const PICTURE_NAMES = { rabbit: "bunny" };
const FRONTS = { 1: ["apple", "bird", "butterfly", "tree"], 2: ["apple", "balloon", "bird", "bunny", "butterfly", "carrot", "flower", "strawberry", "tree"], 3: ["apple", "balloon", "bird", "bunny", "butterfly", "carrot", "strawberry", "tree"], 4: ["apple", "balloon", "bird", "butterfly", "carrot", "flower", "strawberry", "tree"] };
/*
 * FUNCTION / COMPONENT: MemoryPicture
 * Reusable picture tile supporting revealed artwork, card backs, tapping and dragging.
 * PROPS: item holds stable id/image/alt; level chooses available card art; hidden shows a back;
 * onClick and onDragStart are optional callbacks; className adds local styling.
 * RETURNS: A fitted picture or level card back, with keyboard activation when clickable.
 * Some original Level 1 fronts are supplied art; other items use PictureArtwork/their image URL.
 * The controller owns order and correctness. .lx-picture and game-level overrides control size.
 */
export function MemoryPicture({ item, level = 1, hidden = false, onClick, onDragStart, className = "" }) {
  // VIVA: hidden chooses the card back. Visible cards use themed artwork or the
  // item's image; click/drag/keyboard events delegate arrangement to the parent.
  const name = String(item?.id || "").toLowerCase();
  const assetName = PICTURE_NAMES[name] || name;
  const supplied = ![2, 3, 4].includes(Number(level)) && FRONTS[level]?.includes(assetName);
  const content = hidden && [3, 4].includes(Number(level)) ? <span className="lx-picture-face lx-picture-back"><span role="img" aria-label="Face-down picture" style={{ backgroundImage: `url('/images/workingMemory/pictures/cards/pic-l${level}-back.png')` }} /></span> : hidden ? <img src={`/images/workingMemory/pictures/cards/pic-l${level}-back.png`} alt="Face-down picture" /> : supplied ? <img src={`/images/workingMemory/pictures/cards/pic-l${level}-${assetName}.png`} alt={item.alt} /> : <span className="lx-picture-face">
    {typeof item?.image === "string" ? <PictureArtwork src={item.image} alt={item.alt} /> : <span>{typeof item === "object" ? item.alt : item}</span>}
  </span>;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className={`lx-picture ${className}`} data-item-id={hidden ? undefined : item?.id} draggable={!hidden && Boolean(onDragStart)} onDragStart={onDragStart} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `Select ${item?.alt || item?.id}` : undefined} onKeyDown={onClick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>{content}</div>;
}
const ICONS = { "🟠": "c-orange", "🔵": "c-blue", "🟢": "c-green", "🟣": "c-purple", "🔺": "tri-red", "🟨": "sq-yellow", "🥕": "carrot", "🍎": "apple", "🌸": "flower", "🍃": "leaf", "🍀": "leaf", "🌿": "leaf", "🌙": "moon", "❤️": "heart", "💗": "heart", "⭐": "star", "🌟": "star" };
/*
 * FUNCTION / COMPONENT: PatternSymbol
 * Shared adapter from an authored pattern token to its visual representation.
 * PROPS: value is the stable symbol/token used by the question and checker.
 * RETURNS: PatternArtwork with a legacy icon/text fallback for unresolved tokens.
 * Changing the artwork does not change the stored token or correct answer.
 */
export function PatternSymbol({ value }) {
  // VIVA: PatternArtwork draws the symbol, with icon/text fallback children.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <PatternArtwork value={value}>{ICONS[value] ? <img className="lx-pattern-symbol" src={`${UI}/icons/${ICONS[value]}.svg`} alt={value} /> : <span>{value}</span>}</PatternArtwork>;
}

/*
 * FUNCTION / COMPONENT: DashboardBunny
 * Result-page mascot and encouragement bubble reused by per-game/level results.
 * PROPS: happy selects happy or sad artwork; message supplies bilingual encouragement;
 * si selects the accessible description language.
 * RETURNS: The result bunny image and speech aside with shared result CSS classes.
 * patternReference.css and levelOneDashboard.css position this result-specific mascot.
 */
export function DashboardBunny({ happy, message, si }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: Result mascot and its speech bubble are here. */}
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${UI}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}
