import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Leaf, Trophy } from "lucide-react";
import { getStudentProfile } from "../../services/student/api";
import { getCachedProfile } from "../../utils/studentProfileCache";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import ActivitySelectionModal from "../../components/common/ActivitySelectionModal";
import { WoodenMusicToggle, WoodenStarCounter } from "../../components/common/WoodenNavControls";
import "./dashboard.css";

const UI_ASSETS = "/images/dashboard/reference-style/";

function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const backgroundVideoRef = useRef(null);
  const localized = (i18n.resolvedLanguage || i18n.language).startsWith("si");

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
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { id: "wm", title: t("working_memory"), description: t("wm_desc"), image: "working-memory-removebg-preview.png" },
    { id: "rp", title: t("reading_processing"), description: t("rp_desc"), image: "reading-processing-removebg-preview.png" },
    { id: "pa", title: t("phonological_awareness"), description: t("pa_desc"), image: "phonological-awareness-removebg-preview.png" },
    { id: "sp", title: t("speech_processing"), description: t("sp_desc"), image: "speech-processing-removebg-preview.png" },
  ];

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
    const path = type === "wm"
      ? `/working-memory/${currentGrade}?demo=true`
      : "/identificationActivities-pa/3?demo=true&ids=g3-si-4,g3-si-13";
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
    <div className={`student-home${localized ? " student-home--localized" : ""}`}>
      <video
        ref={backgroundVideoRef}
        className="student-home__video"
        autoPlay loop muted={!musicEnabled} playsInline
        poster="/images/bg.png" aria-hidden="true"
      >
        <source src="/vedios/bgvedio.mp4" type="video/mp4" />
      </video>
      <div className="student-home__backdrop" aria-hidden="true" />

      {showModal && selectedCategory && (
        <ActivitySelectionModal
          category={selectedCategory}
          grade={profile?.grade || getCachedProfile()?.grade || "2"}
          onClose={() => setShowModal(false)}
          onSelect={handleActivitySelect}
        />
      )}

      <header className="student-home__topbar">
        <button type="button" className="student-greeting" onClick={() => navigate("/profile")} aria-label={t("profile")}>
          <span className="student-greeting__avatar">
            <img
              src={profile?.profilePhoto || "/images/dashboard/activity-popup/bunny-separated.png"}
              alt="" className={profile?.profilePhoto ? "" : "student-greeting__mascot"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/dashboard/activity-popup/bunny-separated.png";
                event.currentTarget.className = "student-greeting__mascot";
              }}
            />
          </span>
          <span className="student-greeting__copy">
            <span className="student-greeting__name">
              {t("hi_name", { name: profile?.fullName?.split(" ")[0] || t("explorer") })}
              <Leaf aria-hidden="true" />
            </span>
            <span className="student-greeting__subtitle">{t("ready_for_adventure")}</span>
          </span>
        </button>

        <nav className="student-home__controls" aria-label={t("dashboard")}>
          <div className="student-home__utility-controls">
            <WoodenStarCounter
              className="dashboard-stars" value={profile?.totalStars ?? profile?.totalCarrots}
              ariaLabel={`${t("total_stars")}: ${Math.max(0, Number(profile?.totalStars ?? profile?.totalCarrots) || 0)}`}
            />
            <WoodenMusicToggle
              className="dashboard-music" muted={!musicEnabled}
              onToggle={() => setBackgroundMusic(!musicEnabled)}
              title={musicEnabled ? t("mute_music") : t("play_music")}
            />
            <LanguageSwitcher variant="woodland" className="dashboard-language" />
          </div>
          <button type="button" className="dashboard-wood-control dashboard-achievements" onClick={() => navigate("/reports")}>
            <Trophy aria-hidden="true" />
            <span>{t("my_achievements")}</span>
          </button>
        </nav>
      </header>

      <main className="student-home__main">
        <section className="student-home__intro" aria-labelledby="dashboard-title">
          <h1 id="dashboard-title" className="student-home__title">
            {t("welcome_back")} <span>{t("explorer_bang")}</span>
          </h1>
          <p className="student-home__subtitle">
            <Leaf aria-hidden="true" />
            <span>{t("choose_learning_adventure")}</span>
            <Leaf aria-hidden="true" />
          </p>
          <div className="student-home__flourish" aria-hidden="true"><span />✿<span /></div>
        </section>

        <div className="dashboard-cards">
          {cards.map((card) => (
            <button
              key={card.id} type="button" data-testid={`dashboard-card-${card.id}`}
              onClick={() => handleCategoryClick(card)} aria-label={card.title}
              className={`learning-card learning-card--${card.id}`}
            >
              <img src={`/images/dashboard/category-cards/${card.image}`} alt="" className="learning-card__image" draggable="false" />
              <span className="learning-card__text">
                <span className="learning-card__title">{card.title}</span>
                <span className="learning-card__description">{card.description}</span>
              </span>
              <img src={`${UI_ASSETS}badge-${card.id}.png`} alt="" className="learning-card__badge" draggable="false" />
            </button>
          ))}
        </div>

        <section className="student-home__demo" aria-labelledby="dashboard-demo-title">
          <h2 id="dashboard-demo-title">{t("try_demo")}</h2>
          <div className="student-home__demo-buttons">
            <button type="button" onClick={() => handleStartDemo("wm")} className="dashboard-demo dashboard-demo--wm">
              <span className="dashboard-demo__icon" aria-hidden="true">🧠</span>
              <span><span className="dashboard-demo__category">{t("working_memory")}</span><span className="dashboard-demo__title">{t("wm_demo")}</span></span>
            </button>
            <button type="button" onClick={() => handleStartDemo("pa")} className="dashboard-demo dashboard-demo--pa">
              <span className="dashboard-demo__icon" aria-hidden="true">🗣️</span>
              <span><span className="dashboard-demo__category">{t("phonological_awareness")}</span><span className="dashboard-demo__title">{t("pa_demo")}</span></span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
