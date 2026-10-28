// VIVA: Individual level button: number/state, prompt or guide label, stars and retry/locked styling in two visual variants.
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const stateStyles = {
  completed: "scale-100 bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-amber-950/25",
  current: "scale-105 bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-950/30 animate-pulse",
  invalid_retry: "scale-105 bg-gradient-to-br from-orange-300 to-rose-500 text-white shadow-orange-950/30",
  locked: "bg-slate-300/90 text-slate-600 shadow-slate-950/10",
};

function LeoLevelNode({ index, prompt, state, stars = 0, onClick, theme, compact = false, variant = "default" }) {
  const { t } = useTranslation("sp");
  const locked = state === "locked";
  const label = prompt?.targetText || prompt?.targetSound || t("level_number", { number: index + 1 });
  const starText = state === "completed"
    ? "*".repeat(Math.max(1, Math.min(3, stars || 1)))
    : locked
      ? t("locked_label")
      : t("star_label");

  if (variant === "adventure") {
    const showLockIcon = locked && index >= 2;

    return (
      <button
        type="button"
        disabled={locked}
        onClick={() => onClick?.(index)}
        className={`group relative flex min-h-[110px] w-full max-w-[110px] flex-col items-center justify-start rounded-[1.7rem] p-1 transition focus:outline-none focus:ring-4 focus:ring-amber-100 ${
          locked ? "cursor-not-allowed opacity-90" : "hover:-translate-y-1 cursor-pointer"
        }`}
        aria-label={t("level_aria_label", { number: index + 1, label })}
      >
        <span className="absolute top-[48px] h-6 w-20 rounded-[999px] bg-stone-900/25 blur-xs" />
        
        {state === "invalid_retry" && (
          <span className="absolute -top-2 z-30 rounded-full border-2 border-amber-50 bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-lg">
            {t("try_again_label")}
          </span>
        )}

        {state === "current" && (
          <span
            className="absolute top-1 h-[68px] w-[68px] animate-ping rounded-full opacity-35"
            style={{ backgroundColor: theme?.primaryColor || "#15803d" }}
          />
        )}

        {/* Node Circle */}
        <span className="relative z-10 rounded-full bg-stone-500/80 p-0.5 shadow-xl">
          <span
            className={`flex h-15 w-15 items-center justify-center rounded-full border-4 border-white text-2xl font-black shadow-inner ${
              state === "current"
                ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white"
                : state === "completed"
                  ? "bg-gradient-to-br from-amber-300 to-orange-500 text-white"
                  : index === 1
                    ? "bg-gradient-to-br from-slate-200 to-blue-400 text-white"
                    : "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-600"
            }`}
          >
            {showLockIcon ? (
              <Lock className="h-6 w-6 text-slate-600 stroke-[2.5]" aria-hidden="true" />
            ) : (
              index + 1
            )}
          </span>
        </span>

        {/* Word Badge (e.g. cat, bat, dog...) */}
        <span className="relative z-10 -mt-1.5 rounded-full border-2 border-amber-100 bg-white px-3 py-0.5 text-[11px] font-black text-[#2e1910] shadow-sm max-w-[96px] truncate">
          {label}
        </span>

        {/* Status Badge (Ready / Locked / Completed) */}
        <span
          className={`relative z-10 mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-2xs ${
            state === "completed"
              ? "bg-amber-100 text-amber-700"
              : state === "current"
                ? "bg-emerald-600 text-white"
                : "bg-white/90 text-slate-500"
          }`}
        >
          {state === "completed" ? starText : locked ? t("locked_label") : t("ready_label")}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onClick?.(index)}
      className={`group relative flex flex-col items-center justify-start rounded-[1.6rem] p-2 transition focus:outline-none focus:ring-4 focus:ring-amber-200 ${
        compact ? "min-h-[86px]" : "min-h-[112px]"
      } ${locked ? "cursor-not-allowed" : "hover:-translate-y-1"}`}
      aria-label={t("level_aria_label", { number: index + 1, label })}
    >
      {state === "invalid_retry" && (
        <span className="absolute -top-2 z-20 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-black text-orange-800 ring-1 ring-orange-200">
          {t("try_again_label")}
        </span>
      )}
      <span
        className={`relative z-10 flex items-center justify-center rounded-full border-white font-black shadow-xl transition ${
          compact ? "h-12 w-12 border-4 text-lg" : "h-16 w-16 border-[5px] text-2xl"
        } ${stateStyles[state] || stateStyles.locked}`}
        style={state === "current" ? { boxShadow: `0 0 0 8px ${theme?.primaryColor || "#15803d"}22` } : undefined}
      >
        {index + 1}
      </span>
      <span className={`mt-2 max-w-[104px] truncate rounded-full border border-[#ecdac2] bg-[#fbf7ed] px-3 py-1 font-black text-[#2e1910] shadow-sm ${
        compact ? "text-[10px]" : "text-xs"
      }`}>
        {label}
      </span>
      <span className={`${compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"} font-black text-[#786154]`}>
        {starText}
      </span>
    </button>
  );
}

export default LeoLevelNode;
