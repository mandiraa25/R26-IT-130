import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WoodenMusicToggle, WoodenStarCounter } from '../../components/common/WoodenNavControls';
import './PATutorial.css';

const ART = '/images/phonologicalAwareness/tutorial';

export function PATutorialStage({ active, children }) {
  const stage = useRef(null);
  useLayoutEffect(() => {
    if (!active) return;
    const fit = () => {
      if (stage.current) stage.current.style.transform = `translate(-50%, -50%) scale(${Math.min(window.innerWidth / 1600, window.innerHeight / 900)})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [active]);
  return active ? <div className="pa-tutorial-stage" ref={stage}>{children}</div> : <>{children}</>;
}

export function PATutorialNavigation({ levelNumber, score, soundEnabled, onToggleSound, onBack }) {
  const { i18n } = useTranslation('pa');
  const sinhala = i18n.language?.startsWith('si');
  return (
    <header className="pa-tutorial-nav">
      <div className="pa-tutorial-nav-group">
        <button type="button" className="pa-tutorial-back" onClick={onBack} aria-label={sinhala ? 'ආපසු' : 'Go back'}><img src="/images/workingMemory/shared/buttons/navigation/nav-back.png" alt="" draggable="false" /></button>
        <div className="pa-tutorial-level">{sinhala ? `මට්ටම ${levelNumber} • ශබ්ද පිළිබඳ දැනුවත්භාවය` : `LEVEL ${levelNumber} • PHONOLOGICAL AWARENESS`}</div>
      </div>
      <div className="pa-tutorial-nav-group">
        <WoodenStarCounter value={score} />
        <WoodenMusicToggle muted={!soundEnabled} onToggle={onToggleSound} ariaLabel={soundEnabled ? 'Mute sound' : 'Enable sound'} />
      </div>
    </header>
  );
}

export default function PATutorial({ instruction, videoStarted, onWatch, onSkip, children }) {
  const { i18n } = useTranslation('pa');
  const sinhala = i18n.language?.startsWith('si');
  return (
    <main className="pa-tutorial-main" lang={i18n.language}>
      <section className="pa-tutorial-board" aria-labelledby="pa-tutorial-heading">
        <img className="pa-tutorial-board-art" src={`${ART}/vine-board-v2.png`} alt="" draggable="false" />
        <h1 id="pa-tutorial-heading">{sinhala ? 'ක්‍රීඩා කරන ආකාරය' : 'HOW TO PLAY'}</h1>
        <div className="pa-tutorial-content">
          <p className="pa-tutorial-instruction">{instruction}</p>
          <div className="pa-tutorial-video">
            {children}
            {!videoStarted && (
              <button className="pa-tutorial-poster" onClick={onWatch} aria-label={sinhala ? 'වීඩියෝව නරඹන්න' : 'Play tutorial video'}>
                <span className="pa-tutorial-logo"><span>Lexi</span>Land<Star fill="#ffe000" stroke="#f8a000" /></span>
                <span className="pa-tutorial-play"><Play fill="white" /></span>
              </button>
            )}
          </div>
          <div className="pa-tutorial-actions">
            <button className="pa-tutorial-watch" onClick={onWatch}><Play fill="currentColor" />{sinhala ? 'වීඩියෝව නරඹන්න' : 'Watch Video'}</button>
            <button className="pa-tutorial-skip" onClick={onSkip}>{sinhala ? 'මඟහැර ක්‍රීඩා කරන්න' : 'Skip & Play'}<ArrowRight /></button>
          </div>
        </div>
      </section>
    </main>
  );
}
