import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../services/student/api";
import { getStudentProgress } from "../../services/phonologicalAwareness/improveApi";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

export default function ImprovementLevels() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("pa");

  const [profile, setProfile] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subcategory modal state
  const [showSubCatModal, setShowSubCatModal] = useState(false);
  const [selectedLevelNum, setSelectedLevelNum] = useState(null);

  // Locked modal state
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const clickSound = useRef(new Audio("/click.mp3"));

  useEffect(() => {
    fetchProfileAndProgress();
  }, []);

  const fetchProfileAndProgress = async () => {
    try {
      const profileRes = await getStudentProfile();
      setProfile(profileRes.data);

      const studentId = profileRes.data?._id || localStorage.getItem("studentId");
      if (studentId) {
        const progRes = await getStudentProgress(studentId);
        if (progRes?.success && progRes?.data) {
          setProgressData(progRes.data);
        }
      }
    } catch (err) {
      console.error("Error fetching student profile/progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const playClick = () => {
    if (soundEnabled) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch((e) => console.log("Audio play blocked", e));
    }
  };

  const handleBack = () => {
    playClick();
    setTimeout(() => {
      navigate("/dashboard");
    }, 200);
  };

  const handleLevelClick = (levelNum, isLocked) => {
    playClick();
    if (isLocked) {
      setShowLockedModal(true);
    } else {
      setSelectedLevelNum(levelNum);
      setShowSubCatModal(true);
    }
  };

  const handleStartSubCategory = (subCategoryKey) => {
    playClick();
    const currentGrade = grade || profile?.grade || "2";
    navigate(`/improvement-activity-pa/${currentGrade}/${selectedLevelNum}/${subCategoryKey}`);
  };

  const maxUnlocked = progressData?.maxUnlockedLevel || 1;

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
      color: "bg-emerald-400 border-emerald-500 text-emerald-800",
      buttonColor: "bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white",
      animalImage: "/images/phonologicalAwareness/cat.png",
      emoji: "🦁",
    },
    {
      num: 2,
      titleKey: "level_2_title",
      descKey: "level_2_desc",
      color: "bg-amber-400 border-amber-500 text-amber-800",
      buttonColor: "bg-amber-500 hover:bg-amber-600 border-amber-700 text-white",
      animalImage: "/images/phonologicalAwareness/pig.png",
      emoji: "🐯",
    },
    {
      num: 3,
      titleKey: "level_3_title",
      descKey: "level_3_desc",
      color: "bg-sky-400 border-sky-500 text-sky-800",
      buttonColor: "bg-sky-500 hover:bg-sky-600 border-sky-700 text-white",
      animalImage: "/images/phonologicalAwareness/dog.png",
      emoji: "🦓",
    },
    {
      num: 4,
      titleKey: "level_4_title",
      descKey: "level_4_desc",
      color: "bg-purple-400 border-purple-500 text-purple-800",
      buttonColor: "bg-purple-500 hover:bg-purple-600 border-purple-700 text-white",
      animalImage: "/images/phonologicalAwareness/van.png",
      emoji: "🦜",
    },
  ];

  const subCategoriesMeta = [
    { key: "phonological_awareness", icon: "🎵", color: "bg-amber-50 border-amber-200" },
    { key: "visual_processing", icon: "👁️", color: "bg-purple-50 border-purple-200" },
    { key: "orthographic_skills", icon: "✍️", color: "bg-sky-50 border-sky-200" },
    { key: "segmentation_counting", icon: "🔢", color: "bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden font-sans select-none flex flex-col">
      {/* 🌄 Jungle Background */}
      <img
        src="/images/phonologicalAwareness/Improvement/bg.png"
        alt="Jungle Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* 🌟 Header Section */}
      <header className="relative z-10 w-full px-4 py-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Back Button & Grade Tag */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handleBack}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 border-b-6 border-emerald-700 text-white flex items-center justify-center text-3xl font-black transition-all transform active:translate-y-1 active:border-b-0 shadow-lg cursor-pointer"
            title="Go Back"
          >
            ←
          </button>

          <div className="bg-yellow-400 border-b-6 border-yellow-600 px-6 py-2 rounded-2xl shadow-lg flex items-center gap-2">
            <span className="text-yellow-900 text-xl font-black uppercase tracking-wider">
              {t("common:grade")} {grade || profile?.grade || "1-3"}
            </span>
          </div>
        </div>

        {/* Center: Wood-panel Title */}
        <div className="relative transform hover:scale-105 transition-transform duration-300">
          <div className="bg-amber-950 border-4 border-amber-800 px-8 py-3 rounded-3xl shadow-2xl relative flex items-center justify-center">
            <span className="absolute -top-3 left-4 text-2xl">🍃</span>
            <span className="absolute -top-3 right-4 text-2xl">🍃</span>
            <h1 className="text-2xl md:text-3xl font-black text-amber-50 uppercase tracking-wide text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {t("improvement_path")}
            </h1>
          </div>
        </div>

        {/* Right: Sound, Lang, Profile */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playClick();
            }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-b-6 active:translate-y-1 active:border-b-0 transition-all ${soundEnabled
              ? "bg-purple-500 border-purple-700 hover:bg-purple-600 text-white"
              : "bg-gray-400 border-gray-600 hover:bg-gray-500 text-gray-200"
              }`}
            title="Toggle Sound"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-md">
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl border-b-4 border-slate-200 shadow-md">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">👦</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {t("common:hello")}
              </span>
              <span className="text-sm font-black text-slate-700 leading-tight">
                {profile?.fullName?.split(" ")[0] || "Explorer"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 🗺️ Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col justify-center items-center">
        {/* Banner if identification quiz not completed yet */}
        {progressData && !progressData.isIdentificationCompleted && (
          <div className="w-full max-w-4xl bg-amber-500/90 backdrop-blur-md border-4 border-amber-300 text-white p-4 rounded-3xl shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💡</span>
              <p className="font-bold text-base md:text-lg">
                {t("need_identification_quiz")}
              </p>
            </div>
            <button
              onClick={() => {
                playClick();
                // navigate(`/identificationActivities-pa/${grade || profile?.grade || "2"}`);
                navigate("/dashboard");
              }}
              className="bg-white hover:bg-amber-100 text-amber-900 font-black px-6 py-2.5 rounded-2xl shadow-md border-b-4 border-amber-200 transition-all uppercase tracking-wider shrink-0"
            >
              {t("go_to_identification")} ➔
            </button>
          </div>
        )}

        {/* Title Tag */}
        <p className="text-white text-xl md:text-2xl font-black text-center mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase tracking-wide">
          {t("select_level")}
        </p>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl">
          {levelsConfig.map((lvl) => {
            const isLocked = lvl.num > maxUnlocked;
            const stats = getLevelStats(lvl.num);

            return (
              <div
                key={lvl.num}
                onClick={() => handleLevelClick(lvl.num, isLocked)}
                className={`group relative bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-2xl border-b-[8px] border-slate-200 ${isLocked
                  ? "opacity-80 grayscale-[20%] border-gray-300 cursor-pointer"
                  : "cursor-pointer transform hover:-translate-y-3 hover:shadow-indigo-300/40 active:translate-y-0 active:border-b-0 hover:border-indigo-400 transition-all duration-300"
                  } flex flex-col items-center justify-between text-center overflow-hidden min-h-[360px]`}
              >
                {/* Level Tag */}
                <div
                  className={`px-6 py-1.5 rounded-full font-black text-sm uppercase tracking-widest text-white border-b-4 ${isLocked ? "bg-gray-400 border-gray-500" : lvl.color
                    } mb-4 shadow-md`}
                >
                  {t(lvl.titleKey)}
                </div>

                {/* Animal Graphic */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  {isLocked ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center shadow-inner relative">
                      <span className="text-6xl grayscale">🔒</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={lvl.animalImage}
                        alt="Level Animal"
                        className="w-20 h-20 object-contain drop-shadow-md"
                      />
                      <span className="absolute -bottom-2 -right-2 text-3xl animate-bounce">
                        {lvl.emoji}
                      </span>
                    </div>
                  )}
                </div>

                {/* Level Description */}
                <div className="flex-1 flex flex-col justify-center mb-6">
                  <p className="text-slate-700 font-black text-lg leading-snug px-2">
                    {t(lvl.descKey)}
                  </p>
                </div>

                {/* Bottom Stars & Play Button */}
                <div className="w-full">
                  {isLocked ? (
                    <div className="bg-gray-200 text-gray-500 font-black py-3 rounded-2xl flex items-center justify-center gap-2 border-b-4 border-gray-300 uppercase tracking-widest">
                      🔒 {t("locked")}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="bg-yellow-100 border-2 border-yellow-200 text-yellow-800 font-black py-2 rounded-2xl flex items-center justify-center gap-2 shadow-inner text-sm">
                        ⭐ {stats.stars} {t("subcategories")}
                      </div>
                      <button
                        className={`w-full py-3 rounded-2xl font-black text-lg uppercase tracking-wider border-b-6 transform transition-all active:translate-y-1 active:border-b-0 shadow-md ${lvl.buttonColor}`}
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
      </main>

      {/* 📂 SUB-CATEGORIES MODAL (Slightly Reduced Dimensions, 100% Uncropped) */}
      {showSubCatModal && selectedLevelNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          {/* Main Frame Wrapper */}
          <div className="relative max-w-3xl sm:max-w-[820px] w-full flex items-center justify-center animate-scaleIn">

            {/* 🖼️ The 100% Uncropped Frame Image */}
            <img
              src="/images/phonologicalAwareness/Improvement/popup_frame_bg.png"
              alt="Popup Frame"
              className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)] pointer-events-none select-none max-h-[84vh]"
            />

            {/* 🦜 Top-Left Parrot Mascot */}
            <img
              src="/images/phonologicalAwareness/Improvement/parrot.png"
              alt="Parrot Mascot"
              className="absolute -top-[5%] -left-[2%] z-40 w-[18%] max-w-[150px] min-w-[85px] h-auto drop-shadow-2xl pointer-events-none transform -rotate-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";
              }}
            />

            {/* 🪵 Top-Center Wooden Level Sign badge */}
            <div className="absolute -top-[3.5%] left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none w-[26%] max-w-[200px] min-w-[120px]">
              <div className="relative flex items-center justify-center w-full">
                <img
                  src="/images/phonologicalAwareness/Improvement/level_badge_wood.png"
                  alt="Level Sign"
                  className="w-full h-auto object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[#3B1700] font-black text-[11px] sm:text-base md:text-lg tracking-widest uppercase pb-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                  LEVEL {selectedLevelNum}
                </span>
              </div>
            </div>

            {/* ✕ Top-Right Wooden Close Button */}
            <button
              onClick={() => {
                playClick();
                setShowSubCatModal(false);
              }}
              className="absolute top-[1.5%] right-[1.5%] z-40 w-[7%] max-w-[54px] min-w-[34px] aspect-square transition-transform hover:scale-110 active:scale-95 cursor-pointer bg-transparent border-0 p-0"
              title="Close"
            >
              <img
                src="/images/phonologicalAwareness/Improvement/wooden_close_btn.png"
                alt="Close"
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            </button>

            {/* 2x2 Sub-Categories List Grid Overlaid inside the Parchment Area */}
            <div className="absolute inset-0 pt-[15%] pb-[13%] px-[10%] flex flex-col justify-center pointer-events-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 w-full h-full items-center overflow-hidden">
                {subCategoriesMeta.map((meta, index) => {
                  const lvlProg = progressData?.levelsProgress?.find(
                    (l) => l.levelNumber === selectedLevelNum
                  );

                  const subCatData = lvlProg?.subCategories?.find(
                    (s) => s.subCategoryKey === meta.key
                  );

                  const isSubUnlocked = subCatData ? subCatData.isUnlocked : index === 0;
                  const isCompleted = subCatData?.isCompleted || false;
                  const bestScore = subCatData?.bestScore || 0;

                  // Color themes & asset images matching Image 2
                  const themeMap = {
                    phonological_awareness: {
                      border: "border-[#E5A024]",
                      bg: "bg-gradient-to-b from-[#FFFDF5] to-[#FFF3D6]",
                      bgImage: "/images/phonologicalAwareness/Improvement/card_bg_amber.png",
                      title: "text-[#3B1F04]",
                      iconBg: "bg-[#FFF0CB] border-2 border-[#F7D37E]",
                    },
                    visual_processing: {
                      border: "border-[#A855F7]",
                      bg: "bg-gradient-to-b from-[#FDF4FF] to-[#F3E8FF]",
                      bgImage: "/images/phonologicalAwareness/Improvement/card_bg_purple.png",
                      title: "text-[#3B0764]",
                      iconBg: "bg-[#F3E8FF] border-2 border-[#D8B4FE]",
                    },
                    orthographic_skills: {
                      border: "border-[#0284C7]",
                      bg: "bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE]",
                      bgImage: "/images/phonologicalAwareness/Improvement/card_bg_blue.png",
                      title: "text-[#075985]",
                      iconBg: "bg-[#E0F2FE] border-2 border-[#7DD3FC]",
                    },
                    segmentation_counting: {
                      border: "border-[#22C55E]",
                      bg: "bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7]",
                      bgImage: "/images/phonologicalAwareness/Improvement/card_bg_green.png",
                      title: "text-[#14532D]",
                      iconBg: "bg-[#DCFCE7] border-2 border-[#86EFAC]",
                    },
                  };

                  const cardTheme = themeMap[meta.key] || themeMap.phonological_awareness;

                  return (
                    <div
                      key={meta.key}
                      onClick={() => {
                        if (isSubUnlocked) {
                          handleStartSubCategory(meta.key);
                        } else {
                          playClick();
                        }
                      }}
                      className={`relative px-5 py-3 sm:px-8 sm:py-4 text-center flex flex-col justify-between transition-all duration-300 min-h-[125px] sm:min-h-[155px] bg-contain bg-center bg-no-repeat ${isSubUnlocked
                          ? "hover:scale-[1.03] cursor-pointer"
                          : "grayscale opacity-75 cursor-not-allowed"
                        }`}
                      style={{
                        backgroundImage: `url('${cardTheme.bgImage}')`,
                      }}
                    >
                      {/* Top Row: Icon & Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-inner ${cardTheme.iconBg}`}>
                          <span className="text-lg sm:text-2xl">{meta.icon}</span>
                        </div>

                        {isCompleted ? (
                          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-300 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1">
                            ✓ {i18n.language?.startsWith("si") ? "සම්පූර්ණයි!" : t("subcat_completed")}
                          </span>
                        ) : isSubUnlocked ? (
                          <span className="bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-300 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                            Ready
                          </span>
                        ) : (
                          <span className="bg-gray-400 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                            🔒 {t("locked")}
                          </span>
                        )}
                      </div>

                      {/* Center Row: Sub-category Title (Positioned Higher in Parchment Space) */}
                      <div className="z-10 flex-1 flex flex-col justify-start items-center text-center pt-0.5 pb-2 px-3 -mt-1 sm:-mt-2">
                        <h4 className={`font-black text-xs sm:text-base md:text-lg leading-snug text-center w-full ${cardTheme.title}`}>
                          {t(`subcat_${meta.key}`)}
                        </h4>

                        {/* Points line commented out as requested */}
                        {/* {isCompleted ? (
                          <p className="text-emerald-900 font-extrabold text-[10px] sm:text-xs flex items-center gap-1">
                            <span>⭐</span> Best Score: {bestScore} pts
                          </p>
                        ) : isSubUnlocked ? (
                          <p className="text-slate-700 font-bold text-[10px] sm:text-xs">
                            Click to start activity!
                          </p>
                        ) : (
                          <p className="text-gray-500 font-bold text-[10px] sm:text-xs">
                            {t("complete_previous_subcat")}
                          </p>
                        )} */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔒 LOCKED MODAL */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl relative border-8 border-indigo-50 text-center animate-scaleIn">
            <button
              onClick={() => {
                playClick();
                setShowLockedModal(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all font-bold cursor-pointer"
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
                playClick();
                setShowLockedModal(false);
              }}
              className="bg-indigo-500 hover:bg-indigo-600 border-b-6 border-indigo-700 text-white font-black text-xl px-10 py-3 rounded-2xl transition-all shadow-lg cursor-pointer"
            >
              OK!
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
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
