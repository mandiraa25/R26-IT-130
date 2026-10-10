import { useTranslation } from "react-i18next";
import { LeoLionImage, LEO_TRAINING_MAP_GRADIENT } from "./LeoAssetFallback";
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
      className="relative min-h-[640px] overflow-hidden rounded-[2.5rem] border-4 border-[#6e3c1b] bg-[#fffdf7] text-slate-900 shadow-2xl sm:rounded-[3rem]"
      style={{
        backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

      <div className="relative z-10 flex min-h-[640px] flex-col p-4 sm:p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border-3 border-[#6b4122] bg-[#a86532] px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#8f5224] focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            {resolvedBackLabel}
          </button>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="rounded-[1.35rem] border-3 border-[#6e3c1b] bg-[#fffdf7] px-4 py-2 text-sm font-black text-[#2e1910] shadow-xl">
              {t("start_overlay_level_progress", { completed: completedLevels, total: totalLevels })}
            </span>
            <span className="flex items-center gap-1.5 rounded-[1.35rem] border-3 border-[#6e3c1b] bg-[#fffdf7] px-4 py-2 text-sm font-black text-amber-500 shadow-xl">
              <span>★</span>
              <span>{totalStars}</span>
              <span className="text-[#2e1910]">{resolvedCollectibleLabel}</span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-3 w-full max-w-4xl text-center">
          <div className="relative mx-auto rounded-[2rem] border-4 border-[#6b4122] bg-[#a86532] px-6 py-4 shadow-2xl ring-4 ring-amber-200/50">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-100">
              {t("leo_sound_safari_title")}
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-white drop-shadow-[0_3px_0_rgba(69,26,3,0.65)] sm:text-4xl lg:text-5xl">
              {resolvedTitle}
            </h1>
          </div>

          <div className="mx-auto mt-4 max-w-2xl rounded-[1.6rem] border-3 border-[#6e3c1b] bg-[#fffdf7] px-5 py-3 text-sm font-black leading-6 text-[#2e1910] shadow-xl sm:text-base">
            {subtitle || t("follow_sound_path")}
          </div>
        </div>

        <div className="mt-4 grid flex-1 items-center gap-4 lg:grid-cols-[240px_1fr_250px]">
          <aside className="order-3 flex flex-col items-center lg:order-1 lg:items-start">
            <div className="relative">
              <LeoLionImage className="h-40 w-40 filter drop-shadow-xl sm:h-52 sm:w-52 lg:h-56 lg:w-56" />
              <div className="absolute -right-5 top-12 max-w-[150px] rounded-[1.4rem] border-3 border-[#6e3c1b] bg-[#fffdf7] px-4 py-3 text-center text-sm font-black leading-5 text-[#2e1910] shadow-xl">
                {resolvedGuideMessage}
              </div>
            </div>
          </aside>

          <aside className="order-1 flex flex-col items-center gap-4 lg:order-3 lg:items-stretch">
            <button
              type="button"
              onClick={onStart}
              disabled={startDisabled}
              className="w-full max-w-[280px] rounded-[2rem] border-4 border-[#6b4122] bg-gradient-to-b from-[#a86532] to-[#8f5224] px-8 py-5 text-xl font-black text-white shadow-2xl transition hover:-translate-y-1 hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-60"
            >
              {resolvedStartLabel}
            </button>

            <div className="w-full max-w-[260px] rounded-[1.75rem] border-3 border-[#6e3c1b] bg-[#fffdf7] p-4 text-center text-[#2e1910] shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#786154]">
                {t("collected_label")}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-4xl font-black text-amber-500">
                <span>★</span>
                <span>{totalStars}</span>
              </p>
              <p className="text-sm font-black text-[#2e1910]">{resolvedCollectibleLabel}</p>
            </div>

            <p className="max-w-[260px] rounded-[1.35rem] border border-[#ecdac2] bg-[#fbf7ed] px-4 py-3 text-center text-xs font-bold leading-5 text-[#786154] shadow-md">
              {t("start_game_ready_hint")}
            </p>
          </aside>

          <div className="order-2 lg:order-2">
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
        </div>
      </div>
    </section>
  );
}

export default LeoGameStartOverlay;
