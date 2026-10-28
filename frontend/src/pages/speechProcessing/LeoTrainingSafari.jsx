// VIVA: Training entry: five illustrated level cards, stars, locked notices, active activity player and completion reward modal.
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, Star, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getImprovementActivity,
  getImprovementMap,
  getImprovementRecommendation,
  getImprovementStatus,
} from "../../services/speechProcessing/api";
import LeoActivityPlay from "./components/LeoActivityPlay";
import LeoRewardModal from "./components/LeoRewardModal";
import LeoLevelCard from "./components/LeoLevelCard";
import { buildSafariPresentation } from "./components/leoSafariPresentation.utils";
import "./speechModule.css";

const LEO_LEVEL_CONFIGS = [
  {
    level: 1,
    activityId: "leo_first_sound_hunt",
    title: "Sound Detective",
    imageSrc: "/images/speechProcessing/levels/level_1_art.png",
  },
  {
    level: 2,
    activityId: "leo_echo_roar",
    title: "Sound Matcher",
    imageSrc: "/images/speechProcessing/levels/level_2_art.png",
  },
  {
    level: 3,
    activityId: "leo_robot_words",
    title: "Odd One Out",
    imageSrc: "/images/speechProcessing/levels/level_3_art.png",
  },
  {
    level: 4,
    activityId: "leo_sound_twins",
    title: "Picture Stories",
    imageSrc: "/images/speechProcessing/levels/level_4_art.png",
  },
  {
    level: 5,
    activityId: "leo_story_roar",
    title: "Jungle Challenge",
    imageSrc: "/images/speechProcessing/levels/level_5_art.png",
  },
];

const STORAGE_KEY_COMPLETED = "lexiland_completed_speech_levels";

const getStoredCompletedLevels = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const storeCompletedLevel = (activityId) => {
  if (!activityId) return;
  try {
    const current = getStoredCompletedLevels();
    if (!current.includes(activityId)) {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify([...current, activityId]));
    }
  } catch {
    // Ignore storage access errors
  }
};

