import React, { useState, useEffect, useRef } from "react";
import PAQuizHeaderControls from "./PAQuizHeaderControls";
import { renderMirroredText, getCleanText } from "../../utils/phonologicalAwareness/text.util";

/**
 * PACategory1 Component
 * UI component for Subcategory 1 (Phonological Awareness) matching the redesign.
 * Theme: Jungle Detective Matching Pair with Target Tag on Left & Options Column on Right.
 */
export default function PACategory1({
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
  subCategoryTitle = "Phonological Awareness",
  savedAnswer = null,
}) {
  const [selectedOpt, setSelectedOpt] = useState(savedAnswer || null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [prevQId, setPrevQId] = useState(currentQuestion?.id);
  const [lineCoords, setLineCoords] = useState([]);

  const containerRef = useRef(null);
  const targetNodeRef = useRef(null);
  const optionPinRefs = useRef([]);

  // Check correctness helper
  const checkIsCorrect = (choice) => {
    if (!choice || !currentQuestion) return false;
    const correctAns = currentQuestion.correct || currentQuestion.correctAnswer || currentQuestion.correctOption;
    if (typeof correctAns === "string") {
      return choice.trim().toLowerCase() === correctAns.trim().toLowerCase();
    }
    return choice === correctAns;
  };

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

  // Synchronously reset state when navigating between questions
  if (currentQuestion?.id !== prevQId) {
    setPrevQId(currentQuestion?.id);
    const initialOpt = savedAnswer || null;
    setSelectedOpt(initialOpt);
    const initialIdx = initialOpt && currentQuestion?.options ? currentQuestion.options.indexOf(initialOpt) : null;
    setSelectedIdx(initialIdx !== -1 ? initialIdx : null);
    setIsCorrect(initialOpt ? checkIsCorrect(initialOpt) : false);
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

  // Recalculate line coordinates between Target Tag Node and Option Tag Ring Pins
  const updateLineCoords = () => {
    if (!containerRef.current || !targetNodeRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetNodeRef.current.getBoundingClientRect();

    const startX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const startY = targetRect.top + targetRect.height / 2 - containerRect.top;

    const coords = (currentQuestion?.options || []).map((_, i) => {
      const pinEl = optionPinRefs.current[i];
      if (!pinEl) return null;
      const pinRect = pinEl.getBoundingClientRect();
      const endX = pinRect.left + pinRect.width / 2 - containerRect.left;
      const endY = pinRect.top + pinRect.height / 2 - containerRect.top;
      return { startX, startY, endX, endY };
    });

    setLineCoords(coords);
  };

  useEffect(() => {
    const anim1 = requestAnimationFrame(() => {
      const anim2 = requestAnimationFrame(() => {
        updateLineCoords();
      });
      return () => cancelAnimationFrame(anim2);
    });

    window.addEventListener("resize", updateLineCoords);
    return () => {
      cancelAnimationFrame(anim1);
      window.removeEventListener("resize", updateLineCoords);
    };
  }, [currentQuestion?.id, currentQuestion?.options, selectedIdx]);

  if (!currentQuestion) return null;

  // Extract target symbol from question instruction
  const extractTargetSymbol = () => {
    if (!currentQuestion) return "?";
    if (currentQuestion.targetSymbol) return currentQuestion.targetSymbol;
    const match = currentQuestion.instruction?.match(/['"]([^'"]+)['"]/);
    if (match && match[1]) return match[1];
    return currentQuestion.correct || currentQuestion.options?.[0] || "?";
  };

  const targetSymbol = extractTargetSymbol();
  const targetSymbolLen = typeof targetSymbol === "string" ? targetSymbol.length : 1;
  const targetFontSizeClass =
    targetSymbolLen > 10
      ? "text-base sm:text-xl md:text-2xl"
      : targetSymbolLen > 6
      ? "text-xl sm:text-3xl md:text-4xl"
      : targetSymbolLen > 3
      ? "text-2xl sm:text-4xl md:text-5xl"
      : "text-4xl sm:text-6xl md:text-7xl";

  // Instruction text & Sinhala detection
  const instructionText = currentQuestion.instruction || "Listen and choose the correct answer!";
  const isSinhala = currentQuestion.instruction && /[\u0D80-\u0DFF]/.test(currentQuestion.instruction);

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

  const handleOptionClick = (opt, index) => {
    playBtnSound();
    setSelectedOpt(opt);
    setSelectedIdx(index);
    const correct = checkIsCorrect(opt);
    setIsCorrect(correct);
    playResultSound(correct);
  };

  const handleNextQuestionClick = () => {
    if (selectedOpt) {
      playBtnSound();
      onOptionSelect(selectedOpt);
    }
  };

  const isLastQuestion = currentIdx === totalQuestions - 1;

  // Option Card Themes matching screenshot style (Blue, Green, Yellow tags)
  const optionCardThemes = [
    {
      bg: "bg-[#E0F2FE]",
      border: "border-[#38BDF8]",
      text: "text-[#0369A1]",
      ring: "border-[#0284C7]",
      flower: "🌸",
    },
    {
      bg: "bg-[#DCFCE7]",
      border: "border-[#4ADE80]",
      text: "text-[#15803D]",
      ring: "border-[#16A34A]",
      flower: "🏵️",
    },
    {
      bg: "bg-[#FEF9C3]",
      border: "border-[#FACC15]",
      text: "text-[#A16207]",
      ring: "border-[#CA8A04]",
      flower: "🪻",
    },
  ];

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
        {/* Left: Home Button & Wooden Activity Sign */}
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
            <span className="absolute -top-3 -right-2 text-xl">🍒</span>
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
            {isSinhala ? "ගැලපෙන යුගලය සම්බන්ධ කරන්න!" : "Connect the correct pair!"}
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

        {/* 📋 CENTER COLUMN: Visual Matching Parchment Container */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-center bg-no-repeat rounded-[2.5rem] md:rounded-[3rem] px-6 sm:px-12 md:px-16 pt-6 sm:pt-8 md:pt-10 pb-8 sm:pb-10 md:pb-12 relative h-full max-h-[85vh] overflow-hidden"
          style={{
            backgroundImage: "url('/images/phonologicalAwareness/Improvement/question_bg.png')",
            backgroundSize: "100% 100%",
          }}
        >
          {/* ⚡ SVG CONNECTING MATCHING LINES OVERLAY */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {lineCoords.map((coord, i) => {
              if (!coord) return null;
              const isSelected = selectedIdx === i;
              const pathD = `M ${coord.startX} ${coord.startY} Q ${(coord.startX + coord.endX) / 2} ${
                (coord.startY + coord.endY) / 2 + (i === 0 ? -25 : i === 2 ? 25 : 0)
              } ${coord.endX} ${coord.endY}`;

              return (
                <g key={i}>
                  {/* Dashed background line or solid green/red selected line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? (isCorrect ? "#22C55E" : "#EF4444") : "#A88B68"}
                    strokeWidth={isSelected ? "6" : "3"}
                    strokeDasharray={isSelected ? "none" : "7 5"}
                    strokeLinecap="round"
                    className={isSelected ? "drop-shadow-md" : "opacity-60"}
                  />
                </g>
              );
            })}
          </svg>

          {/* TOP WOODEN INSTRUCTION BANNER WITH q_bg.png */}
          <div
            className="w-full max-w-md sm:max-w-lg md:max-w-xl text-center drop-shadow-md mt-0 mb-1 flex items-center justify-center relative h-[72px] sm:h-[84px] md:h-[96px] shrink-0 z-10"
            style={{
              backgroundImage: "url('/images/phonologicalAwareness/Improvement/q_bg.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Centered Question Text */}
            <div className="w-full max-w-[80%] px-8 sm:px-12 flex items-center justify-center h-full my-auto overflow-hidden text-center">
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

          {/* INNER PLAY AREA: LEFT TARGET TAG & RIGHT OPTIONS STACK */}
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl flex items-center justify-between gap-4 sm:gap-8 my-auto shrink-0 z-10">
            {/* 🎯 LEFT SIDE: Target Symbol Anchor */}
            <div className="w-2/5 sm:w-1/3 max-w-[170px] sm:max-w-[200px] flex items-center justify-center">
              <div
                className="relative bg-gradient-to-b from-[#FEF9C3] to-[#FEF08A] border-4 border-[#EAB308] rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col items-center justify-center w-full min-h-[140px] sm:min-h-[170px] transform transition-transform hover:scale-105"
              >
                {/* Visual Processing Icon */}
                <span className="absolute -top-3 -left-2 text-xl sm:text-2xl drop-shadow">🔍</span>

                {/* Target Symbol/Word */}
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#854D0E] drop-shadow-sm tracking-wider text-center py-2">
                  {targetSymbol}
                </span>

                {/* Green Circular Anchor Node on Right Edge */}
                <div
                  ref={targetNodeRef}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E] border-3 border-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 flex items-center justify-center"
                />
              </div>
            </div>

            {/* 🏷️ RIGHT SIDE: Options Tags Stack */}
            <div className="w-3/5 sm:w-2/3 max-w-[320px] md:max-w-[360px] flex flex-col gap-2 sm:gap-3 md:gap-3.5 justify-center">
              {currentQuestion.options?.map((opt, i) => {
                const theme = optionCardThemes[i % optionCardThemes.length];
                const cleanText = getCleanText(opt);
                const isSelected = selectedIdx === i;

                const optLen = typeof cleanText === "string" ? cleanText.length : 1;
                const optFontSizeClass =
                  optLen > 11
                    ? "text-xs sm:text-sm md:text-base"
                    : optLen > 8
                    ? "text-sm sm:text-base md:text-lg"
                    : optLen > 5
                    ? "text-base sm:text-lg md:text-xl"
                    : optLen > 3
                    ? "text-lg sm:text-xl md:text-2xl"
                    : "text-xl sm:text-3xl md:text-4xl";

                return (
                  <div
                    key={i}
                    onClick={() => handleOptionClick(opt, i)}
                    className={`group relative ${theme.bg} border-4 ${
                      isSelected
                        ? isCorrect
                          ? "border-[#22C55E] ring-6 ring-[#22C55E]/40 scale-105 shadow-2xl"
                          : "border-[#EF4444] ring-6 ring-[#EF4444]/40 scale-105 shadow-2xl"
                        : theme.border
                    } rounded-2xl sm:rounded-3xl px-3 py-1.5 sm:py-2 md:py-2.5 flex items-center justify-between shadow-xl transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 cursor-pointer min-h-[48px] sm:min-h-[56px] md:min-h-[64px]`}
                  >
                    {/* Ring Pin Anchor on Left Edge */}
                    <div
                      ref={(el) => (optionPinRefs.current[i] = el)}
                      className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-3 ${theme.ring} bg-white shadow-md flex items-center justify-center z-30`}
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>

                    {/* Option Text Display */}
                    <div className="flex-1 flex items-center justify-center px-2 sm:px-3 py-1 overflow-hidden">
                      <span
                        className={`${optFontSizeClass} font-black ${theme.text} drop-shadow-sm text-center whitespace-nowrap max-w-full leading-normal`}
                      >
                        {renderMirroredText(opt)}
                      </span>
                    </div>

                    {/* Right Decorative Cherries */}
                    <span className="text-xl sm:text-2xl select-none transform group-hover:scale-110 transition-transform">
                      🍒
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 💡 RIGHT COLUMN: Tip Wooden Hanging Sign */}
        <div className="hidden md:flex flex-col items-center relative w-1/5 max-w-[200px] shrink-0">
          <div className="relative bg-gradient-to-b from-[#FFF2D6] to-[#FFE3A8] border-4 border-[#C98B2B] rounded-3xl p-4 shadow-xl text-center flex flex-col items-center w-full">
            <div className="absolute -top-5 left-6 w-1.5 h-6 bg-[#A16207]" />
            <div className="absolute -top-5 right-6 w-1.5 h-6 bg-[#A16207]" />
            <span className="absolute -top-6 right-2 text-lg">🍒</span>

            <div className="flex items-center gap-1 text-[#B45309] font-black text-base md:text-lg mb-2 uppercase tracking-wide">
              <span>💡</span> {isSinhala ? "උපදෙස" : "TIP"}
            </div>

            <p className="text-[#78350F] font-extrabold text-xs md:text-sm leading-snug">
              {currentQuestion.tip && /[\u0D80-\u0DFF]/.test(currentQuestion.tip)
                ? currentQuestion.tip
                : isSinhala
                ? "වචනයේ ශබ්දය කෙරෙහි අවධානය යොමු කර නිවැරදි පිළිතුර තෝරන්න!"
                : currentQuestion.tip || "Listen carefully to the word sounds and choose your answer!"}
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
