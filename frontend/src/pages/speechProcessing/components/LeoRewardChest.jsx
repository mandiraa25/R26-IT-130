import { useTranslation } from "react-i18next";

function LeoRewardChest({
  unlocked,
  rewardLabel,
  totalStars = 0,
  compact = false,
  variant = "default",
}) {
  const { t } = useTranslation("sp");
  const resolvedRewardLabel = rewardLabel || t("jungle_sound_badge");

  if (variant === "adventure") {
    return (
      <div
        className={`relative w-full min-w-[125px] max-w-[145px] rounded-[1.6rem] border-3 text-center shadow-xl transition ${
          unlocked
            ? "border-amber-300 bg-gradient-to-br from-amber-100 to-orange-200 text-amber-950 ring-2 ring-amber-300/50"
            : "border-[#d8c0a2] bg-[#fffdf7] text-amber-950"
        }`}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-md whitespace-nowrap">
          {t("final_reward")}
        </div>
        <div className="p-2.5 pt-3.5">
          <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 text-sm font-black text-white shadow-md ${unlocked ? "animate-bounce" : ""}`}>
            {unlocked ? t("reward_open_short") : t("reward_go_short")}
          </div>
          <h3 className="mt-1.5 text-xs font-black leading-tight text-[#2e1910] px-1 line-clamp-2">
            {resolvedRewardLabel}
          </h3>
          <p className="mt-0.5 text-[10px] font-bold text-[#786154]">
            {unlocked ? t("stars_collected", { count: totalStars }) : t("finish_every_level")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-[1.75rem] border-4 text-center shadow-xl transition ${
        compact ? "min-h-[108px] p-3" : "min-h-[132px] p-4"
      } ${
        unlocked
          ? "border-amber-200 bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-400 text-amber-950 shadow-amber-950/20"
          : "border-white/50 bg-white/55 text-slate-500 shadow-slate-950/10"
      }`}
    >
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-lg">
        {t("final_reward")}
      </span>
      <div className={`${compact ? "mt-3 text-3xl" : "mt-4 text-5xl"} ${unlocked ? "animate-bounce" : ""}`}>
        {unlocked ? t("trophy_label") : t("gift_label")}
      </div>
      <h3 className={`${compact ? "mt-1 text-sm" : "mt-2 text-lg"} font-black`}>
        {resolvedRewardLabel}
      </h3>
      <p className="mt-1 text-xs font-black">
        {unlocked ? t("stars_collected", { count: totalStars }) : t("finish_every_level")}
      </p>
    </div>
  );
}

export default LeoRewardChest;
