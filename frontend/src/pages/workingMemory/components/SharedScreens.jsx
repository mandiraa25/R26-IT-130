import ActionButton from "./ActionButton";
import React from "react";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import { formatYouTubeEmbedUrl } from "../utils/helpers";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

// Top header bar: back button, level/subcategory label, sound toggle, language switcher.
// hideOnVideoPhase: Pattern game hides the header during the "video" phase; the other
// three games keep it visible throughout.
export const Header = ({
  phase,
  hideOnVideoPhase = false,
  levelNumber,
  subCategoryKey,
  t,
  handleBackToLevels,
  soundEnabled,
  setSoundEnabled,
  earnedStars,
  totalStars,
}) => {
  if (hideOnVideoPhase && phase === "video") return null;

  const showStarBadge = phase !== "video" && phase !== "intro" && Number.isFinite(Number(totalStars));

  return (
    <header className="wm-game-header relative z-10 w-full px-4 py-2 md:px-6 md:py-2.5 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-[clamp(12px,1.5vw,18px)] min-w-0">
        <button
          onClick={handleBackToLevels}
          className="w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full bg-white hover:bg-slate-50 border-4 border-yellow-400 text-yellow-600 flex items-center justify-center text-2xl font-black transition-all transform hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 shadow-[var(--shadow-soft)] cursor-pointer"
          title="Go Back" aria-label="Go back to levels"
        >
          ←
        </button>
        <div className="bg-yellow-400 border-b-6 border-yellow-600 px-4 py-1.5 md:px-5 md:py-2 rounded-2xl shadow-lg flex items-center min-w-0">
          <span className="text-yellow-950 font-black text-xs sm:text-sm md:text-lg uppercase tracking-wide truncate">
            Level {levelNumber} • {t(`subcat_${subCategoryKey}`)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[clamp(10px,1.2vw,14px)] shrink-0">
        {showStarBadge && (
          <div
            className="flex h-11 md:h-12 items-center gap-1.5 rounded-full border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-100 px-3 md:px-3.5 shadow-md min-w-[3.25rem]"
            title={t("total_stars", { defaultValue: "Total Stars" })}
            aria-label={`${t("game_stars", { defaultValue: "Game stars" })}: ${Math.max(0, Number(earnedStars) || 0)}`}
          >
            <span className="text-base md:text-lg leading-none" aria-hidden="true">⭐</span>
            <span className="text-sm md:text-base font-black tabular-nums text-amber-950 leading-none">
              {Math.max(0, Number(earnedStars) || 0)}
            </span>
          </div>
        )}
        <button
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"} aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-lg shadow-[var(--shadow-soft)] border-4 active:translate-y-0.5 transition-all cursor-pointer ${
            soundEnabled ? "bg-white border-purple-400 hover:bg-slate-50 text-purple-600" : "bg-gray-100 border-gray-400 hover:bg-gray-200 text-gray-400"
          }`}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        <div className="h-11 md:h-12 bg-white/95 px-2.5 md:px-3 rounded-full shadow-[var(--shadow-soft)] border-2 border-emerald-100/50 flex items-center justify-center text-slate-700 font-bold">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

const WOODEN_PROGRESS_BASE = "/images/workingMemory/improve/progress";

export const WoodenQuestionProgress = ({ currentQuestion, totalQuestions, completedQuestions, incorrectQuestions }) => {
  const activeQuestion = Math.min(Math.max(Number(currentQuestion) || 1, 1), 5);
  const explicitlyCompleted = Array.isArray(completedQuestions)
    ? new Set(completedQuestions.map(Number))
    : null;
  const explicitlyIncorrect = Array.isArray(incorrectQuestions)
    ? new Set(incorrectQuestions.map(Number))
    : null;

  return (
    <div
      className="wooden-question-progress"
      role="progressbar"
      aria-label={`Question ${activeQuestion} of ${totalQuestions || 5}`}
      aria-valuemin="1"
      aria-valuemax={totalQuestions || 5}
      aria-valuenow={activeQuestion}
    >
      <img className="wooden-question-progress__stick" src="/images/workingMemory/improve/reference-art/question-tracker.png" alt="" aria-hidden="true" />
      <div className="wooden-question-progress__numbers">
        {[1, 2, 3, 4, 5].map((number) => {
          const isCompleted = explicitlyCompleted
            ? explicitlyCompleted.has(number)
            : !explicitlyIncorrect && number < activeQuestion;
          const isIncorrect = explicitlyIncorrect?.has(number);
          const state = isCompleted
            ? "completed"
            : isIncorrect
              ? "incorrect"
              : number === activeQuestion
                ? "current"
                : "upcoming";
          return (
            <div
              key={number}
              className={`wooden-question-progress__number wooden-question-progress__number--asset-${number} wooden-question-progress__number--${state}`}
              style={{ "--progress-number-index": number - 1 }}
              aria-label={`Question ${number}: ${state}`}
            >
              <img
                src={`${WOODEN_PROGRESS_BASE}/level_${number}_wooden_button.png`}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
              {state === "completed" && <span aria-hidden="true">✓</span>}
              {state === "incorrect" && <span aria-hidden="true">✗</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Phase 1: video lesson, shared by all four games. `showDescription` controls whether the
// extra bilingual "you're ready to practice" paragraph is shown under the "video ended" card
// (the default Words/Instructions/Numbers layout shows it, Pattern's intro screen doesn't).
export const VideoScreen = ({
  subCatData,
  useFallbackIframe,
  videoEnded,
  handleReplayVideo,
  startQuiz,
  i18n,
  showDescription = true,
}) => {
  return (
    <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-2 md:py-4 flex flex-col items-center justify-center min-h-0 overflow-hidden animate-fadeIn">
      <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-6 border-2 border-white/35 border-b-[8px] md:border-b-[10px] border-b-white/20 w-full max-h-full flex flex-col items-center text-center justify-center overflow-hidden">
        <div className="w-full max-w-4xl aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-100 bg-black relative mb-4 md:mb-6 shrink min-h-0 max-h-[58vh] md:max-h-[62vh]">
          {subCatData.youtubeVideoUrl ? (
            <>
              {useFallbackIframe ? (
                <iframe
                  className="w-full h-full"
                  src={formatYouTubeEmbedUrl(subCatData.youtubeVideoUrl)}
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div id="yt-player-element" className="w-full h-full" />
              )}

              {/* Click shields */}
              <div className="absolute bottom-0 right-0 z-20 w-44 md:w-56 h-14 pointer-events-auto bg-transparent" />
              <div className="absolute top-0 left-0 z-20 w-3/4 h-16 pointer-events-auto bg-transparent" />
              <div className="absolute top-0 right-0 z-20 w-28 h-16 pointer-events-auto bg-transparent" />

              {videoEnded && (
                <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                  <span className="text-6xl mb-3 animate-bounce">🌟</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                    {i18n.language?.startsWith("si") ? "වීඩියෝ පාඩම නරඹා අවසන්!" : "Lesson Video Completed!"}
                  </h3>
                  {showDescription && (
                    <p className="text-indigo-200 text-sm md:text-base font-semibold mb-6 max-w-md">
                      {i18n.language?.startsWith("si")
                        ? "ඔබ වීඩියෝව සාර්ථකව නරඹන ලදී. දැන් ප්‍රායෝගික පුහුණුව ආරම්භ කිරීමට පහත බොත්තම ඔබන්න!"
                        : "Great job watching the video! Click below to start your practice activity."}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <button
                      onClick={handleReplayVideo}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      🔄 {i18n.language?.startsWith("si") ? "නැවත නරඹන්න" : "Replay Video"}
                    </button>
                    <ActionButton action="try-again"
                      onClick={startQuiz}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      🚀 {i18n.language?.startsWith("si") ? "ඉක්මනින් ක්‍රීඩා කරන්න" : "Skip and Play"}
                    </ActionButton>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-800 p-6">
              <span className="text-6xl mb-4 animate-bounce">📽️</span>
              <p className="text-xl font-bold">Educational Demonstration Video</p>
            </div>
          )}
        </div>

        <ActionButton action="try-again"
          onClick={startQuiz}
          className="bg-emerald-500 hover:bg-emerald-600 border-b-6 md:border-b-8 border-emerald-700 text-white font-black text-xl md:text-2xl px-8 md:px-12 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all transform uppercase tracking-wider flex items-center gap-3 cursor-pointer shrink-0"
        >
          <span>🚀</span> {i18n.language?.startsWith("si") ? "ඉක්මනින් ක්‍රීඩා කරන්න" : "Skip and Play"}
        </ActionButton>
      </div>
    </main>
  );
};

export const LegacyIntroScreen = ({ i18n, subCategoryKey, levelNumber, onReady }) => {
  const isSinhala = i18n.language?.startsWith("si");
  const instructions = {
    pattern: isSinhala ? "සූදානම්ද? 1, 2, 3, ක්‍රීඩා කරමු!" : "Ready? 1, 2, 3, Let's Play!",
    words: isSinhala ? "කාඩ්පත්වල අනුපිළිවෙල මතක තබා ගන්න. ඉන්පසු ඒවා නිවැරදි අනුපිළිවෙලට ඇද දමන්න." : "Remember the order of the cards carefully. Then drag the cards into the correct order.",
    instructions: isSinhala ? "උපදෙස්වලට හොඳින් සවන් දී නිවැරදි පිළිතුර තට්ටු කරන්න." : "Listen carefully to the instructions, then tap the correct answer.",
    numbers: isSinhala ? "අංකවල අනුපිළිවෙල හොඳින් බලා මතක තබා ගන්න. ඉන්පසු නිවැරදි අනුපිළිවෙලට තට්ටු කරන්න." : "Look carefully at the order of the numbers and remember them. Then tap the numbers in the correct order.",
  };
  const accent = { 1: "bg-orange-500 border-orange-700", 2: "bg-green-600 border-green-800", 3: "bg-pink-500 border-pink-700", 4: "bg-purple-600 border-purple-800" }[Number(levelNumber)] || "bg-emerald-500 border-emerald-700";

  return (
    <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col items-center justify-center animate-fadeIn">
      <div className="glass-card rounded-[3rem] p-7 md:p-10 border-2 border-white/35 border-b-[10px] border-b-white/20 w-full max-w-3xl flex flex-col md:flex-row items-center gap-7">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/90 border-8 border-pink-200 shadow-xl flex items-center justify-center text-8xl md:text-9xl">🐰</div>
          <span className="mt-3 bg-white/90 text-pink-700 px-4 py-1 rounded-full font-black uppercase tracking-wider">{isSinhala ? "සූදානම්ද?" : "Ready?"}</span>
        </div>
        <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative w-full bg-lime-50 border-4 border-dashed border-emerald-700 rounded-[2rem] p-6 shadow-xl">
            <span className="absolute -left-4 top-8 text-3xl">🍃</span>
            <span className="absolute -right-4 bottom-8 text-3xl">🍃</span>
            <p className="text-emerald-950 font-black text-xl md:text-2xl leading-snug">{instructions[subCategoryKey]}</p>
          </div>
          <p className="mt-4 text-white/90 font-black uppercase tracking-widest text-sm">{isSinhala ? `මට්ටම ${levelNumber}` : `Level ${levelNumber}`}</p>
          <ActionButton action="play" onClick={onReady} className={`${accent} text-white font-black text-xl px-9 py-3 rounded-2xl border-b-6 shadow-xl mt-4 uppercase tracking-wider transition-transform hover:scale-105 active:translate-y-1`}>
            ▶ {subCategoryKey === "pattern" ? (isSinhala ? "ආරම්භ කරන්න" : "Start") : (isSinhala ? "ක්‍රීඩා කිරීමට සූදානම්" : "Ready to Play")}
          </ActionButton>
        </div>
      </div>
    </main>
  );
};

export const IntroScreen = ({ i18n, subCategoryKey, levelNumber, onReady }) => {
  const isSinhala = i18n.language?.startsWith("si");
  const isPictureMemory = subCategoryKey === "words";
  const accent = {
    1: "bg-orange-500 border-orange-700",
    2: "bg-green-600 border-green-800",
    3: "bg-pink-500 border-pink-700",
    4: "bg-purple-600 border-purple-800",
  }[Number(levelNumber)] || "bg-emerald-500 border-emerald-700";

  return (
    <main className="relative z-10 flex-1 w-full min-h-0 px-2 sm:px-4 py-2 flex items-center justify-center overflow-hidden animate-fadeIn">
      <section className="wm-ready-board" style={{ backgroundImage: `url('${getWorkingMemoryThemeAssets(levelNumber).questionBoard}')` }}>
        <img className="wm-ready-bunny" src="/images/workingMemory/improve/reference-art/bunny.png" alt="" />
        <ActionButton action="play"
          type="button"
          onClick={onReady}
          aria-label={isSinhala ? "ක්‍රීඩාව ආරම්භ කරන්න" : "Start the game"}
          className={`${accent} min-h-12 px-7 py-2.5 rounded-2xl border-b-4 text-white font-black text-[clamp(.8rem,1.7vw,1.1rem)] shadow-lg uppercase tracking-wide transition-transform hover:scale-105 active:translate-y-1 cursor-pointer`}
        >
          {isPictureMemory ? (isSinhala ? "ආරම්භ කරන්න" : "Start") : (isSinhala ? "ක්‍රීඩා කිරීමට සූදානම්" : "Ready to Play")}
        </ActionButton>
      </section>
    </main>
  );
};

export const BunnyMascot = ({ screen }) => (
  <img
    src={`/images/workingMemory/improve/reference-art/bunny-${screen === "answer" ? "answer" : "question"}.png`}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute -left-10 md:-left-24 bottom-0 z-20 hidden w-48 md:block md:w-64 lg:-left-32 lg:w-72"
  />
);

// Final phase: score, pass/fail status, retry / next / back-to-levels actions. Shared by all four games.
export const ResultScreen = ({ score, questions, earnedStars, totalStars, t, isSubmitting, submitResult, startQuiz, handleNextSubCategory, handleBackToLevels, showGameNavigation = false, useVineBoard = false, levelNumber = 1 }) => {
  const totalQuestions = questions.length;
  const correctCount = Math.min(score, totalQuestions);
  const incorrectCount = Math.max(totalQuestions - correctCount, 0);
  const isPassed = submitResult?.isPassed ?? correctCount >= 2;

  return (
    <main className={`relative z-10 flex-1 min-h-0 mx-auto w-full px-4 py-2 flex flex-col items-center justify-center animate-fadeIn ${useVineBoard ? "result-vine-stage" : "max-w-2xl"}`}>
      {useVineBoard && (
        <div className="result-board-bunny">
          <BunnyMascot screen={score >= 2 ? "answer" : "question"} />
        </div>
      )}

      <div
        className={useVineBoard
        ? "result-vine-board w-full flex flex-col items-center text-center relative"
        : "glass-card rounded-[2rem] p-4 md:p-6 border-2 border-white/35 border-b-[8px] border-b-white/20 w-full max-h-full flex flex-col items-center text-center relative overflow-hidden"
        }
        style={useVineBoard ? { "--result-vine-board-image": `url('${getWorkingMemoryThemeAssets(levelNumber).questionBoard}')` } : undefined}
      >
        <div className={useVineBoard ? "result-vine-board__content" : "contents"}>
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl shadow-inner mb-2 animate-bounce">
          {score >= 2 ? "🐰🎉" : "🐰💪"}
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-1 uppercase tracking-wide">
          {score >= 2 ? t("congratulations") : t("great_effort")}
        </h2>

        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 border-b-5 border-amber-600 px-6 py-3 rounded-2xl w-full max-w-md shadow-lg my-2 text-center">
          <span className="text-amber-950 font-black text-base uppercase tracking-widest block">{t("your_score")}</span>
          <span className="text-5xl font-black text-white drop-shadow-md">
            {correctCount} / {totalQuestions}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md" aria-label="Answer summary">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-2">
            <span className="block text-sm font-black uppercase text-emerald-700">
              {t("correct", { defaultValue: "Correct" })}
            </span>
            <span className="block text-3xl font-black text-emerald-800">{correctCount}</span>
          </div>
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-2">
            <span className="block text-sm font-black uppercase text-rose-700">
              {t("incorrect", { defaultValue: "Incorrect" })}
            </span>
            <span className="block text-3xl font-black text-rose-800">{incorrectCount}</span>
          </div>
        </div>

        {Number.isFinite(earnedStars) && (
          <div className="mt-2 grid grid-cols-2 gap-3 w-full max-w-md">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 py-2 font-black text-amber-800">
              <span className="block text-xs uppercase">{t("game_stars", { defaultValue: "Game Stars" })}</span>
              <span className="text-xl">⭐ {earnedStars}</span>
            </div>
            <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 px-3 py-2 font-black text-yellow-800">
              <span className="block text-xs uppercase">{t("total_stars", { defaultValue: "Total Stars" })}</span>
              <span className="text-xl">⭐ {Number(totalStars) || 0}</span>
            </div>
          </div>
        )}

        {isSubmitting ? (
          <div className="text-slate-500 font-bold text-base my-1 animate-pulse">Saving your progress...</div>
        ) : (
          <div className="my-2">
            {isPassed ? (
              <div className="bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-black px-6 py-3 rounded-2xl text-lg shadow-sm">
                🔓 {t("unlocked_next")}
              </div>
            ) : (
              <div className="bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold px-6 py-3 rounded-2xl text-base shadow-sm">
                {t("score_needed")}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 w-full max-w-md mt-3 shrink-0">
          {showGameNavigation ? (
            <>
              <ActionButton action="try-again" onClick={startQuiz} className="flex-1 bg-sky-500 hover:bg-sky-600 border-b-5 border-sky-700 text-white font-black text-sm sm:text-base py-3 px-2 rounded-2xl transition-all active:translate-y-1 uppercase shadow-lg cursor-pointer">
                Back to Game
              </ActionButton>
              <ActionButton action="back" onClick={handleBackToLevels} className="flex-1 bg-amber-500 hover:bg-amber-600 border-b-5 border-amber-700 text-white font-black text-sm sm:text-base py-3 px-2 rounded-2xl transition-all active:translate-y-1 uppercase shadow-lg cursor-pointer">
                Games Dashboard
              </ActionButton>
            </>
          ) : isPassed ? (
            <ActionButton action="continue"
              onClick={handleNextSubCategory}
              className="w-full bg-emerald-500 hover:bg-emerald-600 border-b-5 border-emerald-700 text-white font-black text-lg py-3 rounded-2xl transition-all active:translate-y-1 active:border-b-0 uppercase shadow-lg cursor-pointer"
            >
              {t("next_activity")} ➔
            </ActionButton>
          ) : (
            <ActionButton action="try-again"
              onClick={startQuiz}
              className="w-full bg-sky-500 hover:bg-sky-600 border-b-5 border-sky-700 text-white font-black text-lg py-3 rounded-2xl transition-all active:translate-y-1 active:border-b-0 uppercase shadow-lg cursor-pointer"
            >
              {t("play_again", { defaultValue: "Try Again" })}
            </ActionButton>
          )}
        </div>
        </div>
      </div>
    </main>
  );
};
