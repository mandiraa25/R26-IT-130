import ActionButton from "../components/ActionButton";
import React, { useEffect, useRef } from "react";
import GameStyles from "../styles/Gamestyles";
import {
  Header,
  IntroScreen,
  BunnyMascot,
  ResultScreen,
  WoodenQuestionProgress,
} from "../components/SharedScreens";
import HowToPlayScreen from "../components/HowToPlayScreen";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

const NUMBER_LEVEL_THEMES = {
  1: {
    primary: "#F28C28",
    light: "#FFB765",
    dark: "#B9530B",
    surface: "#FFF0D5",
    border: "#F7A84A",
    buttonImage: "/images/workingMemory/improve/buttons/number_button_level1.png",
  },

  2: {
    primary: "#4DAE58",
    light: "#79CF75",
    dark: "#267735",
    surface: "#EAF8E8",
    border: "#68BE68",
    buttonImage: "/images/workingMemory/improve/buttons/number_button_level2.png",
  },

  3: {
    primary: "#E56F9D",
    light: "#F39ABC",
    dark: "#AD3F6B",
    surface: "#FCE8F0",
    border: "#E987AD",
    buttonImage: "/images/workingMemory/improve/buttons/number_button_level3.png",
  },

  4: {
    primary: "#873CB7",
    light: "#E7D8F0",
    dark: "#642B91",
    surface: "#F0E4F5",
    border: "#A986C3",
    buttonImage: "/images/workingMemory/improve/buttons/number_button_level4.png",
  },
};

