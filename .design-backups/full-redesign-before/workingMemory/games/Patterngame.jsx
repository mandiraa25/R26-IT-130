import React from "react";
import GameStyles from "../styles/GameStyles";
import {
  Header,
  IntroScreen,
  BunnyMascot,
  ResultScreen,
  WoodenQuestionProgress,
} from "../components/SharedScreens";
import HowToPlayScreen from "../components/HowToPlayScreen";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

const PATTERN_LEVEL_THEMES = Object.freeze({
  1: { primary: "#F7931E", light: "#FFD59A", dark: "#B85D08", surface: "#FFF4E3", shadow: "rgba(184, 93, 8, 0.24)" },
  2: { primary: "#5DBB63", light: "#BDE8B8", dark: "#2F7D39", surface: "#EFF9ED", shadow: "rgba(47, 125, 57, 0.24)" },
  3: { primary: "#E85B91", light: "#F7B6CE", dark: "#A93663", surface: "#FFF0F5", shadow: "rgba(169, 54, 99, 0.24)" },
  4: { primary: "#873CB7", light: "#E7D8F0", dark: "#642B91", surface: "#F0E4F5", shadow: "rgba(100, 43, 145, 0.24)" },
});

// Game 1: Pattern — study a sequence, then identify what comes next.
const PatternGame = ({
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
  slots,
  dragPool,
  handleTileClick,
  isCurrentCorrect,
  currentIdx,
  questions,
  handleNextQuestion,
  score,
  results,
  isSubmitting,
  submitResult,
  handleNextSubCategory,
  handleReadyToPlay,
  speakText,
  handlePatternConfirm,
  earnedStars,
  lastStarReward,
  totalStars,
  backgroundSrc = "/images/workingMemory/improve/common/common_bg.png",
}) => {
  const isSinhala = i18n.language?.startsWith("si");
  const levelTheme = PATTERN_LEVEL_THEMES[Number(levelNumber)] || PATTERN_LEVEL_THEMES[1];
  const themeAssets = getWorkingMemoryThemeAssets(levelNumber);
  const instructionFrameFallback = "/images/workingMemory/improve/level4/boards/frame.png";
  const levelThemeVariables = {
    "--pattern-primary": levelTheme.primary,
    "--pattern-light": levelTheme.light,
    "--pattern-dark": levelTheme.dark,
    "--pattern-surface": levelTheme.surface,
    "--pattern-shadow": levelTheme.shadow,
    "--vine-board-image": `url('${themeAssets.questionBoard}')`,
    "--pattern-instruction-frame": `url('${themeAssets.instructionFrame}'), url('${instructionFrameFallback}')`,
  };

  const vineBoardImage = themeAssets.questionBoard;
  const patternChoiceSelected = Boolean(slots[0]);
  const progressCompleted = (results || []).flatMap((result, index) => (result.isCorrect ? [index + 1] : []));
  const progressIncorrect = (results || []).flatMap((result, index) => (!result.isCorrect ? [index + 1] : []));
  const correctPatternAnswer = currentQuestion?.missingAnswer || currentQuestion?.correct?.[0];

  const answerInstruction = isSinhala
    ? "මීළඟට පැමිණෙන්නේ කුමක්ද?"
    : "What comes next?";

  const nextButtonText =
    currentIdx < questions.length - 1
      ? isSinhala
        ? "මීළඟ ප්‍රශ්නය ➔"
        : "Next Question ➔"
      : isSinhala
        ? "අවසන් කරන්න ➔"
        : "Finish ➔";

  const patternChoices = currentQuestion
    ? [...new Set([
        ...(currentQuestion.options || currentQuestion.dragPool || dragPool || []),
        currentQuestion.missingAnswer,
      ])].filter((item) => item !== undefined && item !== null && item !== "?")
    : [];

  return (
    <div
      className={`pattern-game-screen relative w-full h-screen h-dvh min-h-screen overflow-hidden font-custom select-none flex flex-col ${Number(levelNumber) === 4 ? "level-4-theme" : ""}`}
      style={levelThemeVariables}
    >
      {/* Level background */}
      <img
        src={backgroundSrc}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/images/workingMemory/improve/common/common_bg.png";
        }}
        alt="Jungle background"
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

      {/* PHASE 2: BUNNY INSTRUCTION SCREEN */}
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

      {/* PATTERN QUESTION AND ANSWER SCREEN */}
      {phase === "answer" && currentQuestion && (
        <main className="pattern-stage pattern-stage--answer relative z-10 flex-1 mx-auto w-full px-3 sm:px-5 py-2 flex items-center justify-center animate-fadeIn">
          <div className="pattern-board-bunny">
            <BunnyMascot screen="answer" />
          </div>

          <section
            className="pattern-vine-board pattern-vine-board--answer adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress
              currentQuestion={currentIdx + 1}
              totalQuestions={questions.length}
              completedQuestions={progressCompleted}
              incorrectQuestions={progressIncorrect}
            />
            {/* Wooden question frame is attached directly to the board border. */}
            <div className="pattern-answer-title pattern-question-header">
              <span>{answerInstruction}</span>
              <button
                type="button"
                className="pattern-listen-button pattern-listen-button--in-frame"
                onClick={() => speakText(answerInstruction, false)}
                aria-label={isSinhala ? "උපදෙස් අසන්න" : "Listen to the instruction"}
                title={isSinhala ? "උපදෙස් අසන්න" : "Listen"}
              >
                🔊
              </button>
            </div>

            <div className="pattern-vine-board__content pattern-vine-board__content--answer adaptive-vine-board__content">

              <div
                className="pattern-sequence-panel pattern-answer-sequence-panel"
                style={{ "--pattern-count": currentQuestion.showItems.length }}
                aria-label={isSinhala ? "රටාව" : "Pattern to complete"}
              >
                {currentQuestion.showItems.map((item, index) => (
                  <div
                    key={`answer-pattern-item-${index}`}
                    className={`seq-tile pattern-sequence-tile ${item === "?" ? `pattern-missing-tile ${patternChoiceSelected ? "pattern-missing-tile--filled" : ""}` : "text-slate-800"}`}
                  >
                    {item === "?" ? (slots[0] || "?") : item}
                  </div>
                ))}
              </div>

              {/* Answer choices */}
              <div className="pattern-choice-grid">
                {patternChoices.map((item, index) => (
                  <button
                    type="button"
                    key={`choice-${index}`}
                    onClick={() => handleTileClick(item)}
                    className={`seq-tile choice pattern-choice-tile ${slots[0] === item ? "pattern-choice-tile--selected" : ""}`}
                    aria-pressed={slots[0] === item}
                    aria-label={`${isSinhala ? "පිළිතුර" : "Answer"}: ${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-testid="wm-pattern-confirm"
                onClick={handlePatternConfirm}
                disabled={!patternChoiceSelected}
                className={`pattern-confirm-button ${patternChoiceSelected ? "pattern-confirm-button--active" : ""}`}
              >
                {t("pattern_check_answer", { defaultValue: "Check Answer" })}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 5: CORRECT OR INCORRECT FEEDBACK */}
      {phase === "feedback" && currentQuestion && (
        <main className="pattern-stage relative z-10 flex-1 mx-auto w-full px-3 sm:px-5 py-2 flex items-center justify-center animate-fadeIn">
          <div className="pattern-board-bunny">
            <BunnyMascot
              screen={isCurrentCorrect ? "correct" : "incorrect"}
            />
          </div>

          <section
            className="pattern-vine-board pattern-vine-board--feedback adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress
              currentQuestion={currentIdx + 1}
              totalQuestions={questions.length}
              completedQuestions={progressCompleted}
              incorrectQuestions={progressIncorrect}
            />
            <div className="pattern-vine-board__content pattern-vine-board__content--feedback adaptive-vine-board__content">
              {/* Result icon */}
              <div
                className={`pattern-feedback-icon ${
                  isCurrentCorrect
                    ? "bg-emerald-100"
                    : "bg-rose-100"
                }`}
              >
                {isCurrentCorrect ? "✅" : "❌"}

                {isCurrentCorrect && (
                  <>
                    <span className="pattern-star pattern-star--one">
                      ⭐
                    </span>

                    <span className="pattern-star pattern-star--two">
                      ⭐
                    </span>

                    <span className="pattern-star pattern-star--three">
                      ⭐
                    </span>
                  </>
                )}
              </div>

              {/* Result heading */}
              <h3
                className={`pattern-feedback-title ${
                  isCurrentCorrect
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {isCurrentCorrect
                  ? isSinhala
                    ? "නියමයි!"
                    : "Great Job!"
                  : isSinhala
                    ? "සමීපයි, නමුත් නොවේ!"
                    : "Not quite!"}
              </h3>

              {/* Feedback message */}
              <div
                className={`pattern-feedback-message ${
                  isCurrentCorrect
                    ? "pattern-feedback-message--correct"
                    : "pattern-feedback-message--incorrect"
                }`}
              >
                {isCurrentCorrect
                  ? isSinhala
                    ? "ඔබ රටාව සොයාගත්තා!"
                    : "You found the pattern!"
                  : isSinhala
                    ? `හරි පිළිතුර ${correctPatternAnswer || ""} විය. ඊළඟ ප්‍රශ්නයට යමු!`
                    : `The answer was ${correctPatternAnswer || "—"}. Let's go to the next question!`}
              </div>

              {isCurrentCorrect && lastStarReward > 0 && (
                <div className="pattern-carrot-reward">
                  <div className="flex items-center gap-1.5 font-black text-lg text-amber-950">
                    <span>+{lastStarReward} {isSinhala ? "තරු" : "Stars"}</span>
                    <span className="text-xl animate-bounce">⭐</span>
                  </div>

                  <div className="pattern-total-carrots">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {isSinhala ? "මෙම ක්‍රීඩාව" : "This game"}: {earnedStars} ⭐
                    </span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {isSinhala ? "මුළු තරු" : "Total stars"}: {totalStars} ⭐
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextQuestion}
                className={`pattern-next-button ${
                  isCurrentCorrect
                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-700"
                    : "bg-rose-500 hover:bg-rose-600 border-rose-700"
                }`}
              >
                {nextButtonText}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 6: FINAL RESULT */}
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

      {/* Pattern Game vine-board styles */}
      <style>{`
        .pattern-stage {
          max-width: 1380px;
          min-height: 0;
          align-items: center !important;
          overflow: visible !important;
        }

        /*
         * Reusable transparent vine-board image
         */
        .pattern-vine-board {
          position: relative;

          aspect-ratio: 3 / 2;

          margin: 0 auto;

          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;

          isolation: isolate;
          overflow: visible;
        }

        /*
         * Board sizes for each screen
         */
        .pattern-vine-board--show {
          width: min(70vw, calc((100dvh - 120px) * 16 / 9), 1100px) !important;
        }

        .pattern-vine-board--feedback {
          width: min(68vw, calc((100dvh - 112px) * 16 / 9), 940px);
        }

        /*
         * Safe cream-coloured content area
         */
        .pattern-vine-board__content {
          position: absolute;
          inset: 13% 9% 10% 13%;

          z-index: 2;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          min-width: 0;
          min-height: 0;

          box-sizing: border-box;
        }

        .pattern-vine-board__content--feedback {
          inset: 14% 12% 12% 16%;
          justify-content: space-evenly;
          overflow: hidden;
        }

        /*
         * Bunny overlapping board's bottom-left edge
         */
        .pattern-board-bunny {
          position: absolute;
          left: clamp(20px, 8vw, 155px);
          bottom: clamp(8px, 2.5vh, 34px);
          z-index: 5;
          pointer-events: none;
        }

        .pattern-board-bunny > * {
          position: relative !important;

          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;

          margin: 0 !important;
        }

        .pattern-stage > .pattern-board-bunny > img {
          display: block !important;
          width: clamp(270px, 24vw, 370px) !important;
          max-width: none !important;
          height: auto !important;
          object-fit: contain !important;
        }

        .pattern-stage--question > .pattern-board-bunny,
        .pattern-stage--answer > .pattern-board-bunny {
          left: clamp(-28px, 0.5vw, 18px);
          bottom: clamp(10px, 2vh, 30px);
        }

        .pattern-vine-board .instruction-tag {
          color: var(--pattern-dark) !important;
          background: var(--pattern-surface) !important;
          border-color: var(--pattern-light) !important;
          box-shadow: 0 7px 16px var(--pattern-shadow);
        }

        .pattern-vine-board .timerbar-wrap {
          border-color: var(--pattern-light) !important;
        }

        .pattern-vine-board .timerbar-fill {
          background: linear-gradient(90deg, var(--pattern-primary), var(--pattern-light)) !important;
        }

        .pattern-vine-board .timer-label {
          color: var(--pattern-dark) !important;
        }

        /*
         * Memorization screen
         */
        .pattern-show-title {
          width: min(76%, 760px);

          margin-bottom: clamp(8px, 1.2vh, 16px);

          flex-shrink: 0;
        }

        .pattern-timer {
          width: min(72%, 680px);

          margin-bottom: clamp(18px, 3vh, 35px);

          flex-shrink: 0;
        }

        .pattern-sequence-panel {
          width: min(88%, 900px);
          min-height: clamp(130px, 20vh, 210px);

          display: grid;
          grid-template-columns: repeat(var(--pattern-count), minmax(0, 1fr));
          align-items: center;
          justify-content: center;

          gap: clamp(5px, 1vw, 14px);

          padding: clamp(14px, 2vw, 26px);

          background: linear-gradient(
            180deg,
            var(--pattern-light),
            var(--pattern-primary)
          );

          border: 5px solid var(--pattern-light);
          border-radius: 30px;

          box-shadow:
            0 12px 22px var(--pattern-shadow),
            inset 0 2px 0 rgba(255, 255, 255, 0.45);

          box-sizing: border-box;
        }

        .pattern-sequence-tile {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;
          max-width: 92px;
          min-width: 0;
          justify-self: center;

          font-size: clamp(1.25rem, 3vw, 2.8rem);
        }

        .pattern-missing-tile {
          color: var(--pattern-dark);
          background: var(--pattern-surface);
          border-color: var(--pattern-primary);
          border-style: dashed;

          font-weight: 900;
        }

        /*
         * Answer screen
         */
        .pattern-question-progress {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 8px;
          margin-bottom: 4px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pattern-answer-title {
          width: min(70%, 650px);

          margin-bottom: 5px;

          flex-shrink: 0;
        }

        .pattern-select-instruction {
          margin: 0 0 8px;

          color: #6b4b1c;

          font-size: clamp(1rem, 1.7vw, 1.25rem);
          font-weight: 900;
          text-align: center;

          flex-shrink: 0;
        }

        .pattern-answer-slots {
          width: min(100%, 780px);

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: clamp(8px, 1.25vw, 16px);

          margin-bottom: clamp(8px, 1.4vh, 15px);

          flex-shrink: 0;
        }

        .pattern-answer-slot {
          width: clamp(64px, 6vw, 88px);
          height: clamp(64px, 6vw, 88px);

          display: flex;
          align-items: center;
          justify-content: center;

          border-width: 5px;
          border-style: dashed;
          border-radius: 24px;

          font-size: clamp(1.8rem, 3.3vw, 2.8rem);
          font-weight: 900;

          cursor: pointer;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background-color 160ms ease;
        }

        .pattern-answer-slots--long {
          width: min(100%, 700px);
          gap: clamp(6px, 0.9vw, 12px);
        }

        .pattern-answer-slots--long .pattern-answer-slot {
          width: clamp(54px, 5vw, 70px);
          height: clamp(54px, 5vw, 70px);
          border-width: 4px;
          border-radius: 18px;
          font-size: clamp(1.45rem, 2.5vw, 2.1rem);
        }

        .pattern-listen-button {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          padding: 0;
          color: var(--pattern-dark);
          background: var(--pattern-surface);
          border: 2px solid var(--pattern-primary);
          border-radius: 50%;
          font-size: 1.15rem;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .pattern-answer-slot--empty {
          color: var(--pattern-dark);
          background: var(--pattern-surface);
          border-color: var(--pattern-primary);
        }

        .pattern-answer-slot--empty:hover {
          background: #ffffff;
          border-color: var(--pattern-dark);
        }

        .pattern-choice-grid {
          width: min(100%, 680px);

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;

          flex-direction: row;

          gap: clamp(12px, 2vw, 24px);

          margin-bottom: clamp(8px, 1.5vh, 16px);

          flex-shrink: 0;
        }

        .pattern-choice-tile {
          flex: 0 1 108px;
          width: clamp(64px, 7vw, 108px);
          min-width: 0;
          color: #1e293b;
          background: #ffffff;
          border: 3px solid var(--pattern-light);
          border-bottom: 5px solid var(--pattern-primary);
          box-shadow: 0 7px 14px var(--pattern-shadow);

          font-size: clamp(2rem, 4vw, 3rem);

          cursor: pointer;
        }

        .pattern-action-row {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          padding: 0 18px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pattern-peek-button {
          display: flex;
          align-items: center;

          gap: 8px;

          padding: 9px 20px;

          color: #ffffff;
          background: #78350f;
          border: 4px solid #b45309;
          border-radius: 16px;

          font-size: clamp(0.75rem, 1.2vw, 0.9rem);
          font-weight: 800;

          box-shadow: 0 6px 12px rgba(80, 35, 8, 0.18);

          cursor: pointer;
          transition: transform 150ms ease;
        }

        .pattern-peek-button:active {
          transform: scale(0.96);
        }

        .pattern-submit-button {
          padding: 11px 35px;

          color: #ffffff;
          background: linear-gradient(
            180deg,
            #34d399,
            #059669
          );

          border: 0;
          border-bottom: 6px solid #047857;
          border-radius: 16px;

          font-size: clamp(0.9rem, 1.5vw, 1.2rem);
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;

          box-shadow: 0 8px 16px rgba(5, 100, 75, 0.2);

          cursor: pointer;
        }

        .pattern-submit-button:active {
          transform: translateY(3px);
          border-bottom-width: 2px;
        }

        /*
         * Pattern peek overlay stays inside vine board
         */
        .pattern-peek-overlay {
          position: absolute;
          inset: 0;

          z-index: 20;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background: rgba(255, 253, 246, 0.98);
          border-radius: 24px;

          box-sizing: border-box;
        }

        .pattern-peek-title {
          margin-bottom: 18px;

          color: #78350f;

          font-size: 1.25rem;
          font-weight: 900;
        }

        .pattern-peek-sequence {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 12px;
        }

        .pattern-peek-tile {
          width: clamp(52px, 6vw, 70px);
          height: clamp(52px, 6vw, 70px);

          display: flex;
          align-items: center;
          justify-content: center;

          color: #1e293b;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 14px;

          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 900;
        }

        .pattern-peek-message {
          margin-top: 18px;

          color: #94a3b8;

          font-size: 0.75rem;
          font-weight: 700;
        }

        /*
         * Feedback screen
         */
        .pattern-feedback-icon {
          position: relative;

          width: clamp(60px, 6vw, 82px);
          height: clamp(60px, 6vw, 82px);

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 999px;
          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.08);

          font-size: clamp(1.9rem, 3vw, 2.6rem);

          flex-shrink: 0;
        }

        .pattern-feedback-title {
          margin: 5px 0;

          font-size: clamp(1.5rem, 2.8vw, 2.2rem);
          font-weight: 900;
          letter-spacing: 0.03em;
          text-transform: uppercase;

          flex-shrink: 0;
        }

        .pattern-feedback-message {
          width: min(100%, 480px);

          padding: 10px 16px;

          border-width: 3px;
          border-style: solid;
          border-radius: 20px;

          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          font-weight: 900;
          text-align: center;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pattern-feedback-message--correct {
          color: #047857;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .pattern-feedback-message--incorrect {
          color: #be123c;
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .pattern-carrot-reward {
          width: min(100%, 420px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 6px;

          padding: 10px 14px;

          background: #fffbeb;
          border: 4px solid #fde68a;
          border-radius: 24px;

          box-shadow: inset 0 3px 8px rgba(120, 75, 10, 0.08);

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pattern-total-carrots {
          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 4px;

          padding-top: 5px;

          border-top: 2px solid rgba(252, 211, 77, 0.4);
        }

        .pattern-correct-answer {
          width: min(100%, 450px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 8px;

          padding: 12px 16px;

          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 20px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pattern-correct-label {
          color: #6366f1;

          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pattern-correct-items {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 8px;
        }

        .pattern-correct-item {
          padding: 5px 13px;

          color: #047857;
          background: #ecfdf5;
          border: 2px solid #a7f3d0;
          border-radius: 12px;

          font-size: 1.1rem;
          font-weight: 900;
        }

        .pattern-hint-button {
          padding: 9px 18px;
          color: #5b3b11;
          background: #fff7d6;
          border: 2px solid #f4c95d;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .pattern-next-button {
          padding: 10px 38px;

          color: #ffffff;

          border-bottom-width: 4px;
          border-radius: 15px;

          font-size: clamp(0.8rem, 1.4vw, 1rem);
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;

          box-shadow: 0 7px 14px rgba(25, 40, 65, 0.16);

          cursor: pointer;
          flex-shrink: 0;
        }

        /*
         * Feedback stars
         */
        .pattern-star {
          position: absolute;

          left: 50%;
          top: 50%;

          margin-left: -18px;
          margin-top: -18px;

          font-size: 2rem;

          pointer-events: none;

          animation-duration: 2.2s;
          animation-fill-mode: forwards;
          animation-timing-function:
            cubic-bezier(0.1, 0.8, 0.3, 1);
          animation-iteration-count: infinite;
        }

        .pattern-star--one {
          animation-name: patternStarLeft;
        }

        .pattern-star--two {
          animation-name: patternStarCentre;
          animation-delay: 0.15s;
        }

        .pattern-star--three {
          animation-name: patternStarRight;
          animation-delay: 0.3s;
        }

        @keyframes patternStarLeft {
          0% {
            transform: translate(0, 25px) scale(0.6);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform:
              translate(-80px, -120px)
              rotate(45deg)
              scale(2);
            opacity: 0;
          }
        }

        @keyframes patternStarCentre {
          0% {
            transform: translate(0, 25px) scale(0.6);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform:
              translate(0, -150px)
              rotate(-30deg)
              scale(2.2);
            opacity: 0;
          }
        }

        @keyframes patternStarRight {
          0% {
            transform: translate(0, 25px) scale(0.6);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform:
              translate(80px, -120px)
              rotate(75deg)
              scale(2);
            opacity: 0;
          }
        }

        /*
         * Tablet layout
         */
        @media (max-width: 900px) {
          .pattern-vine-board--show {
            width: min(88vw, calc((100dvh - 110px) * 16 / 9)) !important;
          }

          .pattern-vine-board--feedback {
            width: min(92vw, 820px);
          }

          .pattern-vine-board__content {
            inset: 14% 7% 10% 12%;
          }

          .pattern-sequence-panel {
            gap: 9px;
            padding: 15px;
          }

          .pattern-action-row {
            padding: 0 8px;
          }

        }

        @media (max-width: 800px) {
          .pattern-stage > .pattern-board-bunny {
            left: clamp(10px, 5vw, 42px);
            bottom: clamp(5px, 1.5vh, 16px);
          }

          .pattern-stage > .pattern-board-bunny > img {
            width: clamp(210px, 31vw, 290px) !important;
          }

          .pattern-stage--question > .pattern-board-bunny,
          .pattern-stage--answer > .pattern-board-bunny {
            left: clamp(-24px, 1vw, 8px);
          }
        }

        /*
         * Smaller screens
         */
        @media (max-width: 650px) {
          .pattern-vine-board--show {
            width: min(94vw, calc((100dvh - 96px) * 16 / 9)) !important;
          }

          .pattern-vine-board__content {
            inset: 15% 6% 9% 10%;
          }

          .pattern-show-title,
          .pattern-answer-title,
          .pattern-timer {
            width: 80%;
          }

          .pattern-show-title {
            font-size: 0.83rem;
          }

          .pattern-sequence-panel {
            width: 92%;
            min-height: 96px;

            gap: 4px;
            padding: 8px;
          }

          .pattern-sequence-tile {
            border-radius: 10px;
            border-bottom-width: 3px;
            font-size: clamp(0.8rem, 4vw, 1.5rem);
          }

          .pattern-choice-grid {
            gap: 8px;
          }

          .pattern-choice-tile {
            flex-basis: 72px;
            width: clamp(52px, 16vw, 72px);
            font-size: 1.7rem;
          }

          .pattern-answer-slot {
            width: 58px;
            height: 58px;

            border-width: 4px;
            border-radius: 16px;

            font-size: 1.8rem;
          }

          .pattern-action-row {
            flex-direction: column;

            gap: 7px;
          }

          .pattern-peek-button,
          .pattern-submit-button {
            padding: 7px 18px;
            font-size: 0.75rem;
          }

        }

        @media (max-width: 560px) {
          .pattern-stage > .pattern-board-bunny {
            left: 4px;
            bottom: 4px;
          }

          .pattern-stage > .pattern-board-bunny > img {
            width: 155px !important;
          }

          .pattern-stage--question > .pattern-board-bunny,
          .pattern-stage--answer > .pattern-board-bunny {
            left: -20px;
          }
        }

        /* One Pattern question composition shared by every level. */
        .pattern-game-screen {
          --pattern-board-width: min(68vw, calc((100dvh - 170px) * 1.5), 1100px);
          --pattern-tile-size: clamp(68px, 5.6vw, 98px);
          --pattern-answer-size: clamp(84px, 7.8vw, 120px);
          --pattern-gap: clamp(8px, 0.85vw, 14px);
          width: 100vw;
          height: 100dvh;
          min-height: 100vh;
          overflow: hidden;
        }

        .pattern-stage--answer {
          position: relative;
          width: min(92vw, 1200px) !important;
          max-width: 1200px;
          height: min(76vh, 740px);
          flex: 1 1 auto;
          margin: auto !important;
          align-items: center !important;
          padding-block: clamp(20px, 2.5vw, 32px) 8px !important;
          overflow: visible !important;
        }

        .pattern-vine-board.pattern-vine-board--answer.working-memory-board-frame {
          width: var(--pattern-board-width) !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: calc(100dvh - 170px) !important;
          aspect-ratio: 3 / 2 !important;
        }

        .pattern-vine-board--answer > .wooden-question-progress {
          left: 50% !important;
          top: -8px !important;
          width: clamp(275px, 42%, 390px) !important;
          transform: translate(-50%, calc(-118% - 2cm)) !important;
        }

        .pattern-vine-board .wooden-question-progress__number--completed {
          color: #fff;
          background: #4f9f42;
          border: 2px solid #eaffdf;
          filter: drop-shadow(0 2px 3px rgba(24, 78, 17, .3));
        }

        .pattern-vine-board .wooden-question-progress__number--completed img {
          opacity: 0;
        }

        .pattern-vine-board .wooden-question-progress__number--completed span {
          inset: 0;
          width: 100%;
          height: 100%;
          color: #fff;
          background: transparent;
          border: 0;
          font-size: clamp(.9rem, 1.5vw, 1.25rem);
          box-shadow: none;
        }

        .pattern-vine-board .wooden-question-progress__number--current {
          position: relative;
          outline: 4px solid var(--pattern-primary);
          outline-offset: 1px;
          transform: scale(1.08);
          filter: brightness(1.14) drop-shadow(0 0 8px color-mix(in srgb, var(--pattern-primary) 55%, transparent));
        }

        .pattern-vine-board .wooden-question-progress__number--current::after {
          content: "";
          position: absolute;
          inset: 3%;
          z-index: 1;
          border-radius: 50%;
          background: color-mix(in srgb, var(--pattern-primary) 38%, transparent);
          mix-blend-mode: color;
          pointer-events: none;
        }

        .pattern-vine-board .pattern-vine-board__content--answer.adaptive-vine-board__content {
          position: absolute !important;
          inset: 24% 11% 8% 11% !important;
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column;
          align-items: center;
          justify-content: center !important;
          gap: clamp(12px, 1.6vh, 20px) !important;
          overflow: visible !important;
        }

        .pattern-vine-board .pattern-question-header {
          position: absolute;
          z-index: 25;
          left: 50%;
          top: clamp(22px, 3vh, 32px);
          width: min(72%, 760px) !important;
          min-height: 0 !important;
          aspect-ratio: 2079 / 756;
          margin: 0 !important;
          transform: translateX(-50%) translateY(-1.5cm);
          padding: 8% 15% 7% 11% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pattern-dark) !important;
          background: var(--pattern-instruction-frame) center / 100% 100% no-repeat !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          box-sizing: border-box;
          font-size: clamp(1.15rem, 2vw, 2rem);
          font-weight: 900;
          line-height: 1.2;
          text-align: center;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .pattern-vine-board .pattern-listen-button--in-frame {
          position: absolute;
          right: clamp(12px, 1.6vw, 18px);
          top: 50%;
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          transform: translateY(-50%);
          z-index: 2;
        }

        .pattern-vine-board .pattern-answer-sequence-panel {
          width: fit-content !important;
          max-width: 96% !important;
          min-height: clamp(126px, 17vh, 168px) !important;
          height: auto !important;
          max-height: clamp(130px, 19vh, 195px);
          margin: 0 !important;
          padding: clamp(10px, 1.35vw, 18px) clamp(14px, 2vw, 24px) !important;
          grid-template-columns: repeat(var(--pattern-count), var(--pattern-tile-size)) !important;
          gap: var(--pattern-gap) !important;
          background: var(--pattern-surface) !important;
          border: 4px solid var(--pattern-primary) !important;
          border-radius: 20px !important;
          box-shadow: 0 7px 14px var(--pattern-shadow) !important;
          overflow: visible;
        }

        .pattern-vine-board .pattern-answer-sequence-panel .pattern-sequence-tile {
          width: var(--pattern-tile-size) !important;
          max-width: var(--pattern-tile-size) !important;
          aspect-ratio: 1;
          color: #1e293b;
          background: #fff !important;
          border: 2px solid color-mix(in srgb, var(--pattern-primary) 24%, #e5e1df) !important;
          border-radius: clamp(10px, 1.2vw, 16px) !important;
          box-shadow: 0 4px 0 color-mix(in srgb, var(--pattern-primary) 18%, #ddd) !important;
          font-size: clamp(1.4rem, 3.1vw, 2.9rem);
          animation: none;
        }

        .pattern-vine-board .pattern-missing-tile {
          color: var(--pattern-dark) !important;
          background: color-mix(in srgb, var(--pattern-surface) 88%, #fff) !important;
          border: 3px dashed var(--pattern-primary) !important;
          box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--pattern-primary) 12%, transparent) !important;
        }

        .pattern-vine-board .pattern-missing-tile--filled {
          border-style: solid !important;
          background: color-mix(in srgb, var(--pattern-primary) 16%, #fff) !important;
        }

        .pattern-vine-board .pattern-confirm-button {
          margin-top: clamp(-6px, 0.2vh, 4px);
          min-width: min(58%, 260px);
          min-height: 48px;
          padding: 10px 20px;
          border-radius: 14px;
          border: 3px solid #cbd5e1;
          border-bottom-width: 5px;
          background: #e2e8f0;
          color: #64748b;
          font-size: clamp(1rem, 1.45vw, 1.125rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          cursor: not-allowed;
          transition: transform 150ms ease, background 150ms ease, border-color 150ms ease, filter 150ms ease;
        }

        .pattern-vine-board .pattern-confirm-button--active {
          cursor: pointer;
          color: #fff;
          background: var(--pattern-primary);
          border-color: var(--pattern-dark);
          box-shadow: 0 5px 0 var(--pattern-dark);
        }

        .pattern-vine-board .pattern-confirm-button--active:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }

        .pattern-vine-board .pattern-confirm-button--active:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 var(--pattern-dark);
        }

        .pattern-vine-board .wooden-question-progress__number--incorrect {
          outline: 3px solid #dc2626;
          outline-offset: -3px;
        }

        .pattern-vine-board .wooden-question-progress__number--incorrect img {
          opacity: 0;
        }

        .pattern-vine-board .pattern-choice-grid {
          width: 100%;
          margin: 0 !important;
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: var(--pattern-answer-size);
          justify-content: center;
          align-items: center;
          gap: clamp(16px, 2vw, 28px);
        }

        .pattern-vine-board .pattern-choice-tile {
          width: 100%;
          aspect-ratio: 1;
          color: #1e293b;
          background: var(--pattern-surface);
          border: 3px solid color-mix(in srgb, var(--pattern-primary) 45%, #e8dcc8);
          border-bottom-width: 4px;
          border-radius: clamp(12px, 1.3vw, 18px);
          box-shadow: 0 5px 10px var(--pattern-shadow);
          font-size: clamp(2rem, 4.1vw, 3.25rem);
          transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }

        .pattern-vine-board .pattern-choice-tile:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: var(--pattern-dark);
          box-shadow: 0 8px 14px var(--pattern-shadow);
        }

        .pattern-vine-board .pattern-choice-tile:focus-visible {
          outline: 4px solid #fff;
          box-shadow: 0 0 0 7px var(--pattern-primary), 0 8px 16px var(--pattern-shadow);
        }

        .pattern-vine-board .pattern-choice-tile--selected,
        .pattern-vine-board .pattern-choice-tile[aria-pressed="true"] {
          color: var(--pattern-dark);
          background: #fff;
          border-color: var(--pattern-primary);
          outline: 4px solid var(--pattern-primary);
          outline-offset: 1px;
          box-shadow: 0 0 0 2px #fff, 0 8px 14px var(--pattern-shadow);
          transform: scale(1.02);
        }

        @media (max-width: 900px) {
          .pattern-vine-board.pattern-vine-board--answer.working-memory-board-frame {
            width: min(88vw, calc((100dvh - 150px) * 1.5)) !important;
            max-height: calc(100dvh - 150px) !important;
          }
        }

        @media (max-width: 650px) {
          .pattern-vine-board .pattern-vine-board__content--answer.adaptive-vine-board__content {
            inset: 25% 8% 7% 10% !important;
            gap: 10px !important;
          }

          .pattern-vine-board .pattern-question-header {
            top: clamp(16px, 2.5vh, 24px);
            width: 76% !important;
            min-height: 44px !important;
            padding-right: 52px !important;
            font-size: clamp(0.95rem, 3.4vw, 1.05rem);
          }

          .pattern-vine-board .pattern-listen-button--in-frame {
            width: 44px;
            height: 44px;
            right: clamp(10px, 2vw, 14px);
          }

          .pattern-vine-board--answer > .wooden-question-progress {
            width: clamp(240px, 48%, 300px) !important;
          }

          .pattern-stage > .pattern-board-bunny > img {
            width: clamp(210px, 42vw, 260px) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pattern-vine-board .wooden-question-progress__number,
          .pattern-vine-board .pattern-choice-tile,
          .pattern-vine-board .pattern-missing-tile,
          .pattern-vine-board .pattern-missing-tile--filled,
          .pattern-star {
            animation: none !important;
            transition: none !important;
          }

          .pattern-vine-board .pattern-choice-tile:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PatternGame;
