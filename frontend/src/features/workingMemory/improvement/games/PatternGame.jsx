/*
 * FILE PURPOSE
 * Pattern question view with local selection, a Check button and feedback; also retains a legacy
 * result view.
 *
 * HOW IT CONNECTS
 * ActivityScreen passes controller props. PatternQuestion draws q.showItems and p.dragPool using
 * PatternSymbol, then calls handlePatternAnswer. The controller uses evaluatePatternAnswer and later
 * handleNextQuestion.
 * Direct source importers: ../ActivityScreen.jsx.
 * Local feature/style dependencies: ../../shared/GameLayout.jsx, ../../shared/Feedback.jsx,
 * ../../config/gameConfig.js, ../../styles/patternReference.css.
 *
 * THINGS TO REMEMBER
 * selectedAnswer remembers a choice until Check; checked prevents duplicate checks. Patterns are
 * authored, not generated during play. grid questions use one board image instead of separate sequence
 * symbols. patternReference.css and shared game styles control layout. Supported levels currently use
 * ActivityResults before the legacy PatternResults branch.
 */

// VIVA: Pattern sequence, selectable answer pieces, Check and feedback controls.
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MemoryBoard, MemoryBunny, MemoryHeading, MemoryTracker, PatternSymbol } from "../../shared/GameLayout";
import Feedback from "../../shared/Feedback";
import { getImprovementBunnyMessage } from "../../config/gameConfig";
import "../../styles/patternReference.css";

const ART = "/images/workingMemory/shared";

/*
 * FUNCTION / COMPONENT: PatternGame
 * React renders this component when its parent uses <PatternGame /> or when its state/props change.
 * INPUT PROPS: p. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function PatternGame(p) {
  const si = p.i18n.language?.startsWith("si");
  /*
   * EFFECT: After React renders
   * Preload artwork before the child reaches its next screen; it changes download timing, not answers.
   * DEPENDENCIES: [] means mount once; a returned cleanup runs on unmount.
   */
  useEffect(() => {
    for (const name of ["bunny/bunny-happy", "bunny/bunny-sad", "feedback/trophy", "feedback/star"]) {
      const image = new Image(); image.src = `${ART}/${name}.webp`;
      image.decode().catch(() => {});
    }
  }, []);
  if (p.phase === "result") return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <PatternResults p={p} si={si} />;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <PatternQuestion key={`${p.currentQuestion?.id}-${p.currentIdx}`} p={p} si={si} />;
}

/*
 * FUNCTION / COMPONENT: PatternQuestion
 * React renders this component when its parent uses <PatternQuestion /> or when its state/props
 * change.
 * INPUT PROPS: { p, si }. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
function PatternQuestion({ p, si }) {
  // VIVA: Selection is local UI state. Check sends the selected token to the
  // controller once; the visible pattern stays on screen during the answer.
  /*
   * REMEMBER: selectedAnswer
   * Pattern option selected before Check. Tapping updates it and enables the Check button; it does not
   * score until checked.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  /*
   * REMEMBER: checked
   * Whether this local pattern question has already been checked. A ref blocks a second Check before
   * React updates the UI.
   * Changing .current is immediate and does not cause a render.
   */
  const checked = useRef(false);
  const q = p.currentQuestion;
  const answered = p.phase === "feedback";
  const levelOne = [1, 2, 3, 4].includes(Number(p.levelNumber));
  // Read aloud exactly the question shown in the heading, nothing else.
  const heading = (q?.prompt && (si ? q.prompt.si : q.prompt.en)) || q?.questionText || (si ? "ඊළඟට පැමිණෙන්නේ කුමක්ද?" : "Which picture comes next?");
  /*
   * FUNCTION: checkAnswer
   * Send the selected Pattern token for checking once.
   * WHEN: The Pattern Check button calls this.
   * HOW / RESULT: Requires a selection and no previous check; handlePatternAnswer in the parent
   * evaluates correctness and opens feedback.
   */
  const checkAnswer = () => {
    if (selectedAnswer === null || answered || checked.current) return;
    checked.current = true;
    p.handlePatternAnswer(selectedAnswer);
  };
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    <MemoryTracker current={p.currentIdx + 1} total={p.questions.length} responses={p.results} questionIds={p.questions.map(question => question.id)} />
    {/* VIVA: Guidance and the visible pattern question board are here. */}
    <MemoryBunny message={getImprovementBunnyMessage({ game: "pattern", phase: p.phase, correct: p.isCurrentCorrect, si })} />
    <MemoryBoard className={`lx-pattern-question${q?.layout === "grid" ? " lx-pattern-question--grid" : ""}`} data-question-id={q?.id}>
      <MemoryHeading onListen={() => p.speakText(heading)}>{heading}</MemoryHeading>
      {/* A grid question shows one picture (the 2x2 squares with the gap) instead of a row. */}
      <div className={`lx-pattern-sequence${q?.layout === "grid" ? " lx-pattern-sequence--grid" : ""}`} aria-label={si ? "සම්පූර්ණ කළ යුතු රටාව" : "Pattern to complete"}>{/* UI SECTION: Pattern stimulus: authored tokens remain visible; question marks identify the missing piece. */}{q.showItems.map((item, i) => <div key={i} className={`lx-pattern-tile ${item === "?" ? "is-missing" : ""}`}>{item === "?" ? "?" : <PatternSymbol value={item} />}</div>)}</div>
      {/* VIVA: Answer pieces are selected here before pressing Check. */}
      <div className="lx-pattern-options">{/* UI SECTION: Pattern answers: a tap selects locally; Check sends the selected token to the controller. */}{p.dragPool.map((option, i) => {
        const selected = (answered ? p.lastUserAnswer : selectedAnswer) === option;
        return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <button key={`${q.id}-${i}`} type="button" className={`lx-pattern-option ${selected ? "is-selected" : ""}`} aria-label={`Answer: ${option}`} aria-pressed={selected} disabled={answered} onClick={() => { if (!checked.current) setSelectedAnswer(option); }}><b aria-hidden="true">{String.fromCharCode(65 + i)}</b><PatternSymbol value={option} /></button>;
      })}</div>
      {/* VIVA: Check changes to Next or See results after answering. */}
      <div className={`lx-pattern-response${answered ? " lx-feedback-footer" : ""}`}>{/* UI SECTION: Pattern actions: Check before answering, then Next or See results after feedback. */}
        {answered ? <>
          <button type="button" className="lx-pattern-next" onClick={p.handleNextQuestion}>{si ? p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === p.questions.length - 1 ? "See results" : "Next"}<ArrowRight aria-hidden="true" /></button>
        </> : <><p className="lx-note">{si ? "ඔබේ පිළිතුර තෝරන්න." : "Tap your answer."}</p><button type="button" className={`lx-pattern-check${si || levelOne ? "" : " lx-pattern-check--illustrated"}`} disabled={selectedAnswer === null} onClick={checkAnswer}><span className="lx-pattern-check-label">{si ? "පරීක්ෂා කරන්න" : "Check"}</span>{si || levelOne ? <Check aria-hidden="true" /> : <img src="/images/workingMemory/shared/buttons/actions/check-button.png" alt="" />}</button></>}
      </div>
    </MemoryBoard>
    {answered && <Feedback p={p} si={si} />}
  </>;
}

