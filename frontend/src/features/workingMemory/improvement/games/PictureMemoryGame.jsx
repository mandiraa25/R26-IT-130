import { MemoryHeading, MemoryPicture, MemoryTimer, MemoryButton } from "../../shared/GameLayout";

// The controller owns card order, timers and answers; this component displays them.
export default function PictureMemoryGame(p) {
  const { phase, currentQuestion: q, levelNumber, slots = [], dragPool = [] } = p;
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const activityPhase = phase === "feedback" ? "answer" : phase;
  const levelOne = [1, 2, 3, 4].includes(Number(levelNumber));
  return <>
          <MemoryHeading onListen={() => p.speakText(q.instruction)}>{text(activityPhase === "answer" ? "Put the pictures in the correct order.": "Remember the order of the cards.", activityPhase === "answer" ? "පින්තූර නිවැරදි අනුපිළිවෙලට තබන්න." : "පින්තූර අනුපිළිවෙල මතක තබා ගන්න.")}</MemoryHeading>
          {activityPhase === "show" ? <>
            <div className="lx-row lx-picture-sequence">{q.showItems.map((item, i) => <MemoryPicture key={`${q.id}-${i}`} item={item} level={levelNumber} hidden={p.wordsAwaitingPlay} />)}</div>
            {p.wordsAwaitingPlay ? <div className="lx-reminder"><p>{text(`You will have ${p.pictureMemorySeconds} seconds to memorise the pictures.`, `පින්තූර මතක තබා ගැනීමට තත්පර ${p.pictureMemorySeconds} ක් ලැබේ.`)}</p><MemoryButton variant="play" onClick={p.startWordsMemory}>{text("Ready", "සූදානම්")}</MemoryButton></div> : <MemoryTimer count={p.timerCount} max={p.timerMax} />}
          </> : <>
            <div className="lx-card-rows"><div className="lx-row lx-picture-slots">{slots.map((item, i) => <div key={i} className={`lx-picture-slot ${p.selectedSlotIndex === i ? "is-selected" : ""}`} role="button" tabIndex={0} aria-label={`Position ${i + 1}`} aria-pressed={p.selectedSlotIndex === i} onClick={() => p.handleSlotClick(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.handleSlotClick(i); } }} onDragOver={p.handleDragOver} onDrop={e => p.handleDropOnSlot(e, i)}><small>{i + 1}</small>{item ? <MemoryPicture item={item} level={levelNumber} onDragStart={e => p.handleDragStart(e, "slot", i, item)} /> : "?"}</div>)}</div>
              <div className="lx-row lx-picture-pool">{dragPool.map((item, i) => <MemoryPicture key={`${item.id}-${i}`} item={item} level={levelNumber} onClick={() => p.handleTileClick(item)} onDragStart={e => p.handleDragStart(e, "pool", i, item)} />)}</div></div>
            <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.handleUndo} disabled={!slots.some(Boolean)}>{text("Undo", "ආපසු")}</MemoryButton>{!levelOne && <MemoryButton variant="secondary" onClick={p.handleStartOver} disabled={!slots.some(Boolean)}>{text("Start over", "නැවත අරඹන්න")}</MemoryButton>}<MemoryButton onClick={p.handleDragSubmit} disabled={slots.some(v => !v)}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton></div>
          </>}
        </>;
}
