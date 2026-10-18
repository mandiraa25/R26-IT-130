import { UI, LEVEL_THEMES } from "./utils/memoryTheme";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getWorkingMemoryAccess } from "../../services/workingMemory/improveApi";
import { MemoryStage, MemoryNav, MemoryButton } from "./components/MemoryUI";
import LevelMenu from "./components/LevelMenu";

export default function ImprovementLevelsWM() {
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
  return <MemoryStage level={open ? selected : 2} className={open ? "lx-menu-page" : "lx-map"}>
    <MemoryNav title={open ? `${si ? "මට්ටම" : "Level"} ${selected}` : "Working Memory"} onBack={goBack} stars={totalStars} language={!open} map />
    {open ? <LevelMenu level={selected} progress={levelData?.subCategories || []} onSelect={key => navigate(`/improvement-activity-wm/${grade || profile?.grade}/${selected}/${key}`)} onLocked={() => setNotice(t("complete_previous_subcat"))} si={si} /> : <>
      <div className="lx-map-logo"><strong>Lexi<span>Land</span></strong><small>WORKING MEMORY</small></div>
      <h1 className="lx-map-title">{si ? "ඔබේ මට්ටම තෝරන්න" : "Choose your level"}</h1>
      <div className="lx-level-cards">{[1,2,3,4].map(n => {
        const locked = !eligible || n > (progress?.maxUnlockedLevel || 0);
        const completed = progress?.levelsProgress?.find(l => l.levelNumber === n)?.subCategories?.filter(s => s.isCompleted).length || 0;
        const theme = LEVEL_THEMES[n];
        return <button key={n} type="button" className={`lx-level-card ${locked ? "is-locked" : ""}`} style={{ "--card-accent": theme.accent, "--card-dark": theme.dark }} onClick={() => choose(n)} disabled={!progress} aria-label={`${si ? "මට්ටම" : "Level"} ${n}${locked ? ", locked" : ""}`}>
          <div className="lx-level-art" style={{ backgroundImage: `url('${UI}/backgrounds/bg-level${n}.webp')` }}><img className="lx-card-bunny" src={`${UI}/characters/bunny.webp`} alt="" /><img className="lx-card-bucket" src={`${UI}/buckets/bucket-level${n}.png`} alt="" /></div>
          <h2>{si ? "මට්ටම" : "Level"} {n}</h2><span className={`lx-level-cta ${locked ? "is-locked" : ""}`}>{locked ? (si ? "අගුළු දමා ඇත" : "Locked") : (si ? "ක්‍රීඩා කරමු" : "Play")}</span>{completed > 0 && <small className="lx-level-done">{completed} / 4</small>}
        </button>;
      })}</div>
    </>}
    <div className="lx-map-notice" role="status">{error ? <><p>{si ? "ප්‍රගතිය පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න." : "Unable to load progress. Please try again."}</p><MemoryButton onClick={() => setRetry(v => v + 1)}>{si ? "නැවත උත්සාහ කරන්න" : "Try Again"}</MemoryButton></> : !progress ? (si ? "පූරණය වෙමින්..." : "Loading your progress…") : notice || (open ? "" : si ? "ඊළඟ මට්ටම විවෘත කිරීමට මට්ටමක් සම්පූර්ණ කරන්න." : "Finish a level to unlock the next.")}{progress && !eligible && <MemoryButton onClick={() => navigate(`/working-memory/${grade}`)}>{t("go_to_identification")}</MemoryButton>}</div>
  </MemoryStage>;
}