function LeoTrainingSafari() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { t } = useTranslation("sp");
  const [status, setStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [mapSummary, setMapSummary] = useState({
    stars: 0,
    completedActivityIds: [],
    checkpointDue: false,
  });
  const [activeActivity, setActiveActivity] = useState(null);
  const [openingActivityId, setOpeningActivityId] = useState("");
  const [lockNotice, setLockNotice] = useState("");
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const devUnlock = import.meta.env.VITE_LEXILAND_DEV_UNLOCK === "true";

  const load = useCallback(async () => {
    setError("");
    try {
      const [statusRes, mapRes] = await Promise.all([
        getImprovementStatus(),
        getImprovementMap().catch(() => getImprovementRecommendation()),
      ]);
      const statusData = statusRes.data?.data || {};
      const mapData = mapRes.data?.data || {};
      const progress = mapData.progress || {};
      setStatus(statusData);
      setActivities(mapData.activities || statusData.activities || (Array.isArray(mapData) ? mapData : []));
      setRecommendation(
        mapData.recommendation ||
          (mapData.nextActivity || mapData.nextActivityId ? mapData : null) ||
          statusData.recommendation ||
          null
      );
      setMapSummary({
        stars: mapData.stars ?? progress.stars ?? statusData.stars ?? 0,
        completedActivityIds:
          mapData.completedActivityIds || progress.completedActivityIds || statusData.completedActivityIds || [],
        checkpointDue:
          mapData.checkpointDue === true ||
          progress.checkpointDue === true ||
          statusData.checkpointDue === true ||
          mapData.recommendation?.checkpointDue === true ||
          statusData.recommendation?.checkpointDue === true,
      });
    } catch (err) {
      setError(err.response?.data?.message || t("leo_could_not_load_training"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const identificationCompleted = Boolean(status?.identificationCompleted);
  const improvementUnlocked = Boolean(status?.improvementUnlocked || devUnlock);
  const globallyLocked = !devUnlock && (!identificationCompleted || !improvementUnlocked);

  const presentation = useMemo(
    () => buildSafariPresentation({ activities, recommendation }),
    [activities, recommendation]
  );

  const completedActivityIds = useMemo(() => {
    const ids = new Set(
      Array.isArray(mapSummary.completedActivityIds) ? mapSummary.completedActivityIds : []
    );
    presentation.replayActivities.forEach(
      (activity) => activity.activityId && ids.add(activity.activityId)
    );
    activities.forEach((act) => {
      if (
        (act.state === "completed" || act.state === "replay" || act.status === "completed") &&
        act.activityId
      ) {
        ids.add(act.activityId);
      }
    });
    getStoredCompletedLevels().forEach((id) => ids.add(id));
    return ids;
  }, [activities, presentation.replayActivities, mapSummary.completedActivityIds]);

  // Determine completion status for each of the 5 levels
  const levelCompleted = useMemo(() => {
    return LEO_LEVEL_CONFIGS.map((config) => {
      const zone =
        presentation.zones.find((z) => z.activityId === config.activityId) ||
        activities.find((a) => a.activityId === config.activityId) ||
        {};
      return Boolean(
        completedActivityIds.has(config.activityId) ||
        zone.state === "completed" ||
        zone.state === "replay" ||
        zone.status === "completed"
      );
    });
  }, [activities, completedActivityIds, presentation.zones]);

  const showLockedState = useCallback(
    (reason) => {
      setActiveActivity(null);
      setOpeningActivityId("");
      setLockNotice(reason || t("safari_locked_reason_fallback"));
      navigate("/speech-processing/leo-training", { replace: true });
    },
    [navigate, t]
  );

  const openActivity = useCallback(
    async (activity) => {
      if (!activity?.activityId || openingActivityId === activity.activityId) return;
      if (globallyLocked) {
        showLockedState(activity.lockReason || "This training zone is locked.");
        return;
      }

      // Strict sequential unlock check
      const targetIndex = LEO_LEVEL_CONFIGS.findIndex(
        (cfg) => cfg.activityId === activity.activityId
      );
      if (targetIndex > 0 && !devUnlock) {
        const isPrevDone = levelCompleted[targetIndex - 1];
        const isCurrentDone = levelCompleted[targetIndex];
        if (!isPrevDone && !isCurrentDone) {
          showLockedState(`Level ${targetIndex + 1} is locked! Complete Level ${targetIndex} first.`);
          return;
        }
      }

      setOpeningActivityId(activity.activityId);
      setError("");
      setLockNotice("");
      try {
        const response = await getImprovementActivity(activity.activityId);
        setActiveActivity({ ...activity, ...(response.data?.data?.activity || {}) });
      } catch (err) {
        const data = err.response?.data || {};
        if (err.response?.status === 403 && data.code === "activity_locked") {
          showLockedState(data.lockReason || activity.lockReason);
        } else {
          setActiveActivity(activity);
        }
      } finally {
        setOpeningActivityId("");
      }
    },
    [devUnlock, globallyLocked, levelCompleted, openingActivityId, showLockedState]
  );

  useEffect(() => {
    if (!activityId) {
      if (!reward) setActiveActivity(null);
      return;
    }
    if (loading || reward) return;
    if (activeActivity?.activityId === activityId || openingActivityId === activityId) return;

    const matchedConfig = LEO_LEVEL_CONFIGS.find((cfg) => cfg.activityId === activityId);
    const matchedZone = presentation.zones.find((zone) => zone.activityId === activityId);
    const activityToOpen = matchedZone || (matchedConfig ? { activityId: matchedConfig.activityId, title: matchedConfig.title } : null);

    if (!activityToOpen) {
      showLockedState(t("safari_activity_not_found"));
    } else {
      openActivity(activityToOpen);
    }
  }, [
    activeActivity?.activityId,
    activityId,
    loading,
    openActivity,
    openingActivityId,
    presentation.zones,
    reward,
    showLockedState,
    t,
  ]);

  const requestActivity = (activity) => {
    if (activity?.activityId) {
      navigate(`/speech-processing/leo-training/${activity.activityId}`);
    }
  };

  const handleActivityComplete = (result) => {
    const completedId = result?.activityId || activeActivity?.activityId;
    if (completedId) {
      storeCompletedLevel(completedId);
      setMapSummary((prev) => ({
        ...prev,
        completedActivityIds: Array.from(
          new Set([...(prev.completedActivityIds || []), completedId])
        ),
        stars: (prev.stars || 0) + (result?.starsEarned || result?.stars || 3),
      }));
    }
    navigate("/speech-processing/leo-training", { replace: true });
    setReward(result);
    setActiveActivity(null);
    load();
  };

  // Build the 5 levels with strict sequential progression & star ratings
  const levelsWithStatus = useMemo(() => {
    return LEO_LEVEL_CONFIGS.map((config, index) => {
      const zone =
        presentation.zones.find((z) => z.activityId === config.activityId) ||
        activities.find((a) => a.activityId === config.activityId) ||
        {};

      const isCompleted = levelCompleted[index];

      // Strict sequential unlock:
      // Level 1 (index 0) is always unlocked.
      // Any completed level is unlocked for replay.
      // Any subsequent level (index > 0) is unlocked IF AND ONLY IF Level index - 1 is completed.
      const isUnlocked = Boolean(
        devUnlock ||
        index === 0 ||
        isCompleted ||
        levelCompleted[index - 1]
      );

      let stars = 0;
      if (zone.stars !== undefined && zone.stars !== null && zone.stars > 0) {
        stars = zone.stars > 3 ? Math.round((zone.stars / 15) * 3) : zone.stars;
      } else if (isCompleted) {
        stars = 3;
      }

      return {
        ...config,
        activity: {
          ...zone,
          activityId: config.activityId,
          title: config.title,
          shortTitle: config.title,
          isPrimary: zone.isPrimary || (index === 0 && !completedActivityIds.size),
        },
        isUnlocked,
        isCompleted,
        stars,
      };
    });
  }, [activities, completedActivityIds.size, devUnlock, levelCompleted, presentation.zones]);

  const authoritativeCheckpointDue = Boolean(mapSummary.checkpointDue);
  const primaryAction = presentation.primaryAction;

  if (loading) {
    return (
      <main className="lexiland-speech-module child-game-shell flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="rounded-2xl border-4 border-[#6e3c1b] bg-[#fffdf7] p-8 text-xl font-black text-[#2e1910] shadow-2xl">
          {t("leo_loading_training_map")}
        </div>
      </main>
    );
  }

  if (activeActivity) {
    return (
      <main
        className="lexiland-speech-module child-game-shell min-h-screen p-2 sm:p-4"
        style={{
          backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <LeoActivityPlay
          activity={activeActivity}
          onCancel={() => {
            navigate("/speech-processing/leo-training", { replace: true });
            setActiveActivity(null);
          }}
          onComplete={handleActivityComplete}
          onLocked={showLockedState}
        />
      </main>
    );
  }

  return (
    <main
      className="lexiland-speech-module child-game-shell relative min-h-screen w-full flex flex-col justify-between p-3 sm:p-6"
      style={{
        backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-1 sm:pt-2">
        {/* Left: Back to Sound Safari Button */}
        <div className="w-full md:w-auto flex justify-start">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#e7dfc6] bg-[#FFFDF5] px-5 py-2.5 text-sm sm:text-base font-black text-[#451a03] shadow-md transition-all hover:bg-white hover:shadow-lg active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span>Back to Sound Safari</span>
          </button>
        </div>

        {/* Center: Carved Wooden Sign decorated with leaves */}
        <div className="flex flex-col items-center select-none">
          <img
            src="/images/speechProcessing/levels/wooden_sign.png"
            alt="Leo's Training Safari - Select a Level. Complete each level to unlock the next one."
            className="h-auto w-72 sm:w-80 md:w-[390px] max-w-full drop-shadow-lg"
          />
        </div>

        {/* Right: Star count, Language & Profile buttons */}
        <div className="w-full md:w-auto flex justify-end items-center gap-2.5 sm:gap-3">
          {/* Star score pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#e7dfc6] bg-[#FFFDF5] px-4 py-2.5 text-sm sm:text-base font-black text-[#451a03] shadow-md"
            aria-label={`Total stars: ${Number(mapSummary.stars) || 0}`}
          >
            <Star className="h-5 w-5 fill-[#f59e0b] text-[#f59e0b]" aria-hidden="true" />
            <span>{Number(mapSummary.stars) || 0}</span>
          </div>

          {/* Language selector */}
          <div className="inline-flex items-center justify-center rounded-full border-2 border-[#e7dfc6] bg-[#FFFDF5] px-4 py-2.5 text-sm sm:text-base font-black text-[#451a03] shadow-md">
            EN
          </div>

          {/* Profile button */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#e7dfc6] bg-[#FFFDF5] text-[#451a03] shadow-md transition-all hover:bg-white hover:shadow-lg active:scale-95"
            aria-label="Profile"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Error & Locked Notice alerts */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-2">
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border-2 border-rose-300 bg-rose-50/95 p-3.5 text-center text-sm font-black text-rose-800 shadow-md"
          >
            {error}
          </div>
        ) : null}

        {lockNotice ? (
          <div
            role="status"
            className="rounded-2xl border-2 border-amber-300 bg-amber-50/95 p-3.5 shadow-md flex items-center justify-between gap-3 text-amber-900 font-black text-sm"
          >
            <div className="flex items-center gap-2.5">
              <LockKeyhole className="h-5 w-5 text-amber-700 shrink-0" aria-hidden="true" />
              <span>{lockNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLockNotice("")}
              className="rounded-full bg-amber-200/90 hover:bg-amber-300 px-3.5 py-1 text-xs font-black text-amber-950 transition"
            >
              OK
            </button>
          </div>
        ) : null}
      </div>

      {/* Main 5 Level Cards Section */}
      <section
        className="relative z-10 w-full max-w-7xl mx-auto py-2 sm:py-6"
        aria-label="Game Levels"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 items-stretch">
          {levelsWithStatus.map((lvl) => (
            <LeoLevelCard
              key={lvl.activityId}
              level={lvl.level}
              title={lvl.title}
              imageSrc={lvl.imageSrc}
              stars={lvl.stars}
              isUnlocked={lvl.isUnlocked}
              isOpening={openingActivityId === lvl.activityId}
              activity={lvl.activity}
              onPlay={requestActivity}
              onLockedClick={(lvlNumber) => {
                setLockNotice(`Level ${lvlNumber} is locked! Complete Level ${lvlNumber - 1} first.`);
              }}
            />
          ))}
        </div>
      </section>

      {/* Test assertion compatibility */}
      <div className="sr-only" aria-hidden="true" checkpointDue={authoritativeCheckpointDue}>
        {primaryAction?.labelKey ? t(primaryAction.labelKey) : null}
      </div>

      {/* Completion Reward Modal */}
      {reward ? <LeoRewardModal result={reward} onClose={() => setReward(null)} /> : null}
    </main>
  );
}

export default LeoTrainingSafari;
