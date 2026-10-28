// VIVA: Identification completion card: Leo, translated completion message, collected stars and return-to-map button.
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeoLionImage } from "./LeoAssetFallback";

function LeoCompletionScreen({ completion }) {
  const navigate = useNavigate();
  const { t } = useTranslation("sp");
  const stars = completion?.starsEarnedTotal || completion?.starsEarned || 0;

  return (
    <main
      className="child-game-shell flex min-h-screen items-center justify-center p-5 text-slate-950 sm:p-8"
      style={{
        backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <section className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
        <div className="w-full rounded-[3rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-8 shadow-2xl sm:p-12">
          <LeoLionImage className="mx-auto h-44 w-44 filter drop-shadow-md" />
          <h1 className="mt-4 text-3xl font-black text-[#2e1910] sm:text-5xl">
            {t("identification_complete_title")}
          </h1>
          <p className="mt-3 text-lg font-bold text-[#786154]">
            {t("identification_complete_desc")}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#ecdac2] bg-[#fbf7ed] px-8 py-3 text-2xl font-black text-amber-500 shadow-inner">
            <span>★</span>
            <span>{t("stars_collected", { count: stars })}</span>
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-full border-3 border-[#6b4122] bg-[#a86532] px-8 py-4 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#8f5224]"
            >
              {t("back_to_lexiland_map")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LeoCompletionScreen;
