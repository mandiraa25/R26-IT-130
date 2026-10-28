/*
 * FILE PURPOSE
 * Reusable welcome dialog and instructions dialog shown before screening.
 *
 * HOW IT CONNECTS
 * ScreeningPage passes translated text and callbacks. IntroShell uses MemoryStage, MemoryNav and
 * SCREENING_ART; DemoCompleteScreen delegates to ScreeningResults.
 * Direct source importers: ScreeningPage.jsx.
 * Local feature/style dependencies: ../styles/identificationScreens.css,
 * ../shared/ScreeningResults.jsx, ../shared/GameLayout.jsx, ../config/levelThemes.js.
 *
 * THINGS TO REMEMBER
 * Props are inputs from the parent. onTryDemo starts practice; onStartTest opens rules; onReady begins
 * the real quiz. children inserts the different dialog contents. identificationScreens.css places the
 * board, bunny and buttons.
 */

// VIVA: Welcome choice cards and the rules popup share one illustrated shell.
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight } from "lucide-react";
import "../styles/identificationScreens.css";
import { ScreeningDemoCompleteScreen } from "../shared/ScreeningResults";
import { MemoryStage, MemoryNav } from "../shared/GameLayout";
import { SCREENING_ART } from "../config/levelThemes";

const SHARED_ART = "/images/workingMemory/shared/";
const INTRO_ART = "/images/workingMemory/identification/intro/";

/*
 * FUNCTION / COMPONENT: IntroShell
 * Reusable frame for both the welcome choice and rules dialog.
 * PROPS: kind selects choice-board.png or rules-board.png; gradeLabel/title/subtitle/helper
 * supply live copy; t translates control labels; children inserts welcome cards or rules;
 * onClose returns control to ScreeningPage and testId supports existing UI tests.
 * RETURNS: MemoryStage/MemoryNav, dimming layer, illustrated board, close button and header.
 * Refs/effect manage focus and keyboard navigation; identificationScreens.css positions it.
 */
function IntroShell({ gradeLabel, t, children, onClose, kind, title, subtitle, helper, testId }) {
  // VIVA: Welcome and briefing reuse this dialog shell. Callbacks from the
  // screening controller choose demo, real-test briefing, start or exit.
  const { i18n } = useTranslation();
  /*
   * REMEMBER: closeRef
   * The dialog close button DOM reference. The focus effect can focus it when the dialog opens.
   * Changing .current is immediate and does not cause a render.
   */
  const closeRef = useRef(null);
  /*
   * REMEMBER: panelRef
   * The dialog panel DOM reference. The keyboard handler finds its controls to keep Tab focus inside.
   * Changing .current is immediate and does not cause a render.
   */
  const panelRef = useRef(null);
  /*
   * EFFECT: After React renders
   * Manage DOM focus/keyboard/scroll behaviour while this screen/dialog is mounted, and restore it in
   * cleanup.
   * DEPENDENCIES: [onClose]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const buttons = [...panelRef.current.querySelectorAll("button:not(:disabled)")];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [onClose]);
  const localized = (i18n.resolvedLanguage || i18n.language).startsWith("si");
  return (
    /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <MemoryStage level={1} background={SCREENING_ART.background} className="lx-screening-intro">
    {/* VIVA: Intro navigation and the dimmed dialog background are here. */}
    <MemoryNav title={t("intro_choice_title")} onBack={onClose} />
    <div className="wm-intro-scene">
      <div className="wm-intro-dimmer" aria-hidden="true" />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="wm-intro-title" data-testid={testId} className={'wm-intro-panel wm-intro-panel--'+kind+(localized ? ' wm-intro-panel--si' : '')}>
        <img className="wm-intro-board" src={INTRO_ART+kind+'-board.png'} alt="" draggable="false" />
        <button ref={closeRef} type="button" className="wm-intro-close" onClick={onClose} aria-label={t("common:close_activity_popup")}><img src={SHARED_ART+'buttons/wm-close.png'} alt="" /></button>
        <header className="wm-intro-header">{/* UI SECTION: Dialog header: grade, live title and bunny illustration. */}
          <img className="wm-intro-bunny" src={SHARED_ART+'bunny/wm-intro-bunny.png'} alt="" draggable="false" />
          <div className="wm-intro-heading">
            <span className="wm-intro-grade">{gradeLabel}</span>
            <h1 id="wm-intro-title">{title}</h1>
            <p className="wm-intro-subtitle">{subtitle}</p>
            {helper && <p className="wm-intro-helper">{helper}</p>}
          </div>
        </header>
        {/* VIVA: Welcome cards or briefing rules are inserted by the caller. */}
        {children}
      </section>
    </div>
    </MemoryStage>
  );
}

/*
 * FUNCTION / COMPONENT: PlayArrow
 * Small decorative play icon reused by welcome/rules action buttons.
 * It has no props or state; the same SVG path is drawn each time.
 * The parent button owns clicking and its accessible label. wm-intro-play controls its appearance.
 */
const PlayArrow = () => <svg className="wm-intro-play" viewBox="0 0 32 36" aria-hidden="true"><path d="M5 2 Q1 0 1 5 V31 Q1 36 5 34 L29 20 Q33 18 29 16 Z" fill="currentColor" /></svg>;

