import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../services/student/api";
import { getStudentProgress } from "../../services/workingMemory/improveApi";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import GameSelectionModal from "./components/GameSelectionModal";

const WM_PROFILE_CACHE = "wm-profile-cache";
const WM_PROGRESS_CACHE = "wm-progress-cache";
const readSessionCache = (key) => {
  try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
};

export default function ImprovementLevelsWM() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("wm");

  const [profile, setProfile] = useState(() => readSessionCache(WM_PROFILE_CACHE));
  const [progressData, setProgressData] = useState(() => readSessionCache(WM_PROGRESS_CACHE));

  // Subcategory modal state
  const [showSubCatModal, setShowSubCatModal] = useState(false);
  const [selectedLevelNum, setSelectedLevelNum] = useState(null);

  // Locked modal state
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showIdentificationModal, setShowIdentificationModal] = useState(false);
  const [progressLoading, setProgressLoading] = useState(() => !readSessionCache(WM_PROGRESS_CACHE));
  const [soundEnabled, setSoundEnabled] = useState(true);

  async function fetchProfileAndProgress() {
    setProgressLoading(true);
    try {
      const profileRes = await getStudentProfile();
      setProfile(profileRes.data);
      sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(profileRes.data));

      const studentId = profileRes.data?._id || localStorage.getItem("studentId");
      if (studentId) {
        const progRes = await getStudentProgress(studentId);
        if (progRes?.success && progRes?.data) {
          setProgressData(progRes.data);
          sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(progRes.data));
        }
      }
    } catch (err) {
      console.error("Error fetching student profile/progress:", err);
    } finally {
      setProgressLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(fetchProfileAndProgress);
    [
      "/images/workingMemory/improve/common/common_bg.png",
      ...[1, 2, 3, 4].map((level) => `/images/workingMemory/improve/levels/level${level}_bg.png`),
      "/images/workingMemory/improve/boards/wm_bunny_ready.png",
    ].forEach((src) => { const image = new Image(); image.src = src; });
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLevelClick = (levelNum, isLocked) => {
    if (progressLoading) return;

    if (!isIdentificationCompleted) {
      setShowIdentificationModal(true);
      return;
    }

    if (isLocked) {
      setShowLockedModal(true);
    } else {
      setSelectedLevelNum(levelNum);
      setShowSubCatModal(true);
    }
  };

  const handleStartSubCategory = (subCategoryKey) => {
    const currentGrade = grade || profile?.grade || "2";
    navigate(`/improvement-activity-wm/${currentGrade}/${selectedLevelNum}/${subCategoryKey}`);
  };

  const isIdentificationCompleted = Boolean(progressData?.isIdentificationCompleted);
  const maxUnlocked = isIdentificationCompleted ? (progressData?.maxUnlockedLevel ?? 0) : 0;
  const totalStars = Math.max(0, Number(progressData?.totalStars ?? progressData?.totalCarrots) || 0);

  const goToIdentification = () => {
    navigate(`/working-memory/${grade || profile?.grade || "2"}`);
  };

  // Helper to compute stats for level cards
  const getLevelStats = (lvlNum) => {
    if (!progressData?.levelsProgress) return { stars: "0 / 4", completedCount: 0 };
    const lvlProg = progressData.levelsProgress.find((l) => l.levelNumber === lvlNum);
    if (!lvlProg) return { stars: "0 / 4", completedCount: 0 };

    const completedCount = lvlProg.subCategories.filter((s) => s.isCompleted).length;
    return {
      stars: `${completedCount} / 4`,
      completedCount,
    };
  };

  const levelsConfig = [
    {
      num: 1,
      titleKey: "level_1_title",
      descKey: "level_1_desc",
      color: "bg-gradient-to-b from-orange-400 to-orange-500 border-orange-600 text-orange-950",
      buttonColor: "bg-gradient-to-b from-orange-400 to-orange-600 border-orange-700 text-white hover:brightness-105 active:scale-95",
      emoji: "🦁",
    },
    {
      num: 2,
      titleKey: "level_2_title",
      descKey: "level_2_desc",
      color: "bg-gradient-to-b from-green-400 to-green-500 border-green-600 text-green-950",
      buttonColor: "bg-gradient-to-b from-green-400 to-green-600 border-green-700 text-white hover:brightness-105 active:scale-95",
      emoji: "🐯",
    },
    {
      num: 3,
      titleKey: "level_3_title",
      descKey: "level_3_desc",
      color: "bg-gradient-to-b from-pink-400 to-pink-500 border-pink-600 text-pink-950",
      buttonColor: "bg-gradient-to-b from-pink-400 to-pink-600 border-pink-700 text-white hover:brightness-105 active:scale-95",
      emoji: "🦓",
    },
    {
      num: 4,
      titleKey: "level_4_title",
      descKey: "level_4_desc",
      color: "bg-gradient-to-b from-purple-400 to-purple-500 border-purple-600 text-purple-950",
      buttonColor: "bg-gradient-to-b from-purple-400 to-purple-600 border-purple-700 text-white hover:brightness-105 active:scale-95",
      emoji: "🦜",
    },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden font-custom select-none flex flex-col">
      {/* 🌄 Background */}
      <img
        src="/images/workingMemory/improve/common/common_bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      {/* Dark scrim overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/35 pointer-events-none z-0" />

      {/* 🌟 Header Section */}
      <header className="relative z-10 w-full px-4 py-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Back Button & Grade Tag */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handleBack}
            className="w-14 h-14 rounded-full bg-white hover:bg-slate-50 border-4 border-yellow-400 text-yellow-600 flex items-center justify-center text-3xl font-black transition-all transform hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 shadow-[var(--shadow-soft)] cursor-pointer"
            title="Go Back"
          >
            ←
          </button>

          <div className="bg-yellow-400 border-b-6 border-yellow-600 px-6 py-2.5 rounded-2xl shadow-lg flex items-center gap-2">
            <span className="text-yellow-950 text-xl font-black uppercase tracking-wider">
              {t("common:grade")} {grade || profile?.grade || "2-4"}
            </span>
          </div>
        </div>

        {/* Center: Wood-panel Title */}
        <div className="relative transform hover:scale-105 transition-transform duration-300">
          <div className="bg-amber-950 border-4 border-amber-800 px-8 py-3.5 rounded-3xl shadow-2xl relative flex items-center justify-center">
            <span className="absolute -top-3 left-4 text-2xl">🍃</span>
            <span className="absolute -top-3 right-4 text-2xl">🍃</span>
            <h1 className="text-2xl md:text-3xl font-black text-amber-50 uppercase tracking-wide text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {t("improvement_path")}
            </h1>
          </div>
        </div>

        {/* Right: Stars, Sound, Lang, Profile */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div
            className="flex items-center gap-2 rounded-full border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-100 px-4 py-2 shadow-md"
            title={t("total_stars", { defaultValue: "Total Stars" })}
          >
            <span className="text-xl" aria-hidden="true">⭐</span>
            <span className="text-lg font-black text-amber-900 tabular-nums">{totalStars}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[var(--shadow-soft)] border-4 active:translate-y-0.5 transition-all cursor-pointer ${
              soundEnabled
                ? "bg-white border-purple-400 hover:bg-slate-50 text-purple-600"
                : "bg-gray-400 border-gray-400 hover:bg-gray-200 text-gray-400"
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          <div className="bg-white/95 px-4 py-2.5 rounded-full shadow-[var(--shadow-soft)] border-2 border-emerald-100/50 flex items-center justify-center text-slate-700 font-bold">
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-3 bg-white/95 px-5 py-2.5 rounded-full shadow-[var(--shadow-soft)] border-2 border-emerald-100/50">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-white shadow-md">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👦</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs text-emerald-800 font-black uppercase tracking-wider leading-none">
                {t("common:hello")}, {profile?.fullName?.split(" ")[0] || "Explorer"}! 🌿
              </span>
              <span className="text-[0.78rem] text-slate-500 font-bold leading-none mt-1">
                Ready for adventure?
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 🗺️ Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col justify-center items-center">
        {/* Banner if identification quiz not completed yet */}
        {!progressLoading && !isIdentificationCompleted && (
          <div role="alert" aria-live="polite" className="w-full max-w-4xl bg-amber-500/95 border-4 border-amber-300 text-white p-5 rounded-3xl shadow-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💡</span>
              <p className="font-bold text-base md:text-lg leading-snug">
                {t("identification_required_msg")}
              </p>
            </div>
            <button
              onClick={goToIdentification}
              className="bg-white hover:bg-amber-100 text-amber-900 font-black px-6 py-2.5 rounded-2xl shadow-md border-b-4 border-amber-200 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {t("go_to_identification")} ➔
            </button>
          </div>
        )}

        {progressLoading && (
          <div className="w-full max-w-md mb-6 flex flex-col items-center gap-3 text-white">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="font-black text-lg drop-shadow-md">{t("checking_access")}</p>
          </div>
        )}

        {/* Title Tag */}
        <p className="text-white text-xl md:text-2xl font-black text-center mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase tracking-wide">
          {t("select_level")}
        </p>

        {/* Levels Grid */}
        <div className={`relative w-full max-w-5xl ${!progressLoading && !isIdentificationCompleted ? "pointer-events-none" : ""}`}>
          {!progressLoading && !isIdentificationCompleted && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-20 rounded-[2.5rem] bg-slate-900/15 backdrop-blur-[1px]"
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {levelsConfig.map((lvl) => {
            const isLocked = progressLoading || !isIdentificationCompleted || lvl.num > maxUnlocked;
            const stats = getLevelStats(lvl.num);

            return (
              <div
                key={lvl.num}
                onClick={() => handleLevelClick(lvl.num, isLocked)}
                className={`group relative bg-white/95 rounded-[2.5rem] p-6 shadow-[var(--shadow-soft)] border-4 ${
                  isLocked
                    ? "opacity-80 grayscale-[55%] border-slate-200 cursor-not-allowed filter drop-shadow-md"
                    : "border-transparent hover:border-emerald-400 cursor-pointer transform hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-300"
                } flex flex-col items-center justify-between text-center min-h-[380px] ${!progressLoading && !isIdentificationCompleted ? "pointer-events-auto" : ""}`}
              >
                {/* Level Tag */}
                <div
                  className={`px-6 py-1.5 rounded-full font-black text-sm uppercase tracking-widest text-white border-b-4 ${
                    isLocked ? "bg-gray-400 border-gray-500" : lvl.color
                  } mb-4 shadow-md`}
                >
                  {t(lvl.titleKey)}
                </div>

                {/* Level Graphic (Emoji) */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  {isLocked ? (
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center shadow-inner border-4 border-slate-200">
                      <span className="text-5xl">🔒</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner border-4 border-indigo-100/50 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-6xl drop-shadow-md">{lvl.emoji}</span>
                    </div>
                  )}
                </div>

                {/* Level Description */}
                <div className="flex-1 flex flex-col justify-center mb-6">
                  <p className="text-emerald-950 font-bold text-base leading-snug px-2">
                    {t(lvl.descKey)}
                  </p>
                </div>

                {/* Bottom Stars & Play Button */}
                <div className="w-full">
                  {isLocked ? (
                    <div className="bg-slate-300 text-slate-600 font-black py-3 rounded-2xl flex items-center justify-center gap-2 border-b-4 border-slate-400 uppercase tracking-widest text-sm shadow-md">
                      🔒 {!isIdentificationCompleted && !progressLoading ? t("identification_required_short") : t("locked")}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 font-black py-2 rounded-2xl flex items-center justify-center gap-2 shadow-inner text-sm">
                        ⭐ {stats.stars} {t("subcategories")}
                      </div>
                      <button
                        className={`w-full py-3.5 rounded-2xl font-black text-lg uppercase tracking-wider border-b-6 transform transition-all active:translate-y-1 active:border-b-0 shadow-md ${lvl.buttonColor} cursor-pointer`}
                      >
                        {t("level_play")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </main>

      {/* 📂 SUB-CATEGORIES MODAL */}
      {showSubCatModal && selectedLevelNum && isIdentificationCompleted && (
        <GameSelectionModal
          levelNumber={selectedLevelNum}
          subCategoriesProgress={Object.fromEntries(
            (progressData?.levelsProgress?.find((l) => l.levelNumber === selectedLevelNum)?.subCategories || []).map((s) => [s.subCategoryKey, s.isUnlocked]),
          )}
          onSelectGame={handleStartSubCategory}
          onLockedSelect={() => setShowLockedModal(true)}
          onClose={() => setShowSubCatModal(false)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
          t={t}
        />
      )}

      {/* 🔒 IDENTIFICATION REQUIRED MODAL */}
      {showIdentificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border-8 border-amber-100 text-center animate-scaleIn">
            <button
              type="button"
              onClick={() => setShowIdentificationModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer"
              aria-label={t("common:close", { defaultValue: "Close" })}
            >
              ✕
            </button>
            <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl shadow-inner">
              📝
            </div>
            <h3 className="text-3xl font-black text-gray-800 mb-2 uppercase">
              {t("identification_required_title")}
            </h3>
            <p className="text-slate-500 font-bold text-lg px-4 mb-6">
              {t("identification_required_msg")}
            </p>
            <button
              type="button"
              onClick={goToIdentification}
              className="w-full bg-gradient-to-b from-amber-400 to-amber-600 border-b-6 border-amber-700 text-white font-black text-xl px-10 py-3.5 rounded-2xl transition-all shadow-lg cursor-pointer"
            >
              {t("go_to_identification")} ➔
            </button>
          </div>
        </div>
      )}

      {/* 🔒 LOCKED MODAL */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border-8 border-amber-50 text-center animate-scaleIn">
            <button
              onClick={() => {
                setShowLockedModal(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl shadow-inner">
              🔒
            </div>
            <h3 className="text-3xl font-black text-gray-800 mb-2 uppercase">
              {t("locked")}
            </h3>
            <p className="text-slate-500 font-bold text-lg px-4 mb-6">
              {t("level_locked_msg")}
            </p>
            <button
              onClick={() => {
                setShowLockedModal(false);
              }}
              className="bg-gradient-to-b from-indigo-400 to-indigo-600 border-b-6 border-indigo-700 text-white font-black text-xl px-10 py-3.5 rounded-2xl transition-all shadow-lg cursor-pointer"
            >
              OK!
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Fredoka:wght@400;500;600;700&display=swap');
        
        :root {
          --shadow-soft: 0 12px 30px rgba(20,60,20,0.18);
        }

        .font-custom {
          font-family: 'Fredoka', 'Baloo 2', system-ui, -apple-system, sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
}
