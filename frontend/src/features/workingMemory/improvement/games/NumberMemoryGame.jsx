/*
 * FILE PURPOSE
 * Number Memory Ready, timed reveal and recall view with a digit keypad.
 *
 * HOW IT CONNECTS
 * ActivityScreen supplies the controller props. gameConfig supplies guidance; GameLayout supplies
 * headings/timer/buttons. Keypad taps call playKeypadTone and handleTileClick.
 * Direct source importers: ../ActivityScreen.jsx.
 * Local feature/style dependencies: ../../shared/GameLayout.jsx, ../../config/gameConfig.js,
 * ../../logic/audio.js.
 *
 * THINGS TO REMEMBER
 * Numbers are authored in numbers/bank.js, not randomly generated here. Ready starts a
 * 12/10/8/6-second reveal by level. Recall uses a reusable 0-9 keypad, Undo and Submit. Backward
 * questions already store their reversed correct sequence. gameLevels.css and improvementLayout.css
 * refine the base styles.
 */

// VIVA: Number Ready/reveal/recall displays with keypad, Undo and Submit.
import { MemoryHeading, MemoryNumber, MemoryTimer, MemoryButton } from "../../shared/GameLayout";
import { numberStageInstruction } from "../../config/gameConfig";
import { playKeypadTone } from "../../logic/audio";

/*
 * FUNCTION / COMPONENT: NumberMemoryGame
 * React renders this component when its parent uses <NumberMemoryGame /> or when its state/props
 * change.
 * INPUT PROPS: p. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function NumberMemoryGame(p) {
  // VIVA: Ready -> reveal -> recall are derived from parent props. Reveal time
  // is 12/10/8/6 seconds by level; recall uses a reusable 0-9 keypad and Submit.
  const { phase, currentQuestion: q, slots = [] } = p;
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const ready = phase === "show" && p.numbersAwaitingPlay;
  const revealing = phase === "show" && !p.numbersAwaitingPlay;
  const recalling = phase === "answer" || phase === "feedback";
  if (!q || !(ready || revealing || recalling)) return null;

  const numberInstruction = numberStageInstruction({ recall: recalling, awaiting: ready, backward: q.isBackward, si });
  // VIVA: Backward questions already store their reversed correct sequence in
  // the bank; this flag changes guidance, while the controller checks the answer.
  const hasEmptySlot = slots.length === 0 || slots.some(value => value === "" || value === null);

  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: The prompt explains forward or backward recall. */}
    <MemoryHeading onListen={() => p.speakText(numberInstruction)}>{numberInstruction}</MemoryHeading>
    {ready && <div className="lx-number-ready" data-number-stage="ready">
      {/* VIVA: Concealed number cards wait here for Ready. */}
      <div className="lx-row lx-number-concealed" aria-hidden="true">
        {q.showItems.map((_, index) => <MemoryNumber key={index} className="lx-number-blank" disabled tabIndex={-1} />)}
      </div>
      {/* Same reminder as Picture Memory, with this level's display time. */}
      <div className="lx-reminder"><p>{text(`You have ${p.numberMemorySeconds} seconds to remember these numbers. Tap Ready when you are ready!`, `මෙම අංක මතක තබා ගැනීමට ඔබට තත්පර ${p.numberMemorySeconds} ක් ඇත. සූදානම් වූ විට සූදානම් ඔබන්න!`)}</p><MemoryButton variant="play" onClick={p.handleNumbersReady}>{text("Ready", "සූදානම්")}</MemoryButton></div>
    </div>}
    {revealing && <>
      {/* VIVA: The remembered sequence and reveal timer are here. */}
      <div className="lx-row lx-numbers-show" data-number-stage="reveal">
        {q.showItems.map((number, index) => <MemoryNumber key={index} aria-hidden="true" tabIndex={-1}>{number}</MemoryNumber>)}
      </div>
      <MemoryTimer count={p.timerCount} max={p.timerMax} />
    </>}
    {recalling && <>
      {/* VIVA: Answer slots, the reusable keypad and submit actions are here. */}
      <div className="lx-row lx-number-slots" data-number-stage="recall" role="group" aria-label={text("Your answer", "ඔබේ පිළිතුර")}>{/* UI SECTION: Number recall positions: the student sequence, including empty slots, is stored by the parent. */}
        {slots.map((number, index) => <span className={`lx-number-slot ${number === "" ? "is-empty" : ""}`} key={index} aria-label={`Position ${index + 1}: ${number === "" ? "empty" : number}`}>{number}</span>)}
      </div>
      <div className="lx-keypad">{/* UI SECTION: Number keypad: digits can repeat; buttons fill slots and play a short tone. */}
        {Array.from({ length: 10 }, (_, digit) => <MemoryNumber key={digit} aria-label={`Digit ${digit}`} onClick={() => { playKeypadTone(digit); p.handleTileClick(String(digit)); }} disabled={phase !== "answer" || !hasEmptySlot}>{digit}</MemoryNumber>)}
      </div>
      {/* After checking, the keypad stays (disabled) and Next replaces Undo/Submit. */}
      {phase === "answer" && <div className="lx-actions">
        <MemoryButton variant="secondary" onClick={p.handleUndo} disabled={phase !== "answer" || slots.every(value => value === "")}>{text("Undo", "ආපසු")}</MemoryButton>
        <MemoryButton onClick={p.handleDragSubmit} disabled={phase !== "answer" || hasEmptySlot}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton>
      </div>}
    </>}
  </>;
}
