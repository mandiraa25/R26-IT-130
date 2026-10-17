import { useTranslation } from "react-i18next";
import "./woodenNavControls.css";

const NAV_ART = "/images/workingMemory/shared/buttons/navigation";

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
