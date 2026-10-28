// VIVA: OVERVIEW - PA attempt results: score, save/pass status and retry/continue navigation supplied by the controller.
import React from 'react';
import { ArrowRight, Leaf, LockKeyholeOpen, RotateCcw, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WoodenMusicToggle } from '../../components/common/WoodenNavControls';
import { PATutorialStage } from './PATutorial';
import './PAScoreboard.css';

const ART = '/images/phonological-awareness/scoreboard';

export default function PAScoreboard({ levelNumber, categoryTitle, score, totalQuestions, soundEnabled, onToggleSound, onBack, onRetry, onNext, isSubmitting, submitResult }) {
  const { t, i18n } = useTranslation('pa');
  const sinhala = i18n.language?.startsWith('si');
  const congratulatory = score >= Math.ceil(totalQuestions / 2);
  const passed = Boolean(submitResult?.isPassed);

  return (
    <div className="pa-scoreboard-screen" lang={i18n.language}>
      <img className="pa-scoreboard-background" src={`${ART}/jungle-background.png`} alt="" />
      <PATutorialStage active>
        <header className="pa-scoreboard-nav">
          <div className="pa-scoreboard-nav-left">
            <button type="button" className="pa-scoreboard-back" onClick={onBack} aria-label={sinhala ? 'ආපසු' : 'Go back'}>
              <img src="/images/workingMemory/shared/buttons/navigation/nav-back.png" alt="" draggable="false" />
            </button>
            <div className="pa-scoreboard-nav-title">{sinhala ? 'මට්ටම' : 'LEVEL'} {levelNumber} • {categoryTitle}</div>
          </div>
          <div className="pa-scoreboard-nav-right">
            <WoodenMusicToggle muted={!soundEnabled} onToggle={onToggleSound} ariaLabel={soundEnabled ? 'Mute sound' : 'Enable sound'} />
          </div>
        </header>
        {/* VIVA: Result board, mascot and attempt score. */}
        <main className="pa-scoreboard-board" aria-labelledby="pa-scoreboard-heading">
          <img className="pa-scoreboard-board-art" src={`${ART}/vine-scoreboard.png`} alt="" />
          <img className="pa-scoreboard-mascot" src={`${ART}/celebrating-parrot.png`} alt="" />
          <h1 id="pa-scoreboard-heading" className={congratulatory ? '' : 'is-encouraging'}>
            <Leaf aria-hidden="true" />
            <span>{congratulatory ? t('congratulations') : t('great_effort')}</span>
            <Leaf aria-hidden="true" />
          </h1>
          {/* VIVA: Correct answers out of the attempt question count. */}
          <section className="pa-scoreboard-score" aria-label={`${t('your_score')}: ${score} / ${totalQuestions}`}>
            <span>{t('your_score')}</span>
            <strong>{score} / {totalQuestions}</strong>
          </section>
          {/* VIVA: Saving and pass/practice feedback from the attempt result. */}
          <div className="pa-scoreboard-status-area" role="status" aria-live="polite">
            {isSubmitting ? (
              <p className="pa-scoreboard-status is-saving">{sinhala ? 'ප්‍රගතිය සුරකිමින්…' : 'Saving your progress...'}</p>
            ) : submitResult ? (
              <p className={`pa-scoreboard-status ${passed ? 'is-passed' : 'is-practice'}`}>
                {passed && <LockKeyholeOpen aria-hidden="true" />}
                <span>{passed ? t('unlocked_next').replace(/\s*🌟\s*$/u, '') : t('score_needed')}</span>
                {passed && <><Sun aria-hidden="true" /><Sun aria-hidden="true" /></>}
              </p>
            ) : null}
          </div>
          {/* VIVA: Retry, continue after passing, or return to the difficulty map. */}
          <div className={`pa-scoreboard-actions${passed ? '' : ' is-returning'}`}>
            <button type="button" className="pa-scoreboard-retry" onClick={onRetry}><RotateCcw aria-hidden="true" />{t('retry')}</button>
            <button type="button" className={`pa-scoreboard-continue${passed ? '' : ' is-returning'}`} onClick={passed ? onNext : onBack}>
              {!passed && <svg className="pa-scoreboard-home" viewBox="0 0 32 32" strokeLinejoin="round" aria-hidden="true"><path d="M4 14 16 4 28 14v15H4Z" /><path className="pa-scoreboard-home-door" d="M13 29V20h6v9Z" /></svg>}
              {passed ? t('next_activity') : t('back_to_levels')}
              {passed && <ArrowRight aria-hidden="true" />}
            </button>
          </div>
        </main>
      </PATutorialStage>
    </div>
  );
}
