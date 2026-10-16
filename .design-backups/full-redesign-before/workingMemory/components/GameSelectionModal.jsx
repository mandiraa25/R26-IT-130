import React from "react";

const ASSET_ROOT = "/images/workingMemory/improve/gameselection";

const GAMES = [
  { key: "pattern", image: `${ASSET_ROOT}/pattern.png`, labelKey: "subcat_pattern" },
  { key: "words", image: `${ASSET_ROOT}/picture-memory.png`, labelKey: "game_picture_memory" },
  { key: "instructions", image: `${ASSET_ROOT}/instructions.png`, labelKey: "subcat_instructions" },
  { key: "numbers", image: `${ASSET_ROOT}/numbers.png`, labelKey: "subcat_numbers" },
];

export default function GameSelectionModal({
  levelNumber,
  subCategoriesProgress,
  onSelectGame,
  onLockedSelect,
  onClose,
  soundEnabled,
  onToggleSound,
  t,
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black/60 p-2 backdrop-blur-sm animate-fadeIn sm:p-3"
      onClick={onClose}
    >
      <section
        aria-label={`${t("common:level", { defaultValue: "Level" })} ${levelNumber}`}
        className="relative aspect-[1464/1091] max-h-[90dvh] w-[min(92vw,120.8dvh)] animate-scaleIn"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={`${ASSET_ROOT}/vine-board.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />

        <h2 className="absolute left-[35%] right-[35%] top-[5.2%] flex h-[9%] items-center justify-center whitespace-nowrap text-[clamp(.9rem,2.35vw,2rem)] font-black text-[#3f210f] drop-shadow-[0_2px_0_rgba(255,255,255,.65)]">
          {t("common:level", { defaultValue: "Level" })} {levelNumber}
        </h2>

        <h3 className="absolute left-[17%] right-[17%] top-[17.5%] text-center text-[clamp(.8rem,2.15vw,1.9rem)] font-black leading-tight text-[#45250f] drop-shadow-[0_2px_0_rgba(255,255,255,.7)]">
          {t("choose_subcategory")}
        </h3>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("common:close", { defaultValue: "Close" })}
          className="absolute right-[5.6%] top-[5.1%] z-20 grid aspect-square w-[6.4%] min-w-8 place-items-center rounded-full border-[clamp(3px,.35vw,6px)] border-[#f7cf55] bg-[#fffdf2] text-[clamp(1rem,2.5vw,2.25rem)] font-black leading-none text-orange-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          ×
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? t("common:mute_music", { defaultValue: "Mute sound" }) : t("common:play_music", { defaultValue: "Play sound" })}
          aria-pressed={soundEnabled}
          className="absolute right-[11.2%] top-[17%] z-20 grid aspect-square w-[5.6%] min-w-8 place-items-center rounded-full border-[clamp(2px,.28vw,5px)] border-[#f7cf55] bg-[#fffdf2] text-[clamp(.75rem,1.75vw,1.5rem)] shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>

        <div className="absolute bottom-[9.8%] left-[10.2%] right-[10.2%] top-[26.2%] grid grid-cols-2 grid-rows-2 gap-x-[3.4%] gap-y-[2.5%]">
          {GAMES.map((game) => {
            const isUnlocked = Boolean(subCategoriesProgress?.[game.key]);
            const activate = () => (isUnlocked ? onSelectGame(game.key) : onLockedSelect());

            return (
              <button
                type="button"
                key={game.key}
                onClick={activate}
                aria-label={`${t(game.labelKey)} — ${isUnlocked ? t("level_play") : t("locked")}`}
                className={`group relative min-h-0 min-w-0 transition-transform focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                  isUnlocked ? "hover:-translate-y-1 active:translate-y-0" : "cursor-not-allowed grayscale-[45%]"
                }`}
              >
                <img src={game.image} alt="" className="pointer-events-none h-full w-full object-contain" />
                <span className="pointer-events-none absolute bottom-[10.2%] left-[24%] right-[21%] flex h-[15%] -translate-y-[5%] items-center justify-center whitespace-nowrap text-[clamp(.58rem,1.48vw,1.28rem)] font-black leading-none text-[#3c210f]">
                  {t(game.labelKey)}
                </span>
                <span className="pointer-events-none absolute bottom-[6%] right-[1.6%] grid aspect-square w-[17.5%] place-items-center text-[clamp(.8rem,2.5vw,2.2rem)] text-white drop-shadow-[0_2px_1px_rgba(70,30,5,.55)] transition-transform group-hover:scale-110">
                  {isUnlocked ? "▶" : "🔒"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
