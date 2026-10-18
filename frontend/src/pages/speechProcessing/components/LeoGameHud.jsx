function LeoGameHud({
  title,
  onBack,
  backLabel = "Back to Safari",
  currentLevel = 1,
  totalLevels = 1,
  totalStars = 0,
  theme,
}) {
  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] sm:rounded-[2.4rem] border-3 sm:border-4 border-[#4d2407] bg-gradient-to-b from-[#7a421a] via-[#603110] to-[#4a2208] px-4 py-3 sm:px-6 sm:py-3.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {/* Decorative leaf cluster top-left */}
      <div className="pointer-events-none absolute -top-2.5 -left-2 text-2xl select-none" aria-hidden="true">
        🌿
      </div>
      {/* Decorative leaf cluster top-right */}
      <div className="pointer-events-none absolute -top-2.5 -right-2 text-2xl select-none" aria-hidden="true">
        🍃
      </div>

      {/* Left Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border-2 sm:border-3 border-[#f7e0aa] bg-gradient-to-b from-[#2b7a3e] to-[#1c562a] hover:from-[#348e49] hover:to-[#226732] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span aria-hidden="true" className="text-base">&larr;</span>
        <span className="tracking-wide">{backLabel}</span>
      </button>

      {/* Center Carved Wooden Signboard */}
      <div className="min-w-0 flex-1 px-2 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-black/30 px-3 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-200 shadow-inner">
          <span aria-hidden="true">🦁</span>
          <span>Leo's Sound Safari</span>
        </div>
        <h1 className="mt-0.5 truncate text-lg sm:text-2xl md:text-3xl font-black text-[#fffcf2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Stats Pills */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-amber-950 shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
          <span className="text-sm sm:text-base">{theme?.collectibleIcon || "★"}</span>
          <span>{totalStars}</span>
        </span>
        <span className="inline-flex items-center rounded-full border-2 border-[#8a522a] bg-[#fffaf0] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-[#4d2407] shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
          Level {Math.min(currentLevel, totalLevels)} of {totalLevels}
        </span>
      </div>
    </header>
  );
}

export default LeoGameHud;
