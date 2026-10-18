import ActionButton from "../components/ActionButton";
import React, { useEffect, useRef, useState } from "react";
import GameStyles from "../styles/Gamestyles";
import { Header, IntroScreen, BunnyMascot, ResultScreen, WoodenQuestionProgress } from "../components/SharedScreens";
import HowToPlayScreen from "../components/HowToPlayScreen";
import { parseInstructionSteps } from "../utils/helpers";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

// Drop your bunny image in at this path (falls back to the default bunny if missing).
const LISTENING_BUNNY_IMAGE = "/images/workingMemory/improve/reference-art/bunny-question.png";

// Wave color follows the level's accent color (same palette used across the WM games).
const LEVEL_WAVE_COLORS = {
  1: "rgba(249, 115, 22, 0.75)", // orange
  2: "rgba(34, 197, 94, 0.75)", // green
  3: "rgba(236, 72, 153, 0.75)", // pink
  4: "rgba(147, 51, 234, 0.75)", // purple
};

// Game 3: Instructions — listen to a chain of instructions read one-by-one, then recall
// what was said by tapping the correct answer (no drag-and-drop).
const InstructionsGame = ({
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
  currentIdx,
  questions,
  dragPool,
  handleInstructionAnswer,
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
  handleInstructionReady,
  earnedStars,
  lastStarReward,
  totalStars,
}) => {
  const isSinhala = i18n.language?.startsWith("si");
  const questionBoardImage = getWorkingMemoryThemeAssets(levelNumber).questionBoard;

  // --- Sequential instruction playback: reads each step separately with a 1s pause between ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playbackTokenRef = useRef(0);

  const stopInstructionPlayback = () => {
    playbackTokenRef.current += 1;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const playInstructionSequence = (instructionText) => {
    const steps = parseInstructionSteps(instructionText).map((step) => step.text);
    if (steps.length === 0) return;

    playbackTokenRef.current += 1;
    const myToken = playbackTokenRef.current;
    window.speechSynthesis?.cancel();
    setIsSpeaking(true);

    const speakStep = (idx) => {
      if (myToken !== playbackTokenRef.current) return;
      if (idx >= steps.length) {
        setIsSpeaking(false);
        return;
      }
      speakText(steps[idx], false, () => {
        if (myToken !== playbackTokenRef.current) return;
        setTimeout(() => {
          if (myToken !== playbackTokenRef.current) return;
          speakStep(idx + 1);
        }, 1000);
      });
    };

    speakStep(0);
  };

  // Automatically read the instruction sequence when entering the listening stage, and
  // reset all audio/timers whenever the phase or question changes (new question / restart).
  useEffect(() => {
    if (phase === "show" && currentQuestion) {
      playInstructionSequence(currentQuestion.instruction);
    }
    return () => stopInstructionPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion?.id]);

  // Read the recall question aloud (in the selected language, English or Sinhala) so
  // children who can't read yet can still hear what's being asked.
  useEffect(() => {
    if (phase === "answer" && currentQuestion?.questionText && soundEnabled) {
      speakText(currentQuestion.questionText, false);
    }
    return () => window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion?.id, soundEnabled]);

  const handleShowQuestion = () => {
    stopInstructionPlayback();
    handleInstructionReady();
  };

  const answerColors = [
    "bg-pink-50 border-pink-300 hover:border-pink-500 text-pink-950",
    "bg-emerald-50 border-emerald-300 hover:border-emerald-500 text-emerald-950",
    "bg-amber-50 border-amber-300 hover:border-amber-500 text-amber-950",
    "bg-sky-50 border-sky-300 hover:border-sky-500 text-sky-950",
  ];

  return (
    <div
      data-level={levelNumber} lang={i18n.language} className={`wm-game-root relative w-full h-screen h-dvh overflow-hidden font-custom select-none flex flex-col ${Number(levelNumber) === 4 ? "level-4-theme" : ""}`}
      style={{ "--vine-board-image": `url('${questionBoardImage}')` }}
    >
      <img
        src={backgroundSrc}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/images/workingMemory/improve/common/common_bg.png";
        }}
        alt="Jungle Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      <div className="scrim" />

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

      {/* PHASE 1: HOW TO PLAY */}
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

      {/* PHASE 2: BUNNY INSTRUCTION SCREEN (same ready screen used by every WM game) */}
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

      {/* PHASE 3: LISTENING / INSTRUCTION STAGE */}
      {phase === "show" && currentQuestion && (
        <main className="adaptive-game-stage relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col items-center justify-center animate-fadeIn">
          <div
            className="vine-board adaptive-vine-board working-memory-board-frame instructions-vine-board relative rounded-[3rem] p-8 md:p-12 w-full flex flex-col items-center text-center"
            style={{ "--wave-color": LEVEL_WAVE_COLORS[Number(levelNumber)] || LEVEL_WAVE_COLORS[1] }}
          >
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <div className="flex items-center justify-center gap-3 md:gap-5 mb-3">
              <span className={`wave-stack wave-left ${isSpeaking ? "" : "invisible"}`}>
                <span className="wave-arc" />
                <span className="wave-arc" />
                <span className="wave-arc" />
              </span>
              <img
                src={LISTENING_BUNNY_IMAGE}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/images/workingMemory/improve/boards/wm_bunny_question.png";
                }}
                alt="Bunny listening"
                className="w-32 md:w-44 lg:w-48 drop-shadow-xl"
              />
              <span className={`wave-stack wave-right ${isSpeaking ? "" : "invisible"}`}>
                <span className="wave-arc" />
                <span className="wave-arc" />
                <span className="wave-arc" />
              </span>
            </div>
            <style>{`
              .wave-stack {
                position: relative;
                width: 34px;
                height: 60px;
                flex-shrink: 0;
              }
              .wave-arc {
                position: absolute;
                border: 3px solid var(--wave-color, rgba(249, 115, 22, 0.75));
                border-left-color: transparent;
                border-top-color: transparent;
                border-bottom-color: transparent;
                border-radius: 50%;
                opacity: 0;
                animation: waveArcPulse 1.6s ease-out infinite;
              }
              .wave-arc:nth-child(1) { inset: 18px; }
              .wave-arc:nth-child(2) { inset: 9px; animation-delay: 0.25s; }
              .wave-arc:nth-child(3) { inset: 0; animation-delay: 0.5s; }
              .wave-left { transform: scaleX(-1); }
              @keyframes waveArcPulse {
                0% { opacity: 0.9; transform: scale(0.85); }
                80% { opacity: 0.3; }
                100% { opacity: 0; transform: scale(1.15); }
              }
            `}</style>
            <div className="instruction-tag mb-4">{isSinhala ? "හොඳින් සවන් දී පියවර අනුපිළිවෙළින් මතක තබා ගන්න." : "Listen properly and remember the steps in order."}</div>

            <div className="speech max-w-2xl mb-4 flex items-center justify-center gap-3 min-h-[64px]">
              {isSpeaking ? (
                <>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: "0s" }}>🔊</span>
                  <span className="flex items-end gap-1 h-6">
                    <span className="w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ height: "60%", animationDelay: "0s" }} />
                    <span className="w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ height: "100%", animationDelay: "0.15s" }} />
                    <span className="w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ height: "45%", animationDelay: "0.3s" }} />
                  </span>
                  <span>{isSinhala ? "සවන් දෙන්න..." : "Listening..."}</span>
                </>
              ) : (
                <span>🐰 {isSinhala ? "සූදානම්ද?" : "Ready when you are!"}</span>
              )}
            </div>

            <div className="wm-instruction-actions">
            <ActionButton action="listen-again"
              type="button"
              onClick={() => playInstructionSequence(currentQuestion.instruction)}
              className="btn-purple text-white font-black px-6 py-3 rounded-2xl border-b-4 border-indigo-800 cursor-pointer"
            >
              🔊 {isSinhala ? "නැවත අසන්න" : "Listen again"}
            </ActionButton>
            <ActionButton action="show-question"
              type="button"
              onClick={handleShowQuestion}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 border-b-6 border-emerald-700 text-white font-black text-xl px-9 py-3 rounded-2xl shadow-xl cursor-pointer uppercase tracking-wider"
            >
              ▶ {isSinhala ? "ප්‍රශ්නය පෙන්වන්න" : "Show Question"}
            </ActionButton>
            </div>
          </div>
        </main>
      )}

      {/* PHASE 4: ANSWER SCREEN */}
      {phase === "answer" && currentQuestion && (
        <main className="adaptive-game-stage relative z-10 flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 py-1 md:py-2 flex flex-col items-center justify-center min-h-0 overflow-hidden animate-fadeIn">
          <div className="vine-board adaptive-vine-board working-memory-board-frame instructions-vine-board relative rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-7 md:p-10 w-full flex flex-col items-center justify-between text-center overflow-visible">
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <BunnyMascot screen="answer" />

            <div className="w-full flex flex-col items-center animate-fadeIn justify-between flex-1 min-h-0 py-1 overflow-y-auto custom-scrollbar">
              <div className="instruction-tag mb-3 flex items-center gap-3">
                <span>{currentQuestion.questionText}</span>
                <button
                  type="button"
                  onClick={() => speakText(currentQuestion.questionText, false)}
                  aria-label={isSinhala ? "ප්‍රශ්නය අසන්න" : "Listen to the question"}
                  className="shrink-0 w-8 h-8 rounded-full bg-white/80 border-2 border-purple-200 text-purple-700 flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  🔊
                </button>
              </div>
              <div className="text-slate-700 font-bold text-sm mb-4">
                {isSinhala ? "නිවැරදි පිළිතුර තට්ටු කරන්න." : "Tap the correct answer."}
              </div>

              {/* Answer Options — large, child-friendly tap buttons (no drag-and-drop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
                {dragPool.map((option, i) => {
                  const colorClass = answerColors[i % answerColors.length];
                  return (
                    <button
                      key={i}
                      onClick={() => handleInstructionAnswer(option)}
                      className={`min-h-16 sm:min-h-20 rounded-2xl border-3 sm:border-4 shadow-md hover:scale-105 active:scale-95 transition-all transform flex items-center justify-center gap-3 px-4 py-3 cursor-pointer ${colorClass}`}
                    >
                      <span className="font-black text-base sm:text-lg text-center leading-tight">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PHASE 5: FEEDBACK SCREEN (appears inside the vine board, like the other games) */}
      {phase === "feedback" && currentQuestion && (
        <main className="adaptive-game-stage relative z-10 flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 py-1 sm:py-2 flex flex-col items-center justify-center min-h-0 overflow-hidden animate-fadeIn">
          <div className="vine-board adaptive-vine-board working-memory-board-frame instructions-vine-board relative rounded-[2.5rem] md:rounded-[3rem] p-4 sm:p-5 md:p-6 w-full max-h-[85vh] flex flex-col items-center justify-between text-center overflow-visible">
            <WoodenQuestionProgress currentQuestion={currentIdx + 1} totalQuestions={questions.length} />
            <BunnyMascot screen={isCurrentCorrect ? "correct" : "incorrect"} />
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-inner mb-2 shrink-0 relative ${isCurrentCorrect ? "bg-emerald-100" : "bg-rose-100"}`}>
              {isCurrentCorrect ? "✅" : "❌"}
              {isCurrentCorrect && (
                <>
                  <span className="absolute star-animate star-1 text-4xl">⭐</span>
                  <span className="absolute star-animate star-2 text-4xl">⭐</span>
                  <span className="absolute star-animate star-3 text-4xl">⭐</span>
                  <style>{`
                    @keyframes floatStar1 {
                      0% { transform: translate(0, 25px) scale(0.6); opacity: 0; }
                      30% { opacity: 1; }
                      100% { transform: translate(-80px, -120px) rotate(45deg) scale(2.0); opacity: 0; }
                    }
                    @keyframes floatStar2 {
                      0% { transform: translate(0, 25px) scale(0.6); opacity: 0; }
                      30% { opacity: 1; }
                      100% { transform: translate(0px, -160px) rotate(-30deg) scale(2.4); opacity: 0; }
                    }
                    @keyframes floatStar3 {
                      0% { transform: translate(0, 25px) scale(0.6); opacity: 0; }
                      30% { opacity: 1; }
                      100% { transform: translate(80px, -120px) rotate(75deg) scale(2.0); opacity: 0; }
                    }
                    .star-animate {
                      pointer-events: none;
                      animation-duration: 2.2s;
                      animation-fill-mode: forwards;
                      animation-timing-function: cubic-bezier(0.1, 0.8, 0.3, 1);
                      animation-iteration-count: infinite;
                    }
                    .star-1 {
                      animation-name: floatStar1;
                    }
                    .star-2 {
                      animation-name: floatStar2;
                      animation-delay: 0.15s;
                    }
                    .star-3 {
                      animation-name: floatStar3;
                      animation-delay: 0.3s;
                    }
                  `}</style>
                </>
              )}
            </div>

            <h3 className={`text-2xl sm:text-3xl font-black mb-2 uppercase tracking-wide shrink-0 ${isCurrentCorrect ? "text-emerald-600" : "text-rose-600"}`}>
              {isCurrentCorrect ? "CORRECT!" : "INCORRECT"}
            </h3>

            {isCurrentCorrect && lastStarReward > 0 && (
              <div className="bg-amber-50 border-4 border-amber-200 p-3 sm:p-4 rounded-[2rem] shadow-inner mb-3 w-full max-w-md flex flex-col items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5 font-black text-lg text-amber-950">
                  <span>+{lastStarReward} {isSinhala ? "තරු" : "Stars"}</span>
                  <span className="text-xl animate-bounce">⭐</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-t-2 border-amber-200/50 w-full pt-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isSinhala ? "මෙම ක්‍රීඩාව" : "This game"}: {earnedStars} ⭐
                  </span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isSinhala ? "මුළු තරු" : "Total stars"}: {totalStars} ⭐
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border-2 border-slate-100 p-3 sm:p-4 rounded-2xl md:rounded-[2rem] max-w-md w-full mb-3 sm:mb-4 shadow-inner text-center flex flex-col items-center justify-center shrink-0">
              <div className="mb-2 w-full flex flex-col items-center justify-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1 text-center">Your Answer:</span>
                <div className={`px-3 py-2 rounded-xl font-bold text-base shadow-sm border ${isCurrentCorrect ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"} flex items-center justify-center gap-2.5 w-full max-w-xs`}>
                  <span className="text-2xl">{parseInstructionSteps(currentQuestion.instruction).find((s) => s.text === lastUserAnswer)?.icon || "📝"}</span>
                  <span>{lastUserAnswer || "?"}</span>
                </div>
              </div>
              {!isCurrentCorrect && (
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-1 text-center">Correct Answer:</span>
                  <div className="px-3 py-2 rounded-xl font-bold text-base bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm flex items-center justify-center gap-2.5 w-full max-w-xs">
                    <span className="text-2xl">{parseInstructionSteps(currentQuestion.instruction).find((s) => s.text === currentQuestion.correct)?.icon || "📝"}</span>
                    <span>{currentQuestion.correct}</span>
                  </div>
                </div>
              )}
            </div>

            <ActionButton action={currentIdx < questions.length - 1 ? "next" : "finish"}
              onClick={handleNextQuestion}
              className={`text-white text-base sm:text-lg font-black px-10 py-2.5 sm:py-3 rounded-2xl border-b-4 transform transition-all active:translate-y-1 active:border-b-0 shadow-lg cursor-pointer uppercase tracking-wider shrink-0 ${
                isCurrentCorrect ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-700" : "bg-indigo-500 hover:bg-indigo-600 border-indigo-700"
              }`}
            >
              {currentIdx < questions.length - 1 ? "Next Question ➔" : "Finish ➔"}
            </ActionButton>
          </div>
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
    </div>
  );
};

export default InstructionsGame;
