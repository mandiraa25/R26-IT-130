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
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] sm:rounded-[2.2rem] border-3 sm:border-4 border-[#6e3c1b] bg-[#fffdf7]/95 px-4 py-2.5 sm:py-3 text-[#2e1910] shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm md:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border-3 border-[#6b4122] bg-[#a86532] hover:bg-[#8f5224] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span aria-hidden="true">&larr;</span>
        <span>{backLabel}</span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#8c6b4f]">
          🦁 Leo's Sound Safari
        </p>
        <h1 className="truncate text-base sm:text-xl md:text-2xl font-black text-[#2e1910] leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-amber-900 shadow-sm">
          <span>{theme?.collectibleIcon || "⭐"}</span>
          <span>{totalStars}</span>
        </span>
        <span className="inline-flex items-center rounded-full border-2 border-[#e6d6c2] bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-[#5c4033] shadow-sm">
          Level {Math.min(currentLevel, totalLevels)} of {totalLevels}
        </span>
      </div>
    </header>
  );
}

export default LeoGameHud;
