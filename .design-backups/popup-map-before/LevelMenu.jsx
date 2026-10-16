import { UI } from "../utils/memoryTheme";


const GAMES = [
  { key:"pattern", name:"Pattern", si:"රටා", colour:"#F08A1C", dark:"#C9620A", badge:"star", icons:["carrot","flower","carrot","flower","carrot"] },
  { key:"words", name:"Picture Game", si:"පින්තූර", colour:"#43A832", dark:"#2F7F22", badge:"leaf", icons:["carrot","leaf","flower","star"] },
  { key:"instructions", name:"Instructions", si:"උපදෙස්", colour:"#E8478E", dark:"#B8276A", badge:null, icons:["leaf","carrot","flower"] },
  { key:"numbers", name:"Numbers", si:"අංක", colour:"#8A55D8", dark:"#6233AE", badge:null, icons:[] },
];
export default function LevelMenu({ level, progress, onSelect, onLocked, si }) {
  return <>
    <section className="lx-menu-board" aria-label={`${si ? "මට්ටම" : "Level"} ${level} game menu`}>
      <h1 className="lx-menu-title">{si ? "මට්ටම" : "Level"} {level}</h1><h2 className="lx-menu-question">{si ? "ඔබ ක්‍රීඩා කිරීමට කැමති කුමක්ද?" : "Which game would you like to play?"}</h2>
      <div className="lx-menu-games">{GAMES.map(game => {
        const unlocked = progress.find(p => p.subCategoryKey === game.key)?.isUnlocked;
        return <button key={game.key} type="button" className={`lx-menu-game ${unlocked ? "" : "is-locked"}`} style={{ "--game-c":game.colour,"--game-d":game.dark }} onClick={() => unlocked ? onSelect(game.key) : onLocked()} aria-label={`${si ? game.si : game.name}${unlocked ? "" : ", locked"}`}>
          <span className="lx-menu-badge">{game.badge ? <img src={`${UI}/icons/${game.badge}.svg`} alt="" /> : game.key === "numbers" ? "123" : <img src="/images/phonologicalAwareness/Improvement/speaker.png" alt="" />}</span>
          <div className="lx-menu-preview">{game.key === "numbers" ? [1,2,3].map((n,i) => <span className="lx-number" key={n} style={{backgroundImage:`url('${UI}/buttons/btn-${["orange","green","purple"][i]}.png')`}}>{n}</span>) : game.icons.map((icon,i) => <span key={i}><img src={`${UI}/icons/${icon}.svg`} alt="" /></span>)}</div>
          <div className="lx-menu-name"><span>{si ? game.si : game.name}</span><b aria-hidden="true">{unlocked ? "▶" : "🔒"}</b></div>
        </button>;
      })}</div>
    </section><img className="lx-menu-bunny" src={`${UI}/characters/bunny.webp`} alt="" />
  </>;
}
