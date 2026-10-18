import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdaptiveRenderer from "./AdaptiveRenderer";
import GazeDot from "./GazeDot";
import Calibration from "./Calibration";
import { useGazeTracking, releaseWebGazerCamera } from "../hooks/useGazeTracking";
import { useEyeWatchdog } from "../hooks/useEyeWatchdog";
import { connectSocket } from "../api/socket";
import { playAttentionChime, releaseReadingAudio, speakIfQuiet } from "../api/chime";
import { endReadingSession, startReadingSession } from "../../../services/readingProcessing/identifyApi";

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
      setGaze({ x: sample.x, y: sample.y });
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
      <div className="container stack">
        <div className="card stack">
          <h1>Eye Tracking Setup</h1>
          <p>Before we start, the camera needs to learn where your eyes are. Look at each yellow dot and tap it — this only takes about 30 seconds.</p>
          <p className="note">Your calibration is saved on this device, so you will not need to redo it next time.</p>
          <p className="note">No video is stored — only gaze coordinates.</p>
          <div className="row">
            <button onClick={() => setPhase("calibrating")}>Start calibration</button>
            <button className="ghost" onClick={() => setPhase("instructions")}>Skip — play without eye tracking</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "calibrating") {
    return (
      <Calibration
        trackerStatus={trackerStatus}
        source={trackerSource}
        detail={trackerDetail}
        onDone={() => setPhase("instructions")}
      />
    );
  }

  if (phase === "instructions") {
    return (
      <div className="container stack">
        <div className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
          <h1>How to Play</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: 500 }}>
            {level === "shapes" && "I'll show you a shape name. Find and tap the matching shape from the choices below!"}
            {level === "letters" && "I'll show you a letter. Find and tap the same letter from the choices below!"}
            {level === "words" && "I'll show you a word. Find and tap the matching word from the choices below!"}
            {level === "sentences" && "I'll show you a sentence. Find and tap the matching sentence from the choices below!"}
          </p>
          <p className="muted">Listen to the audio instructions for help.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button onClick={playInstruction}>Replay instructions</button>
            <button onClick={() => setPhase("starting")}>Start game</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "starting" || phase === "ending") {
    return <div className="container"><div className="card">Getting things ready…</div></div>;
  }

  return (
    <div className="container stack">
      <div className="row">
        <span className="badge">{mode === "improvement" ? "Practice" : "Screening"}</span>
        <span className="badge">Level: {level}</span>
        <span className="badge">Round {Math.min(round + 1, order.length)} / {order.length}</span>
        <span className="spacer" />
        <span className="badge good">{correct}</span>
      </div>

      <div className="card stack" style={{ alignItems: "center" }}>
        <div className="row" style={{ justifyContent: "center", gap: "1rem" }}>
          <p style={{ margin: 0, fontSize: "1.3rem" }}>Find: <strong style={{ fontSize: "1.6rem" }}>{target}</strong></p>
          <button className="ghost" onClick={replayTargetAudio} style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}>Replay</button>
        </div>
        <div ref={targetRef} style={{ width: "100%" }}>
          <AdaptiveRenderer target={target} action={adaptAction} />
        </div>
        <div className="choices">
          {choices.map((choice) => (
            <button key={choice} onClick={() => answer(choice)} disabled={waitingForAudio}>{choice}</button>
          ))}
        </div>
        {waitingForAudio && <p className="muted">Listen…</p>}
        {showFeedback && (
          <div className={`badge ${showFeedback === "good" ? "good" : "bad"}`}>
            {showFeedback === "good" ? "Great!" : showFeedback === "time" ? "Let's try the next one" : "Almost — try again next round"}
          </div>
        )}
      </div>

      {eyesLost && (
        <div role="status" aria-live="polite" className="eye-alert" style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 40,
          display: "flex", alignItems: "center", gap: ".6rem", padding: ".7rem 1.2rem", borderRadius: 999,
          background: "rgba(255,216,77,0.95)", color: "#1b1400", fontSize: "1.05rem", fontWeight: 600,
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        }}>
          I can&apos;t see your eyes — look at the screen
        </div>
      )}

      <GazeDot x={gaze.x} y={gaze.y} />
    </div>
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
