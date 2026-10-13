import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported?.("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported?.("audio/webm")) return "audio/webm";
  return "";
};

const isCurrentRecordingContext = (activeContext, context) =>
  Boolean(context && activeContext === context && !context.discarded);

const releaseCurrentRecordingContext = (activeContextRef, context) => {
  if (!activeContextRef || activeContextRef.current !== context) return false;
  activeContextRef.current = null;
  return true;
};

const clearRecordingContextTimer = (context, clearIntervalFn = globalThis.clearInterval) => {
  if (!context || context.timer == null) return;
  clearIntervalFn(context.timer);
  context.timer = null;
};

const requestStopRecordingContext = (
  context,
  clearIntervalFn = globalThis.clearInterval
) => {
  if (!context) return false;
  if (context.stopRequested) {
    clearRecordingContextTimer(context, clearIntervalFn);
    return false;
  }
  context.stopRequested = true;
  clearRecordingContextTimer(context, clearIntervalFn);
  if (context.recorder?.state !== "recording") return false;
  context.recorder.stop();
  return true;
};

const releasePendingRecordingContext = (
  activeContextRef,
  context,
  clearIntervalFn = globalThis.clearInterval
) => {
  if (!isCurrentRecordingContext(activeContextRef?.current, context) || context.recorder) {
    return false;
  }
  context.discarded = true;
  requestStopRecordingContext(context, clearIntervalFn);
  return releaseCurrentRecordingContext(activeContextRef, context);
};

const stopRecordingContextStream = (context) => {
  context?.stream?.getTracks().forEach((track) => track.stop());
};

const createRecordingContext = ({ id, maxDurationMs }) => ({
  id,
  recorder: null,
  stream: null,
  chunks: [],
  startedAt: null,
  timer: null,
  discarded: false,
  stopRequested: false,
  maxDurationMs,
});

