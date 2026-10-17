import { MemoryHeading, MemoryNumber, MemoryTimer, MemoryButton } from "../../shared/GameLayout";
import { numberStageInstruction } from "../../config/gameConfig";

export default function NumberMemoryGame(p) {
  const { phase, currentQuestion: q, levelNumber, slots = [] } = p;
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const activityPhase = phase === "feedback" ? "answer" : phase;
  const levelThree = Number(levelNumber) === 3;
  const levelFour = Number(levelNumber) === 4;
  const levelOne = [1, 2, 3, 4].includes(Number(levelNumber));
  const numberInstruction = levelThree || levelFour ? numberStageInstruction({ recall: activityPhase === "answer", awaiting: p.numbersAwaitingPlay, backward: q?.isBackward, si }) : null;
  return <>
          <MemoryHeading onListen={() => p.speakText(numberInstruction || q.instruction)}>{levelThree || levelFour ? numberInstruction : activityPhase === "answer" && !q.isBackward ? text("Enter the numbers in the same order.", "අංක එම අනුපිළිවෙලට ඇතුළත් කරන්න.") : q.instruction}</MemoryHeading>
          {phase === "show" ? levelOne && p.numbersAwaitingPlay ? <div className="lx-number-ready">
            <div className="lx-number-concealed" aria-hidden="true">{q.showItems.map((_, i) => <span key={i}>?</span>)}</div>
            <p className="lx-note">{text(`Tap Ready to see the numbers for ${p.numberMemorySeconds} seconds.`, `අංක තත්පර ${p.numberMemorySeconds} ක් බැලීමට සූදානම් බොත්තම ඔබන්න.`)}</p>
            <MemoryButton onClick={p.handleNumbersReady}>{text("Ready", "සූදානම්")}</MemoryButton>
          </div> : <><div className="lx-row lx-numbers-show">{q.showItems.map((n, i) => <MemoryNumber key={i} aria-hidden="true" tabIndex={-1}>{n}</MemoryNumber>)}</div><MemoryTimer count={p.timerCount} max={p.timerMax} /></> : <>
            <div className="lx-row lx-number-slots">{slots.map((n, i) => <span className={`lx-number-slot ${n === "" ? "is-empty" : ""}`} key={i} aria-label={`Position ${i + 1}: ${n === "" ? "empty" : n}`}>{n}</span>)}</div>
            <div className="lx-keypad">{Array.from({ length: 10 }, (_, i) => <MemoryNumber key={i} aria-label={`Digit ${i}`} onClick={() => p.handleTileClick(String(i))}>{i}</MemoryNumber>)}</div>
            <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.handleUndo} disabled={slots.every(v => v === "")}>{text("Undo", "ආපසු")}</MemoryButton><MemoryButton onClick={p.handleDragSubmit} disabled={slots.some(v => v === "")}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton></div>
          </>}
        </>;
}
