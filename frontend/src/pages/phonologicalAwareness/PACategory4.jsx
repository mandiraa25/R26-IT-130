import React, { useState, useEffect, useRef } from "react";
import PAQuizHeaderControls from "./PAQuizHeaderControls";
import { renderMirroredText, getCleanText } from "../../utils/phonologicalAwareness/text.util";

/**
 * PACategory4 Component
 * UI component for Subcategory 4 (Segmentation & Counting) across all levels.
 * Theme: Jungle Rhythm Beats & Numbered Lily Pads with Drum Tapper.
 *
 * Sound Effects & Feedback:
 * - Web Audio API button click sound effects.
 * - 3 Gold Stars ⭐⭐⭐ + Victory Fanfare on correct answer.
 * - Inline feedback card in bottom bar (No popup modal, hidden previous button, next arrow on right).
 */
export default function PACategory4({
  currentQuestion,
  currentIdx = 0,
  totalQuestions = 5,
  onOptionSelect,
  onPrevQuestion,
  onNextQuestion,
  onBack,
  soundEnabled = true,
  onToggleSound,
  speakText,
  isPlayingAudio = false,
  levelNumber = 1,
  subCategoryTitle = "Segmentation & Counting",
  savedAnswer = null,
}) {
  const [selectedOpt, setSelectedOpt] = useState(savedAnswer || null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [prevQId, setPrevQId] = useState(currentQuestion?.id);
  const [drumTapCount, setDrumTapCount] = useState(0);

  // Web Audio API Synthesizer Helper for sound effects
  const playSynthesizedSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "correct") {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } else if (type === "wrong") {
        const notes = [220.00, 164.81];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.25);
        });
      }
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  const clickAudioRef = useRef(new Audio("/click.mp3"));

  const playBtnSound = () => {
    if (soundEnabled) {
      playSynthesizedSound("click");
      try {
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.play().catch(() => {});
      } catch (e) {}
    }
  };

  const playResultSound = (correct) => {
    if (!soundEnabled) return;
    if (correct) {
      playSynthesizedSound("correct");
    } else {
      playSynthesizedSound("wrong");
    }
  };

  // Check correctness helper
  const checkIsCorrect = (choice) => {
    if (!choice || !currentQuestion) return false;
    const correctAns = currentQuestion.correct || currentQuestion.correctAnswer || currentQuestion.correctOption;
    if (typeof correctAns === "string") {
      return choice.trim().toLowerCase() === correctAns.trim().toLowerCase();
    }
    return choice === correctAns;
  };

  // Synchronously reset state when navigating between questions
  if (currentQuestion?.id !== prevQId) {
    setPrevQId(currentQuestion?.id);
    const initialOpt = savedAnswer || null;
    setSelectedOpt(initialOpt);
    const initialIdx = initialOpt && currentQuestion?.options ? currentQuestion.options.indexOf(initialOpt) : null;
    setSelectedIdx(initialIdx !== -1 ? initialIdx : null);
    setIsCorrect(initialOpt ? checkIsCorrect(initialOpt) : false);
    setDrumTapCount(0);
  }

  useEffect(() => {
    const initialOpt = savedAnswer || null;
    setSelectedOpt(initialOpt);
    if (initialOpt && currentQuestion?.options) {
      const idx = currentQuestion.options.indexOf(initialOpt);
      setSelectedIdx(idx !== -1 ? idx : null);
      setIsCorrect(checkIsCorrect(initialOpt));
    } else {
      setSelectedIdx(null);
      setIsCorrect(false);
    }
  }, [currentQuestion?.id, savedAnswer]);

  if (!currentQuestion) return null;

  const instructionText =
    currentQuestion.instruction || "Count the letters or words in the sentence!";

  // Format instruction text to highlight quotes
  const renderFormattedInstruction = (text) => {
    const parts = text.split(/('[^']+'|"[^"]+")/g);
    return parts.map((part, idx) => {
      if (
        (part.startsWith("'") && part.endsWith("'")) ||
        (part.startsWith('"') && part.endsWith('"'))
      ) {
        return (
          <span key={idx} className="text-[#B91C1C] font-black px-1 underline decoration-[#B91C1C] decoration-2">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Drum Tapper Handler
  const handleDrumTap = () => {
    playBtnSound();
    const nextCount = drumTapCount >= 12 ? 1 : drumTapCount + 1;
    setDrumTapCount(nextCount);
    if (speakText && soundEnabled) {
      speakText(`${nextCount}`);
    }
  };

  // Handle Option Click: Immediately highlights option, plays sound & displays result feedback
  const handleOptionClick = (opt, index) => {
    playBtnSound();
    setSelectedOpt(opt);
    setSelectedIdx(index);
    const correct = checkIsCorrect(opt);
    setIsCorrect(correct);
    playResultSound(correct);
  };

  // Handle Next Question Navigation Click
  const handleNextQuestionClick = () => {
    if (selectedOpt) {
      playBtnSound();
      onOptionSelect(selectedOpt);
    }
  };

  // Lily Pad Colors
  const lilyPadColors = [
    { bg: "bg-gradient-to-b from-[#4ADE80] to-[#22C55E]", border: "border-[#15803D]", text: "text-white", accent: "bg-emerald-700" },
    { bg: "bg-gradient-to-b from-[#38BDF8] to-[#0284C7]", border: "border-[#075985]", text: "text-white", accent: "bg-sky-700" },
    { bg: "bg-gradient-to-b from-[#FACC15] to-[#EAB308]", border: "border-[#A16207]", text: "text-white", accent: "bg-amber-700" },
  ];

  const isLastQuestion = currentIdx === totalQuestions - 1;
  const isSinhala = currentQuestion.instruction && /[\u0D80-\u0DFF]/.test(currentQuestion.instruction);

  return (
    <div className="relative w-full h-screen h-dvh overflow-hidden font-sans select-none flex flex-col justify-between p-2 md:p-4">
      {/* 🌄 Jungle Background */}
      <img
        src="/images/phonologicalAwareness/Improvement/bg.png"
        alt="Jungle Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/images/phonologicalAwareness/quiz_interaction_bg2.png";
        }}
      />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* 🌟 TOP HEADER ROW */}
      <header className="relative z-10 w-full flex items-center justify-between gap-2 md:gap-4 shrink-0">
        {/* Left: Back Home Button & Wooden Sign */}
        <div className="flex items-center gap-2 md:gap-3 z-10">
          <button
            onClick={() => {
              playBtnSound();
              onBack();
            }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#8B4513] hover:bg-[#72380F] border-b-4 border-[#5C2E0B] text-white flex items-center justify-center shadow-lg transform active:translate-y-1 active:border-b-0 transition-all cursor-pointer"
            title="Go Back"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>

          {/* Level Wooden Board */}
          <div className="relative bg-gradient-to-b from-[#E6A055] to-[#B86E2A] border-4 border-[#7A4211] px-4 md:px-6 py-1.5 md:py-2 rounded-2xl shadow-xl flex flex-col items-center">
            <span className="absolute -top-3 -right-2 text-xl">🥁</span>
            <span className="text-[#4A2403] font-black text-xs md:text-sm uppercase tracking-wider leading-none">
              {isSinhala ? `මට්ටම ${levelNumber}` : `LEVEL ${levelNumber}`}
            </span>
            <span className="text-[#331801] font-extrabold text-sm md:text-base leading-tight">
              {subCategoryTitle}
            </span>
          </div>
        </div>

        <PAQuizHeaderControls
          currentIdx={currentIdx}
          totalQuestions={totalQuestions}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            playBtnSound();
            onToggleSound();
          }}
        />
      </header>

      {/* 🧩 MAIN CONTENT ROW */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-6 py-2 min-h-0">
        {/* 🦜 LEFT COLUMN: Speech Bubble aligned with background Parrot */}
        <div className="hidden lg:flex flex-col items-center justify-center relative w-1/5 max-w-[240px] shrink-0 self-center mt-16 md:mt-24">
          {/* Speech Bubble */}
          <div className="relative bg-white border-3 border-[#70441D] rounded-3xl p-4 shadow-2xl text-center text-[#3B1F04] font-black text-base md:text-lg leading-snug w-full animate-fadeIn">
            {renderFormattedInstruction(instructionText)}
            {speakText && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => {
                    playBtnSound();
                    speakText(instructionText);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-black inline-flex items-center gap-1.5 cursor-pointer transition-all border ${
                    isPlayingAudio
                      ? "bg-amber-400 text-amber-950 border-amber-500 animate-pulse scale-105"
                      : "bg-[#16A34A] hover:bg-[#15803D] text-white border-[#14532D]"
                  }`}
                >
                  <img
                    src="/images/phonologicalAwareness/Improvement/speaker.png"
                    alt="Speaker"
                    className="w-4 h-4 object-contain inline-block"
                  />
                  {isPlayingAudio ? "Playing..." : "Listen"}
                </button>
              </div>
            )}
            {/* Bubble Tail pointing UPWARDS */}
            <div className="absolute -top-3 left-1/3 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-[#70441D]" />
            <div className="absolute -top-[9px] left-1/3 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[11px] border-b-white" />
          </div>
        </div>

        {/* 📋 CENTER COLUMN: Rhythm Beats Board */}
        <div
          className="flex-1 flex flex-col items-center justify-between bg-center bg-no-repeat rounded-[2.5rem] md:rounded-[3rem] px-6 sm:px-14 md:px-20 pt-4 sm:pt-6 md:pt-8 pb-7 sm:pb-9 md:pb-12 relative h-full max-h-[85vh] overflow-hidden"
          style={{
            backgroundImage: "url('/images/phonologicalAwareness/Improvement/question_bg.png')",
            backgroundSize: "100% 100%",
          }}
        >
          {/* Decorative Drum Accent */}
          <div className="absolute top-2 right-4 text-2xl">🥁</div>

          {/* TOP WOODEN INSTRUCTION BANNER WITH q_bg.png */}
          <div
            className="w-full max-w-md sm:max-w-lg md:max-w-xl text-center drop-shadow-md mt-0 mb-1 flex items-center justify-center relative h-[84px] sm:h-[98px] md:h-[112px] shrink-0 z-10"
            style={{
              backgroundImage: "url('/images/phonologicalAwareness/Improvement/q_bg.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Centered Question Text */}
            <div className="w-full max-w-[80%] px-6 sm:px-10 flex items-center justify-center h-full my-auto overflow-hidden text-center">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[#3B1F04] leading-tight sm:leading-snug text-center drop-shadow-sm px-1 py-1">
                {renderFormattedInstruction(instructionText)}
              </h2>
            </div>

            {/* Speaker Icon - Vertically Centered on Right */}
            {speakText && (
              <button
                onClick={() => {
                  playBtnSound();
                  speakText(instructionText);
                }}
                className={`absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 rounded-full active:scale-95 transition-all cursor-pointer border-0 p-0 bg-transparent flex items-center justify-center shrink-0 ${
                  isPlayingAudio ? "animate-bounce ring-4 ring-amber-400 rounded-full" : ""
                }`}
                title="Listen to audio"
              >
                <img
                  src="/images/phonologicalAwareness/Improvement/speaker.png"
                  alt="Speaker"
                  className="w-full h-full object-contain drop-shadow"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </button>
            )}
          </div>

          {/* 🥁 INTERACTIVE BONGO DRUM TAPPER & SYLLABLE COUNTER */}
          <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center my-2 p-4 bg-gradient-to-b from-white to-emerald-50 rounded-[2rem] border-3 border-emerald-300 shadow-inner relative">
            <button
              onClick={handleDrumTap}
              className="group relative bg-gradient-to-b from-[#D97706] to-[#B45309] border-4 border-[#78350F] rounded-full w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex flex-col items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl transform group-hover:rotate-12 transition-transform">
                🥁
              </span>
              <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider mt-1">
                {isSinhala ? "තට්ටු කරන්න" : "Tap Beat"}
              </span>
            </button>

            {/* Tap Counter Badge & Reset Button */}
            <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-2 bg-emerald-100 border-2 border-emerald-400 px-4 py-1.5 rounded-full text-emerald-900 font-extrabold text-xs sm:text-sm shadow">
                <span>🎵</span>
                <span>
                  {isSinhala
                    ? `තට්ටු කළ වාර ගණන: ${drumTapCount}`
                    : `Beats Counted: ${drumTapCount}`}
                </span>
              </div>

              <button
                onClick={() => {
                  playBtnSound();
                  setDrumTapCount(0);
                }}
                disabled={drumTapCount === 0}
                className={`font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all ${
                  drumTapCount === 0
                    ? "bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed opacity-50"
                    : "bg-rose-500 hover:bg-rose-600 border-2 border-rose-700 text-white cursor-pointer hover:scale-105 active:scale-95"
                }`}
                title={isSinhala ? "නැවත 0 කරන්න" : "Reset counter to 0"}
              >
                <span className={drumTapCount > 0 ? "animate-spin-once" : ""}>🔄</span>
                <span>{isSinhala ? "නැවත 0 කරන්න" : "Reset"}</span>
              </button>
            </div>
          </div>

          {/* 🍃 NUMBERED LILY PAD OPTION CARDS */}
          <div className="w-full max-w-2xl grid grid-cols-3 gap-3 md:gap-6 mt-2 shrink-0">
            {currentQuestion.options?.map((opt, i) => {
              const theme = lilyPadColors[i % lilyPadColors.length];
              const isSelected = selectedIdx === i;

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(opt, i)}
                  className={`group relative ${theme.bg} border-4 ${
                    isSelected
                      ? isCorrect
                        ? "border-[#22C55E] ring-6 ring-[#22C55E]/40 scale-105 shadow-2xl"
                        : "border-[#EF4444] ring-6 ring-[#EF4444]/40 scale-105 shadow-2xl"
                      : theme.border
                  } rounded-[2rem] p-3 sm:p-4 flex flex-col items-center justify-center shadow-xl transform transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 cursor-pointer min-h-[90px] sm:min-h-[110px] md:min-h-[120px]`}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg drop-shadow">
                    🌿
                  </span>

                  <div className="flex-1 flex items-center justify-center w-full my-1">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      {renderMirroredText(opt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 💡 RIGHT COLUMN: Tip Wooden Hanging Sign */}
        <div className="hidden md:flex flex-col items-center relative w-1/5 max-w-[200px] shrink-0">
          <div className="relative bg-gradient-to-b from-[#FFF2D6] to-[#FFE3A8] border-4 border-[#C98B2B] rounded-3xl p-4 shadow-xl text-center flex flex-col items-center w-full">
            <div className="absolute -top-5 left-6 w-1.5 h-6 bg-[#A16207]" />
            <div className="absolute -top-5 right-6 w-1.5 h-6 bg-[#A16207]" />
            <span className="absolute -top-6 right-2 text-lg">🥁</span>

            <div className="flex items-center gap-1 text-[#B45309] font-black text-base md:text-lg mb-2 uppercase tracking-wide">
              <span>💡</span> {isSinhala ? "උපදෙස" : "TIP"}
            </div>

            <p className="text-[#78350F] font-extrabold text-xs md:text-sm leading-snug">
              {currentQuestion.tip && /[\u0D80-\u0DFF]/.test(currentQuestion.tip)
                ? currentQuestion.tip
                : isSinhala
                ? "වචනයේ කොටස්/ශබ්ද ගණන ගණන් කර නිවැරදි අංකය තෝරන්න!"
                : currentQuestion.tip || "Tap the drum or count out loud to find the right number!"}
            </p>
          </div>
        </div>
      </main>

      {/* 🌟 BOTTOM STATUS & NAVIGATION BAR */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between gap-3 mt-2 shrink-0">
        {/* Previous Button (HIDDEN per request) */}
        <div className="w-12 h-12 md:w-14 md:h-14 opacity-0 pointer-events-none shrink-0" />

        {/* Center Feedback Banner (Replaces "Click an answer..." section) */}
        <div className="flex-1 max-w-2xl mx-auto flex items-center justify-center">
          {selectedOpt && (
            <div
              className={`w-full py-2 px-5 sm:px-6 rounded-2xl border-3 shadow-md flex items-center justify-between gap-2 sm:gap-3 animate-fadeIn ${
                isCorrect
                  ? "bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-500 text-emerald-900"
                  : "bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50 border-rose-500 text-rose-900"
              }`}
            >
              {isCorrect ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">🎯</span>
                    <span className="font-black text-sm sm:text-base md:text-lg">
                      {isSinhala ? "හරිම විශිෂ්ටයි! නිවැරදි පිළිතුරයි!" : "Awesome Job! Correct Answer!"}
                    </span>
                  </div>
                  {/* 3 ANIMATED GOLD STARS ⭐ ⭐ ⭐ */}
                  <div className="flex items-center gap-1 text-2xl sm:text-3xl">
                    <span className="animate-bounce">⭐</span>
                    <span className="animate-bounce [animation-delay:0.15s]">⭐</span>
                    <span className="animate-bounce [animation-delay:0.3s]">⭐</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">❌</span>
                    <span className="font-black text-sm sm:text-base md:text-lg">
                      {isSinhala ? "වැරදි පිළිතුරයි. ඊළඟ ප්‍රශ්නයට යන්න!" : "Oops! Wrong Answer. Keep going!"}
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl animate-pulse">💡</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Next Question Button (Right Side) */}
        <button
          onClick={handleNextQuestionClick}
          disabled={!selectedOpt}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full text-white flex items-center justify-center text-2xl font-black shadow-lg transition-all border-b-4 shrink-0 ${
            !selectedOpt
              ? "bg-gray-400 border-gray-600 opacity-40 cursor-not-allowed pointer-events-none"
              : "bg-[#16A34A] hover:bg-[#15803D] border-[#14532D] active:translate-y-1 active:border-b-0 cursor-pointer animate-bounce ring-4 ring-emerald-300"
          }`}
          title={isLastQuestion ? "Finish Activity" : "Next Question"}
        >
          {isLastQuestion ? "✓" : "→"}
        </button>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
