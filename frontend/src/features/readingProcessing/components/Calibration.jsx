import { useCallback, useEffect, useRef, useState } from "react";
import { gazeClient } from "../api/gazeClient";
import { recordWebGazerClick } from "../hooks/useGazeTracking";
import { MemoryStage, MemoryNav, MemoryBoard, MemoryButton, MemoryBunny } from "../../workingMemory/shared/GameLayout";
import { SCREENING_ART } from "../../workingMemory/config/levelThemes";

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
    if (!dotRef.current) return;
    const rect = dotRef.current.getBoundingClientRect();
    recordWebGazerClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
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
  const captionAtTop = py > 50;
  const prompt = !ready
    ? "Starting the camera. Please wait."
    : isPython
      ? `Tap the yellow dot, then keep looking at it until it fills. ${idx + 1} of ${POINTS.length}`
      : `Look at the yellow dot and tap it ${CLICKS_PER_POINT} times. ${idx + 1} of ${POINTS.length}`;

  return (
    <>
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title="Eye tracking" onBack={onCancel} controls={false} />
        {(fitting || errorPx != null || failure || !ready) && (
          <MemoryBoard>
            <div className="rf-eye-copy">
              {fitting && <h1>One moment</h1>}
              {fitting && <p>Working out where your eyes are looking.</p>}
              {errorPx != null && <h1>All set</h1>}
              {errorPx != null && <p>The camera is ready. Typical accuracy is about {Math.round(errorPx)} pixels.</p>}
              {failure && <h1>Let&apos;s try again</h1>}
              {failure && <p>{failure}</p>}
              {!ready && !fitting && errorPx == null && !failure && <h1>Look and tap</h1>}
              {!ready && !fitting && errorPx == null && !failure && <p>Starting the camera. Please wait.</p>}
              {failure && (
                <div className="rf-eye-actions">
                  <MemoryButton onClick={retry}>Try again</MemoryButton>
                  <MemoryButton onClick={() => onDoneRef.current?.()}>Skip for now</MemoryButton>
                </div>
              )}
            </div>
          </MemoryBoard>
        )}
        {(!ready || done) && <MemoryBunny message="Look at the yellow dot" />}
      </MemoryStage>

      {ready && !done && (
        <div className={`rf-eye-caption ${captionAtTop ? "is-top" : "is-bottom"}`}>
          <p>{prompt}</p>
          {stallReason && <p>{REASON_TEXT[stallReason] || "Not getting a clear view of your eyes."}</p>}
        </div>
      )}

      {ready && !done && (
        <button
          ref={dotRef}
          type="button"
          className="rf-cal-dot"
          onClick={click}
          disabled={collecting}
          aria-label={`Calibration point ${idx + 1} of ${POINTS.length}`}
          style={{
            left: `${px}%`,
            top: `${py}%`,
            background: `conic-gradient(#ffb000 ${fill * 360}deg, rgba(255,255,255,0.35) 0)`,
          }}
        />
      )}

      {stallReason && collecting && (
        <div className={`rf-eye-caption-action ${captionAtTop ? "is-top" : "is-bottom"}`}>
          <MemoryButton onClick={cancelPoint}>Start over</MemoryButton>
        </div>
      )}
    </>
  );
}
