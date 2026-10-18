import { useEffect, useRef, useState } from "react";
import { Home, ArrowRight } from "lucide-react";
import "./screening.css";
import "../styles/contentRefinement.css";
import RecommendedPractice from "../components/RecommendedPractice";
import PatternArtwork from "../components/PatternArtwork";
import { useNavigate } from "react-router-dom";
import { MemoryStage, MemoryNav, MemoryBoard } from "../components/MemoryUI";
import { SCREENING_ART } from "./screeningAssets";

export { default as ScreeningPicture } from "../components/PictureArtwork";

const categoryKeys = {
  Pattern: "screen_pattern_memory",
  "Picture Memory": "screen_picture_memory",
  "Number Memory": "screen_number_memory",
  Instruction: "screen_instructions",
};
function ScreeningShell({ children, t, current = 0, total = 15, completed = false, responses = [] }) {
  const navigate = useNavigate();
  return (
    <MemoryStage level={1} background={SCREENING_ART.background} className={`wm-screen lx-screening${completed ? " wm-screen--completed" : ""}`}>
      <MemoryNav title={t("screen_complete_badge")} onBack={() => navigate("/dashboard")} controls={false} />
      <img className="lx-bunny wm-screen__standing-bunny" src={SCREENING_ART.bunny} alt="" draggable="false" />
      <div className="wm-screen__wrap">
        {!completed && <header className="wm-screen__tracking">
          <div className="wm-screen__trackers">
            <ol className="wm-screen__stars" aria-label={t("screen_question_progress")}>
              {Array.from({ length: total }, (_, index) => {
                const done = Boolean(responses[index]);
                const active = !completed && index === current;
                return <li key={index} aria-current={active ? "step" : undefined} aria-label={t("screen_progress_state", { current: index + 1, state: t(done ? "screen_done" : active ? "screen_current" : "screen_upcoming") })} className={done ? "is-done" : active ? "is-current" : ""}><span className="wm-screen__pip" /></li>;
              })}
            </ol>
          </div>
          <p className="wm-screen__count" aria-live="polite" aria-atomic="true">{completed ? t("screen_complete_badge") : t("screen_question_count", { current: current + 1, total })}</p>
        </header>}
        <div className="wm-screen__stage">
          <MemoryBoard level={1} aria-labelledby="wm-screen-title">
            <div className="wm-screen__board-content">{children}</div>
          </MemoryBoard>
        </div>
      </div>
    </MemoryStage>
  );
}

const isMissingToken = (token) => token === "?" || token === "__" || token === "__?";
const patternTokens = (text) => String(text || "").split(/[\s,]+/).map((token) => token.trim()).filter(Boolean).reduce((tokens, token) => {
  if (isMissingToken(token)) {
    if (tokens[tokens.length - 1] !== "?") tokens.push("?");
  } else tokens.push(token);
  return tokens;
}, []);

function PatternToken({ token }) {
  if (isMissingToken(token)) return <span className="wm-screen__missing" aria-hidden="true">?</span>;
  return <PatternArtwork value={token}><span className="wm-screen__pattern-token">{token}</span></PatternArtwork>;
}

export function ScreeningQuestionScreen({ question, current, total, phase, t, heading, renderPictures, responses, audioState, onAnswer, onListen, onAudioFallback }) {
  const headingRef = useRef(null);
  const isPattern = question.category === "Pattern";
  const isPicture = question.category === "Picture Memory";
  const isInstruction = question.category === "Instruction";
  const canAnswer = isPattern || phase === "answer";
  const [selected, setSelected] = useState(null);
  const submitted = useRef(false);
  const answer = option => { if (submitted.current) return; submitted.current = true; setSelected(option); onAnswer(option); };
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [question.id]);
  const steps = isInstruction ? question.text.split(/[,،]|\bthen\b|\bපසුව\b/iu).map(step => step.trim()).filter(Boolean) : [];
  const isNumber = question.category === "Number Memory";
  const hint = audioState === "unavailable" && isInstruction && phase === "audio"
    ? t("screen_audio_unavailable")
    : canAnswer
      ? (isPicture || isNumber ? t("screen_tap_order") : t("screen_tap_answer"))
      : isInstruction ? t("screen_look_carefully") : isPicture ? t("screen_look_remember") : t("screen_remember_order");

  return (
    <ScreeningShell t={t} current={current} total={total} responses={responses}>
      <header className="wm-screen__question-header">
        <span className="wm-screen__category">{t(categoryKeys[question.category])}</span>
        <div className="wm-screen__title-row">
          <h1 ref={headingRef} tabIndex={-1} className="wm-screen__question-title" id="wm-screen-title">{heading}</h1>
          <button type="button" onClick={onListen} className="wm-screen__listen" aria-label={t("identify_listen_briefing")} aria-pressed={audioState === "playing"}><img src="/images/phonologicalAwareness/Improvement/speaker.png" alt="" /><span>{t("identify_listen_briefing")}</span></button>
        </div>
      </header>
      <div className={`wm-screen__question-content${isPattern ? " wm-screen__question-content--pattern" : ""}${isInstruction ? " wm-screen__question-content--steps" : ""}${isPicture ? " wm-screen__question-content--pictures" : ""}${isNumber ? " wm-screen__question-content--numbers" : ""}`}>
        {isInstruction && phase === "audio" ? (
          <div className="wm-screen__instruction-area">
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
            <div className="wm-screen__options wm-screen__options--pattern">
              {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-pattern-option" aria-label={option} className={`wm-screen__option wm-screen__option--${index % 3}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>
                <PatternToken token={option} />
                <span className="wm-screen__option-value">{option}</span>
              </button>)}
            </div>
          </>
        ) : !canAnswer ? (
          <div className={`wm-screen__memory-panel${isPicture ? " wm-screen__memory-panel--pictures" : " wm-screen__memory-panel--plain"}`}>
            {isPicture ? renderPictures(question.words.join(", ")) : <NumberSequence sequence={question.sequence} study />}
          </div>
        ) : (
          <div className={`wm-screen__options${isInstruction ? " wm-screen__options--actions" : " wm-screen__options--orders"}`} style={{ "--choice-count": question.options.length }}>
            {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-choice-option" className={`wm-screen__option wm-screen__option--${index % 3}${isPicture ? " wm-screen__option--pictures" : ""}${isNumber ? " wm-screen__option--numbers" : ""}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>
              {isPicture ? renderPictures(option) : option}
            </button>)}
          </div>
        )}
      </div>
      <footer className="wm-screen__question-footer"><p>{hint}</p></footer>
    </ScreeningShell>
  );
}

