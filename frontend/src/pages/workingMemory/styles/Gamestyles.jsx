import React from "react";
import "./redesign.css";

// Shared embedded styles used by every WM improvement game screen (Pattern, Words, Instructions, Numbers)
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Fredoka:wght@400;500;600;700&display=swap');

    :root {
      --shadow-soft: 0 12px 30px rgba(20,60,20,0.18);
      --purple-dark: #5f37b0;
      --carrot-dark: #e06f1f;
    }

    .font-custom {
      font-family: 'Fredoka', 'Baloo 2', system-ui, -apple-system, sans-serif;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35) 85%);
      z-index: 1;
      pointer-events: none;
    }

    /* Timer Wrap and Fill */
    .timerbar-wrap {
      width: 100%;
      background: #eee6d6;
      border: 3px solid #e0d3b0;
      border-radius: 999px;
      height: clamp(28px, 2.8vw, 36px);
      overflow: hidden;
      position: relative;
      max-width: 440px;
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
    }
    .timerbar-fill {
      height: 100%;
      background: linear-gradient(180deg, #8fe06a, #57b23a);
      border-radius: 999px;
      transition: width 1s linear;
    }
    .timer-label {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.92rem;
      font-weight: 800;
      color: #5b4b28;
      z-index: 2;
    }

    /* Glass Container Card */
    .glass-card {
      background: rgba(255, 255, 255, 0.22) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15), 
                  inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
    }

    .vine-board {
      position: relative;
      isolation: isolate;
      width: 100%;
      max-width: 1100px;
      margin-inline: auto;
      aspect-ratio: 16 / 9;
      background-color: #fff3d6 !important;
      box-sizing: border-box;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      box-shadow: none !important;
      border: 0 !important;
    }

    .vine-board::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      background: url('/images/workingMemory/improve/boards/wm_vine_board.png') center / contain no-repeat;
      pointer-events: none;
    }

    .vine-board > :not(img) {
      position: relative;
      z-index: 1;
    }

    /* Instruction Tag */
    .instruction-tag {
      background: #fff3d6;
      border: 3px dashed #e8c98a;
      border-radius: 18px;
      padding: clamp(12px, 1.4vw, 18px) clamp(24px, 3vw, 42px);
      font-weight: 800;
      color: #6b4b1c;
      text-align: center;
      font-size: clamp(1.15rem, 1.6vw, 1.55rem);
      box-shadow: var(--shadow-soft);
    }

    /* SVG Mascot Speech Bubble */
    .speech {
      background: #fff8ea;
      border: 3px solid #f0dcae;
      border-radius: 20px;
      padding: 16px 22px;
      font-weight: 700;
      font-size: 1.1rem;
      color: #5b4326;
      max-width: 340px;
      position: relative;
      box-shadow: var(--shadow-soft);
    }
    .speech::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 40px;
      border-width: 15px 15px 0;
      border-style: solid;
      border-color: #f0dcae transparent;
      display: block;
      width: 0;
    }

    /* Banner ribbon */
    .banner {
      background: linear-gradient(180deg,#8a5ce0,var(--purple-dark));
      color: #fff;
      font-weight: 800;
      font-size: 1.1rem;
      padding: 12px 30px;
      border-radius: 999px;
      box-shadow: var(--shadow-soft);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Button Purple */
    .btn-purple {
      background: linear-gradient(180deg,#9a72e8,var(--purple-dark));
      box-shadow: 0 6px 0 rgba(0,0,0,0.18), var(--shadow-soft);
    }

    /* Pattern Game Styles */
    .seq-banner {
      background: linear-gradient(180deg, #ff9d52, #e06f1f);
      border-radius: 26px;
      padding: clamp(16px, 2.6vw, 26px) clamp(20px, 3vw, 32px);
      margin: clamp(14px, 2.4vw, 22px) 0;
      box-shadow: 0 10px 22px rgba(180,80,10,0.35);
      border: 4px solid #ffffff44;
    }
    .seq-tile {
      width: clamp(64px, 8vw, 100px);
      aspect-ratio: 1/1;
      background: #ffffff;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      position: relative;
      border-bottom: 5px solid #e2e8f0;
    }
    .seq-tile.choice {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .seq-tile.choice:hover {
      transform: translateY(-6px) scale(1.06);
      box-shadow: 0 12px 20px rgba(0,0,0,0.25);
    }
    .seq-tile.choice:active {
      transform: translateY(2px);
    }
    .seq-tile.choice.correct {
      box-shadow: 0 0 0 5px #57b23a, 0 6px 12px rgba(0,0,0,0.15);
    }
    .seq-tile.choice.wrong {
      box-shadow: 0 0 0 5px #d64545, 0 6px 12px rgba(0,0,0,0.15);
      animation: shake 0.35s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out forwards;
    }

    /* Keep picture-memory artwork large and distinct on the cream card face. */
    .word-card-picture {
      filter: saturate(1.12) contrast(1.08)
        drop-shadow(0 3px 2px rgba(73, 43, 15, 0.28));
      background-position-repeat: no-repeat;
    }

    /* Stable wooden board shared by every Working Memory game. */
    .pattern-stage,
    .words-stage,
    .number-stage,
    .adaptive-game-stage {
      align-items: flex-start !important;
      overflow-x: visible !important;
      overflow-y: auto !important;
      padding-block: clamp(58px, 6vw, 76px) clamp(8px, 1.8vw, 22px) !important;
    }

    .adaptive-vine-board {
      position: relative;
      flex: 0 0 auto;
      width: min(62vw, calc((100dvh - 190px) * 1.5), 960px) !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: min(640px, calc(100dvh - 190px)) !important;
      aspect-ratio: 3 / 2 !important;
      box-sizing: border-box;
      background-color: transparent !important;
      background-image: none !important;
      border-style: solid !important;
      border-width: clamp(48px, 5.5vw, 76px) clamp(48px, 6vw, 84px) !important;
      border-image-source: var(--vine-board-image, url('/images/workingMemory/improve/boards/wm_vine_board.png')) !important;
      border-image-slice: 92 96 84 96 fill !important;
      border-image-width: 1 !important;
      border-image-repeat: stretch !important;
      overflow: visible !important;
    }

    /* This repeated class selector deliberately wins over game-local sizing rules. */
    .working-memory-board-frame.working-memory-board-frame.adaptive-vine-board {
      width: min(62vw, calc((100dvh - 190px) * 1.5), 960px) !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: min(640px, calc(100dvh - 190px)) !important;
      aspect-ratio: 3 / 2 !important;
      flex: 0 0 auto !important;
    }

    .adaptive-vine-board > .pattern-board-bunny,
    .adaptive-vine-board > .words-board-bunny,
    .adaptive-vine-board > .number-board-bunny {
      left: clamp(-310px, -18vw, -220px) !important;
      bottom: clamp(-125px, -7vw, -82px) !important;
      transform: scale(1.05) !important;
      transform-origin: bottom right !important;
    }

    .adaptive-vine-board > img[aria-hidden="true"] {
      display: block !important;
      left: clamp(-310px, -18vw, -220px) !important;
      bottom: clamp(-125px, -7vw, -82px) !important;
      width: clamp(240px, 20vw, 310px) !important;
    }

    .adaptive-vine-board::before {
      display: none !important;
    }

    .wooden-question-progress {
      position: absolute;
      left: 50%;
      top: -4px;
      z-index: 60;
      width: clamp(220px, 32%, 300px);
      aspect-ratio: 1912 / 318;
      transform: translate(-50%, -100%);
      pointer-events: none;
      isolation: isolate;
    }

    .wooden-question-progress__stick {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 4px rgba(58, 31, 10, 0.26));
    }

    .wooden-question-progress__numbers {
      position: absolute;
      inset: 2% 9% 3%;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      align-items: center;
      gap: 2%;
      white-space: nowrap;
      overflow: visible;
    }

    .wooden-question-progress__number {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      overflow: hidden;
      clip-path: circle(48% at 50% 50%);
      transform: none;
      transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
    }

    .wooden-question-progress__number img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    .wooden-question-progress__number--asset-4 img {
      width: 134%;
      height: 134%;
      margin: -17%;
      object-fit: cover;
    }

    .wooden-question-progress__number--asset-4 {
      clip-path: circle(47% at 50% 50%);
    }

    .wooden-question-progress__number--completed {
      filter: sepia(.12) saturate(.9) hue-rotate(58deg) brightness(1.02);
    }

    .wooden-question-progress__number--completed span {
      position: absolute;
      right: -1%;
      bottom: -1%;
      width: 34%;
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      color: #fff;
      background: #4f9f42;
      border: 1px solid #eaffdf;
      border-radius: 50%;
      font-size: clamp(.48rem, 1vw, .72rem);
      font-weight: 900;
      box-shadow: 0 2px 4px rgba(24, 78, 17, .28);
    }

    .wooden-question-progress__number--current {
      z-index: 2;
      transform: scale(1.14);
      filter: brightness(1.14) drop-shadow(0 0 5px rgba(255, 230, 92, .72));
    }

    .wooden-question-progress__number--incorrect {
      z-index: 1;
      filter: sepia(.15) saturate(1.1) hue-rotate(-18deg) brightness(1.02);
    }

    .wooden-question-progress__number--incorrect span {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      background: rgba(190, 45, 45, 0.92);
      border-radius: 50%;
      font-size: clamp(.48rem, 1vw, .72rem);
      font-weight: 900;
      box-shadow: 0 2px 4px rgba(120, 20, 20, .28);
    }

    .wooden-question-progress__number--incorrect img {
      opacity: 0.35;
    }

    .wooden-question-progress__number--upcoming {
      opacity: .9;
    }

    @media (max-width: 700px) {
      .wooden-question-progress {
        left: 50%;
        top: -6px;
        width: clamp(205px, 52%, 250px);
        transform: translate(-50%, -96%);
      }
    }

    .adaptive-vine-board__content {
      position: static !important;
      inset: auto !important;
      width: 100%;
      height: auto !important;
      min-height: 0 !important;
      padding: clamp(4px, 0.8vw, 12px) clamp(2px, 0.6vw, 10px) clamp(8px, 1vw, 16px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start !important;
      gap: clamp(8px, 1.2vw, 16px);
      overflow: visible !important;
      box-sizing: border-box;
    }

    .adaptive-vine-board.adaptive-vine-board .instruction-tag {
      position: relative;
      width: min(78%, 720px) !important;
      max-width: 720px !important;
      min-height: clamp(56px, 6vw, 76px);
      height: auto !important;
      margin-block: 0 !important;
      padding: clamp(12px, 1.4vw, 18px) clamp(58px, 7vw, 92px) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b3b0b;
      background: url('/images/workingMemory/improve/level4/boards/frame.png') center / 100% 100% no-repeat !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      line-height: 1.25;
      text-align: center;
      white-space: normal;
      overflow-wrap: anywhere;
      flex: 0 0 auto;
      box-sizing: border-box;
    }

    .adaptive-vine-board .timerbar-wrap {
      margin-block: 0 clamp(4px, 0.8vw, 10px) !important;
      flex: 0 0 auto;
    }

    .adaptive-vine-board .pattern-sequence-panel,
    .adaptive-vine-board .number-sequence-panel,
    .adaptive-vine-board .number-choice-panel {
      min-height: 0 !important;
      height: auto !important;
    }

    .adaptive-vine-board .words-memory-grid-wrapper {
      flex: 0 0 auto !important;
      min-height: auto !important;
      height: auto !important;
      gap: clamp(10px, 1.4vw, 18px) !important;
    }

    .adaptive-vine-board .words-memory-grid {
      flex: 0 0 auto;
    }

    .adaptive-vine-board .words-play-button {
      margin-top: clamp(4px, 0.8vw, 10px) !important;
    }

    /* Shared result screen follows the Pattern game's centered 16:9 stage. */
    .result-vine-stage {
      max-width: 1380px;
      overflow: visible;
      padding-block: 2px !important;
    }

    /* Shared Level 4 lavender theme, sampled from the supplied reference. */
    .level-4-theme {
      --level4-primary: #873cb7;
      --level4-primary-light: #9b4dcc;
      --level4-primary-dark: #642b91;
      --level4-border: #a986c3;
      --level4-surface: #e7d8f0;
      --level4-surface-light: #f0e4f5;
      --level4-cream: #fff3d8;
      --level4-blue: #b9dcf4;
    }

    .level-4-theme .timerbar-wrap {
      background: var(--level4-primary) !important;
      border-color: var(--level4-border) !important;
      box-shadow: inset 0 2px 5px rgba(60, 25, 92, 0.2) !important;
    }

    .level-4-theme .timerbar-fill,
    .level-4-theme .number-level-timer-fill {
      background: linear-gradient(90deg, var(--level4-primary-light), var(--level4-primary-dark)) !important;
    }

    .level-4-theme .timer-label {
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(55, 20, 82, 0.45);
    }

    .level-4-theme .instruction-tag,
    .level-4-theme .words-drag-instruction,
    .level-4-theme .speech {
      color: var(--level4-primary-dark) !important;
      background: var(--level4-cream) !important;
      border-color: var(--level4-border) !important;
    }

    .level-4-theme .btn-purple,
    .level-4-theme .words-play-button,
    .level-4-theme .words-submit-button,
    .level-4-theme .words-next-button,
    .level-4-theme .pattern-peek-button,
    .level-4-theme .pattern-submit-button,
    .level-4-theme .pattern-next-button,
    .level-4-theme .number-submit-button,
    .level-4-theme .number-next-button {
      color: #fff !important;
      background: linear-gradient(180deg, var(--level4-primary-light), var(--level4-primary)) !important;
      border-color: var(--level4-primary-dark) !important;
      box-shadow: 0 6px 0 var(--level4-primary-dark), 0 10px 20px rgba(100, 43, 145, 0.2) !important;
    }

    .level-4-theme .words-audio-button,
    .level-4-theme .pattern-listen-button,
    .level-4-theme .number-audio-button {
      color: var(--level4-primary-dark) !important;
      background: var(--level4-surface-light) !important;
      border-color: var(--level4-primary) !important;
    }

    .level-4-theme .number-choice-panel {
      background: var(--level4-surface) !important;
      border-color: var(--level4-border) !important;
    }

    /* Level 4 pattern display: a simple white field inside a strong purple frame. */
    .level-4-theme .pattern-vine-board--show .pattern-sequence-panel {
      background: #fff !important;
      border: 5px solid var(--level4-primary-dark) !important;
      border-radius: 18px !important;
      box-shadow:
        0 10px 20px rgba(100, 43, 145, 0.22),
        inset 0 0 0 3px var(--level4-border) !important;
    }

    .level-4-theme .pattern-choice-tile,
    .level-4-theme .pattern-sequence-tile {
      background-color: var(--level4-surface-light) !important;
      border-color: var(--level4-border) !important;
    }

    .level-4-theme .pattern-vine-board--show .pattern-sequence-tile {
      background-color: #fff !important;
      border-color: var(--level4-primary) !important;
    }

    .result-vine-board {
      position: relative;
      isolation: isolate;
      flex: 0 0 auto;
      width: min(74vw, calc((100dvh - 92px) * 16 / 9), 1040px) !important;
      aspect-ratio: 16 / 9;
      min-height: 0 !important;
      margin: 0 auto;
      background: var(--result-vine-board-image, url('/images/workingMemory/improve/boards/wm_vine_board.png')) center / contain no-repeat;
      overflow: visible;
    }

    .result-vine-board__content {
      position: absolute;
      inset: 11% 10% 9% 14%;
      z-index: 2;
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: clamp(3px, 0.55vh, 7px);
      box-sizing: border-box;
    }

    .result-vine-board__content > * {
      margin-block: 0 !important;
    }

    .result-vine-board__content > :first-child {
      width: clamp(42px, 5.5vh, 58px) !important;
      height: clamp(42px, 5.5vh, 58px) !important;
      font-size: clamp(1.5rem, 3vh, 2.25rem) !important;
    }

    .result-vine-board__content h2 {
      font-size: clamp(1.35rem, 2.8vh, 2rem) !important;
      line-height: 1.05;
    }

    .result-vine-board__content .text-5xl {
      font-size: clamp(2rem, 4.5vh, 3rem) !important;
      line-height: 1;
    }

    .result-vine-board__content .text-3xl {
      font-size: clamp(1.35rem, 3vh, 1.875rem) !important;
      line-height: 1;
    }

    .result-vine-board__content .py-3 {
      padding-top: clamp(0.4rem, 0.9vh, 0.75rem) !important;
      padding-bottom: clamp(0.4rem, 0.9vh, 0.75rem) !important;
    }

    .result-board-bunny {
      position: absolute;
      left: clamp(0px, 5vw, 82px);
      bottom: clamp(2px, 1.5vh, 18px);
      z-index: 5;
      pointer-events: none;
    }

    .result-board-bunny > img {
      position: relative !important;
      display: block !important;
      left: auto !important;
      bottom: auto !important;
      width: clamp(220px, 23vw, 340px) !important;
      max-width: none !important;
      height: auto !important;
    }

    @media (max-width: 700px) {
      .adaptive-vine-board {
        width: min(90vw, calc((100dvh - 145px) * 1.5)) !important;
        min-height: 0 !important;
        max-height: calc(100dvh - 145px) !important;
        aspect-ratio: 3 / 2 !important;
        border-width: 38px 40px !important;
      }

      .working-memory-board-frame.working-memory-board-frame.adaptive-vine-board {
        width: min(90vw, calc((100dvh - 145px) * 1.5)) !important;
        max-height: calc(100dvh - 145px) !important;
      }

      .adaptive-vine-board > .pattern-board-bunny,
      .adaptive-vine-board > .words-board-bunny,
      .adaptive-vine-board > .number-board-bunny {
        left: -74px !important;
        bottom: -42px !important;
        transform: scale(0.68) !important;
        transform-origin: bottom left !important;
      }

      .adaptive-vine-board > img[aria-hidden="true"] {
        left: -74px !important;
        bottom: -42px !important;
        width: 150px !important;
      }

      .adaptive-vine-board__content {
        gap: 7px;
        padding-bottom: 6px;
      }

      .result-vine-board {
        width: min(94vw, calc((100dvh - 96px) * 16 / 9)) !important;
      }

      .result-vine-board__content {
        inset: 12% 7% 9% 12%;
        gap: 3px;
      }

      .result-board-bunny {
        left: -12px;
        bottom: 2px;
      }

      .result-board-bunny > img {
        width: clamp(135px, 28vw, 200px) !important;
      }
    }
  `}</style>
);

export default GameStyles;
