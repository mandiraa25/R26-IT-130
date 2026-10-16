import { useEffect, useRef, useState } from "react";
import { Home, ArrowRight, Star } from "lucide-react";
import "./screening.css";
import RecommendedPractice from "../components/RecommendedPractice";

const ART = "/images/workingMemory/identify/screening/";
const pictureBounds = new Map();

// Fit the visible artwork rather than the PNG's often very large transparent
// canvas. This only positions the original image; no pixels are edited.
export function ScreeningPicture({ src, alt }) {
  const [style, setStyle] = useState(() => pictureBounds.get(src));
  const fitPicture = (event) => {
    if (pictureBounds.has(src)) { setStyle(pictureBounds.get(src)); return; }
    const image = event.currentTarget;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = Math.max(1, Math.round(256 * image.naturalHeight / image.naturalWidth));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 16) {
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    if (right < left) return;
    const width = right - left + 1, height = bottom - top + 1;
    const size = Math.max(width, height) * 1.08;
    const fitted = {
      width: `${canvas.width / size * 100}%`, height: `${canvas.height / size * 100}%`,
      left: `${((size - width) / 2 - left) / size * 100}%`,
      top: `${((size - height) / 2 - top) / size * 100}%`,
    };
    pictureBounds.set(src, fitted);
    setStyle(fitted);
  };
  return <span className="wm-screen__picture-figure"><img src={src} alt={alt} style={style} onLoad={fitPicture} /></span>;
}
const categoryKeys = {
  Pattern: "screen_pattern_memory",
  "Picture Memory": "screen_picture_memory",
  "Number Memory": "screen_number_memory",
  Instruction: "screen_instructions",
};
function ScreeningShell({ children, t, current = 0, total = 15, completed = false, responses = [] }) {
  return (
    <main className={`wm-screen${completed ? " wm-screen--completed" : ""}`} style={{ backgroundImage: "url('/images/workingMemory/improve/reference-art/screening-background.png')" }}>
      <div className="wm-screen__wrap">
        {!completed && <header className="wm-screen__tracking">
          <div className="wm-screen__trackers">
            <ol className="wm-screen__stars" aria-label={t("screen_question_progress")}>
              {Array.from({ length: total }, (_, index) => {
                const done = Boolean(responses[index]);
                const active = !completed && index === current;
                return <li key={index} aria-current={active ? "step" : undefined} aria-label={t("screen_progress_state", { current: index + 1, state: t(done ? "screen_done" : active ? "screen_current" : "screen_upcoming") })} className={done ? "is-done" : active ? "is-current" : ""}><Star aria-hidden="true" /></li>;
              })}
            </ol>
          </div>
          <p className="wm-screen__count" aria-live="polite" aria-atomic="true">{completed ? t("screen_complete_badge") : t("screen_question_count", { current: current + 1, total })}</p>
        </header>}
        <div className="wm-screen__stage">
          <img className="wm-screen__bunny" src={ART + "bunny.png"} alt="" draggable="false" />
          <section className="wm-screen__board" aria-labelledby="wm-screen-title">
            <img className="wm-screen__board-art" src={ART + "vine-board.png"} alt="" draggable="false" />
            <div className="wm-screen__board-content">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
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

  return (
    <ScreeningShell t={t} current={current} total={total} responses={responses}>
      <header className="wm-screen__question-header">
        <span className="wm-screen__category">{t(categoryKeys[question.category])}</span>
        <button type="button" onClick={onListen} className="wm-screen__listen" aria-label={t("identify_listen_briefing")} aria-pressed={audioState === "playing"}><img src="/images/phonologicalAwareness/Improvement/speaker.png" alt="" /><span>{t(audioState === "playing" ? "screen_audio_playing" : "identify_listen_briefing")}</span></button>
      </header>
      <div className={`wm-screen__question-content${isPattern ? " wm-screen__question-content--pattern" : ""}`}>
        <h1 ref={headingRef} tabIndex={-1} className="wm-screen__question-title" id="wm-screen-title">{heading}</h1>
        {isInstruction && phase === "audio" ? (
          <div className="wm-screen__instruction-area">
            <ol className="wm-screen__instruction-steps">
              {steps.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}</span><p>{step}</p></li>)}
            </ol>
            <p className="wm-screen__hint" role="status">{t(audioState === "unavailable" ? "screen_audio_unavailable" : "screen_listen_remember")}</p>
            {audioState === "unavailable" && <button type="button" className="wm-screen__primary" onClick={onAudioFallback}>{t("screen_continue")}</button>}
          </div>
        ) : isPattern ? (
          <>
            <div className="wm-screen__memory-panel wm-screen__pattern" aria-label={question.text}>{question.text}</div>
            {<div className="wm-screen__options wm-screen__options--compact">
              {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-pattern-option" className={`wm-screen__option wm-screen__option--${index % 3}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>{option}</button>)}
            </div>}
          </>
        ) : !canAnswer ? (
          <div className="wm-screen__memory-panel">
            {isPicture ? renderPictures(question.words.join(", ")) : <NumberSequence sequence={question.sequence} />}
            <p className="wm-screen__hint">{t("screen_remember_order")}</p>
          </div>
        ) : (
          <div className={`wm-screen__options${isInstruction ? " wm-screen__options--compact" : ""}`}>
            {question.options.map((option, index) => <button type="button" key={option} data-testid="wm-choice-option" className={`wm-screen__option wm-screen__option--${index % 3}${isPicture ? " wm-screen__option--pictures" : ""}${question.category === "Number Memory" ? " wm-screen__option--numbers" : ""}`} disabled={selected !== null} aria-pressed={selected === option} onClick={() => answer(option)}>
              {isPicture ? renderPictures(option) : question.category === "Number Memory" ? <NumberSequence sequence={option.split(",").map(item => item.trim())} /> : option}
            </button>)}
          </div>
        )}
      </div>
      <footer className="wm-screen__question-footer"><p>{canAnswer ? t("screen_tap_answer") : isInstruction ? "" : t("look_closely")}</p></footer>
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

function NumberSequence({ sequence }) {
  return <span className="wm-screen__number-sequence" aria-label={sequence.join(", ")}>{sequence.map((number, index) => <span key={index}>{number}</span>)}</span>;
}