export function ScreeningCompleteScreen({ metrics, responses, total, t, onHome, onPractice, saving, saveError, onRetry }) {
  const riskKey = `screen_risk_${metrics.riskLevel.toLowerCase()}`;
  return (
    <ScreeningShell t={t} total={total} completed responses={responses}>
      <div data-testid="wm-finished" className={`wm-screen__complete${saving || saveError ? " wm-screen__complete--notice" : ""}`}>
        <span className="wm-screen__category">{t("screen_complete_badge")}</span>
        <header><h1 id="wm-screen-title">{t("screen_complete_title")}</h1><p>{t("screen_complete_message")}</p></header>
        {saving && <div className="wm-screen__save-notice" role="status">{t("screen_saving")}</div>}
        {saveError && <div className="wm-screen__save-notice" role="alert"><span>{t("screen_save_error")}</span><button type="button" onClick={onRetry}>{t("screen_retry")}</button></div>}
        <div className="wm-screen__results">
          <section className="wm-screen__score"><h2>{t("screen_your_score")}</h2><strong data-testid="wm-final-score">{metrics.finalScore.toFixed(0)}</strong><small>{t("screen_score_unit")}</small><p>{t("screen_risk", { risk: t(riskKey) })}</p></section>
          <RecommendedPractice responses={responses} t={t} onPractice={onPractice} disabled={saving || saveError} limit={2} illustrated />
        </div>
        <div className="wm-screen__result-actions"><button type="button" data-testid="wm-back-home" onClick={onHome} className="wm-screen__option wm-screen__option--0"><Home aria-hidden="true" />{t("screen_go_home")}</button><button type="button" data-testid="wm-go-improvement" disabled={saving || saveError} onClick={() => onPractice()} className="wm-screen__option wm-screen__option--1"><span>{t("screen_go_improvement")}</span><ArrowRight aria-hidden="true" /></button></div>
      </div>
    </ScreeningShell>
  );
}

export function ScreeningDemoCompleteScreen({ t, onStartReal, onTryAgain, onBackHome }) {
  return <ScreeningShell t={t} completed>
    <div className="wm-screen__demo-complete" data-testid="wm-demo-finished">
      <img src="/images/workingMemory/identify/intro/controller.png" alt="" />
      <h1 id="wm-screen-title">{t("identify_demo_complete_title")}</h1>
      <p>{t("identify_demo_complete_msg")}</p>
      <button type="button" data-testid="wm-identify-start-real-after-demo" onClick={onStartReal} className="wm-screen__primary">{t("identify_start_real_test")}<ArrowRight aria-hidden="true" /></button>
      <div className="wm-screen__result-actions">
        <button type="button" onClick={onTryAgain} className="wm-screen__option wm-screen__option--0">{t("identify_try_demo_again")}</button>
        <button type="button" onClick={onBackHome} className="wm-screen__option wm-screen__option--1"><Home aria-hidden="true" />{t("screen_go_home")}</button>
      </div>
    </div>
  </ScreeningShell>;
}

function NumberSequence({ sequence, study = false }) {
  return <span className={`wm-screen__number-sequence${study ? " wm-screen__number-sequence--study" : ""} wm-screen__number-sequence--${sequence.length}`} aria-label={sequence.join(", ")}>{sequence.map((number, index) => <span key={index}>{number}</span>)}</span>;
}
