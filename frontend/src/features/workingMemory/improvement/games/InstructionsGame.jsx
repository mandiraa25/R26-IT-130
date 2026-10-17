import { useEffect, useRef, useState } from "react";
import { MemoryButton, MemoryHeading } from "../../shared/GameLayout";
import { parseInstructionSteps } from "../../logic/presentation";
import { UI } from "../../config/levelThemes";
import { getImprovementBunnyMessage } from "../../config/gameConfig";

export default function InstructionsGame(props) {
  const si = props.i18n.language?.startsWith("si");
  const p = { ...props, phase: props.phase === "feedback" ? "answer" : props.phase, showingFeedback: props.phase === "feedback" };
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
    <div className="lx-instruction-options">{p.dragPool.map((option, i) => <button className={`lx-instruction-option ${p.showingFeedback && p.lastUserAnswer === option ? "is-selected" : ""}`} disabled={p.showingFeedback} aria-pressed={p.showingFeedback && p.lastUserAnswer === option} type="button" key={option} onClick={() => p.handleInstructionAnswer(option)}><span className="lx-number" aria-hidden="true">{i + 1}</span><span>{option}</span></button>)}</div>
  </>;
  return <>
    <MemoryHeading>{getImprovementBunnyMessage({ game: "instructions", phase: "show", si })}</MemoryHeading>
    <div className="lx-listening-scene">{[0, 1].map(i => <div className={`lx-waves ${status === "playing" ? "is-playing" : ""}`} key={i} style={{ order: i === 0 ? 0 : 2 }} aria-hidden="true"><i /><i /><i /></div>)}<img className="lx-listening-bunny" style={{ order: 1 }} src={`${UI}/bunny/bunny.webp`} alt="Bunny listening" /></div>
    <p className="lx-note" role="status">{status === "idle" ? getImprovementBunnyMessage({ game: "instructions", phase: "ready", si }) : si ? status === "playing" ? "එක් එක් පියවරට සවන් දෙන්න." : "දැන් ප්‍රශ්නය පෙන්වන්න ඔබන්න." : status === "playing" ? "Listen to each step." : "Now tap Show question."}</p>
    <div className="lx-actions"><MemoryButton variant={status === "done" ? "secondary" : "primary"} onClick={listen} disabled={status === "playing"}><img className="lx-listen-icon" src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" />{si ? status === "done" ? "නැවත සවන් දෙන්න" : "සවන් දෙන්න" : status === "done" ? "Listen again" : "Listen"}</MemoryButton>{status === "done" && <MemoryButton onClick={p.handleInstructionReady}>{si ? "ප්‍රශ්නය පෙන්වන්න" : "Show question"}</MemoryButton>}</div>
  </>;
}
