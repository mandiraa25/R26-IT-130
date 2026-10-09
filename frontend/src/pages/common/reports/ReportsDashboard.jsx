import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../../services/student/api";
import { getCachedProfile } from "../../../utils/studentProfileCache";

function ReportsDashboard() {
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

  const components = [
    {
      id: "wm",
      num: "01",
      title: "Working Memory",
      subtitle: "Activity results and earned stars.",
      image: "/images/reports/mascot_bunny.png",
      colorHex: "#ea580c",
      borderClass: "border-[#ea580c]",
      textClass: "text-[#ea580c]",
      hoverBgClass: "hover:bg-[#ea580c]",
    },
    {
      id: "rp",
      num: "02",
      title: "Reading Processing",
      subtitle: "Activity results and earned stars.",
      image: "/images/reports/mascot_zebra.png",
      colorHex: "#0284c7",
      borderClass: "border-[#0284c7]",
      textClass: "text-[#0284c7]",
      hoverBgClass: "hover:bg-[#0284c7]",
    },
    {
      id: "pa",
      num: "03",
      title: "Phonological Awareness",
      subtitle: "Activity results and earned stars.",
      image: "/images/reports/mascot_parrot.png",
      colorHex: "#16a34a",
      borderClass: "border-[#16a34a]",
      textClass: "text-[#16a34a]",
      hoverBgClass: "hover:bg-[#16a34a]",
    },
    {
      id: "sp",
      num: "04",
      title: "Speech Processing",
      subtitle: "Activity results and earned stars.",
      image: "/images/reports/mascot_leo.png",
      colorHex: "#9333ea",
      borderClass: "border-[#9333ea]",
      textClass: "text-[#9333ea]",
      hoverBgClass: "hover:bg-[#9333ea]",
    },
  ];

  const tabs = [
    { id: "wm", bg: "bg-[#f97316]", hover: "hover:bg-[#ea580c]" },
    { id: "rp", bg: "bg-[#0ea5e9]", hover: "hover:bg-[#0284c7]" },
    { id: "pa", bg: "bg-[#22c55e]", hover: "hover:bg-[#16a34a]" },
    { id: "sp", bg: "bg-[#a855f7]", hover: "hover:bg-[#9333ea]" },
  ];

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
                className={`w-4 sm:w-5 h-14 sm:h-16 rounded-r-xl ${tab.bg} ${tab.hover} shadow-md transition-all hover:w-6 cursor-pointer`}
                title={`Open ${tab.id.toUpperCase()} reports`}
                aria-label={`Open ${tab.id.toUpperCase()} reports`}
              />
            ))}
          </div>

          {/* Wooden Frame */}
          <div className="relative bg-[#a06334] p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.3)] border-4 border-[#6e3c1b]">
            {/* Corner Decorative Studs */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#4a260f] shadow-inner" />

            {/* Inner Parchment Board */}
            <div className="bg-[#fbf7ed] rounded-[1.6rem] sm:rounded-[2.3rem] px-5 py-6 sm:px-10 sm:py-8 shadow-inner border border-[#ecdac2]">
              {/* Header Title with sparkles */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2e1910] tracking-tight">
                    Learning Reports
                  </h1>
                  {/* Playful green sparkles */}
                  <div className="text-emerald-500 font-black text-2xl sm:text-3xl leading-none select-none">
                    ´
                  </div>
                </div>
                <p className="text-[#786154] font-bold text-sm sm:text-base mt-1">
                  Review your child’s activity results.
                </p>
              </div>

              {/* Component Rows List */}
              <div className="divide-y divide-[#ebdccb]">
                {components.map((comp) => (
                  <div
                    key={comp.id}
                    className="py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 transition-colors hover:bg-black/[0.015] rounded-xl px-1 sm:px-2"
                  >
                    {/* Left: Number + Mascot + Title */}
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      {/* Number */}
                      <span className="text-[#a89587] font-black text-sm sm:text-base w-5 sm:w-6 shrink-0">
                        {comp.num}
                      </span>

                      {/* Mascot Circle Badge */}
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 ${comp.borderClass} bg-white overflow-hidden shrink-0 shadow-sm flex items-center justify-center p-0.5`}
                      >
                        <img
                          src={comp.image}
                          alt={comp.title}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      {/* Titles */}
                      <div className="min-w-0">
                        <h2 className="text-[#2e1910] font-black text-base sm:text-lg md:text-xl truncate leading-tight">
                          {comp.title}
                        </h2>
                        <p className="text-[#786154] font-bold text-xs sm:text-sm truncate mt-0.5">
                          {comp.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: View Results Button */}
                    <button
                      onClick={() => navigate(`/reports/${comp.id}`)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border-2 ${comp.borderClass} ${comp.textClass} ${comp.hoverBgClass} hover:text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer bg-white/70 hover:shadow-md`}
                    >
                      <span>View results</span>
                      <span aria-hidden="true">&gt;</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Subtle Guidance Footer */}
              <div className="mt-5 sm:mt-7 pt-3 border-t border-[#ebdccb]/60 flex items-center justify-center gap-2 text-[#8a7667] text-xs font-bold">
                <span className="text-emerald-600 text-sm">🍃</span>
                <span>Select a component to open its reports.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-2 sm:h-4" />
    </div>
  );
}

export default ReportsDashboard;