function SpeechRecorder({
  onRecordingReady,
  onSupportChange,
  onRecordingStateChange,
  resetKey,
  maxDurationMs = null,
  showDurationLimit = false,
  onAutoSubmit,
  submitting = false,
  autoSubmitDelayMs = 2000,
}) {
  const { t } = useTranslation("sp");
  const activeContextRef = useRef(null);
  const nextContextIdRef = useRef(0);
  const audioUrlRef = useRef("");
  const recordingStateRef = useRef(false);
  const onRecordingReadyRef = useRef(onRecordingReady);
  const onRecordingStateChangeRef = useRef(onRecordingStateChange);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const pendingRecordingRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState("");
  const supported = useMemo(
    () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices) && typeof MediaRecorder !== "undefined",
    []
  );
  const durationLimitSeconds = Number.isFinite(Number(maxDurationMs)) && Number(maxDurationMs) > 0
    ? Math.round(Number(maxDurationMs) / 1000)
    : null;

  const notifyRecordingState = useCallback((nextState) => {
    if (recordingStateRef.current === nextState) return;
    recordingStateRef.current = nextState;
    setIsRecording(nextState);
    onRecordingStateChangeRef.current?.(nextState);
  }, []);

  const clearAutoSubmitRefs = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      window.clearInterval(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    pendingRecordingRef.current = null;
  }, []);

  const clearAutoSubmit = useCallback(() => {
    clearAutoSubmitRefs();
  }, [clearAutoSubmitRefs]);

  const submitPendingRecording = useCallback(() => {
    const pendingRecording = pendingRecordingRef.current;
    if (!pendingRecording) return;
    clearAutoSubmit();
    onAutoSubmitRef.current?.(pendingRecording);
  }, [clearAutoSubmit]);

  const queueAutoSubmit = useCallback((nextRecording) => {
    clearAutoSubmit();
    if (!onAutoSubmitRef.current || !nextRecording?.audioBlob) return;
    const delayMs = Math.max(500, Number(autoSubmitDelayMs) || 2000);
    const dueAt = Date.now() + delayMs;
    pendingRecordingRef.current = nextRecording;
    autoSubmitTimerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, dueAt - Date.now());
      if (remaining === 0) submitPendingRecording();
    }, 100);
  }, [autoSubmitDelayMs, clearAutoSubmit, submitPendingRecording]);

  const stopRecording = useCallback(() => {
    const context = activeContextRef.current;
    if (releasePendingRecordingContext(activeContextRef, context, window.clearInterval)) {
      notifyRecordingState(false);
      return true;
    }
    return requestStopRecordingContext(context, window.clearInterval);
  }, [notifyRecordingState]);

  const revokeCurrentAudioUrl = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = "";
    setAudioUrl("");
  }, []);

  const discardCurrentContext = useCallback(() => {
    const context = activeContextRef.current;
    if (!context) return null;
    context.discarded = true;
    releaseCurrentRecordingContext(activeContextRef, context);
    requestStopRecordingContext(context, window.clearInterval);
    stopRecordingContextStream(context);
    return context;
  }, []);

  useEffect(() => {
    onSupportChange?.(supported);
  }, [onSupportChange, supported]);

  useEffect(() => {
    onRecordingReadyRef.current = onRecordingReady;
  }, [onRecordingReady]);

  useEffect(() => {
    onRecordingStateChangeRef.current = onRecordingStateChange;
  }, [onRecordingStateChange]);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  useEffect(() => {
    clearAutoSubmitRefs();
    discardCurrentContext();
    const resetTimer = window.setTimeout(() => {
      if (activeContextRef.current) return;
      notifyRecordingState(false);
      setDurationMs(0);
      setError("");
      revokeCurrentAudioUrl();
      onRecordingReadyRef.current?.(null);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [clearAutoSubmitRefs, discardCurrentContext, notifyRecordingState, resetKey, revokeCurrentAudioUrl]);

  useEffect(() => {
    return () => {
      clearAutoSubmitRefs();
      discardCurrentContext();
      recordingStateRef.current = false;
      onRecordingStateChangeRef.current?.(false);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [clearAutoSubmitRefs, discardCurrentContext]);

  const startRecording = async () => {
    if (!supported) {
      setError(t("recorder_not_supported"));
      return;
    }

    clearAutoSubmit();
    const previousContext = discardCurrentContext();
    if (previousContext) notifyRecordingState(false);
    const context = createRecordingContext({
      id: nextContextIdRef.current + 1,
      maxDurationMs: Number(maxDurationMs),
    });
    nextContextIdRef.current = context.id;
    activeContextRef.current = context;
    setError("");
    setDurationMs(0);
    revokeCurrentAudioUrl();
    onRecordingReadyRef.current?.(null);
    notifyRecordingState(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      context.stream = stream;
      const currentAtPermissionResolution = isCurrentRecordingContext(
        activeContextRef.current,
        context
      );
      if (!currentAtPermissionResolution || context.stopRequested) {
        context.discarded = true;
        stopRecordingContextStream(context);
        if (currentAtPermissionResolution && releaseCurrentRecordingContext(activeContextRef, context)) {
          notifyRecordingState(false);
        }
        return;
      }

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      context.recorder = recorder;
      context.startedAt = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) context.chunks.push(event.data);
      };

      recorder.onstop = () => {
        clearRecordingContextTimer(context, window.clearInterval);
        stopRecordingContextStream(context);
        if (!isCurrentRecordingContext(activeContextRef.current, context)) return;

        releaseCurrentRecordingContext(activeContextRef, context);
        const elapsedMs = context.startedAt ? Date.now() - context.startedAt : 0;
        const limitMs = context.maxDurationMs;
        const audioDurationMs = Number.isFinite(limitMs) && limitMs > 0
          ? Math.min(elapsedMs, limitMs)
          : elapsedMs;
        notifyRecordingState(false);

        const blob = new Blob(context.chunks, { type: mimeType || "audio/webm" });
        const nextAudioUrl = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = nextAudioUrl;
        setAudioUrl(nextAudioUrl);
        setDurationMs(audioDurationMs);
        const nextRecording = {
          audioBlob: blob,
          audioUrl: nextAudioUrl,
          audioDurationMs,
        };
        onRecordingReadyRef.current?.(nextRecording);
        queueAutoSubmit(nextRecording);
      };

      recorder.start();
      context.timer = window.setInterval(() => {
        if (!isCurrentRecordingContext(activeContextRef.current, context)) {
          context.discarded = true;
          requestStopRecordingContext(context, window.clearInterval);
          return;
        }
        const elapsedMs = Date.now() - context.startedAt;
        const limitMs = context.maxDurationMs;
        const hasLimit = Number.isFinite(limitMs) && limitMs > 0;
        setDurationMs(hasLimit ? Math.min(elapsedMs, limitMs) : elapsedMs);
        if (hasLimit && elapsedMs >= limitMs) {
          requestStopRecordingContext(context, window.clearInterval);
        }
      }, 250);
    } catch {
      if (stream && !context.stream) context.stream = stream;
      clearRecordingContextTimer(context, window.clearInterval);
      stopRecordingContextStream(context);
      if (!isCurrentRecordingContext(activeContextRef.current, context)) return;
      const permissionWasCancelled = context.stopRequested && !context.recorder;
      releaseCurrentRecordingContext(activeContextRef, context);
      notifyRecordingState(false);
      if (!permissionWasCancelled) setError(t("recorder_microphone_needed"));
    }
  };

  const resetRecording = () => {
    clearAutoSubmit();
    discardCurrentContext();
    notifyRecordingState(false);
    revokeCurrentAudioUrl();
    setDurationMs(0);
    setError("");
    onRecordingReadyRef.current?.(null);
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      {/* Audio Waveform Bars */}
      <div className="mb-2 flex items-center justify-center gap-1.5">
        {[18, 28, 44, 58, 44, 28, 18].map((h, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-gradient-to-t from-emerald-500 via-amber-300 to-rose-400 animate-pulse"
                : "bg-amber-400/50"
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Glowing Round Mic Button */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Ambient Ring Halo */}
        <div
          className={`pointer-events-none absolute h-28 w-28 sm:h-32 sm:w-32 rounded-full transition-all duration-500 ${
            isRecording
              ? "bg-rose-500/25 ring-8 ring-rose-400/50 animate-ping"
              : "bg-emerald-500/15 ring-8 ring-emerald-300/35"
          }`}
        />

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!supported || submitting}
          aria-label={isRecording ? t("recorder_stop") : t("recorder_start")}
          className={`relative z-10 flex h-22 w-22 sm:h-26 sm:w-26 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
            isRecording
              ? "bg-gradient-to-b from-rose-500 to-red-600 shadow-rose-500/50"
              : "bg-gradient-to-b from-[#2ecc71] via-[#27ae60] to-[#1e824c] shadow-emerald-500/50 hover:from-[#34d178] hover:to-[#2ecc71]"
          }`}
        >
          {/* Crisp Microphone SVG */}
          <svg className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>

        {/* Status Pill Badge */}
        <div className="mt-3 text-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs sm:text-sm font-black shadow-md ${
              isRecording
                ? "border-2 border-rose-300 bg-rose-100 text-rose-800 animate-pulse"
                : submitting
                  ? "border-2 border-amber-300 bg-amber-100 text-amber-900"
                  : "border-2 border-emerald-400 bg-emerald-100 text-emerald-950"
            }`}
          >
            {isRecording
              ? `${t("recorder_recording")} • ${(durationMs / 1000).toFixed(1)}s`
              : submitting
                ? t("sending_to_leo")
                : t("recorder_start")}
          </span>
        </div>
      </div>

      {showDurationLimit && durationLimitSeconds && !isRecording && (
        <p className="mt-2.5 inline-block rounded-full border border-amber-200/80 bg-white/90 px-3.5 py-1 text-[11px] font-black text-[#5c3514] shadow-sm backdrop-blur-xs">
          {t("recorder_time_guidance", { seconds: durationLimitSeconds })}
        </p>
      )}

      {audioUrl && !isRecording && !onAutoSubmit && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <audio className="max-w-xs" controls src={audioUrl} />
          <button
            type="button"
            onClick={resetRecording}
            disabled={submitting}
            className="rounded-full border-2 border-[#8b552e] bg-[#fffcf5] px-4 py-1.5 text-xs font-black text-[#5c3514] shadow-sm hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
          >
            {t("recorder_again")}
          </button>
        </div>
      )}

      {!supported && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
          {t("recorder_not_supported")}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default SpeechRecorder;
