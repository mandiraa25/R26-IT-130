// VIVA: Leo advice card: mascot, translated greeting/title and a supplied or default encouragement message.
import { useTranslation } from "react-i18next";
import { LeoLionImage } from "./LeoAssetFallback";

function LeoGuide({ title, message, compact = false }) {
  const { t } = useTranslation("sp");

  return (
    <aside
      className={`relative overflow-hidden rounded-[2rem] border-3 border-[#6e3c1b] bg-[#fffdf7] p-5 shadow-xl ${
        compact ? "" : "lg:min-h-[260px]"
      }`}
    >
      <div className="relative flex items-center gap-4">
        <LeoLionImage className={`${compact ? "h-20 w-20" : "h-28 w-28"} filter drop-shadow-md`} />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#786154]">
            {t("leo_the_lion")}
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#2e1910]">{title || t("hi_explorer")}</h2>
        </div>
      </div>
      <div className="relative mt-5 rounded-3xl border border-[#ecdac2] bg-[#fbf7ed] px-5 py-4 text-base font-bold leading-7 text-[#2e1910]">
        {message || t("lets_find_sound_path")}
      </div>
    </aside>
  );
}

export default LeoGuide;
