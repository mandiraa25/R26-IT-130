// VIVA: Pre-game map view: navigation, stars/progress, Leo's current mission, level path, start action and optional replay section.
import { useState } from "react";
import { ArrowLeft, Gamepad2, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import LeoLevelMap from "./LeoLevelMap";

function LeoGameStartOverlay({
  title,
  subtitle,
  guideMessage,
  collectibleLabel,
  rewardLabel,
  startLabel,
  backLabel,
  onStart,
  onBack,
  prompts = [],
  completedPromptIds = [],
  totalStars = 0,
  theme,
  startDisabled = false,
}) {
  const { t } = useTranslation("sp");
  const [soundMuted, setSoundMuted] = useState(false);
  const totalLevels = prompts.length || 1;
  const completedLevels = completedPromptIds.length;
  const resolvedStartLabel = startLabel || t("start_adventure");
  const resolvedBackLabel = backLabel || t("back_to_lexiland_map");
  const resolvedTitle = title || t("training_safari_title");
  const resolvedGuideMessage = guideMessage || t("lets_find_sound_path");
  const resolvedCollectibleLabel = collectibleLabel || t("sound_gems");
  const resolvedRewardLabel = rewardLabel || t("jungle_sound_badge");

  return (
    <section
      className="relative min-h-[640px] rounded-[2.5rem] border-4 border-[#5a2e10] bg-[#fffdf7] text-slate-900 shadow-2xl sm:rounded-[3rem] p-3 sm:p-5 lg:p-6"
      style={{
        backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-[1px] rounded-[2.5rem] sm:rounded-[3rem]" />

      <div className="relative z-10 flex flex-col space-y-2.5 sm:space-y-3">
        {/* Top Navigation Bar with Hanging Wooden Sign */}
        <header className="flex items-center justify-between gap-3 pt-0.5">
          {/* Left: Back button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border-3 border-[#4a240c] bg-gradient-to-b from-[#8f5224] to-[#6e3713] px-5 py-2.5 text-sm sm:text-base font-black text-white shadow-xl transition-all hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-amber-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{resolvedBackLabel}</span>
          </button>

          {/* Center: Hanging carved wooden sign */}
          <div className="flex flex-col items-center">
            {/* Hanging Wooden Sign using clean transparent asset */}
            <div className="relative flex flex-col items-center justify-center w-[280px] sm:w-[380px] md:w-[420px] h-[95px] sm:h-[110px]">
              <img
                src="/images/speechProcessing/hanging_wooden_sign_clean.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xl"
              />
              <div className="absolute inset-x-0 top-[54%] -translate-y-1/2 px-8 sm:px-12 text-center">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] text-[#854d0e] leading-none mb-0.5">
                  {t("leo_sound_safari_title")}
                </p>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-[#15803d] tracking-tight leading-tight drop-shadow-xs truncate max-w-[200px] sm:max-w-[260px] mx-auto">
                  {resolvedTitle}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Progress & Stars */}
          <div className="flex shrink-0 items-center justify-end gap-2.5">
            <span className="rounded-full border-3 border-[#5a2e10] bg-[#fffdf7] px-4 py-2 text-sm font-black text-[#2e1910] shadow-lg">
              {t("start_overlay_level_progress", { completed: completedLevels, total: totalLevels })}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border-3 border-[#5a2e10] bg-[#fffdf7] px-4 py-2 text-sm font-black text-amber-500 shadow-lg">
              <span>★</span>
              <span>{totalStars}</span>
              <span className="text-[#2e1910]">{resolvedCollectibleLabel}</span>
            </span>
          </div>
        </header>

        {/* Subtitle Banner Pill beneath sign */}
        <div className="mx-auto w-full max-w-2xl text-center">
          <div className="inline-block rounded-full border-2 border-[#d8c0a2] bg-[#fffdf7] px-8 py-2 text-xs sm:text-sm font-black text-[#2e1910] shadow-md max-w-full truncate">
            {subtitle || resolvedGuideMessage}
          </div>
        </div>

        {/* Top Wooden Board: Jungle Level Path Banner */}
        <section className="relative w-full rounded-[26px] sm:rounded-[34px] border-[5px] border-[#5a2e10] bg-gradient-to-r from-[#fffcf5] via-[#fff8eb] to-[#fffcf5] p-2.5 sm:p-3.5 shadow-xl ring-2 ring-amber-900/15 overflow-hidden flex items-center justify-between gap-4">
          {/* Decorative Corner Foliage */}
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -left-4 -top-4 h-16 sm:h-22 w-auto pointer-events-none select-none drop-shadow-md z-20"
          />
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -right-4 -top-4 h-16 sm:h-22 w-auto pointer-events-none select-none drop-shadow-md -scale-x-100 z-20"
          />

          <div className="flex items-center gap-3 sm:gap-4 min-w-0 relative z-10 pl-4 sm:pl-6">
            <div className="relative h-15 w-15 sm:h-18 sm:w-18 shrink-0">
              <img
                src="/images/speechProcessing/scout_leo_avatar.png"
                alt="Leo"
                className="h-full w-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#8c674e]">
                {t("jungle_level_path")}
              </p>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#2e1910] tracking-tight truncate">
                {t("collect_every_activity_item", { item: resolvedCollectibleLabel })}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#786154] truncate">
                {subtitle || resolvedGuideMessage}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border-2 border-[#d8c0a2] bg-[#fbf7ed] px-5 py-2 text-xs sm:text-sm font-black text-[#2e1910] shadow-sm hidden md:inline-block relative z-10 mr-2">
            {t("start_overlay_level_progress", { completed: completedLevels, total: totalLevels })}
          </span>
        </section>

        {/* Middle Main Adventure Arena (Full Wooden Board Frame with Winding River) */}
        <div
          className="relative w-full rounded-[30px] sm:rounded-[38px] border-[7px] border-[#5a2e10] shadow-[0_16px_36px_rgba(46,25,16,0.35)] overflow-hidden ring-2 ring-amber-900/20"
          style={{
            backgroundImage: "url(/images/speechProcessing/jungle_river_map.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Decorative Corner Foliage overlapping the wooden frame */}
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -left-4 -top-4 h-18 sm:h-22 w-auto pointer-events-none select-none z-30 drop-shadow-md"
          />
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -right-4 -top-4 h-18 sm:h-22 w-auto pointer-events-none select-none z-30 drop-shadow-md -scale-x-100"
          />
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -right-4 -bottom-4 h-18 sm:h-22 w-auto pointer-events-none select-none z-30 drop-shadow-md rotate-180"
          />

          <div className="relative z-10 flex flex-col lg:flex-row min-h-[440px] sm:min-h-[470px] p-3.5 sm:p-5 justify-between gap-4">
            {/* Action Sidebar: Declared FIRST in JSX to guarantee startAction > renderStart & levelMap > startAction */}
            <aside className="order-2 lg:order-2 flex flex-col justify-between w-full lg:w-[250px] shrink-0 gap-2.5 relative z-20">
              <button
                type="button"
                onClick={onStart}
                disabled={startDisabled}
                className="w-full rounded-2xl sm:rounded-3xl border-4 border-[#4a240c] bg-gradient-to-b from-[#b45309] to-[#78350f] px-5 py-3.5 sm:py-4 text-lg sm:text-xl font-black text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-60 cursor-pointer"
              >
                {resolvedStartLabel}
              </button>

              <div className="w-full rounded-2xl sm:rounded-3xl border-3 border-[#5a2e10] bg-[#fffdf7]/95 backdrop-blur-xs p-3.5 text-center text-[#2e1910] shadow-xl ring-1 ring-amber-900/10">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#786154]">
                  {t("collected_label")}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-3xl sm:text-4xl font-black text-amber-500">
                  <span>★</span>
                  <span>{totalStars}</span>
                </p>
                <p className="text-xs sm:text-sm font-black text-[#2e1910]">{resolvedCollectibleLabel}</p>
              </div>

              <p className="rounded-2xl border-2 border-[#d8c0a2] bg-[#fbf7ed]/95 backdrop-blur-xs px-3.5 py-2.5 text-center text-[11px] sm:text-xs font-bold leading-4.5 text-[#786154] shadow-md">
                {t("start_game_ready_hint")}
              </p>
            </aside>

            {/* River Landscape Arena with Path & Level Nodes */}
            <div className="order-1 lg:order-1 flex-1 flex flex-col justify-between min-w-0 relative z-10">
              {/* Top row: Mission wooden plaque using mission_board_clean.png */}
              <div className="relative flex justify-start select-none">
                <div className="relative w-[240px] sm:w-[270px] h-[90px] sm:h-[100px] flex flex-col justify-center">
                  <img
                    src="/images/speechProcessing/mission_board_clean.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-lg"
                  />
                  <div className="relative z-10 pl-8 pr-3 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                      {t("safari_current_mission")}
                    </p>
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-sm">
                      {t("safari_leos_pick_label")}
                    </h3>
                    <p className="text-[10.5px] text-amber-100 font-semibold leading-tight line-clamp-1">
                      {t("safari_trail_waiting")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: River Level Nodes traversing the trail */}
              <div className="relative z-20 mt-4 sm:mt-6 mb-1 py-1">
                <LeoLevelMap
                  prompts={prompts}
                  currentIndex={completedLevels}
                  completedPromptIds={completedPromptIds}
                  levelStars={{}}
                  invalidPromptIds={[]}
                  theme={theme}
                  guideMessage={resolvedGuideMessage}
                  collectibleLabel={resolvedCollectibleLabel}
                  rewardLabel={resolvedRewardLabel}
                  variant="adventure"
                />
              </div>

              {/* Bottom-left: Standing Scout Leo naturally on grass + Sound toggle */}
              <div className="relative z-20 flex items-end gap-3 select-none -mb-2">
                <button
                  type="button"
                  onClick={() => setSoundMuted((m) => !m)}
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#4a240c] bg-gradient-to-b from-[#8f5224] to-[#6e3713] text-white shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                  aria-label={soundMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <img
                  src="/images/speechProcessing/scout_leo_standing.png"
                  alt="Scout Leo"
                  className="h-44 sm:h-52 md:h-56 w-auto object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wooden Board: Completed Games Replay Tray */}
        <footer className="relative w-full rounded-[28px] sm:rounded-[36px] border-[5px] border-[#5a2e10] bg-gradient-to-r from-[#fffcf5] via-[#fff8eb] to-[#fffcf5] p-3 sm:p-4 shadow-xl ring-2 ring-amber-900/15 overflow-hidden">
          {/* Corner foliage */}
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -left-4 -top-4 h-18 sm:h-22 w-auto pointer-events-none select-none drop-shadow-md z-20"
          />
          <img
            src="/images/reports/board_corner_leaves.png"
            alt=""
            className="absolute -right-4 -top-4 h-18 sm:h-22 w-auto pointer-events-none select-none drop-shadow-md -scale-x-100 z-20"
          />

          <div className="flex flex-wrap items-baseline justify-between gap-2 relative z-10">
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#15803d]">
                {t("safari_replay_eyebrow")}
              </p>
              <h3 className="text-base sm:text-lg font-black text-[#2e1910]">
                {t("safari_replay_heading")}
              </h3>
            </div>
            <p className="text-xs font-bold text-[#786154] max-w-md text-right hidden sm:block">
              {t("safari_replay_not_new_completion")}
            </p>
          </div>
          <div className="mt-2.5 rounded-2xl border-2 border-dashed border-[#d8c0a2] bg-[#fbf7ed] p-3 sm:p-3.5 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-black text-[#786154] relative z-10">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#786154]" aria-hidden="true" />
            <span>{t("safari_replay_empty")}</span>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default LeoGameStartOverlay;
