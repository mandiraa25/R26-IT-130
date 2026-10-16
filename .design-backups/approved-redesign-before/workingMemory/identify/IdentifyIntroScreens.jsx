import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight } from "lucide-react";
import "./identifyIntro.css";
import { ScreeningDemoCompleteScreen } from "./ScreeningUI";

const SHARED_ART = "/images/dashboard/activity-popup/";
const INTRO_ART = "/images/workingMemory/identify/intro/";
const IDENTIFY_BG = "/images/workingMemory/improve/reference-art/screening-background.png";

function IntroShell({ gradeLabel, t, children, onClose, kind, title, subtitle, helper, testId }) {
  const { i18n } = useTranslation();
  const closeRef = useRef(null);
  const panelRef = useRef(null);
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
    <div className="wm-intro-scene" style={{ backgroundImage: 'url("'+IDENTIFY_BG+'")' }}>
      <div className="wm-intro-dimmer" aria-hidden="true" />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="wm-intro-title" data-testid={testId} className={'wm-intro-panel wm-intro-panel--'+kind+(localized ? ' wm-intro-panel--si' : '')}>
        <img className="wm-intro-board" src={INTRO_ART+kind+'-board.png'} alt="" draggable="false" />
        <button ref={closeRef} type="button" className="wm-intro-close" onClick={onClose} aria-label={t("common:close_activity_popup")}><img src={SHARED_ART+'close-wooden.png'} alt="" /></button>
        <header className="wm-intro-header">
          <img className="wm-intro-bunny" src={SHARED_ART+'bunny-separated.png'} alt="" draggable="false" />
          <div className="wm-intro-heading">
            <span className="wm-intro-grade">{gradeLabel}</span>
            <h1 id="wm-intro-title">{title}</h1>
            <p className="wm-intro-subtitle">{subtitle}</p>
            {helper && <p className="wm-intro-helper">{helper}</p>}
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}

const PlayArrow = () => <svg className="wm-intro-play" viewBox="0 0 32 36" aria-hidden="true"><path d="M5 2 Q1 0 1 5 V31 Q1 36 5 34 L29 20 Q33 18 29 16 Z" fill="currentColor" /></svg>;

export const WelcomeScreen = ({ gradeLabel, t, onTryDemo, onStartTest, onBack }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onClose={onBack} kind="choice" title={t("intro_choice_title")} subtitle={t("intro_choice_subtitle")} helper={t("intro_choice_helper")} testId="wm-identify-welcome">
    <div className="wm-choice-cards">
      <article className="wm-choice-card wm-choice-card--demo">
        <img className="wm-choice-art" src={INTRO_ART+'controller.png'} alt="" />
        <h2>{t("intro_demo_title")}</h2>
        <p>{t("intro_demo_questions")}</p>
        <small>{t("intro_demo_unsaved")}</small>
        <button type="button" data-testid="wm-identify-try-demo" onClick={onTryDemo} className="wm-intro-action wm-intro-action--green"><span>{t("intro_demo_title")}</span><PlayArrow /></button>
      </article>
      <article className="wm-choice-card wm-choice-card--check">
        <img className="wm-choice-art" src={SHARED_ART+'magnifier-separated.png'} alt="" />
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

export const BriefingScreen = ({ gradeLabel, t, onReady, onBack, onClose = onBack, onListen }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onClose={onClose} kind="rules" title={t("intro_rules_title")} subtitle={t("intro_rules_subtitle")} testId="wm-identify-briefing">
    <button type="button" className="wm-intro-listen" onClick={onListen} aria-label={t("identify_listen_briefing")} title={t("identify_listen_briefing")}><img src="/images/phonologicalAwareness/Improvement/speaker.png" alt="" /></button>
    <ol className="wm-rules-steps">
      {steps.map((step, index) => <li key={step.image}>
        <span className="wm-rules-step-number">{index + 1}</span>
        <img src={INTRO_ART+step.image+'.png'} alt="" />
        <span className="wm-rules-step-label">{t(step.key)}</span>
        {index < steps.length - 1 && <ChevronRight className="wm-rules-chevron" aria-hidden="true" />}
      </li>)}
    </ol>
    <p className="wm-rules-hide-note">{t("intro_items_hide")}</p>
    <div className="wm-rules-activities">
      {activities.map(activity => <div key={activity.image} className={'wm-rules-activity wm-rules-activity--'+activity.image}><img src={INTRO_ART+activity.image+'.png'} alt="" /><p>{t(activity.key)}</p></div>)}
    </div>
    <div className="wm-rules-actions">
      <button type="button" onClick={onBack} className="wm-intro-action wm-intro-action--back"><ArrowLeft aria-hidden="true" /><span>{t("intro_back")}</span></button>
      <button type="button" data-testid="wm-identify-ready" onClick={onReady} className="wm-intro-action"><span>{t("intro_ready")}</span><PlayArrow /></button>
    </div>
  </IntroShell>
);

export const DemoCompleteScreen = props => <ScreeningDemoCompleteScreen {...props} />;
