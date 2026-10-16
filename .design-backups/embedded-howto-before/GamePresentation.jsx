import { UI } from "../utils/memoryTheme";
import { useEffect, useRef, useState } from "react";
import { MemoryStage, MemoryNav, MemoryTracker, MemoryBunny, MemoryBoard, MemoryButton, MemoryHeading, MemoryTimer, MemoryNumber, MemoryPicture, PatternSymbol } from "./MemoryUI";
import HowToPlayScreen from "./HowToPlayScreen";
import { parseInstructionSteps } from "../utils/helpers";

export default function GamePresentation(p) {
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const { phase, subCategoryKey: game, currentQuestion: q, levelNumber, slots = [], dragPool = [] } = p;
  const title = text({ pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: "Number Recall" }[game], { pattern: "රටා මතකය", words: "පින්තූර මතකය", instructions: "උපදෙස් අනුගමනය", numbers: "අංක මතකය" }[game]);
  const bubble = phase === "feedback" ? text(p.isCurrentCorrect ? "Well done! Keep going!" : "Good try! Let's keep learning!", p.isCurrentCorrect ? "හොඳයි! ඉදිරියට යමු!" : "හොඳ උත්සාහයක්! ඉගෙන ගනිමු!") : phase === "result" ? text("You worked hard! Well done!", "ඔබ හොඳින් උත්සාහ කළා!") : game === "pattern" ? text("Look at the pattern carefully and guess it!", "රටාව හොඳින් බලා පිළිතුර තෝරන්න!") : game === "words" ? text(phase === "answer" ? "Drag and drop the pictures in the correct order!" : p.wordsAwaitingPlay ? "Tap the Ready button when you are ready!" : "Remember the picture order carefully!", phase === "answer" ? "පින්තූර නිවැරදි අනුපිළිවෙලට තබන්න!" : p.wordsAwaitingPlay ? "සූදානම් වූ විට බොත්තම ඔබන්න!" : "පින්තූර අනුපිළිවෙල මතක තබා ගන්න!") : game === "numbers" ? text(phase === "answer" ? "Tap the numbers in the correct order!" : "Remember the number order carefully!", phase === "answer" ? "අංක නිවැරදි අනුපිළිවෙලට ඔබන්න!" : "අංක අනුපිළිවෙල මතක තබා ගන්න!") : text("Choose the correct instruction!", "නිවැරදි උපදෙස තෝරන්න!");
  return <MemoryStage level={levelNumber} className={`lx-game lx-game--${game} lx-phase--${phase}`}>
    <MemoryNav title={`${text("Level", "මට්ටම")} ${levelNumber} • ${title}`} onBack={p.handleBackToLevels} stars={p.totalStars} />
    {phase === "video" ? <HowToPlayScreen levelNumber={levelNumber} gameType={game} videoUrl={p.subCatData?.videoUrl || p.subCatData?.youtubeVideoUrl} onWatchVideo={p.handleReplayVideo} onSkipAndPlay={p.handleSkipAndPlay} language={p.i18n.language} /> : <>
      {!["result", "levelComplete"].includes(phase) && <MemoryTracker current={p.currentIdx + 1} total={p.questions.length} responses={p.results} />}
      {!(game === "instructions" && phase === "show") && <MemoryBunny message={bubble} />}
      <MemoryBoard level={levelNumber} className={phase === "result" ? "lx-results" : ""} data-question-id={q?.id}>
        {phase === "result" ? <GameResults p={p} title={title} si={si} /> : phase === "levelComplete" ? <>
          <img src={`${UI}/icons/star.svg`} alt="" width="95" height="95" /><h1 className="lx-result-title">{text("Level complete!", "මට්ටම සම්පූර්ණයි!")}</h1><p>{text("You finished all four games. Well done!", "ඔබ ක්‍රීඩා හතරම සම්පූර්ණ කළා. හොඳයි!")}</p><MemoryButton onClick={p.handleContinueLevel}>{text(Number(levelNumber) < 4 ? "Next level" : "Back to levels", Number(levelNumber) < 4 ? "ඊළඟ මට්ටම" : "මට්ටම් වෙත")}</MemoryButton>
        </> : phase === "feedback" ? <Feedback p={p} si={si} /> : game === "pattern" ? <>
          <MemoryHeading onListen={() => p.speakText(q.instruction || title)}>{q.questionText || text("Which picture comes next?", "ඊළඟට පැමිණෙන්නේ කුමක්ද?")}</MemoryHeading>
          <div className="lx-pattern-sequence" aria-label="Pattern to complete">{q.showItems.map((item, i) => <div className={`lx-pattern-tile ${item === "?" ? "is-missing" : ""}`} key={i}>{item === "?" ? "?" : <PatternSymbol value={item} />}</div>)}</div>
          <div className="lx-pattern-options">{dragPool.map((option, i) => <button type="button" className="lx-pattern-option" key={`${q.id}-${i}`} aria-label={`Answer: ${option}`} onClick={() => p.handlePatternAnswer(option)}><b>{String.fromCharCode(65 + i)}</b><PatternSymbol value={option} /></button>)}</div>
          <p className="lx-note">{text("Tap your answer.", "ඔබේ පිළිතුර ඔබන්න.")}</p>
        </> : game === "words" ? <>
          <MemoryHeading onListen={() => p.speakText(q.instruction)}>{text(phase === "answer" ? "Put the pictures in the correct order.": "Remember the order of the cards.", phase === "answer" ? "පින්තූර නිවැරදි අනුපිළිවෙලට තබන්න." : "පින්තූර අනුපිළිවෙල මතක තබා ගන්න.")}</MemoryHeading>
          {phase === "show" ? <>
            <div className="lx-row lx-picture-sequence">{q.showItems.map((item, i) => <MemoryPicture key={`${q.id}-${i}`} item={item} level={levelNumber} hidden={p.wordsAwaitingPlay} />)}</div>
            {p.wordsAwaitingPlay ? <div className="lx-reminder"><p>{text(`You will have ${p.pictureMemorySeconds} seconds to memorise the pictures.`, `පින්තූර මතක තබා ගැනීමට තත්පර ${p.pictureMemorySeconds} ක් ලැබේ.`)}</p><MemoryButton variant="play" onClick={p.startWordsMemory}>{text("Ready", "සූදානම්")}</MemoryButton></div> : <MemoryTimer count={p.timerCount} max={p.timerMax} />}
          </> : <>
            <div className="lx-card-rows"><div className="lx-row lx-picture-slots">{slots.map((item, i) => <div key={i} className={`lx-picture-slot ${p.selectedSlotIndex === i ? "is-selected" : ""}`} role="button" tabIndex={0} aria-label={`Position ${i + 1}`} aria-pressed={p.selectedSlotIndex === i} onClick={() => p.handleSlotClick(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.handleSlotClick(i); } }} onDragOver={p.handleDragOver} onDrop={e => p.handleDropOnSlot(e, i)}><small>{i + 1}</small>{item ? <MemoryPicture item={item} level={levelNumber} onDragStart={e => p.handleDragStart(e, "slot", i, item)} /> : "?"}</div>)}</div>
              <div className="lx-row lx-picture-pool">{dragPool.map((item, i) => <MemoryPicture key={`${item.id}-${i}`} item={item} level={levelNumber} onClick={() => p.handleTileClick(item)} onDragStart={e => p.handleDragStart(e, "pool", i, item)} />)}</div></div>
            <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.handleUndo} disabled={!slots.some(Boolean)}>{text("Undo", "ආපසු")}</MemoryButton><MemoryButton variant="secondary" onClick={p.handleStartOver} disabled={!slots.some(Boolean)}>{text("Start over", "නැවත අරඹන්න")}</MemoryButton><MemoryButton onClick={p.handleDragSubmit} disabled={slots.some(v => !v)}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton></div>
          </>}
        </> : game === "numbers" ? <>
          <MemoryHeading onListen={() => p.speakText(q.instruction)}>{phase === "answer" && !q.isBackward ? text("Enter the numbers in the same order.", "අංක එම අනුපිළිවෙලට ඇතුළත් කරන්න.") : q.instruction}</MemoryHeading>
          {phase === "show" ? <><div className="lx-row lx-numbers-show">{q.showItems.map((n, i) => <MemoryNumber key={i} aria-hidden="true" tabIndex={-1}>{n}</MemoryNumber>)}</div><MemoryTimer count={p.timerCount} max={p.timerMax} /></> : <>
            <div className="lx-row lx-number-slots">{slots.map((n, i) => <span className={`lx-number-slot ${n === "" ? "is-empty" : ""}`} key={i} aria-label={`Position ${i + 1}: ${n === "" ? "empty" : n}`}>{n}</span>)}</div>
            <div className="lx-keypad">{Array.from({ length: 10 }, (_, i) => <MemoryNumber key={i} aria-label={`Digit ${i}`} onClick={() => p.handleTileClick(String(i))}>{i}</MemoryNumber>)}</div>
            <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.handleUndo} disabled={slots.every(v => v === "")}>{text("Undo", "ආපසු")}</MemoryButton><MemoryButton onClick={p.handleDragSubmit} disabled={slots.some(v => v === "")}>{text("Submit", "පිළිතුර යවන්න")}</MemoryButton></div>
          </>}
        </> : <InstructionScreen p={p} si={si} />}
      </MemoryBoard>
    </>}
  </MemoryStage>;
}
function Feedback({ p, si }) {
  return <div className={`lx-feedback ${p.isCurrentCorrect ? "" : "is-incorrect"}`} role="status">
    <h2>{si ? p.isCurrentCorrect ? "හොඳයි!" : "හොඳ උත්සාහයක්!" : p.isCurrentCorrect ? "Great job!" : "Good try!"}</h2>
    <p>{si ? p.isCurrentCorrect ? "ඔබ නිවැරදි පිළිතුර තෝරා ගත්තා!" : "අපි දිගටම ඉගෙන ගනිමු." : p.isCurrentCorrect ? "You remembered correctly!" : "Let's keep learning together."}</p>
    {p.isCurrentCorrect && <p>+{p.lastStarReward} {si ? "තරු" : "stars"}</p>}
    {!p.isCurrentCorrect && <div className="lx-feedback-summary"><small>{si ? "නිවැරදි පිළිතුර:" : "Correct answer:"}</small>{p.subCategoryKey === "words" ? p.currentQuestion.correct.map((item, i) => <MemoryPicture key={i} item={item} level={p.levelNumber} />) : <strong>{p.subCategoryKey === "pattern" ? <PatternSymbol value={p.currentQuestion.missingAnswer} /> : Array.isArray(p.currentQuestion.correct) ? p.currentQuestion.correct.join(" · ") : p.currentQuestion.correct}</strong>}</div>}
    <MemoryButton onClick={p.handleNextQuestion}>{si ? p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === p.questions.length - 1 ? "See results" : "Next"}</MemoryButton>
  </div>;
}
function GameResults({ p, title, si }) {
  const passed = p.score >= 3;
  return <>
    <h1 className="lx-result-title">{si ? passed ? "සුබ පැතුම්!" : "හොඳ උත්සාහයක්!" : passed ? "CONGRATULATIONS!" : "NICE TRY!"}</h1><p className="lx-note">{title} · {si ? "මට්ටම" : "Level"} {p.levelNumber}</p>
    <div className="lx-score"><div><small>{si ? "ඔබේ ලකුණු" : "YOUR SCORE"}</small><strong>{p.score} / {p.questions.length}</strong></div><div className="lx-earned-stars">{Array.from({ length: 5 }, (_, i) => <img className={i < p.score ? "is-earned" : ""} key={i} src={`${UI}/icons/star.svg`} alt={i < p.score ? "Earned star" : ""} />)}</div></div>
    <div className="lx-result-stats">{[[si ? "නිවැරදි" : "Correct", p.score], [si ? "වැරදි" : "Incorrect", p.questions.length - p.score], [si ? "ක්‍රීඩාවේ තරු" : "Game stars", p.earnedStars], [si ? "මුළු තරු" : "Total stars", p.totalStars]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <p className="lx-result-notice" role="status">{p.isSubmitting ? (si ? "ප්‍රගතිය සුරකිමින්..." : "Saving your progress…") : p.submissionError ? (si ? "සුරැකීමට නොහැක. නැවත උත්සාහ කරන්න." : "We couldn't save your progress. Please try again.") : passed ? (si ? "හොඳයි! ඔබ ක්‍රීඩාව සමත් වුණා." : "Well done! You passed this game.") : (si ? "ඊළඟ ක්‍රීඩාවට නිවැරදි පිළිතුරු 3 ක් අවශ්‍යයි. නැවත උත්සාහ කරමු!" : "Get 3 correct to unlock the next game. Let's try again!")}</p>
    <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.startQuiz} disabled={p.isSubmitting}>{si ? "නැවත ක්‍රීඩා කරන්න" : "Play again"}</MemoryButton>{p.submissionError ? <MemoryButton onClick={p.handleRetrySave}>{si ? "නැවත සුරකින්න" : "Retry saving"}</MemoryButton> : <MemoryButton variant="play" disabled={!passed || p.isSubmitting || !p.submitResult} onClick={p.handleNextSubCategory}>{si ? "ඊළඟ ක්‍රීඩාව" : "Next game"}</MemoryButton>}</div>
  </>;
}
function InstructionScreen({ p, si }) {
  const [status, setStatus] = useState("idle");
  const token = useRef(0);
  useEffect(() => { const playback = token; playback.current++; return () => { playback.current++; window.speechSynthesis?.cancel(); }; }, [p.currentQuestion.id]);
  const listen = () => {
    if (status === "playing") return;
    const current = ++token.current;
    const steps = parseInstructionSteps(p.currentQuestion.instruction).map(step => step.text);
    setStatus("playing");
    const speak = index => {
      if (current !== token.current) return;
      if (index >= steps.length) { setStatus("done"); return; }
      p.speakText(steps[index], false, () => { if (current !== token.current) return; if (index === steps.length - 1) setStatus("done"); else window.setTimeout(() => speak(index + 1), 1000); });
    };
    speak(0);
  };
  if (p.phase === "answer") return <>
    <MemoryHeading onListen={() => p.speakText(p.currentQuestion.questionText)}>{p.currentQuestion.questionText}</MemoryHeading>
    <div className="lx-instruction-options">{p.dragPool.map((option, i) => <button className="lx-instruction-option" type="button" key={option} onClick={() => p.handleInstructionAnswer(option)}><span className="lx-number" aria-hidden="true">{i + 1}</span><span>{option}</span></button>)}</div>
  </>;
  return <>
    <MemoryHeading>{si ? "හොඳින් සවන් දී පියවර මතක තබා ගන්න." : "Listen carefully and remember the steps in order."}</MemoryHeading>
    <div className="lx-listening-scene">{[0, 1].map(i => <div className={`lx-waves ${status === "playing" ? "is-playing" : ""}`} key={i} style={{ order: i === 0 ? 0 : 2 }} aria-hidden="true"><i /><i /><i /></div>)}<img className="lx-listening-bunny" style={{ order: 1 }} src={`${UI}/characters/bunny.webp`} alt="Bunny listening" /></div>
    <p className="lx-note" role="status">{si ? status === "idle" ? "සූදානම් වූ විට සවන් දෙන්න බොත්තම ඔබන්න." : status === "playing" ? "සවන් දෙන්න..." : "දැන් ප්‍රශ්නය බැලිය හැක." : status === "idle" ? "When you're ready, click Listen and listen carefully!" : status === "playing" ? "Listening…" : "You're ready to see the question."}</p>
    <div className="lx-actions"><MemoryButton variant="secondary" onClick={listen} disabled={status === "playing"}>{si ? status === "done" ? "නැවත සවන් දෙන්න" : "සවන් දෙන්න" : status === "done" ? "Listen Again" : "Listen"}</MemoryButton>{status === "done" && <MemoryButton onClick={p.handleInstructionReady}>{si ? "ප්‍රශ්නය පෙන්වන්න" : "Show the Question"}</MemoryButton>}</div>
  </>;
}
