import { useEffect, useRef, useState } from "react";

export function useEyeWatchdog({
  enabled,
  lastSampleAtRef,
  lossAfterMs = 2500,
  repeatMs = 10_000,
  onAlert,
} = {}) {
  const [lost, setLost] = useState(false);
  const lostSinceRef = useRef(null);
  const lastAlertRef = useRef(0);
  const onAlertRef = useRef(onAlert);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = setInterval(() => {
      const seenAt = lastSampleAtRef?.current || 0;
      if (!seenAt) return;
      const now = Date.now();
      if (now - seenAt <= lossAfterMs) {
        if (lostSinceRef.current != null) {
          lostSinceRef.current = null;
          setLost(false);
        }
        return;
      }
      if (lostSinceRef.current == null) {
        lostSinceRef.current = now;
        lastAlertRef.current = now;
        setLost(true);
        onAlertRef.current?.(0);
        return;
      }
      if (now - lastAlertRef.current >= repeatMs) {
        lastAlertRef.current = now;
        onAlertRef.current?.(Math.round((now - lostSinceRef.current) / 1000));
      }
    }, 500);

    return () => clearInterval(timer);
  }, [enabled, lossAfterMs, repeatMs, lastSampleAtRef]);

  return enabled && lost;
}