const NumbersGame = ({
  phase,
  levelNumber,
  subCategoryKey,
  t,
  i18n,
  soundEnabled,
  setSoundEnabled,
  handleBackToLevels,
  subCatData,
  handleReplayVideo,
  handleSkipAndPlay,
  howToWatchBunny,
  startQuiz,
  currentQuestion,
  timerCount,
  timerMax,
  currentIdx,
  questions,
  slots,
  dragPool,
  handleTileClick,
  handleSlotClear,
  handleDragSubmit,
  speakText,
  isCurrentCorrect,
  lastUserAnswer,
  handleNextQuestion,
  score,
  isSubmitting,
  submitResult,
  handleNextSubCategory,
  backgroundSrc = "/images/workingMemory/improve/common/common_bg.png",
  handleReadyToPlay,
  earnedStars,
  lastStarReward,
  totalStars,
}) => {
  const isSinhala = i18n.language?.startsWith("si");
  const dialAudioContextRef = useRef(null);

  useEffect(() => () => {
    const context = dialAudioContextRef.current;
    if (context && context.state !== "closed") context.close().catch(() => {});
  }, []);

  const levelTheme =
    NUMBER_LEVEL_THEMES[levelNumber] ||
    NUMBER_LEVEL_THEMES[1];

  const themeVariables = {
    "--number-primary": levelTheme.primary,
    "--number-light": levelTheme.light,
    "--number-dark": levelTheme.dark,
    "--number-surface": levelTheme.surface,
    "--number-border": levelTheme.border,
    "--number-button-image": `url('${levelTheme.buttonImage}')`,
    "--vine-board-image": `url('${getWorkingMemoryThemeAssets(levelNumber).questionBoard}')`,
  };

  const vineBoardImage = getWorkingMemoryThemeAssets(levelNumber).questionBoard;

  const memoryInstruction = currentQuestion?.instruction || (isSinhala
    ? "අංක නිවැරදි පිළිවෙලට මතක තබා ගන්න."
    : "Remember the numbers in the correct order.");

  const answerInstruction = currentQuestion?.isBackward ? currentQuestion.instruction : isSinhala
    ? "නිවැරදි අංක අනුපිළිවෙලට තට්ටු කරන්න."
    : "Tap the correct numbers in order.";

  const playTapChime = (value) => {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const noteFrequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];
    if (!dialAudioContextRef.current || dialAudioContextRef.current.state === "closed") {
      dialAudioContextRef.current = new AudioContextClass();
    }
    const context = dialAudioContextRef.current;
    const play = () => {
      const gain = context.createGain();
      const now = context.currentTime;
      const frequency = noteFrequencies[Number(value)] || noteFrequencies[0];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      gain.connect(context.destination);
      [frequency, frequency * 2].forEach((tone, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(tone, now);
        oscillator.connect(gain);
        oscillator.start(now);
        oscillator.stop(now + 0.22);
      });
    };
    if (context.state === "suspended") {
      context.resume().then(play).catch(() => {});
    } else {
      play();
    }
  };

  const handleNumberChoice = (value) => {
    playTapChime(value);
    handleTileClick(value);
  };

  const nextButtonText =
    currentIdx < questions.length - 1
      ? isSinhala
        ? "මීළඟ ප්‍රශ්නය ➔"
        : "Next Question ➔"
      : isSinhala
        ? "අවසන් කරන්න ➔"
        : "Finish ➔";

  return (
    <div
      data-level={levelNumber} lang={i18n.language} className={`wm-game-root number-game number-game--level-${levelNumber} relative w-full h-screen h-dvh overflow-hidden font-custom select-none flex flex-col ${Number(levelNumber) === 4 ? "level-4-theme" : ""}`}
      style={themeVariables}
    >
      {/* Background */}
      <img
        src={backgroundSrc}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/images/workingMemory/improve/common/common_bg.png";
        }}
        alt="Jungle Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      <div className="scrim" />

      {/* Header */}
      <Header
        phase={phase}
        levelNumber={levelNumber}
        subCategoryKey={subCategoryKey}
        t={t}
        handleBackToLevels={handleBackToLevels}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        earnedStars={earnedStars}
        totalStars={totalStars}
      />

      {/* PHASE 1: HOW-TO-PLAY VIDEO */}
      {phase === "video" && (
        <HowToPlayScreen
          levelNumber={levelNumber}
          gameType={subCategoryKey}
          videoUrl={subCatData.videoUrl || subCatData.youtubeVideoUrl}
          videoTitle={subCatData.title}
          bunnyImage={howToWatchBunny}
          onWatchVideo={handleReplayVideo}
          onSkipAndPlay={handleSkipAndPlay}
          language={i18n.language}
        />
      )}

      {/* PHASE 2: BUNNY INSTRUCTIONS */}
      {phase === "intro" && currentQuestion && (
        <IntroScreen
          i18n={i18n}
          subCategoryKey={subCategoryKey}
          levelNumber={levelNumber}
          soundEnabled={soundEnabled}
          speakText={speakText}
          onReady={handleReadyToPlay}
        />
      )}

      {/* PHASE 3: NUMBER MEMORIZATION */}
      {phase === "show" && currentQuestion && (
        <main className="number-stage relative z-10 flex-1 mx-auto w-full px-3 py-2 flex items-center justify-center animate-fadeIn">
          <section
            className="number-vine-board number-vine-board--show adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <div className="number-board-bunny">
              <BunnyMascot screen="question" />
            </div>

            <div className="number-vine-board__content adaptive-vine-board__content">
              {/* Instruction */}
              <div className="instruction-tag number-memory-title">
                {memoryInstruction}
              </div>

              {/* Timer */}
              <div className="timerbar-wrap number-memory-timer">
                <div
                  className="timerbar-fill number-level-timer-fill"
                  style={{
                    width: `${(timerCount / timerMax) * 100}%`,
                  }}
                />

                <div className="timer-label uppercase tracking-widest text-[0.75rem]">
                  ⏱{" "}
                  {isSinhala
                    ? "ඉතිරි කාලය"
                    : "Time Left"}
                  : {timerCount}s
                </div>
              </div>

              {/* Light frame with level-coloured circles */}
              <div className="number-sequence-panel">
                {currentQuestion.showItems.map(
                  (item, index) => (
                    <div
                      key={`number-${index}`}
                      className="level-number-circle level-number-circle--large"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>

              <div className="number-memory-footer">
                🔢{" "}
                {isSinhala
                  ? "පිළිවෙල මතක තබා ගන්න"
                  : "Remember the order"}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 4: ANSWER SCREEN */}
      {phase === "answer" && currentQuestion && (
        <main className="number-stage relative z-10 flex-1 mx-auto w-full px-3 py-2 flex items-center justify-center overflow-hidden animate-fadeIn">
          <section
            className="number-vine-board number-vine-board--answer adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <div className="number-board-bunny">
              <BunnyMascot screen="question" />
            </div>

            <div className="number-vine-board__content number-vine-board__content--answer adaptive-vine-board__content">
              {/* Only one instruction */}
              <div className="instruction-tag number-answer-title">
                <span className="font-black text-left flex-1 leading-snug text-slate-800">
                  {answerInstruction}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    speakText(answerInstruction)
                  }
                  className="number-audio-button"
                  title="Listen again"
                  aria-label="Listen to instruction"
                >
                  🔊
                </button>
              </div>

              {/* Selected order */}
              <div className="number-answer-slots">
                {slots.map((value, index) => (
                  <button
                    key={`slot-${index}`}
                    type="button"
                    onClick={() =>
                      value && handleSlotClear(index)
                    }
                    className={`level-number-circle level-number-circle--answer ${
                      value
                        ? "level-number-circle--selected"
                        : "level-number-circle--empty"
                    }`}
                    aria-label={
                      value
                        ? `Remove ${value}`
                        : `Empty position ${index + 1}`
                    }
                  >
                    {value || "?"}
                  </button>
                ))}
              </div>

              {/* Number choices – no duplicate instruction */}
              <div className="number-choice-panel">
                {dragPool.length > 0 ? (
                  dragPool.map((item, index) => (
                    <button
                      key={`choice-${index}`}
                      type="button"
                      onClick={() => handleNumberChoice(item)}
                      className="level-number-circle level-number-circle--choice"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="number-all-selected">
                    <span>✨</span>

                    <span>
                      {isSinhala
                        ? "සියලුම ඉලක්කම් තෝරාගෙන ඇත!"
                        : "All numbers selected!"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <ActionButton action="check"
                type="button"
                onClick={handleDragSubmit}
                className="number-submit-button"
              >
                {t("submit_answers")}
              </ActionButton>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 5: FEEDBACK */}
      {phase === "feedback" && currentQuestion && (
        <main className="number-stage relative z-10 flex-1 mx-auto w-full px-3 py-2 flex items-center justify-center overflow-hidden animate-fadeIn">
          <section
            className="number-vine-board number-vine-board--feedback adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <div className="number-board-bunny">
              <BunnyMascot
                screen={
                  isCurrentCorrect
                    ? "correct"
                    : "incorrect"
                }
              />
            </div>

            <div className="number-vine-board__content number-vine-board__content--feedback adaptive-vine-board__content">
              {/* Result icon */}
              <div
                className={`number-feedback-icon ${
                  isCurrentCorrect
                    ? "bg-emerald-100"
                    : "bg-rose-100"
                }`}
              >
                {isCurrentCorrect ? "✅" : "❌"}
              </div>

              {/* Result heading */}
              <h3
                className={`number-feedback-title ${
                  isCurrentCorrect
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {isCurrentCorrect
                  ? isSinhala
                    ? "නිවැරදියි!"
                    : "Correct!"
                  : isSinhala
                    ? "නැවත උත්සාහ කරමු!"
                    : "Try Again!"}
              </h3>

              {/* Reward */}
              {isCurrentCorrect && lastStarReward > 0 && (
                <div className="number-carrot-reward">
                  <div className="flex items-center gap-2 font-black text-lg text-amber-950">
                    <span>+{lastStarReward} {isSinhala ? "තරු" : "Stars"}</span>
                    <span>⭐</span>
                  </div>

                  <span className="text-xs font-black text-slate-600 uppercase">
                    {isSinhala ? "මෙම ක්‍රීඩාව" : "This game"}: {earnedStars} ⭐ · {isSinhala ? "මුළු" : "Total"}: {totalStars} ⭐
                  </span>
                </div>
              )}

              {/* Answer comparison */}
              <div className="number-feedback-answer-box">
                <div className="number-feedback-answer-group">
                  <span className="number-feedback-label">
                    {isSinhala
                      ? "ඔබගේ පිළිතුර"
                      : "Your Answer"}
                    :
                  </span>

                  <div className="number-feedback-circles">
                    {(Array.isArray(lastUserAnswer)
                      ? lastUserAnswer
                      : [lastUserAnswer]
                    ).map((item, index) => (
                      <span
                        key={`user-answer-${index}`}
                        className="level-number-circle level-number-circle--feedback"
                      >
                        {item || "?"}
                      </span>
                    ))}
                  </div>
                </div>

                {!isCurrentCorrect && (
                  <div className="number-feedback-answer-group">
                    <span className="number-feedback-label">
                      {isSinhala
                        ? "නිවැරදි පිළිතුර"
                        : "Correct Answer"}
                      :
                    </span>

                    <div className="number-feedback-circles">
                      {(Array.isArray(
                        currentQuestion.correct,
                      )
                        ? currentQuestion.correct
                        : [currentQuestion.correct]
                      ).map((item, index) => (
                        <span
                          key={`correct-answer-${index}`}
                          className="level-number-circle level-number-circle--feedback"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next button */}
              <ActionButton action={currentIdx < questions.length - 1 ? "next" : "finish"}
                type="button"
                onClick={handleNextQuestion}
                className={`number-next-button ${
                  isCurrentCorrect
                    ? "bg-emerald-500 border-emerald-700"
                    : "bg-rose-500 border-rose-700"
                }`}
              >
                {nextButtonText}
              </ActionButton>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 6: RESULTS */}
      {phase === "result" && (
        <ResultScreen
          levelNumber={levelNumber}
          score={score}
          questions={questions}
          earnedStars={earnedStars}
          totalStars={totalStars}
          t={t}
          isSubmitting={isSubmitting}
          submitResult={submitResult}
          startQuiz={startQuiz}
          handleNextSubCategory={handleNextSubCategory}
          handleBackToLevels={handleBackToLevels}
          useVineBoard
        />
      )}

      <GameStyles />

      <style>{`
        /*
         * All number circles use one solid level colour.
         * No random colours, gradients or shadows.
         */
        .level-number-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #ffffff;
          background-color: transparent;
          background-image: var(--number-button-image);
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;

          border: 0;
          border-radius: 0;

          font-weight: 900;
          line-height: 1;

          text-shadow: 0 2px 2px rgba(70, 35, 0, 0.35);
          box-shadow: none;

          transition:
            transform 150ms ease,
            background-color 150ms ease;
        }

        .level-number-circle--large {
          width: clamp(82px, 8vw, 120px);
          height: clamp(82px, 8vw, 120px);

          font-size: clamp(2.8rem, 5vw, 4.3rem);
        }

        .level-number-circle--answer {
          width: clamp(70px, 7vw, 94px);
          height: clamp(70px, 7vw, 94px);

          font-size: clamp(2.2rem, 4vw, 3.2rem);

          cursor: pointer;
        }

        .level-number-circle--choice {
          width: clamp(66px, 6.5vw, 86px);
          height: clamp(66px, 6.5vw, 86px);

          font-size: clamp(2rem, 3.5vw, 2.8rem);

          cursor: pointer;
        }

        .level-number-circle--choice:hover {
          filter: brightness(1.08);
          transform: scale(1.06);
        }

        .level-number-circle--choice:active {
          transform: scale(0.95);
        }

        .level-number-circle--selected {
          filter: drop-shadow(0 5px 5px rgba(90, 45, 0, 0.25));
          transform: scale(1.03);
        }

        .level-number-circle--empty {
          color: var(--number-primary);
          background: var(--number-surface);
          background-image: none;

          border: 4px dashed var(--number-border);
          border-radius: 50%;

          text-shadow: none;
          box-shadow: none;
        }

        .level-number-circle--feedback {
          width: 48px;
          height: 48px;

          border-width: 3px;

          font-size: 1.25rem;
        }

        /*
         * Main stage and vine board
         */
        .number-stage {
          max-width: 1380px;
          min-height: 0;
          overflow: hidden !important;
          padding-block: 2px !important;
          align-items: center !important;
        }

        .number-vine-board {
          position: relative;

          aspect-ratio: 16 / 9;

          margin: 0 auto;

          background-repeat: no-repeat;
          background-position: center;
          background-size: 100% 100%;

          isolation: isolate;
          overflow: visible;
          transform: translateY(-12px) scale(0.94);
          transform-origin: top center;
        }

        .number-vine-board--show {
          width: min(84vw, 1280px);
          max-height: calc(100dvh - 118px);
        }

        .number-vine-board--answer {
          width: min(86vw, 1320px);
          max-height: calc(100dvh - 112px);
        }

        .number-vine-board--feedback {
          width: min(70vw, 980px);
          max-height: calc(100dvh - 112px);
        }

        /*
         * Safe content area inside vine board
         */
        .number-vine-board__content {
          position: absolute;
          inset: 13% 8% 10% 13%;

          z-index: 2;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          min-width: 0;
          min-height: 0;

          box-sizing: border-box;
        }

        .number-vine-board__content--answer {
          inset: 11% 8% 8% 13%;

          justify-content: space-between;
          overflow: hidden;
        }

        .number-vine-board__content--feedback {
          inset: 13% 11% 11% 15%;

          justify-content: space-evenly;
          overflow: hidden;
        }

        /*
         * Bunny on bottom-left of board
         */
        .number-board-bunny {
          position: absolute;

          left: clamp(-95px, -6vw, -55px);
          bottom: -8px;

          z-index: 5;
          pointer-events: none;
        }

        .number-board-bunny > * {
          position: relative !important;

          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;

          margin: 0 !important;
        }

        .adaptive-vine-board > .number-board-bunny {
          left: clamp(-350px, -20vw, -265px) !important;
          transform: scale(0.96) !important;
          transform-origin: bottom right !important;
          bottom: 14px !important;
        }

        /*
         * Memorization instruction and timer
         */
        .number-memory-title {
          width: min(78%, 760px);

          margin-bottom: 10px;

          flex-shrink: 0;
        }

        .number-memory-timer {
          width: min(70%, 680px);

          margin-bottom: 24px;

          flex-shrink: 0;
        }

        .number-level-timer-fill {
          background: var(--number-primary) !important;
        }

        /*
         * Memorization number frame
         */
        .number-sequence-panel {
          position: relative;

          width: min(94%, 1050px);
          min-height: clamp(170px, 25vh, 250px);

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: clamp(16px, 2.2vw, 30px);

          padding: clamp(28px, 3.5vw, 42px);

          background: #fffdf5;

          border: 5px solid var(--number-primary);
          border-radius: 34px;

          box-shadow: none;

          box-sizing: border-box;
        }

        .number-sequence-panel::before {
          content: "";

          position: absolute;
          inset: 9px;

          border: 3px dashed var(--number-border);
          border-radius: 24px;

          pointer-events: none;
        }

        .number-sequence-panel > * {
          position: relative;
          z-index: 1;
        }

        .number-memory-footer {
          margin-top: 18px;

          padding: 8px 24px;

          color: var(--number-dark);
          background: var(--number-surface);

          border: 3px solid var(--number-primary);
          border-radius: 999px;

          font-size: clamp(0.8rem, 1.3vw, 1rem);
          font-weight: 900;

          box-shadow: none;
        }

        /*
         * Answer screen
         */
        .number-question-progress {
          display: none;
          width: 100%;
          align-items: center;
          justify-content: space-between;

          padding: 0 8px;
          margin-bottom: 5px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .number-question-badge {
          padding: 5px 14px;

          color: var(--number-dark);
          background: var(--number-surface);

          border: 2px solid var(--number-primary);
          border-radius: 999px;

          font-size: 0.8rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .number-answer-title {
          width: min(75%, 700px);

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 0;

          flex-shrink: 0;
        }

        .number-audio-button {
          width: 40px;
          height: 40px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: var(--number-dark);
          background: var(--number-surface);

          border: 3px solid var(--number-primary);
          border-radius: 50%;

          font-size: 1rem;

          box-shadow: none;
          cursor: pointer;
        }

        .number-answer-slots {
          width: fit-content;
          max-width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: clamp(12px, 2vw, 24px);

          gap: clamp(8px, 1.3vw, 15px);
          margin: 0;
          padding: 7px 14px;
          background: color-mix(in srgb, var(--number-surface) 82%, transparent);
          border: 2px solid var(--number-border);
          border-radius: 24px;

          flex-shrink: 0;
        }

        /*
         * Light contrast answer frame
         */
        .number-choice-panel {
          position: relative;

          width: min(100%, 460px);
          min-height: 0;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: clamp(10px, 1.4vw, 16px);

          padding: clamp(15px, 2vw, 22px);

          background: #fffdf5;

          border: 5px solid var(--number-primary);
          border-radius: 32px;

          box-shadow: none;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .number-choice-panel::before {
          content: "";

          position: absolute;
          inset: 9px;

          border: 3px dashed var(--number-border);
          border-radius: 22px;

          pointer-events: none;
        }

        .number-choice-panel > * {
          position: relative;
          z-index: 1;
        }

        .number-choice-panel .level-number-circle--choice {
          width: clamp(60px, 5.4vw, 76px);
          height: clamp(60px, 5.4vw, 76px);
          font-size: clamp(1.75rem, 3vw, 2.45rem);
        }

        .number-all-selected {
          display: flex;
          align-items: center;

          gap: 8px;

          color: var(--number-dark);

          font-size: 0.9rem;
          font-weight: 900;
        }

        .number-submit-button {
          padding: 10px 35px;
          margin-top: 4px;

          color: #ffffff;
          background: var(--number-primary);

          border: 4px solid var(--number-dark);
          border-radius: 16px;

          font-size: clamp(0.9rem, 1.5vw, 1.15rem);
          font-weight: 900;
          text-transform: uppercase;

          box-shadow: none;
          cursor: pointer;
        }

        .number-submit-button:hover {
          background: var(--number-dark);
        }

        /*
         * Feedback screen
         */
        .number-feedback-icon {
          width: 72px;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          font-size: 2.2rem;

          box-shadow: none;
        }

        .number-feedback-title {
          margin: 5px 0;

          font-size: clamp(1.5rem, 2.8vw, 2.1rem);
          font-weight: 900;
          text-transform: uppercase;
        }

        .number-carrot-reward {
          width: min(100%, 420px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 6px;

          padding: 10px 14px;

          background: #fffbeb;
          border: 3px solid #fde68a;
          border-radius: 22px;

          box-shadow: none;
        }

        .number-feedback-answer-box {
          position: relative;

          width: min(100%, 500px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 10px;

          padding: 20px;

          background: var(--number-surface);

          border: 4px solid var(--number-primary);
          border-radius: 24px;

          box-shadow: none;
          box-sizing: border-box;
        }

        .number-feedback-answer-box::before {
          content: "";

          position: absolute;
          inset: 7px;

          border: 2px dashed var(--number-border);
          border-radius: 16px;

          pointer-events: none;
        }

        .number-feedback-answer-box > * {
          position: relative;
          z-index: 1;
        }

        .number-feedback-answer-group {
          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 6px;
        }

        .number-feedback-label {
          color: var(--number-dark);

          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .number-feedback-circles {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 10px;
        }

        .number-next-button {
          padding: 10px 38px;

          color: #ffffff;

          border-width: 3px;
          border-radius: 15px;

          font-size: 0.95rem;
          font-weight: 900;
          text-transform: uppercase;

          box-shadow: none;
          cursor: pointer;
        }

        /*
         * Tablet
         */
        @media (max-width: 900px) {
          .number-vine-board {
            transform: translateY(-8px) scale(0.96);
          }

          .adaptive-vine-board > .number-board-bunny {
            left: -150px !important;
            bottom: 4px !important;
            transform: scale(0.78) !important;
            transform-origin: bottom left !important;
          }
          .number-vine-board--show,
          .number-vine-board--answer {
            width: 95vw;
          }

          .number-vine-board--feedback {
            width: min(92vw, 820px);
          }

          .number-vine-board__content {
            inset: 14% 7% 10% 12%;
          }

          .number-sequence-panel,
          .number-choice-panel {
            gap: 10px;
            padding: 18px;
          }

          .number-board-bunny {
            left: -24px;
            bottom: -4px;

            transform: scale(0.78);
            transform-origin: bottom left;
          }
        }

        /*
         * Smaller screens
         */
        @media (max-width: 650px) {
          .number-vine-board {
            transform: translateY(-4px) scale(0.98);
          }

          .adaptive-vine-board > .number-board-bunny {
            left: -84px !important;
            bottom: 0 !important;
            transform: scale(0.72) !important;
            transform-origin: bottom left !important;
          }
          .number-vine-board--show,
          .number-vine-board--answer {
            width: 98vw;
          }

          .number-vine-board__content {
            inset: 15% 6% 9% 10%;
          }

          .number-memory-title,
          .number-memory-timer,
          .number-answer-title {
            width: 80%;
          }

          .number-sequence-panel,
          .number-choice-panel {
            min-height: 110px;

            gap: 7px;
            padding: 15px;

            border-width: 3px;
            border-radius: 20px;
          }

          .number-sequence-panel::before,
          .number-choice-panel::before {
            inset: 6px;
            border-width: 2px;
            border-radius: 14px;
          }

          .level-number-circle--large {
            width: 55px;
            height: 55px;

            border-width: 3px;

            font-size: 1.8rem;
          }

          .level-number-circle--answer,
          .level-number-circle--choice {
            width: 50px;
            height: 50px;

            border-width: 3px;

            font-size: 1.6rem;
          }

          .number-submit-button {
            padding: 7px 20px;
            margin-top: 8px;

            font-size: 0.8rem;
          }

          .number-board-bunny {
            left: -10px;

            transform: scale(0.58);
            transform-origin: bottom left;
          }
        }
      `}</style>
    </div>
  );
};

export default NumbersGame;
