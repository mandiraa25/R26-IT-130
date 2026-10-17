import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMemoryMusic } from "../logic/audio";
import "../styles/memoryUI.css";
import PictureArtwork from "./artwork/PictureArtwork";
import LevelThreeSprite from "./artwork/PictureSprite";
import PatternArtwork from "./artwork/PatternArtwork";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import { WoodenMusicToggle, WoodenStarCounter } from "../../../components/common/WoodenNavControls";

import { UI, LEVEL_THEMES } from "../config/levelThemes";
const warmedImages = new Set();
export function MemoryStage({ level = 1, children, className = "", background }) {
  const ref = useRef(null);
  const { i18n } = useTranslation();
  useLayoutEffect(() => {
    const fit = () => { if (ref.current) ref.current.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1600, innerHeight / 900)})`; };
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const theme = LEVEL_THEMES[Number(level)] || LEVEL_THEMES[1];
  useEffect(() => {
    const sources = [`${UI}/boards/vine/wm-vine-board.webp`, `${UI}/boards/navigation/nav-tracker.png`, `${UI}/bunny/bunny.webp`, "/images/workingMemory/shared/boards/how-to-play/wm-level1-how-to-board.png", `/images/workingMemory/pictures/cards/pic-l${level}-back.png`, `${UI}/buttons/btn-${theme.button}.png`];
    for (const src of sources) {
      if (warmedImages.has(src)) continue;
      warmedImages.add(src);
      const image = new Image(); image.src = src;
      image.decode().catch(() => warmedImages.delete(src));
    }
  }, [level, theme.button]);
  return <div className={`lx-viewport ${className}`} lang={i18n.language} data-level={level} style={{ "--lx-accent": theme.accent, "--lx-dark": theme.dark, "--lx-light": theme.light, "--lx-number": `url('${UI}/buttons/btn-${theme.button}.png')` }}>
    <img className="lx-background" src={background || `${UI}/backgrounds/bg-level${level}.webp`} alt="" />
    <div className="lx-stage" ref={ref}>{children}</div>
  </div>;
}
export function MemoryButton({ children, variant = "primary", className = "", ...props }) {
  return <button type="button" {...props} className={`lx-button lx-button--${variant} ${className}`}>{children}</button>;
}
export function MemoryNav({ title, onBack, stars = 0, language = false, map = false, controls = true }) {
  const { muted, toggle } = useMemoryMusic();
  return <header className="lx-nav">
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
export function MemoryTracker({ current = 1, total = 5, responses = [], questionIds = [] }) {
  const activeIndex = Math.max(0, Math.min(total - 1, current - 1));
  return <ol className={`lx-tracker ${total > 5 ? "lx-tracker--long" : ""}`} aria-label={`Question ${activeIndex + 1} of ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const response = questionIds[i] === undefined ? responses[i] : responses.find(answer => answer.questionId === questionIds[i]);
      const done = Boolean(response);
      const isCurrent = i === activeIndex;
      const state = [isCurrent && "is-current", done && "is-done", !done && !isCurrent && "is-upcoming"].filter(Boolean).join(" ");
      return <li key={questionIds[i] ?? i} className={`lx-step ${state}`} style={{ "--step-index": i }} data-question-id={questionIds[i]} aria-current={isCurrent ? "step" : undefined} aria-label={`Question ${i + 1}${done ? ": completed" : isCurrent ? ": current" : ": upcoming"}`}>
        {total > 5 && <><img src={`${UI}/buttons/btn-orange.png`} alt="" /><span>{i + 1}</span></>}{done && <b aria-hidden="true">✓</b>}
      </li>;
    })}
  </ol>;
}
export function MemoryBunny({ message }) {
  return <>{message && <aside className="lx-thought"><p>{message}</p><i /><i /></aside>}<img className="lx-bunny" src={`${UI}/bunny/bunny.webp`} alt="" /></>;
}
export function MemoryBoard({ children, className = "", ...props }) {
  return <><section {...props} className={`lx-board ${className}`}><div className="lx-board-content">{children}</div></section></>;
}
export function MemoryHeading({ children, onListen }) {
  return <h1 className="lx-question-heading"><span>{children}</span>{onListen && <button type="button" className="lx-speaker" onClick={onListen} aria-label="Listen to the question"><img src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" /></button>}</h1>;
}
export function MemoryTimer({ count, max }) {
  return <div className="lx-timer" role="timer" aria-label={`${count} seconds remaining`}><span>TIME LEFT: {count}s</span><div><i style={{ width: `${Math.max(0, count / max) * 100}%` }} /></div></div>;
}
export function MemoryNumber({ children, className = "", ...props }) {
  return <button type="button" {...props} className={`lx-number ${className}`}>{children}</button>;
}
const PICTURE_NAMES = { rabbit: "bunny" };
const FRONTS = { 1: ["apple", "bird", "butterfly", "tree"], 2: ["apple", "balloon", "bird", "bunny", "butterfly", "carrot", "flower", "strawberry", "tree"], 3: ["apple", "balloon", "bird", "bunny", "butterfly", "carrot", "strawberry", "tree"], 4: ["apple", "balloon", "bird", "butterfly", "carrot", "flower", "strawberry", "tree"] };
export function MemoryPicture({ item, level = 1, hidden = false, onClick, onDragStart, className = "" }) {
  const name = String(item?.id || "").toLowerCase();
  const assetName = PICTURE_NAMES[name] || name;
  const supplied = ![2, 3, 4].includes(Number(level)) && FRONTS[level]?.includes(assetName);
  const sprite = Number.isInteger(item?.spriteIndex);
  const content = hidden && [3, 4].includes(Number(level)) ? <span className="lx-picture-face lx-picture-back"><span role="img" aria-label="Face-down picture" style={{ backgroundImage: `url('/images/workingMemory/pictures/cards/pic-l${level}-back.png')` }} /></span> : hidden ? <img src={`/images/workingMemory/pictures/cards/pic-l${level}-back.png`} alt="Face-down picture" /> : supplied ? <img src={`/images/workingMemory/pictures/cards/pic-l${level}-${assetName}.png`} alt={item.alt} /> : <span className="lx-picture-face">
    {sprite && [3, 4].includes(Number(level)) ? <LevelThreeSprite key={`${item.image}:${item.spriteIndex}`} item={item} /> : sprite ? <span role="img" aria-label={item?.alt} style={{ backgroundImage: `url('${item.image}')`, backgroundSize: "600% 600%", backgroundPosition: `${item.spriteIndex % 6 * 20}% ${Math.floor(item.spriteIndex / 6) * 20}%` }} /> : typeof item?.image === "string" ? <PictureArtwork src={item.image} alt={item.alt} /> : <span>{typeof item === "object" ? item.alt : item}</span>}
  </span>;
  return <div className={`lx-picture ${className}`} data-item-id={hidden ? undefined : item?.id} draggable={!hidden && Boolean(onDragStart)} onDragStart={onDragStart} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `Select ${item?.alt || item?.id}` : undefined} onKeyDown={onClick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>{content}</div>;
}
const ICONS = { "🟠": "c-orange", "🔵": "c-blue", "🟢": "c-green", "🟣": "c-purple", "🔺": "tri-red", "🟨": "sq-yellow", "🥕": "carrot", "🍎": "apple", "🌸": "flower", "🍃": "leaf", "🍀": "leaf", "🌿": "leaf", "🌙": "moon", "❤️": "heart", "💗": "heart", "⭐": "star", "🌟": "star" };
export function PatternSymbol({ value }) {
  return <PatternArtwork value={value}>{ICONS[value] ? <img className="lx-pattern-symbol" src={`${UI}/icons/${ICONS[value]}.svg`} alt={value} /> : <span>{value}</span>}</PatternArtwork>;
}

export function DashboardBunny({ happy, message, si }) {
  return <>
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${UI}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}
