import { MemoryHeading, MemoryNumber, MemoryTimer, MemoryButton } from "../../shared/GameLayout";
import { numberStageInstruction } from "../../config/gameConfig";

export default function NumberMemoryGame(p) {
  const { phase, currentQuestion: q, slots = [] } = p;
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const ready = phase === "show" && p.numbersAwaitingPlay;
  const revealing = phase === "show" && !p.numbersAwaitingPlay;
  const recalling = phase === "answer" || phase === "feedback";
  if (!q || !(ready || revealing || recalling)) return null;

  const numberInstruction = numberStageInstruction({ recall: recalling, awaiting: ready, backward: q.isBackward, si });
  const hasEmptySlot = slots.length === 0 || slots.some(value => value === "" || value === null);

  return <>
    <MemoryHeading onListen={() => p.speakText(numberInstruction)}>{numberInstruction}</MemoryHeading>
    {ready && <div className="lx-number-ready" data-number-stage="ready">
      <div className="lx-row lx-number-concealed" aria-hidden="true">
        {q.showItems.map((_, index) => <MemoryNumber key={index} className="lx-number-blank" disabled tabIndex={-1} />)}
      </div>
      <p className="lx-note">{text(`Tap Ready. Watch for ${p.numberMemorySeconds} seconds.`, `සූදානම් ඔබන්න. තත්පර ${p.numberMemorySeconds} ක් බලන්න.`)}</p>
      <MemoryButton onClick={p.handleNumbersReady}>{text("Ready", "සූදානම්")}</MemoryButton>
    </div>}
    {revealing && <>
      <div className="lx-row lx-numbers-show" data-number-stage="reveal">
        {q.showItems.map((number, index) => <MemoryNumber key={index} aria-hidden="true" tabIndex={-1}>{number}</MemoryNumber>)}
      </div>
      <MemoryTimer count={p.timerCount} max={p.timerMax} />
    </>}
    {recalling && <>
      <div className="lx-row lx-number-slots" data-number-stage="recall" role="group" aria-label={text("Your answer", "ඔබේ පිළිතුර")}>
        {slots.map((number, index) => <span className={`lx-number-slot ${number === "" ? "is-empty" : ""}`} key={index} aria-label={`Position ${index + 1}: ${number === "" ? "empty" : number}`}>{number}</span>)}
      </div>
      <div className="lx-keypad">
        {Array.from({ length: 10 }, (_, digit) => <MemoryNumber key={digit} aria-label={`Digit ${digit}`} onClick={() => p.handleTileClick(String(digit))} disabled={phase !== "answer" || !hasEmptySlot}>{digit}</MemoryNumber>)}
      </div>
      <div className="lx-actions">
        <MemoryButton variant="secondary" onClick={p.handleUndo} disabled={phase !== "answer" || slots.every(value => value === "")}>{text("Undo", "ආපසු")}</MemoryButton>
        <MemoryButton onClick={p.handleDragSubmit} disabled={phase !== "answer" || hasEmptySlot}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton>
      </div>
    </>}
  </>;
}
