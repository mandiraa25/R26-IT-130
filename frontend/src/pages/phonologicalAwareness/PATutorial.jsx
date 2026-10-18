import React from 'react';
import { ArrowLeft, ArrowRight, Music2, Play, Star, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './PATutorial.css';

const ART = '/images/phonologicalAwareness/tutorial';

export function PATutorialNavigation({ grade, score, soundEnabled, onToggleSound, onBack }) {
  const { i18n } = useTranslation('pa');
  const sinhala = i18n.language?.startsWith('si');
  return (
    <header className="pa-tutorial-nav">
      <div className="pa-tutorial-nav-group">
        <button className="pa-wood-circle" onClick={onBack} aria-label={sinhala ? 'ආපසු' : 'Go back'}><ArrowLeft /></button>
        <div className="pa-wood-plaque pa-tutorial-grade">{sinhala ? `${grade} ශ්‍රේණිය • ශබ්ද පිළිබඳ දැනුවත්භාවය` : `GRADE ${grade} • PHONOLOGICAL AWARENESS`}</div>
      </div>
      <div className="pa-tutorial-nav-group">
        <div className="pa-wood-plaque pa-tutorial-stars" aria-label={`${score} stars`}><Star fill="#ffbf00" stroke="#ef8100" />{score}</div>
        <button className="pa-wood-circle" onClick={onToggleSound} aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'} aria-pressed={soundEnabled}>{soundEnabled ? <Music2 /> : <VolumeX />}</button>
        <div className="pa-wood-plaque pa-tutorial-languages" aria-label="Language">
          <button onClick={() => i18n.changeLanguage('en')} aria-pressed={!sinhala}>EN</button>
          <button onClick={() => i18n.changeLanguage('si')} aria-pressed={sinhala}>සිං</button>
        </div>
      </div>
    </header>
  );
}

export default function PATutorial({ instruction, videoStarted, onWatch, onSkip, children }) {
  const { i18n } = useTranslation('pa');
  const sinhala = i18n.language?.startsWith('si');
  return (
    <main className="pa-tutorial-main">
      <section className="pa-tutorial-board" aria-labelledby="pa-tutorial-heading">
        <img className="pa-tutorial-board-art" src={`${ART}/vine-board.png`} alt="" />
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
