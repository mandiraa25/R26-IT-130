import { getPracticeRecommendations } from "../logic/recommendations.js";

const illustrations = { pattern: "pattern.png", words: "pictures.png", instructions: "instructions.png", numbers: "numbers.png" };
export default function RecommendedPractice({ responses, t, onPractice, disabled = false, limit = Infinity, illustrated = false }) {
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