/*
 * FUNCTION / COMPONENT: PatternResults
 * React renders this component when its parent uses <PatternResults /> or when its state/props change.
 * INPUT PROPS: { p, si }. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
function PatternResults({ p, si }) {
  // VIVA: Legacy result view retained here. Supported levels currently render
  // shared ActivityResults first in ActivityScreen's result branch.
  const passed = p.score >= 3;
  const text = (en, sinhala) => si ? sinhala : en;
  const nextDisabled = !passed || p.isSubmitting || !p.submitResult;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    <img className="lx-pattern-result-bunny" src={`${ART}/bunny/bunny-${passed ? "happy" : "sad"}.webp`} alt={text(passed ? "Happy bunny" : "Encouraging bunny", passed ? "සතුටු හාවා" : "දිරිගන්වන හාවා")} />
    <aside className="lx-pattern-speech">{text(passed ? "Well done! You kept going!" : "Good effort! Keep learning.", passed ? "හොඳයි! ඔබ දිගටම උත්සාහ කළා!" : "හොඳ උත්සාහයක්! ඉගෙන ගනිමු.")}</aside>
    <MemoryBoard className={`lx-pattern-reference-board lx-pattern-result ${passed ? "is-passed" : "is-retry"}`} data-testid="pattern-results">
      <header className="lx-pattern-result-heading">
        {passed && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(passed ? "Great Job!" : "No Worries!", passed ? "හොඳයි!" : "කමක් නැහැ!")}</h1><p>{text(passed ? `You finished Pattern Recognition · Level ${p.levelNumber}` : "Let's Try Again!", passed ? `රටා මතකය · මට්ටම ${p.levelNumber} සම්පූර්ණයි` : "නැවත උත්සාහ කරමු!")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score ${p.score} out of 5`, `ඔබේ ලකුණු 5 න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="pattern-score">{p.score} / {p.questions.length}</strong></div>
        <div className="lx-pattern-stars">{Array.from({length:5},(_,i)=><img key={i} className={i<p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt={text(i<p.score ? "Earned star" : "Unearned star", i<p.score ? "ලැබුණු තරුව" : "නොලැබුණු තරුව")} />)}</div>
      </section>
      <div className="lx-pattern-statistics">{/* UI SECTION: Attempt statistics: correct count, incorrect count and five-stars-per-correct reward are separate values. */}
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{p.questions.length-p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong>{p.earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status">{p.isSubmitting ? text("Saving your progress…", "ප්‍රගතිය සුරකිමින්...") : p.submissionError ? text("We couldn't save your progress. Please retry saving.", "ප්‍රගතිය සුරැකීමට නොහැක. නැවත සුරකින්න.") : passed ? text("Passed! You can continue to the next game.", "සමත්! ඊළඟ ක්‍රීඩාවට යා හැක.") : text("Get at least 3 out of 5 correct to unlock the next game.", "ඊළඟ ක්‍රීඩාවට 5 න් 3 ක් නිවැරදිව පිළිතුරු දෙන්න.")}</p>
      <div className="lx-pattern-result-actions">{/* UI SECTION: Result actions: replay resets local state; retry saves a failed POST; continue requires a saved pass. */}
        <button type="button" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text(passed ? "Play again" : "Try again", passed ? "නැවත ක්‍රීඩා කරන්න" : "නැවත උත්සාහ කරන්න")}</button>
        <button type="button" className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : nextDisabled} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{text(p.submissionError ? "Retry saving" : "Next game", p.submissionError ? "නැවත සුරකින්න" : "ඊළඟ ක්‍රීඩාව")}<ArrowRight aria-hidden="true" /></button>
      </div>
    </MemoryBoard>
  </>;
}
