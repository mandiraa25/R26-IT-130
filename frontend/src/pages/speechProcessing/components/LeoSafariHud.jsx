import { ArrowLeft, Check, FlagTriangleRight, Languages, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const CHECKPOINTS = [
  { sequence: 1, threshold: 2 },
  { sequence: 2, threshold: 4 },
  { sequence: 3, threshold: 5 },
];

function LeoSafariHud({ stars = 0, completedCount = 0, checkpointDue = false, onBack }) {
  const { t, i18n } = useTranslation("sp");
  const safeCompletedCount = Math.min(5, Math.max(0, Number(completedCount) || 0));
  const nextCheckpoint =
    CHECKPOINTS.find((checkpoint) => safeCompletedCount < checkpoint.threshold) ||
    CHECKPOINTS[CHECKPOINTS.length - 1];
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

  return (
    <header className="rounded-[2rem] border-3 border-[#6e3c1b] bg-[#fffdf7] px-4 py-3 text-[#2e1910] shadow-xl sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#6b4122] bg-[#a86532] px-4 py-2 text-sm font-black text-white outline-none transition hover:bg-[#8f5224] focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            <span>{t("back_to_lexiland_map")}</span>
          </button>
        ) : null}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-black uppercase text-[#786154]">
            {t("safari_hud_eyebrow")}
          </p>
          <h1 className="text-xl font-black text-[#2e1910] sm:text-2xl">{t("training_safari_title")}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#ecdac2] bg-[#fbf7ed] px-4 py-2 font-black text-amber-500 shadow-sm"
            aria-label={t("stars", { count: stars })}
          >
            <Star aria-hidden="true" className="h-5 w-5 fill-current" />
            <span>{stars}</span>
          </span>
          <div
            className="flex min-h-11 items-center rounded-full border border-[#ecdac2] bg-[#fbf7ed] p-1"
            role="group"
            aria-label={t("safari_language_label")}
          >
            <Languages aria-hidden="true" className="mx-2 h-4 w-4 text-[#786154]" />
            {[
              ["en", "EN"],
              ["si", "සි"],
            ].map(([language, label]) => {
              const active = currentLanguage.startsWith(language);
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => i18n.changeLanguage(language)}
                  className={`min-h-9 min-w-9 rounded-full px-2 text-xs font-black outline-none transition focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    active ? "bg-[#a86532] text-white shadow-sm" : "text-[#786154] hover:bg-amber-100/50"
                  }`}
                  aria-pressed={active}
                  aria-label={t(language === "en" ? "safari_language_english" : "safari_language_sinhala")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {checkpointDue ? (
        <p role="status" className="mt-3 rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] px-4 py-3 text-center text-sm font-black text-[#2e1910]">
          {t("safari_trail_checkpoint_ready")}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 border-t border-[#ecdac2] pt-3 lg:grid-cols-[auto_1fr] lg:items-center">
        <p className="text-sm font-bold text-[#786154]">
          {t("safari_unique_completed", { count: safeCompletedCount, total: 5 })}
        </p>
        <ol className="grid grid-cols-3 gap-2" aria-label={t("safari_checkpoint_progress_label")}>
          {CHECKPOINTS.map((checkpoint) => {
            const achieved = safeCompletedCount >= checkpoint.threshold;
            const current = !achieved && checkpoint.sequence === nextCheckpoint.sequence;
            return (
              <li
                key={checkpoint.sequence}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 py-2 text-center text-xs font-black shadow-sm ${
                  achieved
                    ? "border-2 border-emerald-600 bg-emerald-500 text-white"
                    : current
                      ? "animate-pulse border-2 border-amber-500 bg-amber-100 text-amber-900"
                      : "border border-[#ecdac2] bg-[#fbf7ed] text-[#786154]"
                }`}
              >
                {achieved ? (
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                ) : (
                  <FlagTriangleRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {t(checkpoint.sequence === 3 ? "safari_final_trail_check" : "safari_trail_check_number", {
                    number: checkpoint.sequence,
                  })}
                  <span className="ml-1 opacity-80">({checkpoint.threshold}/5)</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}

export default LeoSafariHud;
