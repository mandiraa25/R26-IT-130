/*
 * FILE PURPOSE
 * Picture Memory study and recall view; stored under the historic game key words.
 *
 * HOW IT CONNECTS
 * ActivityScreen passes question, phase, slots, pool, timer and tap/drag/swap/undo callbacks from
 * ImprovementPage. MemoryPicture renders each picture.
 * Direct source importers: ../ActivityScreen.jsx.
 * Local feature/style dependencies: ../../shared/GameLayout.jsx, ../../config/gameConfig.js.
 *
 * THINGS TO REMEMBER
 * Ready reveals the ordered pictures for ten seconds. After hiding, the child rebuilds the order in
 * answer slots. The parent owns arrangement, checking and reward state. The current controller pool
 * contains only the remembered pictures, even if data also defines distractors. memoryUI.css,
 * gameLevels.css and improvementLayout.css style the rows and controls.
 */

// VIVA: Picture study cards, recall slots, shuffled cards and answer actions.
import { MemoryHeading, MemoryPicture, MemoryTimer, MemoryButton } from "../../shared/GameLayout";
import { getImprovementBunnyMessage } from "../../config/gameConfig";

// The controller owns card order, timers and answers; this component displays them.
/*
 * FUNCTION / COMPONENT: PictureMemoryGame
 * React renders this component when its parent uses <PictureMemoryGame /> or when its state/props
 * change.
 * INPUT PROPS: p. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function PictureMemoryGame(p) {
  // VIVA: Ready reveals the ordered pictures for ten seconds. During recall,
  // slots/pool and their tap, drag, swap and Undo callbacks come from the parent.
  const { phase, currentQuestion: q, levelNumber, slots = [], dragPool = [] } = p;
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const activityPhase = phase === "feedback" ? "answer" : phase;
  const levelOne = [1, 2, 3, 4].includes(Number(levelNumber));
  const instruction = getImprovementBunnyMessage({ game: "words", phase: activityPhase, awaiting: p.wordsAwaitingPlay, si });
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
          {/* VIVA: Read-aloud guidance sits above the picture activity. */}
          <MemoryHeading onListen={() => p.speakText(instruction)}>{instruction}</MemoryHeading>
          {activityPhase === "show" ? <>
            {/* VIVA: Ordered pictures and the Ready/countdown area are here. */}
            <div className="lx-row lx-picture-sequence">{/* UI SECTION: Picture study row: Ready hides/reveals the ordered card artwork before recall. */}{q.showItems.map((item, i) => <MemoryPicture key={`${q.id}-${i}`} item={item} level={levelNumber} hidden={p.wordsAwaitingPlay} />)}</div>
            {p.wordsAwaitingPlay ? <div className="lx-reminder"><p>{text(`The pictures will appear for ${p.pictureMemorySeconds} seconds.`, `පින්තූර තත්පර ${p.pictureMemorySeconds} ක් පෙනේ.`)}</p><MemoryButton variant="play" onClick={p.startWordsMemory}>{text("Ready", "සූදානම්")}</MemoryButton></div> : <MemoryTimer count={p.timerCount} max={p.timerMax} />}
          </> : <>
            {/* VIVA: Recall slots and draggable/tappable picture choices are here. */}
            <div className="lx-card-rows">{/* UI SECTION: Picture recall: answer slots above a movable picture pool; taps, drags and swaps call controller handlers. */}<div className="lx-row lx-picture-slots">{slots.map((item, i) => <div key={i} className={`lx-picture-slot ${p.selectedSlotIndex === i ? "is-selected" : ""}`} role="button" tabIndex={0} aria-label={`Position ${i + 1}`} aria-pressed={p.selectedSlotIndex === i} onClick={() => p.handleSlotClick(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.handleSlotClick(i); } }} onDragOver={p.handleDragOver} onDrop={e => p.handleDropOnSlot(e, i)}><small>{i + 1}</small>{item ? <MemoryPicture item={item} level={levelNumber} onDragStart={e => p.handleDragStart(e, "slot", i, item)} /> : "?"}</div>)}</div>
              <div className="lx-row lx-picture-pool">{dragPool.map((item, i) => <MemoryPicture key={`${item.id}-${i}`} item={item} level={levelNumber} onClick={() => p.handleTileClick(item)} onDragStart={e => p.handleDragStart(e, "pool", i, item)} />)}</div></div>
            <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.handleUndo} disabled={!slots.some(Boolean)}>{text("Undo", "ආපසු")}</MemoryButton>{!levelOne && <MemoryButton variant="secondary" onClick={p.handleStartOver} disabled={!slots.some(Boolean)}>{text("Start over", "නැවත අරඹන්න")}</MemoryButton>}<MemoryButton onClick={p.handleDragSubmit} disabled={slots.some(v => !v)}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton></div>
          </>}
        </>;
}
