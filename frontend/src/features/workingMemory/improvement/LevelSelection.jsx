import { LEVEL_THEMES } from "../config/levelThemes";
import "../styles/popupMap.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getWorkingMemoryAccess } from "../services/improveApi";
import { MemoryStage, MemoryNav, MemoryButton } from "../shared/GameLayout";
import LevelMenu from "./GameMenu";

export default function LevelSelection() {
  const { grade } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("wm");
  const si = i18n.language?.startsWith("si");
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    // Warm the popup while the student chooses a level; do not wait for a click
    // to download its board and illustrations.
    for (const name of ["boards/level-map/popup-vine-board", "icons/games/thumb-pattern", "icons/games/thumb-words", "icons/games/thumb-instructions", "icons/games/thumb-numbers"]) {
      const image = new Image();
      image.src = `/images/workingMemory/shared/${name}.webp`;
      image.decode().catch(() => {});
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(false);
      try {
        const { profile: student, progress: loadedProgress } = await getWorkingMemoryAccess({ refresh: retry > 0 });
        if (cancelled) return;
        setProfile(student); setProgress(loadedProgress);
        sessionStorage.setItem("wm-profile-cache", JSON.stringify(student));
        sessionStorage.setItem("wm-progress-cache", JSON.stringify(loadedProgress));
      } catch { if (!cancelled) setError(true); }
    };
    void load(); return () => { cancelled = true; };
  }, [grade, retry]);
  const selected = Number(search.get("level"));
  const eligible = progress?.isIdentificationCompleted;
  const open = selected >= 1 && selected <= 4 && eligible && selected <= progress.maxUnlockedLevel;
  const totalStars = Math.max(0, Number(progress?.totalStars ?? progress?.totalCarrots) || 0);
  const levelData = progress?.levelsProgress?.find(item => item.levelNumber === selected);
  const goBack = () => open ? setSearch({}) : navigate("/dashboard");
  const choose = n => {
    if (!progress) return;
    if (!eligible) { setNotice(t("identification_required_msg")); return; }
    if (n > progress.maxUnlockedLevel) { setNotice(si ? `මට්ටම ${n - 1} සම්පූර්ණ කර මට්ටම ${n} විවෘත කරන්න!` : `Finish Level ${n - 1} to unlock Level ${n}!`); return; }
    setNotice(""); setSearch({ level: n });
  };
  return <MemoryStage level={2} className="lx-map lx-adventure-map" background="/images/workingMemory/shared/backgrounds/level-map/map-background.webp">
    <div className="lx-map-underlay" inert={open ? true : undefined}>
    <MemoryNav title={`${si ? "ශ්‍රේණිය" : "Grade"} ${grade || profile?.grade || ""}`} onBack={goBack} stars={totalStars} language map />
    <h1 className="lx-adventure-heading">{si ? "ක්‍රියාකාරී මතකය වැඩිදියුණු කිරීම" : "WORKING MEMORY IMPROVEMENT"}</h1>
    <h2 className="lx-adventure-subtitle">{si ? "ඔබේ වික්‍රමය තෝරන්න" : "Choose Your Adventure"}</h2>
    <div className="lx-level-cards">{[1,2,3,4].map(n => {
      const locked = !eligible || n > (progress?.maxUnlockedLevel || 0);
      const completed = progress?.levelsProgress?.find(l => l.levelNumber === n)?.subCategories?.filter(s => s.isCompleted).length || 0;
      const theme = LEVEL_THEMES[n];
      return <button key={n} type="button" className={`lx-level-card ${locked ? "is-locked" : ""}`} style={{ "--card-accent": theme.accent, "--card-dark": theme.dark }} onClick={() => choose(n)} disabled={!progress} aria-disabled={locked} aria-label={`${si ? "මට්ටම" : "Level"} ${n}${locked ? ", locked" : ""}`}>
        <img className="lx-adventure-scene" src={`/images/workingMemory/shared/backgrounds/level-map/level-scene-${n}.webp`} alt="" />
        <img className="lx-adventure-frame" src="/images/workingMemory/shared/boards/level-map/level-card-frame.webp" alt="" />
        <h2 className="lx-adventure-level">{si ? "මට්ටම" : "LEVEL"} {n}</h2>
        <span className="lx-adventure-progress"><img src="/images/workingMemory/shared/icons/star.svg" alt="" />{completed} / 4 {si ? "ක්‍රීඩා" : "Games"}</span>
        <span className={`lx-level-cta ${locked ? "is-locked" : ""}`}>{locked ? (si ? "අගුළු දමා ඇත" : "LOCKED") : <>{si ? "ක්‍රීඩා කරමු" : "PLAY"}<span className="lx-level-arrow" aria-hidden="true">›</span></>}</span>
      </button>;
    })}</div>
    </div>
    {open && <LevelMenu level={selected} progress={levelData?.subCategories || []} onSelect={key => navigate(`/improvement-activity-wm/${grade || profile?.grade}/${selected}/${key}`)} onLocked={() => setNotice(t("complete_previous_subcat"))} onClose={() => { setSearch({}); setNotice(""); }} notice={notice} si={si} />}
    <div className={`lx-map-notice ${open ? "is-popup-open" : ""}`} role="status">{error ? <><p>{si ? "ප්‍රගතිය පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න." : "Unable to load progress. Please try again."}</p><MemoryButton onClick={() => setRetry(v => v + 1)}>{si ? "නැවත උත්සාහ කරන්න" : "Try Again"}</MemoryButton></> : !progress ? (si ? "පූරණය වෙමින්..." : "Loading your progress…") : notice}{progress && !eligible && <MemoryButton onClick={() => navigate(`/working-memory/${grade}`)}>{t("go_to_identification")}</MemoryButton>}</div>
  </MemoryStage>;
}
