import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdaptiveRenderer from "./AdaptiveRenderer";
import GazeDot from "./GazeDot";
import Calibration from "./Calibration";
import { useGazeTracking, releaseWebGazerCamera } from "../hooks/useGazeTracking";
import { useEyeWatchdog } from "../hooks/useEyeWatchdog";
import { connectSocket } from "../api/socket";
import { playAttentionChime, releaseReadingAudio, speakIfQuiet } from "../api/chime";
import { endReadingSession, startReadingSession } from "../../../services/readingProcessing/identifyApi";
import { MemoryStage, MemoryNav, MemoryBoard, MemoryButton, MemoryBunny } from "../../workingMemory/shared/GameLayout";
import { SCREENING_ART } from "../../workingMemory/config/levelThemes";

const TARGET_TIME_MS = 12_000;
const ROUND_COUNT = 6;

const INSTRUCTIONS = {
  shapes: "Let's play the shapes game! You'll see a shape name on the screen. Look at the buttons below and tap the one that matches. Ready? Let's go!",
  letters: "Let's practice letters! I'll show you a letter at the top. Find and tap the same letter from the choices below. Listen carefully and look closely!",
  words: "Time to read some words! I'll show you a word. Find the matching word from the choices and tap it. Take your time and sound it out!",
  sentences: "Let's read sentences! I'll show you a sentence. Find the matching one from the choices below. Read carefully and tap the right answer!",
};

