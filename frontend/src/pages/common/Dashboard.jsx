import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../services/student/api";
import { getCachedProfile } from "../../utils/studentProfileCache";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const backgroundVideoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getStudentProfile({ refresh: true });
        if (!cancelled) setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      id: "wm",
      title: t("working_memory"),
      description: t("wm_desc"),
      image: "/images/dashboard/category-cards/working-memory-removebg-preview.png",
      accentColor: "#e8740c",
      descriptionColor: "#6b4423",
    },
    {
      id: "rp",
      title: t("reading_processing"),
      description: t("rp_desc"),
      image: "/images/dashboard/category-cards/reading-processing-removebg-preview.png",
      accentColor: "#2f7fd6",
      descriptionColor: "#6b4423",
    },
    {
      id: "pa",
      title: t("phonological_awareness"),
      description: t("pa_desc"),
      image: "/images/dashboard/category-cards/phonological-awareness-removebg-preview.png",
      accentColor: "#3d9b2f",
      descriptionColor: "#6b4423",
    },
    {
      id: "sp",
      title: t("speech_processing"),
      description: t("sp_desc"),
      image: "/images/dashboard/category-cards/speech-processing-removebg-preview.png",
      accentColor: "#8b4fd1",
      descriptionColor: "#6b4423",
    },
  ];

  const handleWorkingMemoryClick = () => {
    handleCategoryClick(cards.find((card) => card.id === "wm"));
  };

  const handleReadingProcessingClick = () => {
    handleCategoryClick(cards.find((card) => card.id === "rp"));
  };

  const handlePhonologicalAwarenessClick = () => {
    handleCategoryClick(cards.find((card) => card.id === "pa"));
  };

  const handleSpeechProcessingClick = () => {
    handleCategoryClick(cards.find((card) => card.id === "sp"));
  };

  const cardClickHandlers = {
    wm: handleWorkingMemoryClick,
    rp: handleReadingProcessingClick,
    pa: handlePhonologicalAwarenessClick,
    sp: handleSpeechProcessingClick,
  };

  const handleCategoryClick = (card) => {
    setSelectedCategory(card);
    setShowModal(true);
  };

  const handleActivitySelect = (type) => {
    const currentGrade = profile?.grade || getCachedProfile()?.grade || "2";

    if (type === "identification" && selectedCategory?.id === "pa") {
      navigate(`/identificationActivities-pa/${currentGrade}`);
    } else if (type === "identification" && selectedCategory?.id === "wm") {
      navigate(`/working-memory/${currentGrade}`);
    } else if (type === "improvement" && selectedCategory?.id === "pa") {
      navigate(`/improvement-pa/${currentGrade}`);
    } else if (type === "improvement" && selectedCategory?.id === "wm") {
      navigate(`/improvement-wm/${currentGrade}`);
    } else if (type === "identification" && selectedCategory?.id === "sp") {
      navigate("/speech-processing/leo-identification");
    } else if (type === "improvement" && selectedCategory?.id === "sp") {
      navigate("/speech-processing/leo-training");
    } else {
      console.log(`${type} clicked for ${selectedCategory?.title} - not implemented yet`);
    }
  };

  const handleStartDemo = (type) => {
    const currentGrade = profile?.grade || "2";
    const path =
      type === "wm"
        ? `/working-memory/${currentGrade}?demo=true`
        : `/identificationActivities-pa/3?demo=true&ids=g3-si-4,g3-si-13`;
    navigate(path);
  };

  const setBackgroundMusic = async (enabled) => {
    setMusicEnabled(enabled);
    const video = backgroundVideoRef.current;
    if (!video) return;
    video.muted = !enabled;
    if (enabled) {
      try {
        await video.play();
      } catch {
        setMusicEnabled(false);
        video.muted = true;
      }
    }
  };

  return (
    <div className="student-home font-custom relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto px-4 pb-5 pt-3 sm:px-7 lg:px-10">
      <video
        ref={backgroundVideoRef}
        className="fixed inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        loop
        muted={!musicEnabled}
        playsInline
        poster="/images/bg.png"
        aria-hidden="true"
      >
        <source src="/vedios/bgvedio.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 -z-30 bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/6 via-transparent to-black/10" />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-[3rem] border-8 border-indigo-50 bg-white p-10 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="mb-10 text-center">
              <span className="mb-4 inline-block rounded-full bg-indigo-100 px-6 py-1.5 text-sm font-black uppercase tracking-widest text-indigo-700">
                {t("grade")} {profile?.grade}
              </span>
              <h3 className="text-4xl font-black leading-tight text-gray-800">
                {selectedCategory?.title}
              </h3>
              <p className="mt-2 font-medium text-gray-500">{t("choose_activity")}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <button
                data-testid="activity-identification"
                onClick={() => handleActivitySelect("identification")}
                className="group relative flex flex-col items-center rounded-[2.5rem] border-b-8 border-sky-100 bg-sky-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-sky-600 hover:bg-sky-500"
              >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-inner transition-transform group-hover:scale-110">
                  🔍
                </div>
                <h4 className="mb-2 text-2xl font-black uppercase tracking-wide text-sky-800 group-hover:text-white">
                  {t("identification")}
                </h4>
                <p className="text-center text-sm font-bold text-sky-600/70 group-hover:text-sky-100">
                  {t("identification_desc")}
                </p>
              </button>

              <button
                onClick={() => handleActivitySelect("improvement")}
                className="group relative flex flex-col items-center rounded-[2.5rem] border-b-8 border-pink-100 bg-pink-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-pink-600 hover:bg-pink-500"
              >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-inner transition-transform group-hover:scale-110">
                  📈
                </div>
                <h4 className="mb-2 text-2xl font-black uppercase tracking-wide text-pink-800 group-hover:text-white">
                  {t("improvement")}
                </h4>
                <p className="text-center text-sm font-bold text-pink-600/70 group-hover:text-pink-100">
                  {t("improvement_desc")}
                </p>
                {selectedCategory?.id !== "pa" && selectedCategory?.id !== "wm" && selectedCategory?.id !== "sp" && (
                  <div className="absolute -right-4 -top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-white shadow-md">
                    {t("coming_soon")}
                  </div>
                )}
              </button>
            </div>

            <div className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">
              {t("step_to_success")}
            </div>
          </div>
        </div>
      )}

      <header className="student-home__topbar relative z-20 mx-auto flex w-full max-w-[1500px] shrink-0 items-start justify-between gap-3 sm:gap-4">
        <div className="student-greeting flex min-w-0 items-center rounded-[1.5rem] border-3 border-white/90 bg-[#fffdf2]/95 py-1.5 pl-1.5 pr-4 shadow-[0_5px_0_rgba(104,72,33,.28),0_10px_22px_rgba(36,72,52,.18)] sm:pr-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-3 border-orange-300 bg-emerald-100 text-2xl sm:h-14 sm:w-14">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              "🐰"
            )}
          </div>
          <div className="min-w-0 pl-2.5 sm:pl-3">
            <p className="truncate text-sm font-black text-[#352112] sm:text-xl">
              {t("hi_name", { name: profile?.fullName?.split(" ")[0] || t("explorer") })}{" "}
              <span aria-hidden="true">🌿</span>
            </p>
            <p className="truncate text-[10px] font-bold text-[#5b493a] sm:text-xs">
              {t("ready_for_adventure")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="rounded-full border-3 border-white/90 bg-[#fffdf2]/95 px-2 py-1 shadow-lg sm:px-3">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={() => setBackgroundMusic(!musicEnabled)}
            aria-pressed={musicEnabled}
            aria-label={musicEnabled ? t("mute_background_music") : t("play_background_music")}
            title={musicEnabled ? t("mute_music") : t("play_music")}
            className={`grid h-11 w-11 place-items-center rounded-full border-3 border-white text-lg shadow-[0_4px_0_rgba(111,61,10,.38)] transition-transform hover:scale-105 sm:h-12 sm:w-12 ${musicEnabled ? "bg-orange-500" : "bg-amber-400"}`}
          >
            {musicEnabled ? "🎵" : "🔇"}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-lime-600 shadow-[0_4px_0_rgba(42,91,13,.45)] transition-transform hover:scale-105 sm:h-12 sm:w-12"
            title={t("profile")}
          >
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={t("profile")} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto mb-2 mt-1 max-w-4xl shrink-0 text-center sm:mb-3">
        <h1 className="student-home__title text-[clamp(1.55rem,3.1vw,3rem)] font-black leading-[1.05] tracking-tight text-[#3b1f0e] drop-shadow-[0_2px_0_white]">
          {t("welcome_back")} <span className="text-orange-500">{t("explorer_bang")}</span>
        </h1>
        <p className="mx-auto mt-1.5 w-fit max-w-[95%] rounded-full border-2 border-[#e6d5a7] bg-[#fffbe8]/92 px-4 py-1 text-[10px] font-black leading-snug text-[#3f3529] shadow-sm sm:px-5 sm:text-sm">
          🌿 {t("choose_learning_adventure")} 🌿
        </p>
      </section>

      <div className="relative z-10 mx-auto flex w-full max-w-[min(96vw,1140px)] flex-1 items-center justify-center py-1">
        <div className="dashboard-cards grid w-full grid-cols-2 items-stretch gap-3 sm:gap-3.5 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              data-testid={`dashboard-card-${card.id}`}
              onClick={cardClickHandlers[card.id]}
              aria-label={card.title}
              className="learning-card group"
            >
              <img src={card.image} alt="" aria-hidden="true" className="learning-card__image" />

              <div className="learning-card__text">
                <span className="learning-card__title" style={{ color: card.accentColor }}>
                  {card.title}
                </span>
                <span className="learning-card__description" style={{ color: card.descriptionColor }}>
                  {card.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 justify-center pb-1 pt-1">
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="min-h-10 rounded-full border-3 border-[#ead7aa] bg-[#fffced] px-6 text-sm font-black text-[#3d2c1e] shadow-[0_4px_0_rgba(104,72,33,.3)] transition-transform hover:-translate-y-1 sm:min-h-11 sm:px-7 sm:text-base"
        >
          🏅 {t("my_achievements")} &nbsp; ❯
        </button>
      </div>

      <div className="student-home__demo relative z-10 mt-3 flex shrink-0 flex-col items-center pb-2 sm:mt-4">
        <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.28em] text-white/85 drop-shadow sm:text-xs">
          {t("try_demo")}
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => handleStartDemo("wm")}
            className="group relative flex items-center gap-2.5 rounded-[1.25rem] border-b-5 border-indigo-100 bg-indigo-50/95 px-5 py-2 text-indigo-600 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-800 hover:bg-indigo-600 hover:text-white active:translate-y-0 active:border-b-0 sm:gap-3 sm:px-6"
          >
            <span className="text-xl transition-transform group-hover:scale-110 sm:text-2xl">🧠</span>
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 sm:text-[10px]">
                {t("working_memory")}
              </p>
              <p className="text-sm font-black uppercase sm:text-base">{t("wm_demo")}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStartDemo("pa")}
            className="group relative flex items-center gap-2.5 rounded-[1.25rem] border-b-5 border-pink-100 bg-pink-50/95 px-5 py-2 text-pink-600 shadow-lg transition-all hover:-translate-y-1 hover:border-pink-800 hover:bg-pink-600 hover:text-white active:translate-y-0 active:border-b-0 sm:gap-3 sm:px-6"
          >
            <span className="text-xl transition-transform group-hover:scale-110 sm:text-2xl">🗣️</span>
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 sm:text-[10px]">
                {t("phonological_awareness")}
              </p>
              <p className="text-sm font-black uppercase sm:text-base">{t("pa_demo")}</p>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .dashboard-cards {
          grid-auto-rows: 1fr;
        }

        .learning-card {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          transition: transform 180ms ease, filter 180ms ease;
        }

        .learning-card:hover {
          transform: translateY(-5px) scale(1.01);
        }

        .learning-card:active {
          transform: translateY(-1px) scale(0.99);
        }

        .learning-card__image {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
        }

        .learning-card__text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 32%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          padding: 0.15rem 0.55rem 0.5rem;
          text-align: center;
          pointer-events: none;
        }

        .learning-card__title {
          display: block;
          width: 100%;
          max-width: 94%;
          font-size: clamp(0.7rem, 1.05vw, 0.95rem);
          font-weight: 900;
          line-height: 1.15;
        }

        .learning-card__description {
          display: block;
          width: 100%;
          max-width: 92%;
          font-size: clamp(0.52rem, 0.78vw, 0.68rem);
          font-weight: 700;
          line-height: 1.25;
        }

        @media (max-width: 640px) {
          .learning-card__text {
            height: 33%;
            padding-bottom: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
