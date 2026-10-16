import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useEffect } from "react";
import { MemoryBoard, MemoryBunny, MemoryHeading, MemoryTracker, PatternSymbol } from "./MemoryUI";
import "../styles/patternReference.css";

const ART = "/images/workingMemory/pattern";

export default function PatternPresentation({ p, si }) {
  useEffect(() => {
    for (const name of ["bunny-happy", "bunny-sad", "trophy", "star"]) {
      const image = new Image(); image.src = `${ART}/${name}.webp`;
      image.decode().catch(() => {});
    }
  }, []);
  if (p.phase === "result") return <PatternResults p={p} si={si} />;
  const q = p.currentQuestion;
  const answered = p.phase === "feedback";
  return <>
    <MemoryTracker current={p.currentIdx + 1} total={p.questions.length} responses={p.results} />
    <MemoryBunny message={si ? "රටාව හොඳින් බලා පිළිතුර තෝරන්න!" : "Look at the pattern carefully and guess it!"} />
    <MemoryBoard level={p.levelNumber} className="lx-pattern-question" data-question-id={q?.id}>
      <MemoryHeading onListen={() => p.speakText(q.instruction)}>{q.questionText || (si ? "ඊළඟට පැමිණෙන්නේ කුමක්ද?" : "Which picture comes next?")}</MemoryHeading>
      <div className="lx-pattern-sequence" aria-label={si ? "සම්පූර්ණ කළ යුතු රටාව" : "Pattern to complete"}>{q.showItems.map((item, i) => <div key={i} className={`lx-pattern-tile ${item === "?" ? "is-missing" : ""}`}>{item === "?" ? "?" : <PatternSymbol value={item} />}</div>)}</div>
      <div className="lx-pattern-options">{p.dragPool.map((option, i) => {
        const selected = answered && p.lastUserAnswer === option;
        return <button key={`${q.id}-${i}`} type="button" className={`lx-pattern-option ${selected ? "is-selected" : ""}`} aria-label={`Answer: ${option}`} aria-pressed={selected} disabled={answered} onClick={() => p.handlePatternAnswer(option)}><b aria-hidden="true">{String.fromCharCode(65 + i)}</b><PatternSymbol value={option} /></button>;
      })}</div>
      <div className="lx-pattern-response">
        {answered ? <>
          <p className={`lx-pattern-toast ${p.isCurrentCorrect ? "is-correct" : "is-incorrect"}`} role="status">{p.isCurrentCorrect ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}<span>{si ? p.isCurrentCorrect ? "හොඳයි!" : "හොඳ උත්සාහයක්! ඉදිරියට යමු." : p.isCurrentCorrect ? "Great job!" : "Good try! Let's keep going."}</span></p>
          <button type="button" className="lx-pattern-next" onClick={p.handleNextQuestion}>{si ? p.currentIdx === 4 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === 4 ? "See results" : "Next"}<ArrowRight aria-hidden="true" /></button>
        </> : <p className="lx-note">{si ? "ඔබේ පිළිතුර තෝරන්න." : "Tap your answer."}</p>}
      </div>
    </MemoryBoard>
  </>;
}

function PatternResults({ p, si }) {
  const passed = p.score >= 3;
  const text = (en, sinhala) => si ? sinhala : en;
  const nextDisabled = !passed || p.isSubmitting || !p.submitResult;
  return <>
    <img className="lx-pattern-result-bunny" src={`${ART}/bunny-${passed ? "happy" : "sad"}.webp`} alt={text(passed ? "Happy bunny" : "Encouraging bunny", passed ? "සතුටු හාවා" : "දිරිගන්වන හාවා")} />
    <aside className="lx-pattern-speech">{text(passed ? "Well done!" : "Oops! Let's try again!", passed ? "හොඳයි!" : "නැවත උත්සාහ කරමු!")}</aside>
    <MemoryBoard level={p.levelNumber} className={`lx-pattern-reference-board lx-pattern-result ${passed ? "is-passed" : "is-retry"}`} data-testid="pattern-results">
      <header className="lx-pattern-result-heading">
        {passed && <img src={`${ART}/trophy.webp`} alt="" />}
        <div><h1>{text(passed ? "Great Job!" : "No Worries!", passed ? "හොඳයි!" : "කමක් නැහැ!")}</h1><p>{text(passed ? `You finished Pattern Recognition · Level ${p.levelNumber}` : "Let's Try Again!", passed ? `රටා මතකය · මට්ටම ${p.levelNumber} සම්පූර්ණයි` : "නැවත උත්සාහ කරමු!")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score ${p.score} out of 5`, `ඔබේ ලකුණු 5 න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="pattern-score">{p.score} / {p.questions.length}</strong></div>
        <div className="lx-pattern-stars">{Array.from({length:5},(_,i)=><img key={i} className={i<p.score ? "is-earned" : ""} src={`${ART}/star.webp`} alt={text(i<p.score ? "Earned star" : "Unearned star", i<p.score ? "ලැබුණු තරුව" : "නොලැබුණු තරුව")} />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{p.questions.length-p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong>{p.earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status">{p.isSubmitting ? text("Saving your progress…", "ප්‍රගතිය සුරකිමින්...") : p.submissionError ? text("We couldn't save your progress. Please retry saving.", "ප්‍රගතිය සුරැකීමට නොහැක. නැවත සුරකින්න.") : passed ? text("Passed! You can continue to the next game.", "සමත්! ඊළඟ ක්‍රීඩාවට යා හැක.") : text("Get at least 3 out of 5 correct to unlock the next game.", "ඊළඟ ක්‍රීඩාවට 5 න් 3 ක් නිවැරදිව පිළිතුරු දෙන්න.")}</p>
      <div className="lx-pattern-result-actions">
        <button type="button" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text(passed ? "Play again" : "Try again", passed ? "නැවත ක්‍රීඩා කරන්න" : "නැවත උත්සාහ කරන්න")}</button>
        <button type="button" className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : nextDisabled} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{text(p.submissionError ? "Retry saving" : "Next game", p.submissionError ? "නැවත සුරකින්න" : "ඊළඟ ක්‍රීඩාව")}<ArrowRight aria-hidden="true" /></button>
      </div>
    </MemoryBoard>
  </>;
}
