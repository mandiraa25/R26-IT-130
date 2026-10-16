import ActionButton from "../components/ActionButton";
import React from "react";
import GameStyles from "../styles/Gamestyles";
import {
  Header,
  IntroScreen,
  BunnyMascot,
  ResultScreen,
  WoodenQuestionProgress,
} from "../components/SharedScreens";
import HowToPlayScreen from "../components/HowToPlayScreen";
import { WordCard, WordGhostSlot } from "../components/WordCard";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

// Game 2: Words — memorize picture cards and rebuild their order.
const WordsGame = ({
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
  cardsFlipped,
  wordsAwaitingPlay,
  startWordsMemory,
  currentIdx,
  questions,
  slots,
  dragPool,
  selectedSlotIndex,
  handleSlotClick,
  handleTileClick,
  handleDragOver,
  handleDropOnSlot,
  handleDragStart,
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
  cardBackSrc,
  frontCardSrc,
  handleReadyToPlay,
  earnedStars,
  lastStarReward,
  totalStars,
}) => {
  const isSinhala = i18n.language?.startsWith("si");

  const vineBoardImage = getWorkingMemoryThemeAssets(levelNumber).questionBoard;

  const memoryInstruction = isSinhala
    ? "කාඩ්පත්වල අනුපිළිවෙල මතක තබා ගන්න."
    : "Remember the order of the cards.";

  const answerInstruction = isSinhala
    ? "අයිතම නිවැරදි අනුපිළිවෙලට තබන්න."
    : "Put the items in the correct order.";

  const getMemoryRowColumns = (count) => Math.max(1, count);

  return (
    <div
      data-level={levelNumber} lang={i18n.language} className={`wm-game-root relative w-full h-screen h-dvh overflow-hidden font-custom select-none flex flex-col ${Number(levelNumber) === 4 ? "level-4-theme" : ""}`}
      style={{ "--vine-board-image": `url('${vineBoardImage}')` }}
    >
      {/* Level background */}
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

      {/* Common game header */}
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

      {/* PHASE 3: CARD MEMORIZATION SCREEN */}
      {phase === "show" && currentQuestion && (
        <main className="words-stage words-stage--show relative z-10 flex-1 mx-auto w-full px-3 sm:px-5 py-2 flex items-center justify-center animate-fadeIn">
          <section
            className="words-vine-board words-vine-board--show adaptive-vine-board words-memory-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
              "--memory-row-items": Math.max(
                currentQuestion.showItems.length,
                dragPool.length,
              ),
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            {/* Watching bunny */}
            <div className="words-board-bunny">
              <BunnyMascot screen="question" />
            </div>

            {/* Everything inside the cream area */}
            <div className="words-vine-board__content adaptive-vine-board__content words-memory-board__content">
              <div className="instruction-tag words-memory-title">
                <span>{memoryInstruction}</span>
                <button
                  type="button"
                  onClick={() => speakText(memoryInstruction)}
                  className="words-audio-button words-audio-button--large"
                  title="Listen again"
                  aria-label="Listen to instruction again"
                >
                  🔊
                </button>
              </div>

              {/* Timer below instruction */}
              {!wordsAwaitingPlay && (
                <div className="timerbar-wrap words-memory-timer">
                  <div
                    className="timerbar-fill"
                    style={{
                      width: `${(timerCount / timerMax) * 100}%`,
                    }}
                  />

                  <div className="timer-label uppercase tracking-widest text-[0.8rem]">
                    ⏰ {isSinhala ? "ඉතිරි කාලය" : "Time Left"}:{" "}
                    {timerCount}s
                  </div>
                </div>
              )}

              {/* Original sequence above, shuffled answer cards below. */}
              <div className="words-memory-grid-wrapper">
                <div
                  className="words-memory-grid words-memory-grid--original"
                  style={{ "--word-grid-columns": getMemoryRowColumns(currentQuestion.showItems.length) }}
                >
                  {currentQuestion.showItems.map((item, index) => (
                    <WordCard
                      key={`front-${index}`}
                      item={item}
                      size="lg"
                      isFlipped={cardsFlipped}
                      frontImageSrc={frontCardSrc}
                      backImageSrc={cardBackSrc}
                    />
                  ))}
                </div>

                <div className="words-memory-divider" aria-hidden="true" />

                <div
                  className="words-memory-grid words-memory-grid--answers"
                  style={{ "--word-grid-columns": getMemoryRowColumns(dragPool.length) }}
                  aria-label={isSinhala ? "පිළිතුරු කාඩ්පත්" : "Answer cards"}
                >
                  {dragPool.map((item, index) => (
                    <WordCard
                      key={`preview-answer-${index}`}
                      item={item}
                      size="lg"
                      isFlipped={false}
                      frontImageSrc={frontCardSrc}
                      backImageSrc={cardBackSrc}
                    />
                  ))}
                </div>
              </div>

              <div className="words-action-area">
                {wordsAwaitingPlay && (
                  <ActionButton action="play"
                  type="button"
                  onClick={startWordsMemory}
                  className="words-play-button bg-emerald-500 hover:bg-emerald-600 border-b-6 border-emerald-700 text-white font-black text-xl px-10 py-3 rounded-2xl shadow-xl active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wider cursor-pointer"
                >
                  ▶ {isSinhala ? "ආරම්භ කරන්න" : "Play"}
                  </ActionButton>
                )}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 4: ANSWER SCREEN */}
      {phase === "answer" && currentQuestion && (
        <main className="words-stage words-stage--answer relative z-10 flex-1 mx-auto w-full px-2 sm:px-4 py-1 md:py-2 flex items-center justify-center min-h-0 animate-fadeIn">
          <section
            className="words-vine-board words-vine-board--answer adaptive-vine-board words-answer-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
              "--memory-row-items": Math.max(slots.length, dragPool.length),
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            {/* Thinking bunny */}
            <div className="words-board-bunny">
              <BunnyMascot screen="answer" />
            </div>

            <div className="words-vine-board__content words-vine-board__content--answer adaptive-vine-board__content words-answer-board__content">
              {/* Main answer instruction */}
              <div className="instruction-tag words-answer-title">
                <span className="font-black text-left flex-1 leading-snug text-slate-800">
                  {answerInstruction}
                </span>

                <button
                  type="button"
                  onClick={() => speakText(answerInstruction)}
                  className="words-audio-button words-audio-button--large"
                  title="Listen again"
                  aria-label="Listen to instruction again"
                >
                  🔊
                </button>
              </div>

              <div className="words-answer-stage">
                {/* Empty answer slots */}
                <div className="words-answer-slots" style={{ "--word-grid-columns": getMemoryRowColumns(slots.length) }}>
                {slots.map((value, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    aria-label={`${isSinhala ? "ස්ථානය" : "Position"} ${index + 1}`}
                    aria-pressed={selectedSlotIndex === index}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleSlotClick(index); }
                    }}
                    onClick={() => handleSlotClick(index)}
                    onDragOver={handleDragOver}
                    onDrop={(event) =>
                      handleDropOnSlot(event, index)
                    }
                    className="cursor-pointer transition-transform"
                  >
                    {value ? (
                      <WordCard
                        item={value}
                        size="md"
                        isFlipped={true}
                        backImageSrc={cardBackSrc}
                        frontImageSrc={frontCardSrc}
                        isTappable
                        onDragStart={(event) =>
                          handleDragStart(
                            event,
                            "slot",
                            index,
                            value,
                          )
                        }
                        className={
                          selectedSlotIndex === index
                            ? "ring-4 ring-amber-400 scale-105 shadow-2xl animate-pulse"
                            : ""
                        }
                      />
                    ) : (
                      <WordGhostSlot
                        size="md"
                        index={index + 1}
                        onDragOver={handleDragOver}
                        onDrop={(event) =>
                          handleDropOnSlot(event, index)
                        }
                        className={
                          selectedSlotIndex === index
                            ? "ring-4 ring-amber-400 scale-105"
                            : ""
                        }
                      />
                    )}
                  </div>
                ))}
                </div>

                {/* Draggable card pool */}
                <div className="words-drag-pool" style={{ "--word-grid-columns": getMemoryRowColumns(dragPool.length) }}>
                {dragPool.map((item, index) => (
                  <WordCard
                    key={`answer-${index}`}
                    item={item}
                    size="lg"
                    isFlipped={true}
                    isTappable
                    frontImageSrc={frontCardSrc}
                    backImageSrc={cardBackSrc}
                    onClick={() => handleTileClick(item)}
                    onDragStart={(event) =>
                      handleDragStart(
                        event,
                        "pool",
                        index,
                        item,
                      )
                    }
                  />
                ))}
                </div>
              </div>

              <div className="words-action-area">
                {dragPool.length === 0 && slots.every(Boolean) && <ActionButton action="check"
                  type="button"
                  onClick={handleDragSubmit}
                  className="words-submit-button bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-6 border-emerald-700 text-white font-black text-base md:text-lg px-10 py-2.5 rounded-2xl shadow-xl active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wider cursor-pointer hover:scale-105"
                >
                  {t("submit_answers")}
                </ActionButton>}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 5: CORRECT OR INCORRECT FEEDBACK */}
      {phase === "feedback" && currentQuestion && (
        <main className="words-stage relative z-10 flex-1 mx-auto w-full px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-center min-h-0 overflow-hidden animate-fadeIn">
          <section
            className="words-vine-board words-vine-board--feedback adaptive-vine-board working-memory-board-frame"
            style={{
              backgroundImage: `url('${vineBoardImage}')`,
            }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            {/* Correct or try-again bunny */}
            <div className="words-board-bunny">
              <BunnyMascot
                screen={
                  isCurrentCorrect ? "correct" : "incorrect"
                }
              />
            </div>

            <div className="words-vine-board__content words-vine-board__content--feedback">
              {/* Correct/incorrect icon */}
              <div
                className={`words-feedback-icon ${
                  isCurrentCorrect
                    ? "bg-emerald-100"
                    : "bg-rose-100"
                }`}
              >
                {isCurrentCorrect ? "✅" : "❌"}

                {isCurrentCorrect && (
                  <>
                    <span className="star-animate star-1">
                      ⭐
                    </span>

                    <span className="star-animate star-2">
                      ⭐
                    </span>

                    <span className="star-animate star-3">
                      ⭐
                    </span>
                  </>
                )}
              </div>

              {/* Feedback title */}
              <h3
                className={`words-feedback-title ${
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
                    ? "නැවත උත්සාහ කරන්න!"
                    : "Try Again!"}
              </h3>

              {isCurrentCorrect && lastStarReward > 0 && (
                <div className="words-carrot-reward">
                  <div className="flex items-center gap-1.5 font-black text-lg text-amber-950">
                    <span>+{lastStarReward} {isSinhala ? "තරු" : "Stars"}</span>
                    <span className="text-xl animate-bounce">⭐</span>
                  </div>

                  <div className="words-total-carrots">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {isSinhala ? "මෙම ක්‍රීඩාව" : "This game"}: {earnedStars} ⭐
                    </span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {isSinhala ? "මුළු තරු" : "Total stars"}: {totalStars} ⭐
                    </span>
                  </div>
                </div>
              )}

              {/* User and correct answers */}
              <div className="words-feedback-answer-box">
                <div className="words-feedback-answer-group">
                  <span className="words-feedback-label">
                    {isSinhala
                      ? "ඔබගේ පිළිතුර"
                      : "Your Answer"}
                    :
                  </span>

                  <div className="words-feedback-cards">
                    {(Array.isArray(lastUserAnswer)
                      ? lastUserAnswer
                      : [lastUserAnswer]
                    ).map((item, index) => (
                      <WordCard
                        key={`user-answer-${index}`}
                        item={item || "?"}
                        size="sm"
                        isFlipped={true}
                        frontImageSrc={frontCardSrc}
                        backImageSrc={cardBackSrc}
                      />
                    ))}
                  </div>
                </div>

                {!isCurrentCorrect && (
                  <div className="words-feedback-answer-group">
                    <span className="words-feedback-label text-indigo-500">
                      {isSinhala
                        ? "නිවැරදි පිළිතුර"
                        : "Correct Answer"}
                      :
                    </span>

                    <div className="words-feedback-cards">
                      {(Array.isArray(currentQuestion.correct)
                        ? currentQuestion.correct
                        : [currentQuestion.correct]
                      ).map((item, index) => (
                        <WordCard
                          key={`correct-answer-${index}`}
                          item={item}
                          size="sm"
                          isFlipped={true}
                          frontImageSrc={frontCardSrc}
                          backImageSrc={cardBackSrc}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="words-action-area">
                <ActionButton action={currentIdx < questions.length - 1 ? "next" : "finish"}
                type="button"
                onClick={handleNextQuestion}
                className={`words-next-button ${
                  isCurrentCorrect
                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-700"
                    : "bg-indigo-500 hover:bg-indigo-600 border-indigo-700"
                }`}
              >
                {currentIdx < questions.length - 1
                  ? isSinhala
                    ? "ඊළඟ ප්‍රශ්නය ➔"
                    : "Next Question ➔"
                  : isSinhala
                    ? "අවසන් කරන්න ➔"
                    : "Finish ➔"}
                </ActionButton>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PHASE 6: FINAL RESULT SCREEN */}
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
          showGameNavigation
          useVineBoard
        />
      )}

      <GameStyles />

      {/* Word Game vine-board styles */}
      <style>{`
        .words-stage {
          max-width: 1180px;
          min-height: 0;
          overflow: visible !important;
          padding-block: 2px !important;
          align-items: center !important;
        }

        .words-vine-board {
          transform: translateY(-12px) scale(0.94);
          transform-origin: top center;
        }

        /*
         * The same transparent vine-board PNG is reused
         * for the memorization, answer and feedback screens.
         */
        .words-vine-board {
          position: relative;
          margin: 0 auto;

          background-repeat: no-repeat;
          background-position: center;
          background-size: 100% 100%;

          aspect-ratio: 16 / 9;
          isolation: isolate;
          overflow: visible;
        }

        /*
         * Change these widths if the board needs to be
         * larger or smaller on a particular screen.
         */
        .words-vine-board--show {
          width: min(76vw, calc(var(--memory-row-items, 3) * 122px + 310px), 1080px) !important;
          max-height: calc(100dvh - 118px);
        }

        /* The memory board grows from its two rows instead of reserving a
           fixed 16:9 canvas, avoiding large empty areas on short sequences. */
        .words-memory-board.adaptive-vine-board {
          min-height: 0 !important;
          max-height: calc(100dvh - 112px) !important;
          aspect-ratio: auto !important;
          border-width: clamp(46px, 4.8vw, 66px) !important;
        }

        .words-memory-board__content.adaptive-vine-board__content {
          width: 100%;
          padding: clamp(8px, 1vw, 14px) !important;
          gap: clamp(5px, 0.75vh, 9px) !important;
        }

        .words-memory-board.adaptive-vine-board > .words-board-bunny {
          left: clamp(-230px, -16vw, -170px) !important;
          bottom: -10px !important;
          transform: scale(0.96) !important;
          transform-origin: bottom right !important;
        }

        .words-vine-board--answer {
          width: min(56vw, 900px) !important;
          max-height: calc(100dvh - 112px);
        }

        .words-answer-board.adaptive-vine-board {
          width: min(76vw, calc(var(--memory-row-items, 3) * 122px + 310px), 1080px) !important;
          min-height: 0 !important;
          max-height: calc(100dvh - 250px) !important;
          aspect-ratio: auto !important;
          border-width: clamp(46px, 4.8vw, 66px) !important;
        }

        .words-answer-board__content.adaptive-vine-board__content {
          width: 100%;
          padding: clamp(8px, 1vw, 14px) !important;
          gap: clamp(8px, 1.1vh, 13px) !important;
          overflow: visible !important;
        }

        .words-answer-board.adaptive-vine-board > .words-board-bunny {
          left: clamp(-230px, -16vw, -170px) !important;
          bottom: -10px !important;
          transform: scale(0.96) !important;
          transform-origin: bottom right !important;
        }

        .words-vine-board--feedback {
          width: min(56vw, 820px) !important;
          max-height: calc(100dvh - 112px);
        }

        /*
         * Safe cream-coloured area inside the vine board.
         * Adjust these inset percentages to match your PNG.
         */
        .words-vine-board__content {
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

        .words-vine-board__content--answer {
          inset: 11% 8% 8% 13%;
          justify-content: space-between;
          overflow: hidden;
        }

        .words-vine-board__content--feedback {
          inset: 13% 11% 11% 15%;
          justify-content: space-evenly;
          overflow: hidden;
        }

        /*
         * Bunny overlaps the board's bottom-left border.
         */
        .words-board-bunny {
          position: absolute;

          left: clamp(-95px, -6vw, -55px);
          bottom: -8px;

          z-index: 5;
          pointer-events: none;
        }

        /*
         * Prevent positioning inside BunnyMascot from moving
         * the mascot relative to the full screen.
         */
        .words-board-bunny > * {
          position: relative !important;

          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;

          margin: 0 !important;
        }

        .adaptive-vine-board > .words-board-bunny {
          transform: scale(1.2) !important;
          transform-origin: bottom right !important;
        }

        /*
         * Memorization screen
         */
        .words-memory-title {
          width: fit-content;
          max-width: min(88%, 650px);
          position: absolute !important;
          z-index: 8;
          left: 50%;
          top: clamp(-92px, -9vh, -70px);
          transform: translateX(-50%);
          margin: 0 !important;
        }

        .words-memory-timer {
          width: min(72%, 650px);
          margin-bottom: clamp(8px, 1.5vh, 18px);
          flex-shrink: 0;
        }

        .words-memory-grid-wrapper {
          width: min(100%, 920px);

          display: flex;
          flex: 0 0 auto;
          min-height: auto;
          height: auto;

          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: clamp(10px, 1.4vw, 18px);
        }

        .words-memory-grid {
          width: min(100%, calc(var(--word-grid-columns, 3) * 122px));
          max-width: 100%;

          display: grid;
          grid-template-columns: repeat(var(--word-grid-columns, 3), minmax(0, 1fr));

          align-items: center;
          justify-content: center;
          justify-items: center;

          gap: clamp(6px, 0.8vw, 12px);
        }

        .words-memory-grid > * {
          width: min(100%, 104px) !important;
          height: auto !important;
          aspect-ratio: 1 / 1;
        }

        .words-memory-divider {
          width: min(92%, 560px);
          height: 2px;
          border-radius: 999px;
          background: rgba(155, 105, 35, 0.2);
          flex-shrink: 0;
        }

        .words-play-button {
          position: absolute;
          z-index: 8;
          left: 50%;
          bottom: -64px;
          transform: translateX(-50%);
          margin: 0 !important;
        }

        /*
         * Answer screen
         */
        .words-question-progress {
          position: absolute;
          z-index: 8;
          left: 8%;
          top: -166px;
          width: 84%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin: 0;
          padding: 0 8px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .words-answer-title {
          width: min(75%, 700px);
          position: absolute !important;
          z-index: 8;
          left: 50%;
          top: -132px;
          transform: translateX(-50%);

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;
          margin: 0 !important;

          flex-shrink: 0;
        }

        .words-drag-instruction {
          width: min(72%, 660px);
          position: absolute;
          z-index: 8;
          left: 50%;
          top: -62px;
          transform: translateX(-50%);

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 7px 15px;
          margin: 0;

          color: #6b4b1c;
          background: #fff3d6;
          border: 3px dashed #e8c98a;
          border-radius: 16px;

          box-shadow: 0 5px 10px rgba(84, 50, 14, 0.12);

          font-size: clamp(0.78rem, 1.2vw, 1rem);
          font-weight: 900;
          text-align: center;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .words-audio-button {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #ca8a04;
          background: #ffffff;
          border: 2px solid #facc15;
          border-radius: 999px;

          font-size: 0.875rem;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(84, 50, 14, 0.12);
        }

        .words-audio-button--large {
          width: 40px;
          height: 40px;

          border-width: 4px;
          font-size: 1.1rem;
        }

        .words-answer-slots {
          display: grid;
          grid-template-columns: repeat(var(--word-grid-columns, 3), minmax(0, 1fr));
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 2vw, 24px);

          width: min(100%, calc(var(--word-grid-columns, 3) * 122px));
          max-width: 100%;
          min-height: 0;

          margin: 4px 0;

          flex-shrink: 0;
        }

        .words-drag-pool {
          display: grid;
          grid-template-columns: repeat(var(--word-grid-columns, 3), minmax(0, 1fr));
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 2.5vw, 32px);

          width: min(100%, calc(var(--word-grid-columns, 3) * 122px));
          max-width: 100%;
          min-height: 0;

          padding: 4px 16px;

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .words-answer-slots > div,
        .words-answer-slots > div > *,
        .words-drag-pool > * {
          width: clamp(70px, 8vw, 112px) !important;
          height: clamp(70px, 8vw, 112px) !important;
        }

        .words-submit-button {
          position: absolute;
          z-index: 8;
          left: 50%;
          bottom: -62px;
          transform: translateX(-50%);
          margin: 0;
        }

        /*
         * Feedback screen
         */
        .words-feedback-icon {
          position: relative;

          width: clamp(58px, 6vw, 80px);
          height: clamp(58px, 6vw, 80px);

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 999px;
          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.08);

          font-size: clamp(1.8rem, 3vw, 2.5rem);
          flex-shrink: 0;
        }

        .words-feedback-title {
          margin: 5px 0;

          font-size: clamp(1.4rem, 2.6vw, 2rem);
          font-weight: 900;
          letter-spacing: 0.03em;
          text-transform: uppercase;

          flex-shrink: 0;
        }

        .words-carrot-reward {
          width: min(100%, 450px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 6px;

          padding: 10px 14px;
          margin-bottom: 8px;

          background: #fffbeb;
          border: 4px solid #fde68a;
          border-radius: 24px;

          box-shadow: inset 0 3px 8px rgba(120, 75, 10, 0.08);

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .words-total-carrots {
          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 4px;

          padding-top: 5px;

          border-top: 2px solid rgba(252, 211, 77, 0.4);
        }

        .words-feedback-answer-box {
          width: min(100%, 500px);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 8px;

          padding: 10px 14px;
          margin-bottom: 8px;

          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 24px;

          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.05);

          box-sizing: border-box;
          flex-shrink: 0;
        }

        .words-feedback-answer-group {
          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 5px;
        }

        .words-feedback-label {
          color: #94a3b8;

          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .words-feedback-cards {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 10px;
        }

        .words-next-button {
          flex-shrink: 0;

          padding: 10px 38px;

          color: #ffffff;
          border-bottom-width: 4px;
          border-radius: 16px;

          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          font-weight: 900;
          letter-spacing: 0.03em;
          text-transform: uppercase;

          cursor: pointer;
          box-shadow: 0 8px 16px rgba(25, 40, 65, 0.16);

          transition:
            transform 160ms ease,
            filter 160ms ease;
        }

        .words-next-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.04);
        }

        .words-next-button:active {
          transform: translateY(2px);
        }

        /*
         * Correct-answer floating stars
         */
        .star-animate {
          position: absolute;

          font-size: 2rem;

          pointer-events: none;

          animation-duration: 2.2s;
          animation-fill-mode: forwards;
          animation-timing-function:
            cubic-bezier(0.1, 0.8, 0.3, 1);
          animation-iteration-count: infinite;
        }

        .star-1 {
          animation-name: wordsFloatStarLeft;
        }

        .star-2 {
          animation-name: wordsFloatStarCentre;
          animation-delay: 0.15s;
        }

        .star-3 {
          animation-name: wordsFloatStarRight;
          animation-delay: 0.3s;
        }

        @keyframes wordsFloatStarLeft {
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

        @keyframes wordsFloatStarCentre {
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

        @keyframes wordsFloatStarRight {
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
         * Tablet
         */
        @media (max-width: 900px) {
          .words-vine-board {
            transform: translateY(-8px) scale(0.96);
          }

          .adaptive-vine-board > .words-board-bunny {
            transform: scale(0.78) !important;
            transform-origin: bottom left !important;
          }

          .words-vine-board--show,
          .words-vine-board--answer {
            width: 88vw !important;
          }

          .words-vine-board--feedback {
            width: min(92vw, 820px);
          }

          .words-vine-board__content {
            inset: 14% 7% 10% 12%;
          }

          .words-vine-board__content--answer {
            inset: 13% 7% 9% 12%;
          }

          .words-memory-grid {
            gap: 10px;
          }

          .words-answer-slots,
          .words-drag-pool {
            gap: 8px;
          }

          .words-board-bunny {
            left: -24px;
            bottom: -4px;

            transform: scale(0.78);
            transform-origin: bottom left;
          }

          .words-memory-board.adaptive-vine-board > .words-board-bunny,
          .words-answer-board.adaptive-vine-board > .words-board-bunny {
            left: -78px !important;
            bottom: -5px !important;
            transform: scale(0.76) !important;
          }

        }

        /*
         * Smaller screens
         */
        @media (max-width: 650px) {
          .words-vine-board {
            transform: translateY(-4px) scale(0.98);
          }

          .adaptive-vine-board > .words-board-bunny {
            transform: scale(0.72) !important;
            transform-origin: bottom left !important;
          }

          .words-vine-board--show,
          .words-vine-board--answer {
            width: 92vw !important;
          }

          .words-vine-board__content {
            inset: 15% 6% 9% 10%;
          }

          .words-memory-title,
          .words-memory-timer {
            width: 78%;
          }

          .words-memory-title {
            font-size: 0.88rem;
          }

          .words-question-progress {
            top: -142px;
          }

          .words-answer-title {
            top: -112px;
          }

          .words-drag-instruction {
            top: -52px;
          }

          .words-memory-grid-wrapper {
            width: 92%;
          }

          .words-memory-grid {
            width: min(100%, calc(var(--word-grid-columns, 2) * 72px));
            grid-template-columns: repeat(var(--word-grid-columns, 2), minmax(0, 1fr));
            gap: 5px;
          }

          .words-memory-grid > * {
            width: min(100%, 64px) !important;
          }

          .words-answer-title,
          .words-drag-instruction {
            width: 82%;
          }

          .words-drag-instruction {
            padding: 5px 8px;
            font-size: 0.7rem;
          }

          .words-answer-slots,
          .words-drag-pool {
            min-height: 0;
            grid-template-columns: repeat(var(--word-grid-columns, 2), minmax(0, clamp(62px, 18vw, 92px)));
          }

          .words-play-button,
          .words-submit-button {
            padding: 7px 22px;
            font-size: 0.9rem;
          }

          .words-board-bunny {
            left: -10px;

            transform: scale(0.58);
            transform-origin: bottom left;
          }

        }

        /* Stable safe-area layout shared by every Words game phase. */
        .words-vine-board.words-vine-board {
          transform: none;
        }

        .words-vine-board .words-memory-board__content.adaptive-vine-board__content,
        .words-vine-board .words-answer-board__content.adaptive-vine-board__content,
        .words-vine-board .words-vine-board__content--feedback {
          position: absolute !important;
          inset: 13% 9% 11% 13% !important;
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
          overflow: visible !important;
        }

        .words-vine-board .words-memory-board__content.adaptive-vine-board__content {
          display: flex !important;
          flex-direction: column;
          justify-content: flex-start !important;
          align-items: center;
          gap: clamp(6px, 1vh, 10px) !important;
        }

        .words-memory-title,
        .words-answer-title {
          position: relative !important;
          inset: auto !important;
          transform: none !important;
          width: min(78%, 690px) !important;
          min-height: 48px;
          margin: 0 !important;
          padding: 8px 16px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
          flex: 0 0 auto;
        }

        .words-memory-title > span,
        .words-answer-title > span {
          flex: 1 1 auto;
          text-align: center !important;
        }

        .words-memory-timer {
          width: min(72%, 650px);
          margin: 0 !important;
          flex: 0 0 auto;
        }

        .words-memory-grid-wrapper {
          width: min(100%, 920px);
          min-height: 0 !important;
          flex: 1 1 auto !important;
          display: flex;
          justify-content: center;
          gap: clamp(5px, .8vh, 9px) !important;
        }

        .words-memory-grid {
          flex: 0 1 auto;
        }

        .words-memory-grid > * {
          width: min(100%, clamp(68px, 6.8vw, 104px)) !important;
          max-height: clamp(68px, 11vh, 104px);
        }

        .words-action-area {
          width: 100%;
          min-height: clamp(50px, 6vh, 58px);
          padding: 3px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          box-sizing: border-box;
        }

        .words-play-button,
        .words-submit-button {
          position: relative !important;
          inset: auto !important;
          transform: none !important;
          margin: 0 !important;
        }

        .words-vine-board .words-answer-board__content.adaptive-vine-board__content {
          display: grid !important;
          grid-template-rows: auto minmax(0, 1fr) clamp(50px, 6vh, 58px);
          justify-items: center;
          align-items: center;
          gap: clamp(7px, 1vh, 11px) !important;
        }

        .words-answer-stage {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(9px, 1.4vh, 15px);
        }

        .words-answer-slots,
        .words-drag-pool {
          margin: 0;
          padding: 0;
          flex: 0 1 auto;
          gap: clamp(8px, 1.4vw, 18px);
        }

        .words-answer-slots > div,
        .words-answer-slots > div > *,
        .words-drag-pool > * {
          width: clamp(68px, 7vw, 104px) !important;
          height: clamp(68px, 7vw, 104px) !important;
          max-height: 13vh;
        }

        .words-vine-board .words-vine-board__content--feedback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(4px, .65vh, 8px);
        }

        .words-feedback-icon {
          width: clamp(48px, 5vw, 64px);
          height: clamp(48px, 5vw, 64px);
          font-size: clamp(1.5rem, 2.5vw, 2rem);
        }

        .words-feedback-title {
          margin: 0;
          font-size: clamp(1.15rem, 2.2vw, 1.65rem);
        }

        .words-carrot-reward {
          width: min(82%, 410px);
          padding: 5px 12px;
          margin: 0;
          gap: 2px;
          border-width: 2px;
          border-radius: 16px;
        }

        .words-total-carrots {
          padding-top: 2px;
          border-top-width: 1px;
        }

        .words-feedback-answer-box {
          width: min(94%, 620px);
          min-height: 0;
          padding: 7px 10px;
          margin: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: clamp(8px, 1.4vw, 18px);
          border-radius: 16px;
        }

        .words-feedback-answer-group {
          flex: 1 1 0;
          min-width: 0;
          gap: 3px;
        }

        .words-feedback-cards {
          flex-wrap: nowrap;
          gap: 5px;
        }

        .words-feedback-cards > * {
          width: clamp(48px, 5vw, 66px) !important;
          height: clamp(48px, 5vw, 66px) !important;
        }

        .words-next-button {
          padding: 8px 30px;
          margin: 0;
        }

        @media (max-width: 650px) {
          .words-vine-board .words-memory-board__content.adaptive-vine-board__content,
          .words-vine-board .words-answer-board__content.adaptive-vine-board__content,
          .words-vine-board .words-vine-board__content--feedback {
            inset: 14% 7% 10% 11% !important;
          }

          .words-memory-title,
          .words-answer-title {
            width: 84% !important;
            min-height: 44px;
            padding: 5px 8px !important;
            font-size: .76rem;
          }

          .words-feedback-answer-box {
            width: 98%;
          }
        }
      `}</style>
    </div>
  );
};

export default WordsGame;
