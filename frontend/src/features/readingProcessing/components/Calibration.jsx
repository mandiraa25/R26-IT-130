import { useCallback, useEffect, useRef, useState } from "react";
import { gazeClient } from "../api/gazeClient";

const POINTS = [
  [10, 10], [50, 10], [90, 10],
  [10, 50], [50, 50], [90, 50],
  [10, 90], [50, 90], [90, 90],
];

const CLICKS_PER_POINT = 5;
const STALL_MS = 4000;

const REASON_TEXT = {
  no_face: "I can't see your face — move so your whole face is in the camera view.",
  eyes_closed: "Keep your eyes open and look right at the dot.",
  head_turned: "Turn to face the screen more directly.",
};

export default function Calibration({ onDone, trackerStatus, source = "webgazer" }) {
  const isPython = source === "python";
  const [idx, setIdx] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [collecting, setCollecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stallReason, setStallReason] = useState(null);
  const [fitting, setFitting] = useState(false);
  const [errorPx, setErrorPx] = useState(null);
  const [failure, setFailure] = useState(null);

  const dotRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const lastAcceptRef = useRef(0);
  const lastReasonRef = useRef(null);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const ready = trackerStatus === "running";
  const done = idx >= POINTS.length;

  useEffect(() => {
    if (!isPython) return undefined;
    gazeClient.beginCalibration();
    return undefined;
  }, [isPython]);

  useEffect(() => {
    if (!isPython) return undefined;
    return gazeClient.on("calibration", (evt) => {
      if (evt.kind === "progress") {
        if (evt.reason) {
          lastReasonRef.current = evt.reason;
          return;
        }
        lastReasonRef.current = null;
        lastAcceptRef.current = Date.now();
        setStallReason(null);
        setProgress(evt.needed ? evt.collected / evt.needed : 0);
        if (evt.collected >= evt.needed) {
          setCollecting(false);
          setProgress(1);
          setIdx((i) => i + 1);
        }
      } else if (evt.kind === "done") {
        setFitting(false);
        setErrorPx(evt.errorPx);
        setTimeout(() => onDoneRef.current?.(), 1400);
      } else if (evt.kind === "error") {
        setFitting(false);
        setCollecting(false);
        setFailure(evt.message);
      }
    });
  }, [isPython]);

  useEffect(() => {
    if (!collecting) return undefined;
    const timer = setInterval(() => {
      if (Date.now() - lastAcceptRef.current > STALL_MS) {
        setStallReason(lastReasonRef.current || "no_face");
      }
    }, 500);
    return () => clearInterval(timer);
  }, [collecting]);

  useEffect(() => {
    if (!done || isPython) return undefined;
    const timer = setTimeout(() => onDoneRef.current?.(), 0);
    return () => clearTimeout(timer);
  }, [done, isPython]);

  useEffect(() => {
    if (!done || !isPython || failure || errorPx != null) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setFitting(true);
      gazeClient.fitCalibration();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [done, isPython, failure, errorPx]);

  const click = useCallback(() => {
    if (isPython) {
      if (collecting || !dotRef.current) return;
      const rect = dotRef.current.getBoundingClientRect();
      setCollecting(true);
      setProgress(0);
      setStallReason(null);
      lastAcceptRef.current = Date.now();
      gazeClient.calibrationPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return;
    }
    const next = clicks + 1;
    if (next >= CLICKS_PER_POINT) {
      setClicks(0);
      setIdx((i) => i + 1);
    } else {
      setClicks(next);
    }
  }, [isPython, collecting, clicks]);

  function cancelPoint() {
    setCollecting(false);
    setProgress(0);
    setStallReason(null);
    gazeClient.beginCalibration();
    setIdx(0);
  }

  function retry() {
    setFailure(null);
    setErrorPx(null);
    setFitting(false);
    setCollecting(false);
    setProgress(0);
    setStallReason(null);
    setClicks(0);
    setIdx(0);
    if (isPython) gazeClient.beginCalibration();
  }

  const fill = isPython ? progress : clicks / CLICKS_PER_POINT;
  const [px, py] = POINTS[Math.min(idx, POINTS.length - 1)];
  const panelSide = py > 50 ? { top: 24 } : { bottom: 24 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,0.97)", zIndex: 50, color: "white" }}>
      {!done && (
        <div style={{ position: "absolute", ...panelSide, left: "50%", transform: "translateX(-50%)", width: "min(560px, 90vw)", textAlign: "center", pointerEvents: "none" }}>
          <h2 style={{ margin: "0 0 .25rem" }}>Look &amp; tap</h2>
          {!ready && <p className="muted">Starting camera… please wait.</p>}
          {ready && (
            <p className="muted" style={{ margin: 0 }}>
              {isPython
                ? `Tap the yellow dot, then keep looking at it until it fills. (${idx + 1}/${POINTS.length})`
                : `Look at the yellow dot and tap it ${CLICKS_PER_POINT} times. (${idx + 1}/${POINTS.length})`}
            </p>
          )}
          {stallReason && (
            <p className="badge bad" style={{ marginTop: ".75rem", display: "inline-block" }}>
              {REASON_TEXT[stallReason] || "Not getting a clear view of your eyes."}
            </p>
          )}
          {isPython && !stallReason && <p className="note" style={{ opacity: 0.6, marginTop: ".5rem" }}>Using the local eye-tracking service.</p>}
        </div>
      )}

      {ready && !done && (
        <button
          ref={dotRef}
          onClick={click}
          disabled={collecting}
          aria-label={`Calibration point ${idx + 1} of ${POINTS.length}`}
          style={{
            position: "absolute",
            left: `${px}%`,
            top: `${py}%`,
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            padding: 0,
            border: "none",
            zIndex: 2,
            background: `conic-gradient(var(--rf-accent) ${fill * 360}deg, rgba(255,255,255,0.18) 0)`,
            boxShadow: collecting ? "0 0 46px rgba(255,216,77,0.95)" : "0 0 30px rgba(255,216,77,0.5)",
            cursor: collecting ? "default" : "pointer",
          }}
        />
      )}

      {stallReason && collecting && (
        <div style={{ position: "absolute", bottom: py > 50 ? "auto" : 96, top: py > 50 ? 96 : "auto", left: "50%", transform: "translateX(-50%)" }}>
          <button className="ghost" onClick={cancelPoint}>Start over</button>
        </div>
      )}

      {fitting && <div className="card" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>Working out your calibration…</div>}

      {errorPx != null && (
        <div className="card stack" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <h3 style={{ margin: 0 }}>Calibration saved</h3>
          <p className="muted">Typical accuracy: about {Math.round(errorPx)} pixels.</p>
        </div>
      )}

      {failure && (
        <div className="card stack" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", maxWidth: 420 }}>
          <h3 style={{ margin: 0 }}>Calibration didn&apos;t work</h3>
          <p className="muted">{failure}</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button onClick={retry}>Try again</button>
            <button className="ghost" onClick={() => onDoneRef.current?.()}>Skip for now</button>
          </div>
        </div>
      )}
    </div>
  );
}
