import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMemoryMusic } from "../utils/memoryMusic";
import "../styles/memoryUI.css";

import { UI, LEVEL_THEMES } from "../utils/memoryTheme";
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
    const sources = [`${UI}/vine-board.webp`, `${UI}/nav/nav-tracker.png`, `${UI}/characters/bunny.webp`, "/images/workingMemory/improve/themes/how-to-boards/L1.png", `${UI}/cards/pic-l${level}-back.png`, `${UI}/buckets/bucket-level${level}.png`, `${UI}/buttons/btn-${theme.button}.png`];
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
export function MemoryNav({ title, onBack, stars = 0, language = false, map = false }) {
  const { i18n } = useTranslation();
  const { muted, toggle } = useMemoryMusic();
  return <header className="lx-nav">
    <div className="lx-nav-left">
      <button className="lx-nav-icon" type="button" onClick={onBack} aria-label={map ? "Back to dashboard" : "Back to game menu"}><img src={`${UI}/nav/nav-back.png`} alt="" /></button>
      <div className="lx-nav-title">{title}</div>
    </div>
    <div className="lx-nav-right">
      <div className="lx-nav-stars" aria-label={`${stars} stars`}><img src={`${UI}/nav/nav-star-pill.png`} alt="" /><strong>{stars}</strong></div>
      <button className={`lx-nav-icon ${muted ? "is-muted" : ""}`} type="button" onClick={toggle} aria-label={muted ? "Unmute music" : "Mute music"} aria-pressed={muted}><img src={`${UI}/nav/nav-music.png`} alt="" />{muted && <span className="lx-mute-slash" />}</button>
      {language && <div className="lx-nav-language" style={{ backgroundImage: `url('${UI}/nav/nav-lang-${i18n.language?.startsWith("si") ? "si" : "en"}.png')` }}>
        <button onClick={() => i18n.changeLanguage("en")} aria-pressed={!i18n.language?.startsWith("si")}>EN</button><button lang="si" onClick={() => i18n.changeLanguage("si")} aria-pressed={i18n.language?.startsWith("si")}>සිං</button>
      </div>}
    </div>
  </header>;
}
export function MemoryTracker({ current = 1, total = 5, responses = [] }) {
  return <ol className={`lx-tracker ${total > 5 ? "lx-tracker--long" : ""}`} aria-label={`Question ${current} of ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const done = i < current - 1 || Boolean(responses[i]);
      return <li key={i} className={`lx-step ${done ? "is-done" : i === current - 1 ? "is-current" : "is-upcoming"}`} aria-current={i === current - 1 ? "step" : undefined} aria-label={`Question ${i + 1}${done ? ": completed" : ""}`}>
        {total > 5 && <><img src={`${UI}/buttons/btn-orange.png`} alt="" /><span>{i + 1}</span></>}{done && <b aria-hidden="true">✓</b>}
      </li>;
    })}
  </ol>;
}
export function MemoryBunny({ message }) {
  return <>{message && <aside className="lx-thought"><p>{message}</p><i /><i /></aside>}<img className="lx-bunny" src={`${UI}/characters/bunny.webp`} alt="" /></>;
}
export function MemoryBoard({ children, level = 1, className = "", ...props }) {
  return <><section {...props} className={`lx-board ${className}`}><div className="lx-board-content">{children}</div></section><img className="lx-bucket" src={`${UI}/buckets/bucket-level${level}.png`} alt="" /></>;
}
export function MemoryHeading({ children, onListen }) {
  return <h1 className="lx-question-heading"><span>{children}</span>{onListen && <button type="button" className="lx-speaker" onClick={onListen} aria-label="Listen to the question"><img src="/images/phonologicalAwareness/Improvement/speaker.png" alt="" /></button>}</h1>;
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
  const supplied = FRONTS[level]?.includes(assetName);
  const sprite = Number.isInteger(item?.spriteIndex);
  const content = hidden ? <img src={`${UI}/cards/pic-l${level}-back.png`} alt="Face-down picture" /> : supplied ? <img src={`${UI}/cards/pic-l${level}-${assetName}.png`} alt={item.alt} /> : <span className="lx-picture-face">
    {sprite ? <span role="img" aria-label={item?.alt} style={{ backgroundImage: `url('${item.image}')`, backgroundSize: "600% 600%", backgroundPosition: `${item.spriteIndex % 6 * 20}% ${Math.floor(item.spriteIndex / 6) * 20}%` }} /> : typeof item?.image === "string" ? <img src={item.image} alt={item.alt} /> : <span>{typeof item === "object" ? item.alt : item}</span>}
  </span>;
  return <div className={`lx-picture ${className}`} data-item-id={hidden ? undefined : item?.id} draggable={!hidden && Boolean(onDragStart)} onDragStart={onDragStart} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `Select ${item?.alt || item?.id}` : undefined} onKeyDown={onClick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>{content}</div>;
}
const ICONS = { "🟠": "c-orange", "🔵": "c-blue", "🟢": "c-green", "🟣": "c-purple", "🔺": "tri-red", "🟨": "sq-yellow", "🥕": "carrot", "🍎": "apple", "🌸": "flower", "🍃": "leaf", "🍀": "leaf", "🌿": "leaf", "🌙": "moon", "❤️": "heart", "💗": "heart", "⭐": "star", "🌟": "star" };
export function PatternSymbol({ value }) {
  return ICONS[value] ? <img className="lx-pattern-symbol" src={`${UI}/icons/${ICONS[value]}.svg`} alt={value} /> : <span>{value}</span>;
}
