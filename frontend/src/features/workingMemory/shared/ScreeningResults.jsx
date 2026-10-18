import { Home, ArrowRight } from "lucide-react";
import { ScreeningShell } from "../identification/ScreeningQuestions";
import { getPracticeRecommendations } from "../logic/progression";

export default function ScreeningResults({ metrics, responses, total, t, onHome, onPractice, saving, saveError, onRetry }) {
  const riskKey = `screen_risk_${metrics.riskLevel.toLowerCase()}`;
  return (
    <ScreeningShell t={t} total={total} completed responses={responses}>
      <div data-testid="wm-finished" className={`wm-screen__complete${saving || saveError ? " wm-screen__complete--notice" : ""}`}>
        <span className="wm-screen__category">{t("screen_complete_badge")}</span>
        <header><h1 id="wm-screen-title">{t("screen_complete_title")}</h1><p>{t("screen_complete_message")}</p></header>
        {saving && <div className="wm-screen__save-notice" role="status">{t("screen_saving")}</div>}
        {saveError && <div className="wm-screen__save-notice" role="alert"><span>{t("screen_save_error")}</span><button type="button" onClick={onRetry}>{t("screen_retry")}</button></div>}
        <div className="wm-screen__results">
          <section className="wm-screen__score"><h2>{t("screen_your_score")}</h2><strong data-testid="wm-final-score">{metrics.finalScore.toFixed(0)}</strong><small>{t("screen_score_unit")}</small><p>{t("screen_risk", { risk: t(riskKey) })}</p></section>
          <RecommendedPractice responses={responses} t={t} onPractice={onPractice} disabled={saving || saveError} limit={2} illustrated />
        </div>
        <div className="wm-screen__result-actions"><button type="button" data-testid="wm-back-home" onClick={onHome} className="wm-screen__option wm-screen__option--0"><Home aria-hidden="true" />{t("screen_go_home")}</button><button type="button" data-testid="wm-go-improvement" disabled={saving || saveError} onClick={() => onPractice()} className="wm-screen__option wm-screen__option--1"><span>{t("screen_go_improvement")}</span><ArrowRight aria-hidden="true" /></button></div>
      </div>
    </ScreeningShell>
  );
}

export function ScreeningDemoCompleteScreen({ t, onStartReal, onTryAgain, onBackHome }) {
  return <ScreeningShell t={t} completed>
    <div className="wm-screen__demo-complete" data-testid="wm-demo-finished">
      <img src="/images/workingMemory/identification/intro/controller.png" alt="" />
      <h1 id="wm-screen-title">{t("identify_demo_complete_title")}</h1>
      <p>{t("identify_demo_complete_msg")}</p>
      <button type="button" data-testid="wm-identify-start-real-after-demo" onClick={onStartReal} className="wm-screen__primary">{t("identify_start_real_test")}<ArrowRight aria-hidden="true" /></button>
      <div className="wm-screen__result-actions">
        <button type="button" onClick={onTryAgain} className="wm-screen__option wm-screen__option--0">{t("identify_try_demo_again")}</button>
        <button type="button" onClick={onBackHome} className="wm-screen__option wm-screen__option--1"><Home aria-hidden="true" />{t("screen_go_home")}</button>
      </div>
    </div>
  </ScreeningShell>;
}

// ---------------------------------------------------------------------------
// Recommended practice list (shown on the screening results screen)
// ---------------------------------------------------------------------------
const illustrations = { pattern: "pattern.png", words: "pictures.png", instructions: "instructions.png", numbers: "numbers.png" };
function RecommendedPractice({ responses, t, onPractice, disabled = false, limit = Infinity, illustrated = false }) {
  const recommendation = getPracticeRecommendations(responses);
  return <section className={`wm-recommendations${illustrated ? " wm-recommendations--illustrated" : ""}`} aria-labelledby="wm-recommendation-title">
    <h2 id="wm-recommendation-title">{t(illustrated ? "screen_next_practise" : "screen_recommended_practice")}</h2>
    {(!illustrated || !recommendation.categories.length) && <p>{t(!recommendation.hasData ? "screen_recommendation_unknown" : recommendation.categories.length ? "screen_practice_next" : "screen_practice_any")}</p>}
    {recommendation.categories.length > 0 && <ul>{recommendation.categories.slice(0, limit).map(item => <li key={item.key}>
      <button type="button" disabled={disabled} onClick={() => onPractice(item.key)} aria-label={t("screen_practise_category", { category: t(item.label) })}>
        {illustrated && <img src={`/images/workingMemory/identification/practice/${illustrations[item.key]}`} alt="" />}
        <span>{illustrated ? t(`screen_practice_label_${item.key}`) : t("screen_practise_category", { category: t(item.label) })}</span>
      </button>
    </li>)}</ul>}
  </section>;
}
