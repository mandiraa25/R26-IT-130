/*
 * FILE PURPOSE
 * Shared dashboard popup offering identification or improvement for the selected learning module.
 *
 * HOW IT CONNECTS
 * Dashboard supplies category, grade, onClose and onSelect. Choosing a Working Memory activity reports
 * a string to Dashboard; Dashboard owns the destination URL.
 * Direct source importers: ../../pages/common/Dashboard.jsx.
 * Local feature/style dependencies: activitySelectionModal.css.
 *
 * THINGS TO REMEMBER
 * designs.wm chooses bunny artwork and measured regions. regionStyle converts reference-image
 * coordinates to percentages. Refs/effect maintain keyboard focus and restore scrolling.
 * activitySelectionModal.css styles the popup.
 */

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./activitySelectionModal.css";

const assetRoot = '/images/dashboard/activity-popup/';
// Reference measurements keep each subject's original proportions and placement.
// VIVA: POPUP ART - each module selects its mascot, colors and measured layout regions here.
const designs = {
 wm: {mascot:'bunny',width:1422,height:1138,grade:[664,108,255,78],title:[500,210,755,100],subtitle:[650,329,460,60],animal:[100,50,420,360],left:[110,425,596,628],right:[741,425,595,628],close:[1254,56,106,106],accent:'#ff7100',dark:'#db4d00',tint:'#ffe3bc',ink:'#b83d00',card:'#fff8e8'},
 sp: {mascot:'lion',width:1178,height:912,grade:[588,90,212,64],title:[449,175,594,70],subtitle:[547,259,387,50],animal:[78,59,365,290],left:[81,351,500,508],right:[611,351,500,508],close:[1045,54,88,88],accent:'#9532cc',dark:'#7417ae',tint:'#ead8ee',ink:'#70139e',card:'#f4eaf6'},
 pa: {mascot:'parrot',width:1174,height:974,grade:[537,94,206,63],title:[492,180,474,137],subtitle:[566,334,322,46],animal:[70,60,390,318],left:[85,400,492,508],right:[608,400,492,508],close:[1036,58,90,90],accent:'#24a130',dark:'#087116',tint:'#def4c3',ink:'#195e19',card:'#fff8e8'},
 rp: {mascot:'zebra',width:1298,height:1036,grade:[604,103,225,70],title:[457,207,701,78],subtitle:[587,301,439,55],animal:[85,70,385,324],left:[103,400,541,562],right:[679,400,541,562],close:[1153,66,100,100],accent:'#0a8de4',dark:'#0054ac',tint:'#c9e5f5',ink:'#005b9d',card:'#eff7f9'},
};
// VIVA: POSITIONING - convert reference-image coordinates to percentages so the popup scales together.
function regionStyle([x,y,width,height],design,padding = 0) {
 return {left: ((x-padding)/design.width*100)+'%',top:((y-padding)/design.height*100)+'%',width:((width+padding*2)/design.width*100)+'%',height:((height+padding*2)/design.height*100)+'%'};
}

// VIVA: SHARED COMPONENT - Dashboard passes data and callbacks; this dialog reports the chosen activity.
export default function ActivitySelectionModal({ category, grade, onClose, onSelect }) {
  const { t, i18n } = useTranslation("common");
  /*
   * REMEMBER: dialogRef
   * The activity dialog DOM reference used to keep keyboard focus within the open popup.
   * Changing .current is immediate and does not cause a render.
   */
  const dialogRef = useRef(null);
  /*
   * REMEMBER: closeRef
   * The dialog close button DOM reference. The focus effect can focus it when the dialog opens.
   * Changing .current is immediate and does not cause a render.
   */
  const closeRef = useRef(null);
  const isReading = category.id === "rp";
  const design = designs[category.id];
  const localized = (i18n.resolvedLanguage || i18n.language).startsWith("si");


  // VIVA: ACCESSIBILITY - lock page scrolling, keep keyboard focus in the dialog and restore it on close.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const buttons = [...dialogRef.current.querySelectorAll("button:not(:disabled)")];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  // VIVA: BUTTONS - identification/improvement buttons call onSelect; Dashboard owns route navigation.
  return (
    <div className="activity-popup-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="activity-popup-title"
        aria-describedby={isReading ? "activity-popup-unavailable" : undefined}
        className={'activity-popup activity-popup--'+category.id+(localized ? ' activity-popup--localized' : '')}
        style={{ "--reference-ratio": design.width / design.height, "--accent": design.accent, "--accent-dark": design.dark, "--tint": design.tint, "--grade-ink": design.ink, "--card-tint": design.card }}
      >
        {/* VIVA: POPUP ARTWORK - common board plus the selected module's animal mascot. */}
        <img className="activity-popup__board" src={assetRoot+'board-separated.webp'} alt="" draggable="false" />
        <img className="activity-popup__mascot" src={assetRoot+design.mascot+'-separated.png'} style={regionStyle(design.animal, design)} alt="" draggable="false" />
        <span className="activity-popup__text activity-popup__grade" style={regionStyle(design.grade, design)}>{t("grade")} {grade}</span>
        <h2 id="activity-popup-title" className="activity-popup__text activity-popup__title" style={regionStyle(design.title, design)}>{category.title}</h2>
        <p className="activity-popup__text activity-popup__subtitle" style={regionStyle(design.subtitle, design)}>{t("choose_an_activity")}</p>
        <button ref={closeRef} type="button" onClick={onClose} style={regionStyle(design.close, design)} className="activity-popup__close" aria-label={t("close_activity_popup")}><img src={assetRoot+'close-wooden.png'} alt="" draggable="false" /></button>
        {/* VIVA: SCREENING CHOICE - the button reports identification to Dashboard's callback. */}
        <article className="activity-popup__card activity-popup__card--identify" style={regionStyle(design.left, design)}>
          <img className="activity-popup__illustration" src={assetRoot+'magnifier-separated.png'} alt="" draggable="false" />
          <h3>{t("check_my_skills")}</h3>
          <p>{t("identification")}</p>
          <button type="button" data-testid="activity-identification" disabled={isReading} onClick={() => onSelect("identification")} className="activity-popup__action" aria-label={t("begin_activity")+': '+t("identification")}>
            <span>{t("begin_activity")}</span><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M5 2 Q1 0 1 5 V31 Q1 36 5 34 L29 20 Q33 18 29 16 Z" fill="currentColor" /></svg>
          </button>
        </article>
        {/* VIVA: IMPROVEMENT CHOICE - the button reports improvement to Dashboard's callback. */}
        <article className="activity-popup__card activity-popup__card--improve" style={regionStyle(design.right, design)}>
          <img className="activity-popup__illustration" src={assetRoot+'puzzle-separated.png'} alt="" draggable="false" />
          <h3>{t("play_and_practise")}</h3>
          <p>{t("improvement")}</p>
          <button type="button" data-testid="activity-improvement" disabled={isReading} onClick={() => onSelect("improvement")} className="activity-popup__action" aria-label={t("play_activity")+': '+t("improvement")}>
            <span>{t("play_activity")}</span><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M5 2 Q1 0 1 5 V31 Q1 36 5 34 L29 20 Q33 18 29 16 Z" fill="currentColor" /></svg>
          </button>
        </article>
        {isReading && <p id="activity-popup-unavailable" className="activity-popup__availability" role="status">{t("coming_soon")}</p>}
      </section>
    </div>
  );
}