/*
 * FUNCTION / COMPONENT: WelcomeScreen
 * React renders this component when its parent uses <WelcomeScreen /> or when its state/props change.
 * INPUT PROPS: { gradeLabel, t, onTryDemo, onStartTest, onBack }. These values/callbacks come from the
 * parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export const WelcomeScreen = ({ gradeLabel, t, onTryDemo, onStartTest, onBack }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onClose={onBack} kind="choice" title={t("intro_choice_title")} subtitle={t("intro_choice_subtitle")} helper={t("intro_choice_helper")} testId="wm-identify-welcome">
    {/* VIVA: Demo and real screening choice cards are here. */}
    <div className="wm-choice-cards">{/* UI SECTION: Welcome choices: unsaved demo or full screening instructions. */}
      <article className="wm-choice-card wm-choice-card--demo">
        <img className="wm-choice-art" src={INTRO_ART+'controller.png'} alt="" />
        <h2>{t("intro_demo_title")}</h2>
        <p>{t("intro_demo_questions")}</p>
        <small>{t("intro_demo_unsaved")}</small>
        <button type="button" data-testid="wm-identify-try-demo" onClick={onTryDemo} className="wm-intro-action wm-intro-action--green"><span>{t("intro_demo_title")}</span><PlayArrow /></button>
      </article>
      <article className="wm-choice-card wm-choice-card--check">
        <img className="wm-choice-art" src={SHARED_ART+'icons/wm-magnifier.png'} alt="" />
        <h2>{t("intro_choice_title")}</h2>
        <p>{t("intro_check_description")}</p>
        <button type="button" data-testid="wm-identify-start-test" onClick={onStartTest} className="wm-intro-action"><span>{t("identify_start_test")}</span><PlayArrow /></button>
      </article>
    </div>
    <button type="button" onClick={onBack} className="wm-intro-back-link"><ArrowLeft aria-hidden="true" />{t("intro_back")}</button>
  </IntroShell>
);

const steps = [{ image: "look", key: "intro_look" }, { image: "remember", key: "intro_remember" }, { image: "answer", key: "intro_answer" }];
const activities = [{ image: "pattern", key: "intro_rule_pattern" }, { image: "pictures", key: "intro_rule_pictures" }, { image: "instructions", key: "intro_rule_instructions" }, { image: "numbers", key: "intro_rule_numbers" }];

/*
 * FUNCTION / COMPONENT: BriefingScreen
 * React renders this component when its parent uses <BriefingScreen /> or when its state/props change.
 * INPUT PROPS: { gradeLabel, t, onReady, onBack, onClose = onBack, onListen }. These values/callbacks
 * come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export const BriefingScreen = ({ gradeLabel, t, onReady, onBack, onClose = onBack, onListen }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onClose={onClose} kind="rules" title={t("intro_rules_title")} subtitle={t("intro_rules_subtitle")} testId="wm-identify-briefing">
    {/* VIVA: Read-aloud control, three study steps and game explanations are here. */}
    <button type="button" className="wm-intro-listen" onClick={onListen} aria-label={t("identify_listen_briefing")} title={t("identify_listen_briefing")}><img src="/images/workingMemory/shared/icons/wm-speaker.png" alt="" /></button>
    <ol className="wm-rules-steps">{/* UI SECTION: Rules: the look, remember and answer steps before the real test. */}
      {steps.map((step, index) => <li key={step.image}>
        <span className="wm-rules-step-number">{index + 1}</span>
        <img src={INTRO_ART+step.image+'.png'} alt="" />
        <span className="wm-rules-step-label">{t(step.key)}</span>
        {index < steps.length - 1 && <ChevronRight className="wm-rules-chevron" aria-hidden="true" />}
      </li>)}
    </ol>
    <p className="wm-rules-hide-note">{t("intro_items_hide")}</p>
    <div className="wm-rules-activities">{/* UI SECTION: Rules: illustrated explanations of the four screening categories. */}
      {activities.map(activity => <div key={activity.image} className={'wm-rules-activity wm-rules-activity--'+activity.image}><img src={INTRO_ART+activity.image+'.png'} alt="" /><p>{t(activity.key)}</p></div>)}
    </div>
    {/* VIVA: Back and Ready control entry into the real test. */}
    <div className="wm-rules-actions">{/* UI SECTION: Rules actions: Back returns to welcome; Ready begins the real test. */}
      <button type="button" onClick={onBack} className="wm-intro-action wm-intro-action--back"><ArrowLeft aria-hidden="true" /><span>{t("intro_back")}</span></button>
      <button type="button" data-testid="wm-identify-ready" onClick={onReady} className="wm-intro-action"><span>{t("intro_ready")}</span><PlayArrow /></button>
    </div>
  </IntroShell>
);

/*
 * FUNCTION / COMPONENT: DemoCompleteScreen
 * React renders this component when its parent uses <DemoCompleteScreen /> or when its state/props
 * change.
 * INPUT PROPS: props. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export const DemoCompleteScreen = props => <ScreeningDemoCompleteScreen {...props} />;
