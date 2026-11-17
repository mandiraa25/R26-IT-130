/*
 * FILE PURPOSE
 * Screening presentation components: shared forest/board shell, tracker, study material and answer
 * choices.
 *
 * HOW IT CONNECTS
 * ScreeningPage supplies question, phase, responses and onAnswer. ScreeningResults also reuses
 * ScreeningShell. PatternArtwork draws symbol images; ScreeningPicture re-exports PictureArtwork.
 * Direct source importers: ScreeningPage.jsx, ../shared/ScreeningResults.jsx.
 * Local feature/style dependencies: ../styles/identification.css, ../styles/contentRefinement.css,
 * ../shared/artwork/PatternArtwork.jsx, ../shared/GameLayout.jsx, ../config/levelThemes.js,
 * ../styles/identificationScreens.css, ../shared/artwork/PictureArtwork.jsx.
 *
 * THINGS TO REMEMBER
 * The parent owns time and scoring. selected remembers the tapped option; submitted blocks duplicate
 * taps. category chooses the visible layout. The tracker uses current (zero based) and recorded
 * responses. See identification.css, identificationScreens.css and contentRefinement.css.
 */

// VIVA: Screening board, progress tracker and category-specific answer sections.
import { useEffect, useRef, useState } from "react";
import "../styles/identification.css";
import "../styles/contentRefinement.css";
import PatternArtwork from "../shared/artwork/PatternArtwork";
import { useNavigate } from "react-router-dom";
import { MemoryStage, MemoryNav, MemoryBoard } from "../shared/GameLayout";
import { SCREENING_ART } from "../config/levelThemes";
import "../styles/identificationScreens.css";

export { default as ScreeningPicture } from "../shared/artwork/PictureArtwork";

const categoryKeys = {
  Pattern: "screen_pattern_memory",
  "Picture Memory": "screen_picture_memory",
  "Number Memory": "screen_number_memory",
  Instruction: "screen_instructions",
};
// Round category icons (also used on the screening results screen).
const categoryIcons = {
  Pattern: "pattern.png",
  "Picture Memory": "pictures.png",
  "Number Memory": "numbers.png",
  Instruction: "instructions.png",
};
/*
 * FUNCTION / COMPONENT: ScreeningShell
 * React renders this component when its parent uses <ScreeningShell /> or when its state/props change.
 * INPUT PROPS: { children, t, current = 0, total = 15, completed = false, responses = [] }. These
 * values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export function ScreeningShell({ children, t, current = 0, total = 15, completed = false, responses = [] }) {
  // VIVA: A shared visual shell receives children and progress values. It draws
  // the board/tracker but does not decide whether an answer is correct.
  const navigate = useNavigate();
  return (
    /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <MemoryStage level={1} background={SCREENING_ART.background} className={`wm-screen lx-screening${completed ? " wm-screen--completed" : ""}`}>
      {/* VIVA: Shared navigation and mascot surround the screening board. */}
      <MemoryNav title={t("screen_complete_badge")} onBack={() => navigate("/dashboard")} controls={false} />
      <img className="lx-bunny wm-screen__standing-bunny" src={SCREENING_ART.bunny} alt="" draggable="false" />
      <div className="wm-screen__wrap">
        {/* VIVA: Question progress and the current question count are here. */}
        {!completed && <header className="wm-screen__tracking">{/* UI SECTION: Screening tracker: recorded responses mark completed questions; current highlights the active question. */}
          <div className="wm-screen__trackers">
            <ol className="wm-screen__stars" aria-label={t("screen_question_progress")}>
              {Array.from({ length: total }, (_, index) => {
                const done = Boolean(responses[index]);
                const active = !completed && index === current;
                return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <li key={index} aria-current={active ? "step" : undefined} aria-label={t("screen_progress_state", { current: index + 1, state: t(done ? "screen_done" : active ? "screen_current" : "screen_upcoming") })} className={done ? "is-done" : active ? "is-current" : ""}><span className="wm-screen__pip" /></li>;
              })}
            </ol>
          </div>
          <p className="wm-screen__count" aria-live="polite" aria-atomic="true">{completed ? t("screen_complete_badge") : t("screen_question_count", { current: current + 1, total })}</p>
        </header>}
        <div className="wm-screen__stage">
          {/* VIVA: The board hosts a question or the completed-test content. */}
          <MemoryBoard aria-labelledby="wm-screen-title">
            <div className="wm-screen__board-content">{children}</div>
          </MemoryBoard>
        </div>
      </div>
    </MemoryStage>
  );
}

