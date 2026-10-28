// VIVA: Illustrated level card with title, three-star rating and PLAY/Opening... or Locked action.
import { LockKeyhole, Play } from "lucide-react";

function StarIcon({ filled }) {
  return (
    <svg
      className={`h-6 w-6 sm:h-7 sm:w-7 transition-all ${
        filled
          ? "fill-[#f59e0b] text-[#f59e0b] filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]"
          : "fill-[#d6d3d1] text-[#d6d3d1]"
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LeoLevelCard({
  level,
  title,
  imageSrc,
  stars = 0,
  isUnlocked = false,
  isOpening = false,
  activity,
  onPlay,
  onLockedClick,
}) {
  const normalizedStars = Math.max(0, Math.min(3, Math.round(stars)));

  const handleCardClick = () => {
    if (isUnlocked) {
      if (onPlay) onPlay(activity);
    } else if (onLockedClick) {
      onLockedClick(level);
    }
  };

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-3xl border-4 border-white bg-[#FFFDF5] p-2.5 sm:p-3 shadow-xl transition-all duration-300 ${
        isUnlocked
          ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl ring-1 ring-amber-900/5"
          : "opacity-95 select-none"
      }`}
      onClick={handleCardClick}
      aria-label={`Level ${level}: ${title}. ${isUnlocked ? "Unlocked" : "Locked"}`}
    >
      {/* Artwork Illustration */}
      <div className="relative aspect-[9/10] w-full overflow-hidden rounded-2xl bg-amber-50/50 shadow-inner">
        <img
          src={imageSrc}
          alt={`Level ${level} - ${title}`}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            isUnlocked ? "group-hover:scale-105" : "grayscale-[10%]"
          }`}
          loading="lazy"
        />
      </div>

      {/* Title */}
      <div className="mt-3 flex min-h-[2.5rem] items-center justify-center px-1 text-center">
        <h3 className="text-base sm:text-lg font-black text-[#2e1910] tracking-tight leading-tight">
          {title}
        </h3>
      </div>

      {/* 3-Star Rating */}
      <div
        className="my-2.5 flex items-center justify-center gap-1 sm:gap-1.5"
        aria-label={`${normalizedStars} out of 3 stars`}
      >
        <StarIcon filled={normalizedStars >= 1} />
        <StarIcon filled={normalizedStars >= 2} />
        <StarIcon filled={normalizedStars >= 3} />
      </div>

      {/* Action Button */}
      <div className="mt-1">
        {isUnlocked ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlay) onPlay(activity);
            }}
            disabled={isOpening}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-[#059669] px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#047857] active:scale-95 disabled:cursor-wait disabled:opacity-75 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" aria-hidden="true" />
            <span>{isOpening ? "Opening..." : "PLAY"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onLockedClick) onLockedClick(level);
            }}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-[#78716c] px-4 py-2 text-sm font-bold tracking-wide text-white/95 shadow-sm transition hover:bg-[#68625d]"
          >
            <LockKeyhole className="h-4 w-4 text-white" aria-hidden="true" />
            <span>Locked</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default LeoLevelCard;
