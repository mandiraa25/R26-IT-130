/*
 * FILE PURPOSE
 * Improvement level map page with four illustrated cards and a selected-level game menu.
 *
 * HOW IT CONNECTS
 * App.jsx opens /improvement-wm/:grade. improveApi supplies profile/progress. LEVEL_MAP_CARDS supplies
 * artwork; LevelMapCard displays it. GameMenu opens before the activity route.
 * Direct source importers: ../../../App.jsx.
 * Local feature/style dependencies: ../config/levelMapCards.js, ../styles/popupMap.css,
 * ../services/improveApi.js, ../shared/GameLayout.jsx, GameMenu.jsx, LevelMapCard.jsx.
 *
 * THINGS TO REMEMBER
 * The ?level= query remembers the open popup. The page checks screening completion and
 * maxUnlockedLevel before opening it. completed counts saved game completions, not stars. Map
 * background comes from MemoryStage; heading/menu styles are popupMap.css and card styles are
 * levelMapCards.css. The recommended query from screening is not read here.
 */

// VIVA: Level map and selected-level popup driven by saved improvement progress.
import { LEVEL_MAP_CARDS } from "../config/levelMapCards";
import "../styles/popupMap.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getWorkingMemoryAccess } from "../services/improveApi";
import { MemoryStage, MemoryNav, MemoryButton } from "../shared/GameLayout";
import LevelMenu from "./GameMenu";
import LevelMapCard from "./LevelMapCard";

