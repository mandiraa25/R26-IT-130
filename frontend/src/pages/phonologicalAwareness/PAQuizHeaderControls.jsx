import { useLayoutEffect, useRef } from "react";
import { WoodenMusicToggle } from "../../components/common/WoodenNavControls";
import "./PAQuizHeaderControls.css";

/** Shared question controls for all four PA mini-game categories and languages. */
export default function PAQuizHeaderControls({ currentIdx, totalQuestions, soundEnabled, onToggleSound }) {
  const trackerRef = useRef(null);

  useLayoutEffect(() => {
    const tracker = trackerRef.current;
    const header = tracker.parentElement;
    const leftControls = header.firstElementChild;
    const soundControls = header.lastElementChild;
    const updateAvailableWidth = () => {
      const reservedWidth = Math.max(leftControls.getBoundingClientRect().width, soundControls.getBoundingClientRect().width);
      tracker.style.setProperty("--pa-tracker-available-width", `${Math.max(0, header.clientWidth - 2 * reservedWidth - 32)}px`);
    };
    updateAvailableWidth();
    const observer = new ResizeObserver(updateAvailableWidth);
    [header, leftControls, soundControls].forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Absolute artwork preserves the existing header and quiz layout. */}
      <div
        ref={trackerRef}
        className="pa-quiz-tracker"
        role="img"
        aria-label={`Question ${currentIdx + 1} of ${totalQuestions}`}
        style={{ "--active-circle-x": (9.25 + Math.min(4, Math.max(0, currentIdx)) * 20.35) + '%' }}
      >
        <img src="/images/workingMemory/shared/boards/navigation/nav-tracker.png" alt="" draggable="false" />
        <img className="pa-quiz-tracker-active" src="/images/workingMemory/shared/boards/navigation/nav-tracker.png" alt="" draggable="false" />
        <span className="pa-quiz-tracker-number" aria-hidden="true">{currentIdx + 1}</span>
      </div>

      <div className="flex items-center gap-2 z-10">
        <WoodenMusicToggle
          className="pa-quiz-sound"
          muted={!soundEnabled}
          ariaLabel="Toggle Sound"
          title="Toggle Sound"
          onToggle={onToggleSound}
        />
      </div>
    </>
  );
}
