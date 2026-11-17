/*
 * FILE PURPOSE
 * Shared illustrated star counter and background-music toggle used in Working Memory headers.
 *
 * HOW IT CONNECTS
 * MemoryNav passes total stars, mute state and callbacks. Dashboard also reuses these controls.
 * woodenNavControls.css controls artwork and live text/icons.
 * Direct source importers: LanguageSwitcher.jsx, ../../features/workingMemory/shared/GameLayout.jsx,
 * ../../pages/common/Dashboard.jsx, ../../pages/phonologicalAwareness/ImprovementLevels.jsx,
 * ../../pages/phonologicalAwareness/PAQuizHeaderControls.jsx,
 * ../../pages/phonologicalAwareness/PAScoreboard.jsx,
 * ../../pages/phonologicalAwareness/PATutorial.jsx.
 * Local feature/style dependencies: woodenNavControls.css.
 *
 * THINGS TO REMEMBER
 * The counter displays the supplied number; it never awards stars. The music button invokes the
 * supplied callback; logic/audio.js owns Working Memory playback.
 */

import { useTranslation } from "react-i18next";
import "./woodenNavControls.css";

const NAV_ART = "/images/workingMemory/shared/buttons/navigation";

// VIVA: SHARED DISPLAY - format the supplied total; earning and saving stars happen in game/backend logic.
export function WoodenStarCounter({ value = 0, className = "", ariaLabel }) {
  const number = Number(value);
  const stars = Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;

  return (
    <div className={`wooden-nav-stars ${className}`} aria-label={ariaLabel || `${stars} stars`}>
      <img src="/images/workingMemory/shared/feedback/star.webp" alt="" draggable="false" />
      <strong>{stars}</strong>
    </div>
  );
}

// VIVA: SHARED BUTTON - display mute state and invoke the parent's onToggle audio handler.
export function WoodenMusicToggle({ muted, onToggle, className = "", ariaLabel, title }) {
  const { t } = useTranslation("common");
  const label = ariaLabel || t(muted ? "play_background_music" : "mute_background_music");

  return (
    <button
      type="button" className={`wooden-nav-music ${muted ? "is-muted" : ""} ${className}`}
      onClick={onToggle} aria-label={label} title={title || label} aria-pressed={!muted}
    >
      <img src={`${NAV_ART}/nav-music.png`} alt="" draggable="false" />
      {muted && <span className="wooden-nav-mute-slash" aria-hidden="true" />}
    </button>
  );
}

// VIVA: LANGUAGE BUTTONS - changing i18next language re-renders subscribed labels and localized screens.
export function WoodenLanguageSwitch({ className = "" }) {
  const { i18n } = useTranslation();
  const sinhala = (i18n.resolvedLanguage || i18n.language || "en").startsWith("si");

  return (
    <div
      className={`wooden-nav-language ${className}`} role="group"
      aria-label={sinhala ? "භාෂාව" : "Language"}
      style={{ backgroundImage: `url('${NAV_ART}/nav-lang-${sinhala ? "si" : "en"}.png')` }}
    >
      <button type="button" lang="en" aria-pressed={!sinhala} onClick={() => i18n.changeLanguage("en")}>EN</button>
      <button type="button" lang="si" aria-pressed={sinhala} onClick={() => i18n.changeLanguage("si")}>සිං</button>
    </div>
  );
}
