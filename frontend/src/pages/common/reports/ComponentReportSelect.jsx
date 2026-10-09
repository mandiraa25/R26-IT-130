import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../../services/student/api";
import { getCachedProfile } from "../../../utils/studentProfileCache";

function ComponentReportSelect() {
  const { componentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [profile, setProfile] = useState(() => getCachedProfile());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getStudentProfile({ refresh: true });
        if (!cancelled && res?.data) setProfile(res.data);
      } catch {
        // Fallback to cached profile
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentName = profile?.name || profile?.username || "Mandiraa";
  const studentGrade = profile?.grade || "3";

  // Component configuration matching the 4 reference designs
  const componentConfigs = {
    wm: {
      title: "Working Memory",
      mascot: "/images/reports/mascot_bunny.png",
      tokenAssessment: "/images/reports/token_assessment.png",
      tokenPractice: "/images/reports/token_practice.png",
      themeColorHex: "#ea580c",
      themeBorder: "border-[#ea580c]",
      themeText: "text-[#ea580c]",
      themeHoverBg: "hover:bg-[#ea580c]",
      hasOpenBook: false,
    },
    rp: {
      title: "Reading Processing",
      mascot: "/images/reports/mascot_zebra.png",
      tokenAssessment: "/images/reports/token_assessment.png",
      tokenPractice: "/images/reports/token_practice.png",
      themeColorHex: "#0284c7",
      themeBorder: "border-[#0284c7]",
      themeText: "text-[#0284c7]",
      themeHoverBg: "hover:bg-[#0284c7]",
      hasOpenBook: true,
    },
    pa: {
      title: "Phonological Awareness",
      mascot: "/images/reports/mascot_parrot.png",
      tokenAssessment: "/images/reports/token_assessment_pa.png",
      tokenPractice: "/images/reports/token_practice_pa.png",
      themeColorHex: "#16a34a",
      themeBorder: "border-[#16a34a]",
      themeText: "text-[#16a34a]",
      themeHoverBg: "hover:bg-[#16a34a]",
      hasOpenBook: false,
    },
    sp: {
      title: "Speech Processing",
      mascot: "/images/reports/mascot_leo.png",
      tokenAssessment: "/images/reports/token_assessment.png",
      tokenPractice: "/images/reports/token_practice.png",
      themeColorHex: "#9333ea",
      themeBorder: "border-[#9333ea]",
      themeText: "text-[#9333ea]",
      themeHoverBg: "hover:bg-[#9333ea]",
      hasOpenBook: false,
    },
  };

  // Normalize component IDs to handle both short codes and full slugs
  const normalizedId = (() => {
    const raw = (componentId || "").toLowerCase();
    if (raw === "sp" || raw === "speech-processing" || raw === "speech") return "sp";
    if (raw === "wm" || raw === "working-memory" || raw === "memory") return "wm";
    if (raw === "pa" || raw === "phonological-awareness" || raw === "phonological") return "pa";
    if (raw === "rp" || raw === "reading-processing" || raw === "reading") return "rp";
    return "sp";
  })();

  const currentConfig = componentConfigs[normalizedId] || componentConfigs.sp;

  const tabs = [
    { id: "wm", bg: "bg-[#f97316]", hover: "hover:bg-[#ea580c]" },
    { id: "rp", bg: "bg-[#0ea5e9]", hover: "hover:bg-[#0284c7]" },
    { id: "pa", bg: "bg-[#22c55e]", hover: "hover:bg-[#16a34a]" },
    { id: "sp", bg: "bg-[#a855f7]", hover: "hover:bg-[#9333ea]" },
  ];

  const handleSelect = (type) => {
    if (type === "identification") {
      if (normalizedId === "pa") navigate("/reports/pa/identification");
      else if (normalizedId === "wm") navigate("/reports/wm/identification");
      else if (normalizedId === "sp") navigate("/reports/sp/identification");
      else if (normalizedId === "rp") navigate("/reading-processing");
      else alert(`${type} reports for ${currentConfig.title} are coming soon!`);
    } else if (type === "improvement") {
      if (normalizedId === "pa") navigate("/reports/pa/improvement");
      else if (normalizedId === "wm") navigate("/reports/wm/improvement");
      else if (normalizedId === "sp") navigate("/reports/sp/improvement");
      else if (normalizedId === "rp") navigate("/reading-processing");
      else alert(`${type} reports for ${currentConfig.title} are coming soon!`);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center font-['Nunito',sans-serif] select-none flex flex-col justify-between p-3 sm:p-6 md:p-8"
      style={{
        backgroundImage: "url('/images/reports/jungle_waterfall_bg.jpg')",
      }}
    >
      {/* 🌟 Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between w-full max-w-6xl mx-auto pt-1 sm:pt-2">
        {/* Home Button (Top Left) */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex flex-col items-center focus:outline-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Return to LexiLand Map"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-[#6b4122] bg-[#a86532] shadow-[0_5px_12px_rgba(0,0,0,0.45)] flex items-center justify-center p-2.5 transition-shadow group-hover:shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
            <svg
              className="w-full h-full text-white fill-current drop-shadow"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span className="text-white text-xs sm:text-sm font-black mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
            Home
          </span>
        </button>

        {/* Student Profile Badge (Top Right) */}
        <div className="flex items-center gap-2.5 bg-white/95 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-white/80 backdrop-blur-sm">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#78350f] text-white flex items-center justify-center text-sm font-black shadow-inner">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="text-[#3b2314] font-extrabold text-xs sm:text-sm tracking-tight">
            {studentName} · Grade {studentGrade}
          </span>
        </div>
      </header>

      {/* 📜 Central Wooden Notice Board Container */}
      <main className="relative z-20 w-full max-w-5xl mx-auto my-auto py-3">
        <div className="relative">
          {/* Right edge folder tabs */}
          <div className="hidden sm:flex flex-col gap-2.5 absolute -right-4 sm:-right-5 top-16 z-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`/reports/${tab.id}`)}
                className={`w-4 sm:w-5 h-14 sm:h-16 rounded-r-xl ${tab.bg} ${tab.hover} ${
                  normalizedId === tab.id ? "w-6 shadow-lg ring-2 ring-white/60" : "shadow-md opacity-90"
                } transition-all hover:w-6 hover:opacity-100 cursor-pointer`}
                title={`Switch to ${tab.id.toUpperCase()} reports`}
                aria-label={`Switch to ${tab.id.toUpperCase()} reports`}
              />
            ))}
          </div>

          {/* Wooden Frame */}
          <div className="relative bg-[#a06334] p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.3)] border-4 border-[#6e3c1b]">
            {/* 🌿 Lush Corner Monstera Leaves Draped Over Top-Left Corner */}
            <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 md:-top-10 md:-left-10 w-28 sm:w-36 md:w-44 pointer-events-none z-30 select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]">
              <img
                src="/images/reports/board_corner_leaves.png"
                alt=""
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Corner Decorative Studs */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />

            {/* Inner Parchment Board */}
            <div className="bg-[#fbf7ed] rounded-[1.6rem] sm:rounded-[2.3rem] px-5 py-6 sm:px-10 sm:py-8 shadow-inner border border-[#ecdac2]">
              {/* Back to All Reports Link */}
              <button
                onClick={() => navigate("/reports")}
                className={`inline-flex items-center gap-1.5 ${currentConfig.themeText} font-black text-sm sm:text-base tracking-wide mb-3 sm:mb-4 hover:opacity-80 transition cursor-pointer`}
              >
                <span aria-hidden="true" className="text-lg leading-none">&larr;</span>
                <span>All reports</span>
              </button>

              {/* Component Header with Mascot Badge */}
              <div className="flex items-center gap-4 sm:gap-6 mb-5 sm:mb-7 pb-4 sm:pb-6 border-b border-[#ebdccb]">
                {/* Mascot Badge */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-3 sm:border-4 ${currentConfig.themeBorder} bg-white overflow-hidden shrink-0 shadow-md flex items-center justify-center p-0.5`}
                >
                  <img
                    src={currentConfig.mascot}
                    alt={currentConfig.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Title & Prompt */}
                <div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#2e1910] tracking-tight">
                    {currentConfig.title}
                  </h1>
                  <p className="text-[#786154] font-bold text-sm sm:text-base mt-1">
                    Choose a report type.
                  </p>
                </div>
              </div>

              {/* Two Option Rows */}
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Assessment Reports (Identification) */}
                <div className="flex items-center justify-between gap-3 sm:gap-5 p-2 sm:p-4 rounded-2xl transition-colors hover:bg-black/[0.015]">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 shrink-0 flex items-center justify-center">
                      <img
                        src={currentConfig.tokenAssessment}
                        alt="Assessment reports"
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <div>
                      <h2 className="text-[#2e1910] font-black text-lg sm:text-2xl md:text-3xl leading-tight">
                        Assessment reports
                      </h2>
                      <p className="text-[#786154] font-bold text-xs sm:text-sm md:text-base mt-0.5">
                        Identification
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelect("identification")}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full border-2 ${currentConfig.themeBorder} ${currentConfig.themeText} ${currentConfig.themeHoverBg} hover:text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer bg-white/70 hover:shadow-md`}
                  >
                    <span>View reports</span>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#ebdccb] w-full" />

                {/* 2. Practice Reports (Improvement) */}
                <div className="flex items-center justify-between gap-3 sm:gap-5 p-2 sm:p-4 rounded-2xl transition-colors hover:bg-black/[0.015]">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 shrink-0 flex items-center justify-center">
                      <img
                        src={currentConfig.tokenPractice}
                        alt="Practice reports"
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <div>
                      <h2 className="text-[#2e1910] font-black text-lg sm:text-2xl md:text-3xl leading-tight">
                        Practice reports
                      </h2>
                      <p className="text-[#786154] font-bold text-xs sm:text-sm md:text-base mt-0.5">
                        Improvement
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelect("improvement")}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full border-2 ${currentConfig.themeBorder} ${currentConfig.themeText} ${currentConfig.themeHoverBg} hover:text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer bg-white/70 hover:shadow-md`}
                  >
                    <span>View reports</span>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </div>
              </div>

              {/* Extra Reading Processing button: Open Book */}
              {currentConfig.hasOpenBook && (
                <div className="mt-6 sm:mt-8 pt-4 border-t border-[#ebdccb]/60 flex justify-start">
                  <button
                    onClick={() => navigate("/reading-processing")}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full border-2 border-[#0284c7] text-[#0284c7] hover:bg-[#0284c7] hover:text-white font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer bg-white/70"
                  >
                    <span aria-hidden="true">📖</span>
                    <span>Open book</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-2 sm:h-4" />
    </div>
  );
}

export default ComponentReportSelect;