const isMissingToken = (token) => token === "?" || token === "__" || token === "__?";
/*
 * FUNCTION: patternTokens
 * Split authored pattern text into display tokens and normalize adjacent missing markers.
 * WHEN: The screening Pattern layout calls this.
 * HOW / RESULT: Keeps symbol/letter/number tokens for PatternToken and collapses repeated missing
 * markers to one question mark.
 */
const patternTokens = (text) => String(text || "").split(/[\s,]+/).map((token) => token.trim()).filter(Boolean).reduce((tokens, token) => {
  if (isMissingToken(token)) {
    if (tokens[tokens.length - 1] !== "?") tokens.push("?");
  } else tokens.push(token);
  return tokens;
}, []);

/*
 * FUNCTION / COMPONENT: PatternToken
 * Display one screening pattern token as missing marker, illustration or text.
 * PROPS: token is the authored symbol/letter/number; a missing marker becomes a question mark.
 * RETURNS: PatternArtwork for recognized tokens and a text fallback for other values.
 */
function PatternToken({ token }) {
  if (isMissingToken(token)) return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <span className="wm-screen__missing" aria-hidden="true">?</span>;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <PatternArtwork value={token}><span className="wm-screen__pattern-token">{token}</span></PatternArtwork>;
}

/*
 * FUNCTION / COMPONENT: ScreeningQuestionScreen
 * React renders this component when its parent uses <ScreeningQuestionScreen /> or when its
 * state/props change.
 * INPUT PROPS: { question, current, total, phase, t, heading, renderPictures, responses, audioState,
 * onAnswer, onListen, onListenEnglish, onAudioFallback }. These values/callbacks come from the parent;
 * defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export function ScreeningQuestionScreen({ question, current, total, phase, t, heading, renderPictures, responses, audioState, onAnswer, onListen, onListenEnglish, onAudioFallback }) {
  // VIVA: The parent controls phase and timing. This view reveals the stimulus
  // or recall choices and reports a single selected option through onAnswer.
  /*
   * REMEMBER: headingRef
   * The question-heading DOM reference. The effect focuses the new heading without scrolling when
   * question.id changes.
   * Changing .current is immediate and does not cause a render.
   */
  const headingRef = useRef(null);
  const isPattern = question.category === "Pattern";
  const isPicture = question.category === "Picture Memory";
  const isInstruction = question.category === "Instruction";
  const canAnswer = isPattern || phase === "answer";
  /*
   * REMEMBER: selected
   * Screening option already chosen. The answer handler sets it and disables the option buttons while
   * advancing.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [selected, setSelected] = useState(null);
  /*
   * REMEMBER: submitted
   * Local screening duplicate-tap guard. A ref becomes true before onAnswer reaches the parent.
   * Changing .current is immediate and does not cause a render.
   */
  const submitted = useRef(false);
  /*
   * FUNCTION: answer
   * Accept one screening option and report it to the controller.
   * WHEN: The visible screening answer buttons call this.
   * HOW / RESULT: Sets the synchronous submitted guard and local selected state, then calls onAnswer.
   */
  const answer = option => { if (submitted.current) return; submitted.current = true; setSelected(option); onAnswer(option); };
  /*
   * EFFECT: After React renders
   * Manage DOM focus/keyboard/scroll behaviour while this screen/dialog is mounted, and restore it in
   * cleanup.
   * DEPENDENCIES: [question.id]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [question.id]);
  const steps = isInstruction ? question.text.split(/[,،]|\bthen\b|\bපසුව\b/iu).map(step => step.trim()).filter(Boolean) : [];
  const isNumber = question.category === "Number Memory";
  const hint = audioState === "unavailable" && isInstruction && phase === "audio"
    ? t("screen_audio_unavailable")
    : canAnswer
      ? (isPicture || isNumber ? t("screen_tap_order") : t("screen_tap_answer"))
      : isInstruction ? t("screen_look_carefully") : isPicture ? t("screen_look_remember") : t("screen_remember_order");
  // While the numbers are shown, the hint sits inside the number box.
  const hintInPanel = isNumber && !canAnswer;

  return (
    /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <ScreeningShell t={t} current={current} total={total} responses={responses}>
      {/* VIVA: Category title and read-aloud buttons are here. */}
      <header className="wm-screen__question-header">{/* UI SECTION: Question heading: category label and read-aloud controls. */}
        <span className="wm-screen__category">
          <img src={`/images/workingMemory/identification/practice/${categoryIcons[question.category]}`} alt="" draggable="false" />
          {t(categoryKeys[question.category])}
        </span>
        <div className="wm-screen__title-row">
          <h1 ref={headingRef} tabIndex={-1} className="wm-screen__question-title" id="wm-screen-title">{heading}</h1>
          <div className="wm-screen__listen-group">
            <button type="button" onClick={onListen} className="wm-screen__listen" aria-label={t("identify_listen_briefing")} aria-pressed={audioState === "playing"}><img src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" /><span>{t("identify_listen_briefing")}</span></button>
            {onListenEnglish && <button type="button" onClick={onListenEnglish} className="wm-screen__listen wm-screen__listen--english" aria-label="Listen in English" title="Listen in English">EN</button>}
          </div>
        </div>
      </header>
      {/* VIVA: This section switches between instructions, study items and recall choices. */}
      <div className={`wm-screen__question-content${isPattern ? " wm-screen__question-content--pattern" : ""}${isInstruction ? " wm-screen__question-content--steps" : ""}${isPicture ? " wm-screen__question-content--pictures" : ""}${isNumber ? " wm-screen__question-content--numbers" : ""}`}>{/* UI SECTION: Question body: category and phase choose pattern, study material, instruction steps or recall choices. */}
        {isInstruction && phase === "audio" ? (
          <div className="wm-screen__instruction-area">{/* UI SECTION: Instruction study: authored steps and manual Continue when speech is unavailable. */}
            <ol className="wm-screen__instruction-steps">
              {steps.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}.</span><p>{step}</p></li>)}
            </ol>
            {audioState === "unavailable" && <button type="button" className="wm-screen__primary" onClick={onAudioFallback}>{t("screen_continue")}</button>}
          </div>
        ) : isPattern ? (
          <>
            <div className="wm-screen__pattern" aria-label={question.text}>
              {patternTokens(question.text).map((token, index) => <PatternToken key={`${token}-${index}`} token={token} />)}
            </div>
            {/* VIVA: Tapping a pattern answer submits the selected option. */}
            <div className="wm-screen__options wm-screen__options--pattern">{/* UI SECTION: Answer choices: selecting one calls the parent; disabled state prevents repeated submissions. */}
              {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-pattern-option" aria-label={option} className={`wm-screen__option wm-screen__option--${index % 3}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>
                <PatternToken token={option} />
                <span className="wm-screen__option-value">{option}</span>
              </button>)}
            </div>
          </>
        ) : !canAnswer ? (
          <div className={`wm-screen__memory-panel${isPicture ? " wm-screen__memory-panel--pictures" : " wm-screen__memory-panel--plain"}`}>{/* UI SECTION: Memorization area: ordered pictures or numbers appear before the parent reveal timer hides them. */}
            {isPicture ? renderPictures(question.words.join(", ")) : <NumberSequence sequence={question.sequence} study />}
            {hintInPanel && <p className="wm-screen__panel-hint">{hint}</p>}
          </div>
        ) : (
          <div className={`wm-screen__options${isInstruction ? " wm-screen__options--actions" : " wm-screen__options--orders"}`} style={{ "--choice-count": question.options.length }}>{/* UI SECTION: Answer choices: selecting one calls the parent; disabled state prevents repeated submissions. */}
            {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-choice-option" className={`wm-screen__option wm-screen__option--${index % 3}${isPicture ? " wm-screen__option--pictures" : ""}${isNumber ? " wm-screen__option--numbers" : ""}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>
              {isPicture ? renderPictures(option) : option}
            </button>)}
          </div>
        )}
      </div>
      {!hintInPanel && <footer className="wm-screen__question-footer"><p>{hint}</p></footer>}
    </ScreeningShell>
  );
}





/*
 * FUNCTION / COMPONENT: NumberSequence
 * Display the authored number sequence with study-specific styling.
 * PROPS: sequence is the number array; study adds the memorization-size CSS modifier.
 * RETURNS: A sequence wrapper and one span per digit; it does not accept or check an answer.
 */
function NumberSequence({ sequence, study = false }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <span className={`wm-screen__number-sequence${study ? " wm-screen__number-sequence--study" : ""} wm-screen__number-sequence--${sequence.length}`} aria-label={sequence.join(", ")}>{sequence.map((number, index) => <span key={index}>{number}</span>)}</span>;
}
