// VIVA: Prompt-level path in vertical/adventure/default layouts, marking current, completed, retry and locked steps plus final reward.
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import LeoLevelNode from "./LeoLevelNode";
import LeoRewardChest from "./LeoRewardChest";

function getNodeState({ prompt, currentIndex, index, completedPromptIds, invalidPromptIds }) {
  if (completedPromptIds.includes(prompt.promptId)) return "completed";
  if (index === currentIndex && invalidPromptIds.includes(prompt.promptId)) return "invalid_retry";
  if (index === currentIndex) return "current";
  return "locked";
}

function LeoLevelMap({
  prompts = [],
  currentIndex = 0,
  completedPromptIds = [],
  levelStars = {},
  invalidPromptIds = [],
  theme,
  guideMessage,
  collectibleLabel,
  rewardLabel,
  onNodeClick,
  compact = false,
  variant = "default",
  className = "",
}) {
  const { t } = useTranslation("sp");
  const completed = prompts.length > 0 && completedPromptIds.length >= prompts.length;
  const totalStars = Object.values(levelStars).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const adventure = variant === "adventure";

  if (variant === "vertical") {
    return (
      <aside
        className={`flex flex-col rounded-[2.2rem] border-3 sm:border-4 border-[#4d2407] bg-[#fffcf4]/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md ${className}`}
      >
        {/* Stepper header plaque */}
        <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-[#22572b] bg-gradient-to-b from-[#1b4d24] via-[#153f1d] to-[#0f2c15] px-4 py-2.5 text-center shadow-md">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
            🦁 Lexiland Safari
          </p>
          <h2 className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow">
            {t("jungle_level_path")}
          </h2>
        </div>

        {/* Vertical Stepper List */}
        <div className="relative flex-1 space-y-2.5 px-1 py-1">
          {/* Connecting vertical line */}
          <div className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-1 rounded-full bg-gradient-to-b from-emerald-500 via-amber-300 to-stone-300" />

          {prompts.map((prompt, index) => {
            const state = getNodeState({
              prompt,
              currentIndex,
              index,
              completedPromptIds,
              invalidPromptIds,
            });
            const isCurrent = state === "current";
            const isCompleted = state === "completed";
            const isRetry = state === "invalid_retry";
            const isLocked = state === "locked";
            const stars = levelStars[prompt.promptId] || 0;
            const promptLabel = prompt?.targetText || prompt?.targetSound || t("level_number", { number: index + 1 });

            return (
              <div
                key={prompt.promptId || index}
                className={`relative z-10 flex items-center gap-3 rounded-2xl p-2 transition-all ${
                  isCurrent
                    ? "border-2 border-emerald-400 bg-emerald-50/90 shadow-md ring-2 ring-emerald-300/40"
                    : isCompleted
                      ? "border border-amber-200/80 bg-white/80"
                      : "border border-transparent bg-white/40 opacity-75"
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-md transition-transform ${
                    isCompleted
                      ? "border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                      : isCurrent
                        ? "border-2 border-emerald-200 bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-400/50 scale-105"
                        : isRetry
                          ? "border-2 border-rose-300 bg-rose-500 text-white animate-pulse"
                          : "border-2 border-stone-300 bg-stone-200 text-stone-500"
                  }`}
                >
                  {isCompleted ? (
                    <span>✓</span>
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-stone-500 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`truncate text-xs sm:text-sm font-black ${isCurrent ? "text-emerald-950 font-black" : "text-[#2e1910]"}`}>
                      {promptLabel}
                    </p>
                    {isCompleted && (
                      <span className="shrink-0 text-xs font-black text-amber-500">
                        {"★".repeat(Math.max(1, Math.min(3, stars || 1)))}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-[#786154]">
                    {isCompleted
                      ? t("stars_label")
                      : isCurrent
                        ? t("ready_label")
                        : isRetry
                          ? t("try_again_label")
                          : t("locked_label")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Level Progress Badge */}
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-center text-xs font-black text-[#5c3514]">
          {t("start_overlay_level_progress", {
            completed: completedPromptIds.length,
            total: prompts.length,
          })}
        </div>
      </aside>
    );
  }

  if (adventure) {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Subtle glowing trail curve behind nodes */}
        <div className="pointer-events-none absolute left-10 right-10 top-7 hidden h-3.5 rounded-full bg-gradient-to-r from-amber-300/30 via-yellow-200/40 to-amber-300/30 blur-xs md:block" />
        <div className="relative z-10 flex flex-wrap items-start justify-center md:justify-around gap-2 sm:gap-3 px-1">
          {prompts.map((prompt, index) => {
            const state = getNodeState({
              prompt,
              currentIndex,
              index,
              completedPromptIds,
              invalidPromptIds,
            });

            // Path curve offsets matching the river terrain in Image 2
            const curveOffset = [0, 8, 20, 6, -6][index % 5];

            return (
              <div
                key={prompt.promptId || index}
                className="flex flex-col items-center shrink-0"
                style={{ transform: `translateY(${curveOffset}px)` }}
              >
                <LeoLevelNode
                  index={index}
                  prompt={prompt}
                  state={state}
                  stars={levelStars[prompt.promptId] || 0}
                  theme={theme}
                  compact={false}
                  variant="adventure"
                  onClick={state === "current" || state === "invalid_retry" ? onNodeClick : undefined}
                />
                {/* Reward badge attached under the first node */}
                {index === 0 && (
                  <div className="mt-3">
                    <LeoRewardChest
                      unlocked={completed}
                      theme={theme}
                      rewardLabel={rewardLabel}
                      totalStars={totalStars}
                      compact={false}
                      variant="adventure"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`relative overflow-hidden border-3 border-[#6e3c1b] bg-[#fffdf7] shadow-xl ${
        compact ? "rounded-[1.8rem] p-3" : "rounded-[2.4rem] p-4 sm:p-5"
      } ${className}`}
    >
      <div className="relative z-10">
        <div className={`${compact ? "mb-3" : "mb-4"} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className={`${compact ? "text-[10px]" : "text-xs"} font-black uppercase tracking-[0.2em] text-[#786154]`}>
              {t("jungle_level_path")}
            </p>
            <h2 className={`${compact ? "text-lg" : "text-2xl"} font-black text-[#2e1910]`}>
              {guideMessage || t("follow_sound_path")}
            </h2>
          </div>
          <span className="rounded-full border border-[#ecdac2] bg-[#fbf7ed] px-4 py-2 text-sm font-black text-[#2e1910] shadow-sm">
            {t("start_overlay_level_progress", {
              completed: completedPromptIds.length,
              total: prompts.length,
            })}
          </span>
        </div>

        <div className={`relative border border-[#ecdac2] bg-[#fbf7ed] ${
          compact ? "rounded-[1.4rem] p-3" : "rounded-[2rem] p-4"
        }`}>
          <div className="pointer-events-none absolute left-8 right-8 top-16 hidden h-3 rounded-full bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 opacity-80 md:block" />
          <div className={`relative z-10 grid grid-cols-2 gap-2 ${
            compact ? "sm:grid-cols-3 xl:grid-cols-2" : "sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
          }`}>
            {prompts.map((prompt, index) => {
              const state = getNodeState({
                prompt,
                currentIndex,
                index,
                completedPromptIds,
                invalidPromptIds,
              });

              return (
                <LeoLevelNode
                  key={prompt.promptId || index}
                  index={index}
                  prompt={prompt}
                  state={state}
                  stars={levelStars[prompt.promptId] || 0}
                  theme={theme}
                  compact={compact}
                  variant="default"
                  onClick={state === "current" || state === "invalid_retry" ? onNodeClick : undefined}
                />
              );
            })}
            <LeoRewardChest
              unlocked={completed}
              theme={theme}
              rewardLabel={rewardLabel}
              totalStars={totalStars}
              compact={compact}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeoLevelMap;
