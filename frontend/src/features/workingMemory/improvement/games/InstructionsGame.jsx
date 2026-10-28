/*
 * FILE PURPOSE
 * Listening activity view that changes to a multiple-choice recall question.
 *
 * HOW IT CONNECTS
 * ActivityScreen passes the question and callbacks. parseInstructionSteps splits speech;
 * instructionAudio finds a recording; instructionRecording plays it, with speakText as fallback. on
 * Show question, handleInstructionReady changes the parent phase.
 * Direct source importers: ../ActivityScreen.jsx.
 * Local feature/style dependencies: ../../shared/GameLayout.jsx, ../../logic/presentation.js,
 * ../../config/levelThemes.js, ../../config/gameConfig.js, ../../config/instructionAudio.js,
 * ../../logic/instructionRecording.js.
 *
 * THINGS TO REMEMBER
 * status is idle/playing/done. token invalidates old callbacks when question/language changes. Listen
 * is independent of background music. Answer buttons call handleInstructionAnswer directly, without
 * Submit. The listening bunny, wave bars and choices use memoryUI.css plus
 * gameLevels.css/improvementLayout.css.
 */

// VIVA: Listening scene first, then a question with tappable recall answers.
import { useEffect, useRef, useState } from "react";
import { MemoryButton, MemoryHeading } from "../../shared/GameLayout";
import { parseInstructionSteps } from "../../logic/presentation";
import { UI } from "../../config/levelThemes";
import { getImprovementBunnyMessage } from "../../config/gameConfig";
import { getInstructionAudioUrl } from "../../config/instructionAudio";
import { playInstructionRecording } from "../../logic/instructionRecording";

/*
 * FUNCTION / COMPONENT: InstructionsGame
 * React renders this component when its parent uses <InstructionsGame /> or when its state/props
 * change.
 * INPUT PROPS: props. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function InstructionsGame(props) {
  // VIVA: Local status tracks listening only. The parent owns question scoring
  // and changes to recall when the child presses Show question after playback.
  const si = props.i18n.language?.startsWith("si");
  const p = { ...props, phase: props.phase === "feedback" ? "answer" : props.phase, showingFeedback: props.phase === "feedback" };
  /*
   * REMEMBER: status
   * Listening status: idle, playing or done. Audio callbacks change it; done exposes Show question.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [status, setStatus] = useState("idle");
  /*
   * REMEMBER: token
   * Playback version counter. It prevents old recording/speech callbacks from completing a different
   * question.
   * Changing .current is immediate and does not cause a render.
   */
  const token = useRef(0);
  // VIVA: A changing token invalidates old audio callbacks after navigation,
  // replay or language changes so they cannot finish a different question.
  /*
   * REMEMBER: stopRecording
   * Cleanup callback returned by the recording player. Calling it stops old media before replay or
   * unmount.
   * Changing .current is immediate and does not cause a render.
   */
  const stopRecording = useRef(null);
  /*
   * EFFECT: After React renders
   * Synchronize or clean up speech/media for the active screen so old playback does not affect a new
   * question.
   * DEPENDENCIES: [p.currentQuestion.id, props.i18n.language]. A changed dependency reruns the effect;
   * its prior cleanup runs first.
   */
  useEffect(() => {
    const playback = token;
    playback.current++;
    return () => {
      playback.current++;
      stopRecording.current?.();
      window.speechSynthesis?.cancel();
    };
  }, [p.currentQuestion.id, props.i18n.language]);
  /*
   * FUNCTION: listen
   * Play the authored listening steps using a matching recording or speech fallback.
   * WHEN: InstructionsGame Listen/Listen again calls this.
   * HOW / RESULT: Sets status playing, cancels old media, starts ID-matched audio when available and
   * falls back to spaced speech on error. Completion exposes Show question.
   */
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
    stopRecording.current?.();
    window.speechSynthesis?.cancel();
    const recordingUrl = getInstructionAudioUrl(p.currentQuestion.id, props.i18n.language);
    // VIVA: Prefer the recording matched by question ID; absent/failed media
    // falls back to browser speech, with a one-second pause between steps.
    if (recordingUrl) {
      stopRecording.current = playInstructionRecording(recordingUrl,
        () => { if (current === token.current) setStatus("done"); },
        () => { if (current === token.current) speak(0); });
    } else {
      speak(0);
    }
  };
  if (p.phase === "answer") return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: Recall prompt and answer choices replace the listening scene. */}
    <MemoryHeading onListen={() => p.speakText(p.currentQuestion.questionText)}>{p.currentQuestion.questionText}</MemoryHeading>
    <div className="lx-instruction-options">{/* UI SECTION: Listening recall choices: tapping one immediately submits it; feedback keeps choices disabled. */}{p.dragPool.map((option, i) => <button className={`lx-instruction-option ${p.showingFeedback && p.lastUserAnswer === option ? "is-selected" : ""}`} disabled={p.showingFeedback} aria-pressed={p.showingFeedback && p.lastUserAnswer === option} type="button" key={option} onClick={() => p.handleInstructionAnswer(option)}><span className="lx-number" aria-hidden="true">{i + 1}</span><span>{option}</span></button>)}</div>
  </>;
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: Listening guidance and animated bunny scene are here. */}
    <MemoryHeading>{getImprovementBunnyMessage({ game: "instructions", phase: "show", si })}</MemoryHeading>
    <div className="lx-listening-scene">{/* UI SECTION: Listening scene: bunny and animated wave bars; local playback status controls the animation. */}{[0, 1].map(i => <div className={`lx-waves ${status === "playing" ? "is-playing" : ""}`} key={i} style={{ order: i === 0 ? 0 : 2 }} aria-hidden="true"><i /><i /><i /></div>)}<img className="lx-listening-bunny" style={{ order: 1 }} src={`${UI}/bunny/bunny.webp`} alt="Bunny listening" /></div>
    <p className="lx-note" role="status">{status === "idle" ? getImprovementBunnyMessage({ game: "instructions", phase: "ready", si }) : si ? status === "playing" ? "එක් එක් පියවරට සවන් දෙන්න." : "දැන් ප්‍රශ්නය පෙන්වන්න ඔබන්න." : status === "playing" ? "Listen to each step." : "Now tap Show question."}</p>
    <div className="lx-actions"><MemoryButton variant={status === "done" ? "secondary" : "primary"} onClick={listen} disabled={status === "playing"}><img className="lx-listen-icon" src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" />{si ? status === "done" ? "නැවත සවන් දෙන්න" : "සවන් දෙන්න" : status === "done" ? "Listen again" : "Listen"}</MemoryButton>{status === "done" && <MemoryButton onClick={p.handleInstructionReady}>{si ? "ප්‍රශ්නය පෙන්වන්න" : "Show question"}</MemoryButton>}</div>
  </>;
}