/*
 * FUNCTION / COMPONENT: LevelSelection
 * React renders this component when its parent uses <LevelSelection /> or when its state/props change.
 * This component has no explicit props; its body shows the hooks or fixed values it uses.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function LevelSelection() {
  // VIVA: The map reads server progress. The ?level= query keeps the game popup
  // addressable and lets returning from a game reopen its level.
  const { grade } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("wm");
  const si = i18n.language?.startsWith("si");
  /*
   * REMEMBER: profile
   * Student identity, name and grade. An API/cache fills it; navigation and attempt saving read the
   * student ID/grade.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [profile, setProfile] = useState(null);
  /*
   * REMEMBER: progress
   * Saved level/game access from the server. Loading fills it; cards and menu derive their
   * lock/completion display from it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [progress, setProgress] = useState(null);
  /*
   * REMEMBER: error
   * Whether the map progress request failed. It selects the error message and retry control.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [error, setError] = useState(false);
  /*
   * REMEMBER: retry
   * Map retry counter. Incrementing it reruns the loading effect with refresh enabled.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [retry, setRetry] = useState(0);
  /*
   * REMEMBER: notice
   * Explanation for a locked level/game. Choosing an unavailable item sets it; closing or selecting an
   * allowed item clears it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [notice, setNotice] = useState("");
  /*
   * EFFECT: After React renders
   * Preload artwork before the child reaches its next screen; it changes download timing, not answers.
   * DEPENDENCIES: [] means mount once; a returned cleanup runs on unmount.
   */
  useEffect(() => {
    // Warm the popup while the student chooses a level; do not wait for a click
    // to download its board and illustrations.
    for (const name of ["boards/level-map/popup-vine-board", "icons/games/thumb-pattern", "icons/games/thumb-words", "icons/games/thumb-instructions", "icons/games/thumb-numbers"]) {
      const image = new Image();
      image.src = `/images/workingMemory/shared/${name}.webp`;
      image.decode().catch(() => {});
    }
  }, []);
  /*
   * EFFECT: After React renders
   * Load saved student access/progress and ignore responses after leaving the screen.
   * DEPENDENCIES: [grade, retry]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
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
  // VIVA: Recommendations never bypass these locks; identification and the
  // server's maxUnlockedLevel determine whether a popup may open.
  const open = selected >= 1 && selected <= 4 && eligible && selected <= progress.maxUnlockedLevel;
  const totalStars = Math.max(0, Number(progress?.totalStars ?? progress?.totalCarrots) || 0);
  const levelData = progress?.levelsProgress?.find(item => item.levelNumber === selected);
  /*
   * FUNCTION: goBack
   * Close the level popup or return to the home dashboard.
   * WHEN: The level-map Back callback calls this.
   * HOW / RESULT: An open popup clears the level query; otherwise navigate opens /dashboard.
   */
  const goBack = () => open ? setSearch({}) : navigate("/dashboard");
  /*
   * FUNCTION: choose
   * Open an available level menu or explain why it is locked.
   * WHEN: LevelMapCard calls this through onSelect.
   * HOW / RESULT: Reads screening completion/maxUnlockedLevel; updates notice or the ?level= URL query.
   * It does not unlock a game.
   */
  const choose = n => {
    // VIVA: Locked cards stay clickable so the child can read the reason;
    // choosing an unlocked card updates the URL rather than starting a game.
    if (!progress) return;
    if (!eligible) { setNotice(t("identification_required_msg")); return; }
    if (n > progress.maxUnlockedLevel) { setNotice(si ? `මට්ටම ${n - 1} සම්පූර්ණ කර මට්ටම ${n} විවෘත කරන්න!` : `Finish Level ${n - 1} to unlock Level ${n}!`); return; }
    setNotice(""); setSearch({ level: n });
  };
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <MemoryStage level={2} className="lx-map lx-adventure-map" background="/images/workingMemory/shared/backgrounds/level-map/map-background.webp">
    <div className="lx-map-underlay" inert={open ? true : undefined}>
    {/* VIVA: Grade navigation and adventure headings are here. */}
    <MemoryNav title={`${si ? "ශ්‍රේණිය" : "Grade"} ${grade || profile?.grade || ""}`} onBack={goBack} stars={totalStars} language map />
    <h1 className="lx-adventure-heading">{si ? "ක්‍රියාකාරී මතකය වැඩිදියුණු කිරීම" : "WORKING MEMORY IMPROVEMENT"}</h1>
    <h2 className="lx-adventure-subtitle">{si ? "ඔබේ වික්‍රමය තෝරන්න" : "Choose Your Adventure"}</h2>
    {/* VIVA: The four selectable level cards are here. */}
    <div className="lx-level-cards">{/* UI SECTION: Level map: one LevelMapCard for each authored artwork record; saved progress supplies locks and completion counts. */}{LEVEL_MAP_CARDS.map(({ level: n, artwork }) => {
      const locked = !eligible || n > (progress?.maxUnlockedLevel || 0);
      const completed = progress?.levelsProgress?.find(l => l.levelNumber === n)?.subCategories?.filter(s => s.isCompleted).length || 0;
      return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <LevelMapCard key={n} level={n} artwork={artwork} completed={completed} locked={locked} loading={!progress} si={si} onSelect={choose} />;
    })}</div>
    </div>
    {/* VIVA: The selected level opens its game menu above the map. */}
    {open && <LevelMenu level={selected} progress={levelData?.subCategories || []} onSelect={key => navigate(`/improvement-activity-wm/${grade || profile?.grade}/${selected}/${key}`)} onLocked={() => setNotice(t("complete_previous_subcat"))} onClose={() => { setSearch({}); setNotice(""); }} notice={notice} si={si} />}
    <div className={`lx-map-notice ${open ? "is-popup-open" : ""}`} role="status">{error ? <><p>{si ? "ප්‍රගතිය පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න." : "Unable to load progress. Please try again."}</p><MemoryButton onClick={() => setRetry(v => v + 1)}>{si ? "නැවත උත්සාහ කරන්න" : "Try Again"}</MemoryButton></> : !progress ? (si ? "පූරණය වෙමින්..." : "Loading your progress…") : notice}{progress && !eligible && <MemoryButton onClick={() => navigate(`/working-memory/${grade}`)}>{t("go_to_identification")}</MemoryButton>}</div>
  </MemoryStage>;
}
