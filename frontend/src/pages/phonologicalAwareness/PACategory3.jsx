import React, { useState, useEffect, useRef } from "react";
import { renderMirroredText, getCleanText } from "../../utils/phonologicalAwareness/text.util";

/**
 * PACategory3 Component
 * UI component for Subcategory 3 (Orthographic Skills) across all levels.
 * Theme: Jungle Puzzle Builder with Drag & Drop Letter Tile Snapping.
 *
 * Sound Effects & Feedback:
 * - Web Audio API button click sound effects.
 * - 3 Gold Stars ⭐⭐⭐ + Victory Fanfare on correct answer.
 * - Inline feedback card in bottom bar (No popup modal, hidden previous button, next arrow on right).
 */
export default function PACategory3({
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
  subCategoryTitle = "Orthographic Skills",
  savedAnswer = null,
}) {
  const [selectedOpt, setSelectedOpt] = useState(savedAnswer || null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [prevQId, setPrevQId] = useState(currentQuestion?.id);
  const [draggedOption, setDraggedOption] = useState(null);
  const [isOverSlot, setIsOverSlot] = useState(false);
  const [snappedTile, setSnappedTile] = useState(savedAnswer || null);

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
    setSnappedTile(initialOpt);
    const initialIdx = initialOpt && currentQuestion?.options ? currentQuestion.options.indexOf(initialOpt) : null;
    setSelectedIdx(initialIdx !== -1 ? initialIdx : null);
    setIsCorrect(initialOpt ? checkIsCorrect(initialOpt) : false);
    setDraggedOption(null);
    setIsOverSlot(false);
  }

  useEffect(() => {
    const initialOpt = savedAnswer || null;
    setSelectedOpt(initialOpt);
    setSnappedTile(initialOpt);
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

  // Image source resolution
  const displayImage =
    currentQuestion.targetImage ||
    currentQuestion.imageUrl ||
    currentQuestion.image ||
    currentQuestion.targetImg ||
    null;

  const instructionText =
    currentQuestion.instruction || "Look at the picture and fill in the missing letter!";

  // Format instruction text to highlight quotes or target words with underscores
  const renderFormattedInstruction = (text) => {
    if (!text) return "";
    const parts = text.split(/('[^']+'|"[^"]+"|[^\s:]*_{2,}[^\s:]*)/g);
    return parts.map((part, idx) => {
      if (
        (part.startsWith("'") && part.endsWith("'")) ||
        (part.startsWith('"') && part.endsWith('"')) ||
        part.includes("_")
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

  // Extract word template with slot
  const getWordParts = (text) => {
    if (!text) return { prefix: "", suffix: "", raw: "" };

    // 1. Try matching inside quotes e.g. '___ed' or "___ed"
    let match = text.match(/['"]([^'"]+)['"]/);
    let wordStr = match ? match[1] : "";

    // 2. If no quotes, search for any token containing 2 or more underscores
    if (!wordStr) {
      match = text.match(/([^\s:]*_{2,}[^\s:]*)/);
      wordStr = match ? match[1] : "";
    }

    if (wordStr.includes("_")) {
      const parts = wordStr.split(/_+/);
      return { prefix: parts[0] || "", suffix: parts[1] || "", raw: wordStr };
    }

    return { prefix: "", suffix: "", raw: wordStr };
  };

  const wordParts = getWordParts(instructionText);

  // Apply Option Selection & Play Result Sound
  const selectTileOption = (opt, index) => {
    playBtnSound();
    setSelectedOpt(opt);
    setSnappedTile(opt);
    setSelectedIdx(index);
    const correct = checkIsCorrect(opt);
    setIsCorrect(correct);
    playResultSound(correct);
  };

  // Drag Start
  const handleDragStart = (e, opt) => {
    setDraggedOption(opt);
    e.dataTransfer.setData("text/plain", opt);
  };

  // Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOverSlot(true);
  };

  // Drag Leave
  const handleDragLeave = () => {
    setIsOverSlot(false);
  };

  // Drop onto slot
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOverSlot(false);
    const opt = e.dataTransfer.getData("text/plain") || draggedOption;
    if (opt && currentQuestion.options) {
      const index = currentQuestion.options.indexOf(opt);
      selectTileOption(opt, index !== -1 ? index : 0);
    }
  };

  // Tap to Snap & Select
  const handleTileClick = (opt, index) => {
    selectTileOption(opt, index);
  };

  // Handle Next Question Navigation Click
  const handleNextQuestionClick = () => {
    if (selectedOpt) {
      playBtnSound();
      onOptionSelect(selectedOpt);
    }
  };

  // Option Tile Colors
  const puzzleColors = [
    { bg: "bg-[#FF7A8A]", border: "border-[#E04355]", text: "text-white", accent: "bg-red-600" },
    { bg: "bg-[#FFC038]", border: "border-[#D99614]", text: "text-white", accent: "bg-amber-600" },
    { bg: "bg-[#4A90E2]", border: "border-[#2A66B0]", text: "text-white", accent: "bg-blue-600" },
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

      {/* 🌟 TOP HEADER ROW */}
      <header className="relative z-10 w-full flex items-center justify-between gap-2 md:gap-4 shrink-0">
        {/* Left: Home Button & Wooden Sign */}
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
            <span className="absolute -top-3 -right-2 text-xl">🧩</span>
            <span className="text-[#4A2403] font-black text-xs md:text-sm uppercase tracking-wider leading-none">
              {isSinhala ? `මට්ටම ${levelNumber}` : `LEVEL ${levelNumber}`}
            </span>
            <span className="text-[#331801] font-extrabold text-sm md:text-base leading-tight">
              {subCategoryTitle}
            </span>
          </div>
        </div>

        {/* Center: Vine Progress Path (Centered directly in middle of screen) */}
        <div className="hidden sm:flex items-center justify-center bg-emerald-900/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-emerald-400/40 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0 shadow-inner">
          <div className="absolute top-1/2 left-4 right-4 h-2 bg-[#704824] -translate-y-1/2 rounded-full -z-10 border border-[#422912]" />
          <div className="flex items-center gap-3 md:gap-5">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={i} className="relative flex items-center justify-center">
                  <div
                    className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-base md:text-lg border-2 md:border-3 transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#52C41A] border-[#2B7A0B] text-white shadow-md scale-95"
                        : isCurrent
                        ? "bg-[#22C55E] border-[#15803D] text-white shadow-lg ring-4 ring-emerald-400/50 scale-110"
                        : "bg-[#5A3818] border-[#3B220C] text-[#C29B75]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {isCurrent && (
                    <span className="absolute -bottom-4 text-xs animate-bounce">🧩</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sound Toggle Button */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => {
              playBtnSound();
              onToggleSound();
            }}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-b-4 active:translate-y-1 active:border-b-0 transition-all cursor-pointer ${
              soundEnabled
                ? "bg-[#8B4513] border-[#5C2E0B] hover:bg-[#72380F] text-white"
                : "bg-gray-500 border-gray-700 text-gray-200"
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
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

        {/* 📋 CENTER COLUMN: Drag & Drop Word Builder Board */}
        <div
          className="flex-1 flex flex-col items-center justify-between bg-center bg-no-repeat rounded-[2.5rem] md:rounded-[3rem] px-6 sm:px-14 md:px-20 pt-4 sm:pt-6 md:pt-8 pb-7 sm:pb-9 md:pb-12 relative h-full max-h-[85vh] overflow-hidden"
          style={{
            backgroundImage: "url('/images/phonologicalAwareness/Improvement/question_bg.png')",
            backgroundSize: "100% 100%",
          }}
        >
          {/* TOP WOODEN INSTRUCTION BANNER WITH q_bg.png */}
          <div
            className="w-full max-w-md sm:max-w-lg md:max-w-xl text-center drop-shadow-md mt-0 mb-0.5 flex items-center justify-center relative h-[72px] sm:h-[84px] md:h-[96px] shrink-0 z-10"
            style={{
              backgroundImage: "url('/images/phonologicalAwareness/Improvement/q_bg.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Centered Question Text */}
            <div className="w-full max-w-[80%] px-6 sm:px-10 flex items-center justify-center h-full my-auto overflow-hidden text-center">
              <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-[#3B1F04] leading-tight sm:leading-snug text-center drop-shadow-sm px-1 py-1">
                {renderFormattedInstruction(instructionText)}
              </h2>
            </div>

            {/* Speaker Icon */}
            {speakText && (
              <button
                onClick={() => {
                  playBtnSound();
                  speakText(instructionText);
                }}
                className={`absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full active:scale-95 transition-all cursor-pointer border-0 p-0 bg-transparent flex items-center justify-center shrink-0 ${
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

          {/* Image Display Area */}
          {displayImage && (
            <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] flex items-center justify-center py-0.5 shrink-0 my-0.5">
              <div className="absolute inset-0 bg-white/95 rounded-[1.5rem] border-3 sm:border-4 border-amber-400 shadow-lg -z-0" />
              <img
                src={displayImage}
                alt="Target Object"
                className="relative z-10 max-h-[80px] sm:max-h-[100px] md:max-h-[120px] w-auto object-contain drop-shadow-md transition-all transform hover:scale-105 p-2"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* 🎯 WORD RAIL WITH GLOWING DROP SLOT [ ❓ ] */}
          <div className="w-full max-w-lg sm:max-w-xl bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 rounded-2xl py-1.5 px-3 sm:px-4 my-1 flex flex-col items-center justify-center shadow-inner shrink-0">
            <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[#6D28D9] mb-1 uppercase tracking-wide">
              {isSinhala ? "අකුර ඇදගෙන එන්න හෝ තෝරන්න:" : "Drag tile or tap to fill the missing slot:"}
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              {/* Prefix Block */}
              {wordParts.prefix && (
                <div className="bg-amber-100 border-2 sm:border-3 border-amber-400 text-amber-900 font-black text-xl sm:text-2xl md:text-3xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl shadow-md leading-normal whitespace-nowrap">
                  {wordParts.prefix}
                </div>
              )}

              {/* 🎯 Drop Slot Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-16 h-11 sm:w-22 sm:h-13 md:w-26 md:h-15 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-dashed flex items-center justify-center transition-all duration-200 ${
                  isOverSlot
                    ? "bg-emerald-200 border-emerald-500 scale-110 shadow-lg ring-4 ring-emerald-400"
                    : snappedTile
                    ? "bg-amber-300 border-amber-500 scale-105 ring-4 ring-amber-400"
                    : "bg-white border-[#F97316]"
                }`}
              >
                {snappedTile ? (
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-950 leading-normal py-0.5 whitespace-nowrap">
                    {snappedTile.replace("MIRROR:", "")}
                  </span>
                ) : (
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#F97316]/70">
                    ❓
                  </span>
                )}
              </div>

              {/* Suffix Block */}
              {wordParts.suffix && (
                <div className="bg-amber-100 border-2 sm:border-3 border-amber-400 text-amber-900 font-black text-xl sm:text-2xl md:text-3xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl shadow-md leading-normal whitespace-nowrap">
                  {wordParts.suffix}
                </div>
              )}
            </div>
          </div>

          {/* 🧩 DRAGGABLE OPTION TILES */}
          <div className="w-full max-w-lg sm:max-w-xl grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 mt-1 mb-1 shrink-0">
            {currentQuestion.options?.map((opt, i) => {
              const theme = puzzleColors[i % puzzleColors.length];
              const cleanText = getCleanText(opt);
              const isSelected = selectedIdx === i;

              return (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => handleDragStart(e, opt)}
                  onClick={() => handleTileClick(opt, i)}
                  className={`group relative ${theme.bg} border-3 sm:border-4 ${
                    isSelected
                      ? isCorrect
                        ? "border-[#22C55E] ring-6 ring-[#22C55E]/40 scale-105 shadow-2xl"
                        : "border-[#EF4444] ring-6 ring-[#EF4444]/40 scale-105 shadow-2xl"
                      : theme.border
                  } rounded-2xl md:rounded-3xl p-2 sm:p-3 flex flex-col items-center justify-between shadow-lg transform transition-all duration-200 hover:-translate-y-1 hover:brightness-105 active:scale-95 cursor-grab active:cursor-grabbing min-h-[75px] sm:min-h-[88px] md:min-h-[98px]`}
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs sm:text-sm drop-shadow">
                    🧩
                  </div>

                  <div className="flex-1 flex items-center justify-center w-full my-0.5">
                    <span
                      className={`text-xl sm:text-2xl md:text-3xl font-black ${theme.text} drop-shadow-md leading-normal py-0.5 whitespace-nowrap`}
                    >
                      {renderMirroredText(opt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 💡 RIGHT COLUMN: Tip Wooden Hanging Sign */}
        <div className="hidden md:flex flex-col items-center relative w-1/5 max-w-[200px] shrink-0">
          <div className="relative bg-gradient-to-b from-[#FFF2D6] to-[#FFE3A8] border-4 border-[#C98B2B] rounded-3xl p-4 shadow-xl text-center flex flex-col items-center w-full">
            <div className="absolute -top-5 left-6 w-1.5 h-6 bg-[#A16207]" />
            <div className="absolute -top-5 right-6 w-1.5 h-6 bg-[#A16207]" />
            <span className="absolute -top-6 right-2 text-lg">🧩</span>

            <div className="flex items-center gap-1 text-[#B45309] font-black text-base md:text-lg mb-2 uppercase tracking-wide">
              <span>💡</span> {isSinhala ? "උපදෙස" : "TIP"}
            </div>

            <p className="text-[#78350F] font-extrabold text-xs md:text-sm leading-snug">
              {currentQuestion.tip && /[\u0D80-\u0DFF]/.test(currentQuestion.tip)
                ? currentQuestion.tip
                : isSinhala
                ? "අකුරු එකතු කර නිවැරදි වචනය සාදන්න!"
                : currentQuestion.tip || "Drag the letter tile into the glowing slot to finish the word!"}
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
