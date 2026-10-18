import { useEffect, useRef, useState } from "react";
import { gazeClient } from "../api/gazeClient";

const CONFIGURED_SOURCE = import.meta.env.VITE_GAZE_SOURCE || "auto";
const MIN_CONFIDENCE = 0.4;

let webgazerPromise;

async function getWebGazer() {
  if (!webgazerPromise) {
    webgazerPromise = import("webgazer").then((m) => m.default || m);
  }
  return webgazerPromise;
}

function stopVideo(video) {
  const stream = video?.srcObject;
  if (stream?.getTracks) stream.getTracks().forEach((track) => track.stop());
  if (video) video.srcObject = null;
}

export function releaseWebGazerCamera(webgazer) {
  try {
    webgazer?.pause?.();
    webgazer?.end?.();
  } catch {
    /* webgazer throws if the camera never started */
  }
  const nodes = [
    document.getElementById("webgazerVideoFeed"),
    document.getElementById("webgazerVideoContainer"),
    document.getElementById("webgazerFaceOverlay"),
    document.getElementById("webgazerFaceFeedbackBox"),
    document.getElementById("webgazerGazeDot"),
  ].filter(Boolean);
  for (const node of nodes) {
    if (node.tagName === "VIDEO") stopVideo(node);
    node.querySelectorAll?.("video").forEach(stopVideo);
    node.remove?.();
  }
}

function mapServiceState(state) {
  switch (state) {
    case "running":
    case "uncalibrated":
    case "calibrating":
    case "no_face":
      return "running";
    case "no_camera":
      return "error";
    default:
      return "loading";
  }
}

export function useGazeTracking({ onSample, throttleMs = 33, enabled = true } = {}) {
  const [status, setStatus] = useState("idle");
  const [source, setSource] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const lastEmitRef = useRef(0);
  const onSampleRef = useRef(onSample);

  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const cleanups = [];
    let webgazer;

    function emitSample(sample) {
      const now = performance.now();
      if (now - lastEmitRef.current < throttleMs) return;
      lastEmitRef.current = now;
      onSampleRef.current?.(sample);
    }

    function startPython() {
      setSource("python");
      cleanups.push(gazeClient.acquire());
      cleanups.push(gazeClient.on("sample", (sample) => {
        if (cancelled) return;
        if (sample.conf != null && sample.conf < MIN_CONFIDENCE) return;
        emitSample({ x: sample.x, y: sample.y, t: sample.t });
      }));
      cleanups.push(gazeClient.on("status", (state) => {
        if (cancelled) return;
        setDetail(state.state);
        setStatus(mapServiceState(state.state));
        if (state.state === "no_camera") setError(new Error("The gaze service could not open a webcam."));
      }));
      const current = gazeClient.status;
      setDetail(current.state);
      setStatus(mapServiceState(current.state));
    }

    async function startWebGazer() {
      setSource("webgazer");
      const teardown = () => releaseWebGazerCamera(webgazer);
      try {
        setStatus("loading");
        webgazer = await getWebGazer();
        if (cancelled) return;
        let firstData = false;
        webgazer
          .setRegression("ridge")
          .setGazeListener((data) => {
            if (!data || cancelled) return;
            if (!firstData) {
              firstData = true;
              setStatus("running");
            }
            emitSample({ x: data.x, y: data.y, t: Date.now() });
          })
          .saveDataAcrossSessions(true);
        await webgazer.begin();
        if (cancelled) {
          teardown();
          return;
        }
        webgazer.showVideoPreview(false).showPredictionPoints(false).showFaceOverlay(false);
        if (!firstData) setStatus("running");
      } catch (err) {
        teardown();
        if (!cancelled) {
          setError(err);
          setStatus("error");
        }
        return;
      }
      cleanups.push(teardown);
    }

    async function start() {
      setStatus("loading");
      if (CONFIGURED_SOURCE === "python") {
        startPython();
        return;
      }
      if (CONFIGURED_SOURCE === "webgazer") {
        await startWebGazer();
        return;
      }
      const pythonUp = await gazeClient.probe();
      if (cancelled) return;
      if (pythonUp) startPython();
      else await startWebGazer();
    }

    start();

    return () => {
      cancelled = true;
      for (const fn of cleanups) fn();
      releaseWebGazerCamera(webgazer);
    };
  }, [enabled, throttleMs]);

  return { status, error, source, detail };
}
