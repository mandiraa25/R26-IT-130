import React from "react";

// Word Card Component for Words Subcategory (Game 2 - Card Pack Theme)
export const WordCard = ({ item, size = "md", isFlipped = true, isTappable = false, onClick, onDragStart, className = "", frontImageSrc, backImageSrc }) => {
  const dims =
    size === "lg"
      ? "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40"
      : size === "sm"
      ? "w-16 h-16 sm:w-20 sm:h-20"
      : "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32";

  const fontSize =
    size === "lg"
      ? "text-4xl sm:text-5xl md:text-6xl"
      : size === "sm"
      ? "text-xl md:text-2xl"
      : "text-3xl sm:text-4xl md:text-5xl";

  const imageSrc = typeof item === "object" ? item?.image : item;
  const imageAlt = typeof item === "object" ? item?.alt || item?.id || "Picture card" : "Picture card";
  const displayValue = typeof item === "object" ? item?.alt || item?.id : item;
  const spriteIndex = typeof item === "object" ? item?.spriteIndex : null;
  const isImagePath = typeof imageSrc === "string" && (imageSrc.startsWith("/") || imageSrc.startsWith("http"));

  return (
    <div
      data-item-id={typeof item === "object" ? item?.id : String(item ?? "")}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Select ${typeof item === "object" ? item.alt || item.id : item}` : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(event); }
      } : undefined}
      onClick={onClick}
      draggable={isTappable || !!onDragStart}
      onDragStart={onDragStart}
      className={`relative ${dims} select-none [perspective:1000px] ${className} ${
        isTappable || onDragStart ? "hover:scale-105 active:scale-95 transition-transform cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div
        className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(0deg)]" : "[transform:rotateY(180deg)]"
        }`}
      >
        {/* CARD FRONT */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-2 [backface-visibility:hidden] ${frontImageSrc ? "bg-transparent border-0 shadow-none rounded-none" : "bg-[#FFF9EE] border-3 border-[#E5C384] rounded-2xl md:rounded-3xl shadow-lg"}`}>
          {frontImageSrc && (
            <img
              src={frontImageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          {/* Inner Dashed Stitch Line */}
          {!frontImageSrc && <div className="absolute inset-1.5 border-2 border-dashed border-[#E8CB92] rounded-xl md:rounded-2xl pointer-events-none" />}

          {/* Carrot Top Clip */}
          {!frontImageSrc && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base md:text-lg drop-shadow pointer-events-none z-20">🥕</span>}

          {/* Card Content */}
          {isImagePath && Number.isInteger(spriteIndex) ? (
            <span
              role="img"
              aria-label={imageAlt}
              className="word-card-picture relative z-10 block shrink-0 w-[78%] h-[78%] bg-no-repeat pointer-events-none"
              style={{
                backgroundImage: `url('${imageSrc}')`,
                backgroundSize: "600% 600%",
                backgroundPosition: `${(spriteIndex % 6) * 20}% ${Math.floor(spriteIndex / 6) * 20}%`,
              }}
            />
          ) : isImagePath ? (
            <>
              <img
                src={imageSrc}
                alt={imageAlt}
                className="word-card-picture relative z-10 max-w-[75%] max-h-[75%] object-contain pointer-events-none"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <span className="hidden relative z-10 max-w-[82%] text-center text-sm sm:text-base md:text-lg leading-tight font-black text-amber-950 break-words pointer-events-none">
                {imageAlt}
              </span>
            </>
          ) : (
            <span className={`relative z-10 ${fontSize} drop-shadow pointer-events-none`}>{displayValue}</span>
          )}
        </div>

        {/* CARD BACK */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] ${backImageSrc ? "bg-transparent border-0 shadow-none rounded-none" : "bg-gradient-to-b from-[#FF9142] via-[#F07B2D] to-[#E06F1F] border-3 border-[#E5C384] rounded-2xl md:rounded-3xl shadow-lg"}`}>
          {backImageSrc && (
            <img
              src={backImageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          {/* Inner Dashed Stitch Line */}
          {!backImageSrc && <div className="absolute inset-1.5 border-2 border-dashed border-[#FFC896] rounded-xl md:rounded-2xl pointer-events-none" />}

          {/* Carrot Top Clip */}
          {!backImageSrc && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base md:text-lg drop-shadow pointer-events-none z-20">🥕</span>}

          {/* Card Back Graphic */}
          {!backImageSrc && <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl md:text-3xl shadow-inner pointer-events-none">🥕</div>}
        </div>
      </div>
    </div>
  );
};

// Ghost Card Slot for Words Subcategory
export const WordGhostSlot = ({ size = "md", index = null, onClick, onDragOver, onDrop, className = "" }) => {
  const dims =
    size === "lg"
      ? "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40"
      : size === "sm"
      ? "w-16 h-16 sm:w-20 sm:h-20"
      : "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32";

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`wm-picture-slot relative ${dims} rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 select-none ${className}`}
    >
      {index !== null && <span className="font-black text-2xl md:text-3xl select-none pointer-events-none">?</span>}
    </div>
  );
};

// Card Deck Stack Component for Words Subcategory (Bottom Right Pack)
export const CardDeckStack = ({ remainingCount, topItem, isRevealed, onDeckClick, onDragStart, className = "", frontImageSrc, backImageSrc }) => {
  return (
    <div
      onClick={onDeckClick}
      draggable={isRevealed}
      onDragStart={onDragStart}
      className={`relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none ${className}`}
      title="Tap to draw a card!"
    >
      {remainingCount > 0 || isRevealed ? (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
          {/* Stacked Shadow Card 3 */}
          {remainingCount > 2 && (
            <div className="absolute inset-0 bg-[#C05000] border-2 border-[#E5C384] rounded-2xl md:rounded-3xl translate-x-2.5 translate-y-2.5 opacity-60 shadow pointer-events-none" />
          )}

          {/* Stacked Shadow Card 2 */}
          {remainingCount > 1 && (
            <div className="absolute inset-0 bg-[#E06010] border-2 border-[#E5C384] rounded-2xl md:rounded-3xl translate-x-1.5 translate-y-1.5 opacity-80 shadow pointer-events-none" />
          )}

          {/* Top Card */}
          <WordCard item={topItem} size="md" isFlipped={isRevealed} isTappable frontImageSrc={frontImageSrc} backImageSrc={backImageSrc} className={isRevealed ? "ring-4 ring-amber-400 shadow-2xl animate-pulse" : ""} />

          {/* Stack Counter Badge */}
          <div className="absolute -top-2 -right-2 z-30 bg-purple-600 text-white font-black text-xs sm:text-sm w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg pointer-events-none">
            {remainingCount}
          </div>
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 border-dashed border-white/50 rounded-2xl md:rounded-3xl flex items-center justify-center text-white/70 font-bold text-xs bg-white/10 pointer-events-none">
          Empty
        </div>
      )}
    </div>
  );
};