function speak(text) {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

function speakTarget(level, target) {
  const text = level === "shapes" ? `Find the ${target}`
    : level === "letters" ? `Find the letter ${target}`
    : level === "words" ? `Find the word: ${target}`
    : `Find: ${target}`;
  return speak(text);
}

export default function GameScreen({ mode, level, difficulty, targets, onFinish }) {
  const [phase, setPhase] = useState("calibrate");
  const [sessionId, setSessionId] = useState(null);
  const [gaze, setGaze] = useState({ x: null, y: null });
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [adaptAction, setAdaptAction] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [spokenRound, setSpokenRound] = useState(-1);

  const targetRef = useRef(null);
  const socketRef = useRef(null);
  const lastGazeAtRef = useRef(0);
  const reactionsRef = useRef([]);
  const targetShownAtRef = useRef(0);
  const firstFixationAtRef = useRef(null);
  const timerRef = useRef(null);
  const correctRef = useRef(0);
  const endedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const order = useMemo(() => buildRounds(targets, ROUND_COUNT), [targets]);
  const target = phase === "playing" && round < order.length ? order[round] : null;
  const choices = useMemo(() => (target ? buildChoices(target, targets) : []), [target, targets]);
  const waitingForAudio = phase === "playing" && spokenRound !== round;

  const { status: trackerStatus, source: trackerSource, detail: trackerDetail } = useGazeTracking({
    enabled: phase !== "calibrate" && phase !== "idle" && phase !== "instructions",
    onSample: (sample) => {
      setGaze((prev) => (prev.x === sample.x && prev.y === sample.y ? prev : { x: sample.x, y: sample.y }));
      lastGazeAtRef.current = Date.now();
      const inTarget = isInside(targetRef.current, sample.x, sample.y);
      if (inTarget && firstFixationAtRef.current == null) firstFixationAtRef.current = sample.t;
      socketRef.current?.emit("gaze.sample", {
        sessionId,
        t: sample.t,
        x: sample.x,
        y: sample.y,
        target: inTarget ? target : undefined,
      });
    },
  });

  const eyesLost = useEyeWatchdog({
    enabled: phase === "playing",
    lastSampleAtRef: lastGazeAtRef,
    onAlert: useCallback((secondsLost) => {
      playAttentionChime();
      if (secondsLost < 12) speakIfQuiet("Look at the screen");
    }, []),
  });

  const playInstruction = useCallback(() => {
    speak(INSTRUCTIONS[level] || INSTRUCTIONS.shapes);
  }, [level]);

  useEffect(() => {
    if (phase === "instructions") playInstruction();
  }, [phase, playInstruction]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    socketRef.current?.disconnect();
    releaseReadingAudio();
    releaseWebGazerCamera();
  }, []);

  useEffect(() => {
    if (phase !== "starting") return undefined;
    let mounted = true;
    (async () => {
      const { data } = await startReadingSession({
        mode,
        level,
        difficulty,
        deviceMeta: {
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
          dpr: window.devicePixelRatio,
          ua: navigator.userAgent,
        },
      });
      if (!mounted) return;
      setSessionId(data.session._id);
      const sock = connectSocket();
      socketRef.current = sock;
      sock.on("connect", () => sock.emit("session.join", { sessionId: data.session._id }));
      sock.on("adapt.action", (action) => setAdaptAction(action));
      setPhase("playing");
    })().catch(() => {
      if (mounted) onFinishRef.current?.(null);
    });
    return () => { mounted = false; };
  }, [phase, mode, level, difficulty]);

  function replayTargetAudio() {
    if (target) speakTarget(level, target);
  }

  const answer = useCallback((choice, timedOut = false) => {
    if (phase !== "playing") return;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    const now = Date.now();
    const reactionMs = now - targetShownAtRef.current;
    const decisionDelayMs = firstFixationAtRef.current ? now - firstFixationAtRef.current : reactionMs;
    reactionsRef.current.push({ reactionMs, decisionDelayMs });

    const ok = choice === target;
    if (ok) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    setShowFeedback(timedOut ? "time" : ok ? "good" : "bad");
    socketRef.current?.emit("game.tick", { sessionId, correct: correctRef.current });

    if (ok) speak("Great job!");
    else if (timedOut) speak("Time's up! Let's try the next one.");
    else speak("Almost! Try again next round.");

    setTimeout(() => {
      setShowFeedback(null);
      setRound((value) => value + 1);
    }, 1200);
  }, [phase, target, sessionId]);

  const endSession = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPhase("ending");
    try {
      socketRef.current?.emit("session.end", { sessionId });
      const { data } = await endReadingSession(sessionId, {
        correct: correctRef.current,
        total: order.length,
        reactions: reactionsRef.current,
      });
      socketRef.current?.disconnect();
      releaseReadingAudio();
      releaseWebGazerCamera();
      onFinishRef.current?.(data);
    } catch (err) {
      console.error("end session", err);
      onFinishRef.current?.(null);
    }
  }, [sessionId, order]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    if (round >= order.length) {
      const finishTimer = setTimeout(() => { void endSession(); }, 0);
      return () => clearTimeout(finishTimer);
    }
    const nextTarget = order[round];
    let cancelled = false;
    speakTarget(level, nextTarget).then(() => {
      if (cancelled) return;
      setSpokenRound(round);
      targetShownAtRef.current = Date.now();
      firstFixationAtRef.current = null;
      timerRef.current = setTimeout(() => answer(null, true), TARGET_TIME_MS);
    });
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, [phase, round, order, level, answer, endSession]);

  if (phase === "calibrate") {
    return (
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title="Eye tracking" onBack={() => onFinishRef.current?.(null)} controls={false} />
        <MemoryBoard>
          <div className="rf-eye-copy">
            <h1>Eye tracking</h1>
            <p>Look at each yellow dot and tap it. The camera learns where your eyes are. This takes about half a minute.</p>
            <p>Nothing is recorded except where you look. You can skip this and still play.</p>
            <div className="rf-eye-actions">
              <MemoryButton onClick={() => setPhase("calibrating")}>Start</MemoryButton>
              <MemoryButton onClick={() => setPhase("instructions")}>Skip</MemoryButton>
            </div>
          </div>
        </MemoryBoard>
        <MemoryBunny message="Look at the dots!" />
      </MemoryStage>
    );
  }

  if (phase === "calibrating") {
    return (
      <Calibration
        trackerStatus={trackerStatus}
        source={trackerSource}
        detail={trackerDetail}
        onDone={() => setPhase("instructions")}
        onCancel={() => setPhase("calibrate")}
      />
    );
  }

  if (phase === "instructions") {
    return (
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title="How to play" onBack={() => setPhase("calibrate")} controls={false} />
        <MemoryBoard>
          <div className="rf-eye-copy">
            <h1>How to play</h1>
            <p>
              {level === "shapes" && "I'll show you a shape name. Find and tap the matching shape."}
              {level === "letters" && "I'll show you a letter. Find and tap the same letter."}
              {level === "words" && "I'll show you a word. Find and tap the matching word."}
              {level === "sentences" && "I'll show you a sentence. Find and tap the matching sentence."}
            </p>
            <p>Listen to the instructions, then tap your answer.</p>
            <div className="rf-eye-actions">
              <MemoryButton onClick={playInstruction}>Replay</MemoryButton>
              <MemoryButton onClick={() => setPhase("starting")}>Start game</MemoryButton>
            </div>
          </div>
        </MemoryBoard>
        <MemoryBunny message="Listen, then tap!" />
      </MemoryStage>
    );
  }

  if (phase === "starting" || phase === "ending") {
    return (
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title="Reading" onBack={() => onFinishRef.current?.(null)} controls={false} />
        <MemoryBoard>
          <div className="rf-eye-copy"><h1>Getting ready</h1><p>One moment.</p></div>
        </MemoryBoard>
      </MemoryStage>
    );
  }

  const feedbackText = showFeedback === "good"
    ? "Great!"
    : showFeedback === "time"
      ? "Let's try the next one"
      : showFeedback
        ? "Almost — try again next round"
        : "";

  return (
    <>
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title={`${mode === "improvement" ? "Practice" : "Screening"} · ${Math.min(round + 1, order.length)}/${order.length}`} onBack={() => onFinishRef.current?.(null)} controls={false} />
        <MemoryBoard>
          <div className="rf-eye-copy">
            <p className="rf-eye-round">Find: <strong>{target}</strong></p>
            <div ref={targetRef} className="rf-eye-target">
              <AdaptiveRenderer target={target} action={adaptAction} />
            </div>
            <div className="rf-eye-choices">
              {choices.map((choice) => (
                <MemoryButton key={choice} onClick={() => answer(choice)} disabled={waitingForAudio}>{choice}</MemoryButton>
              ))}
            </div>
            <div className="rf-eye-actions">
              <MemoryButton onClick={replayTargetAudio} disabled={!target}>Replay</MemoryButton>
            </div>
            {waitingForAudio && <p>Listen…</p>}
            {feedbackText && <p>{feedbackText}</p>}
            <p>{correct} correct</p>
          </div>
        </MemoryBoard>
        <MemoryBunny message={eyesLost ? "Look at the screen" : undefined} />
      </MemoryStage>
      <GazeDot x={gaze.x} y={gaze.y} visible={gaze.x != null && gaze.y != null} />
    </>
  );
}

function buildRounds(targets, count) {
  const out = [];
  if (!targets?.length) return out;
  for (let i = 0; i < count; i++) out.push(targets[i % targets.length]);
  return shuffle(out);
}

function buildChoices(answer, pool) {
  const others = pool.filter((item) => item !== answer);
  const wrong = shuffle(others).slice(0, Math.min(3, others.length));
  return shuffle([answer, ...wrong]);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isInside(el, x, y) {
  if (!el || x == null || y == null) return false;
  const rect = el.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
