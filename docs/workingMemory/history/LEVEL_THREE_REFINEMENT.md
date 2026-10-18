# Level 3 Working Memory UI refinement

Changes are scoped to improvement Level 3. Existing workspace edits were preserved. Screening, question banks, reward constants, backend validation, routes, and Levels 1, 2, and 4 were not redesigned.

## Implemented

- Existing pink Level 3 background throughout tutorials, gameplay, feedback, results, and completion. Pink primary/selected states, neutral secondary/disabled controls, and no carrot buckets.
- Aligned navigation with a padded wooden star counter. Centered five-question tracker and vine board; each active ring and badge stays with its wooden circle. Only correct responses receive a green tick; incorrect responses never receive a completion badge.
- Board padding and consistent action areas. Following Instructions options retain their dimensions/positions after validation. Picture and number sequences remain at their pre-submit positions.
- Consistent pink picture frames, unobstructed position badges, preserved drag/drop and Undo, and no Start Over. Existing floral card backs use the same outer frame. Sprite crops isolate the intended object to remove adjacent fragments, including the sliver beside the spoon; source assets are unchanged.
- Number Memory waits for Ready, guards repeated clicks, retains the configured 8-second memorization period, and uses stage/direction-specific headings. Picture Memory retains its existing 10-second period. Existing interval cleanup and replay behavior are retained.
- Immediate external feedback with three decorative stars, friendly correct/incorrect text, existing sound settings, and no correct-answer reveals. Submitted answers stay visible; rewards still come from existing validation.
- Pattern-reference dashboards for all four games with actual score, correct/incorrect counts, earned stars, saved progression, replay, and destination-specific continuation. Completion shows recorded category stars, total Level 3 stars, saved completion, and actual Level 4 unlock status.
- The existing pass threshold remains 3/5. Exactly 3/5 retains the existing happy bunny expression, independently of unlocking.

## Files changed in this task

Existing files:

- [ImprovementActivityWM.jsx](ImprovementActivityWM.jsx): extend existing Ready/save guards and progress refresh handling to Level 3.
- [GamePresentation.jsx](components/GamePresentation.jsx): Level 3 presentation, dashboard, tracker, and stage text routing.
- [PatternPresentation.jsx](components/PatternPresentation.jsx): Level 3 tracker and external feedback presentation.
- [MemoryUI.jsx](components/MemoryUI.jsx): Level 3 card rendering and sprite isolation.
- [HowToPlayScreen.jsx](components/HowToPlayScreen.jsx): Level 3 Ready instructions.

New files:

- [LevelThreeUI.jsx](components/LevelThreeUI.jsx)
- [LevelThreeSprite.jsx](components/LevelThreeSprite.jsx)
- [LevelThreeDashboard.jsx](components/LevelThreeDashboard.jsx)
- [levelThree.css](styles/levelThree.css)
- [levelThreePresentation.js](utils/levelThreePresentation.js)
- [playwright.level-three.config.js](../../../playwright.level-three.config.js)
- [level-three-ui.spec.js](../../../tests/e2e/level-three-ui.spec.js)
- This report.

## Checks performed

- Production build passed. Existing bundle-size and Browserslist warnings remain.
- Targeted ESLint checks passed for all changed/new presentation components and the stage-text helper.
- All 1,263 unit tests passed, including question/answer validation across the existing banks and Screening validation.
- All 14 Grade 2 Level 3 browser tests passed: all four games at 1/5, 3/5, and 4/5; audio mute/reward behavior; and a saved-progress case proving Number Memory alone does not complete the level.
- All eight additional Grade 3/4 Level 3 browser tests passed: every game through all five questions at 4/5, including tutorials, Ready/listening, memorization, recall, correct/incorrect feedback, results, and progression.
- Responsive geometry checked at 1366 × 768 and 2878 × 1540. Verified navigation bounds, star clipping, board padding, tracker/ring alignment, option/sequence stability, visible card badges, and external notification clearance.
- Checked configured durations, repeated Ready/Submit/Next activation, Undo, drag/drop, forward/backward number recall text and validation, one reward/save per attempt, actual history totals, completion, and continuation to Level 4.
- All 13 existing Level 2 browser regression tests passed.
- Visually reviewed generated card/feedback screenshots, including the corrected spoon crop and Grade 3 picture artwork. Screenshots and traces are under frontend/.cache/level-three-ui-results, level-three-grade3, and level-three-grade4.

Reproduce from `frontend` with Vite running at `http://127.0.0.1:5173`:

```powershell
npx.cmd playwright test --config playwright.level-three.config.js
$env:WM_UI_GRADE='3'
npx.cmd playwright test --config playwright.level-three.config.js --grep '4/5' --output .cache/level-three-grade3
$env:WM_UI_GRADE='4'
npx.cmd playwright test --config playwright.level-three.config.js --grep '4/5' --output .cache/level-three-grade4
Remove-Item Env:WM_UI_GRADE
```

## Verification limits

Browser tests mock API persistence, speech completion, and media playback. Live server/database persistence, audible speech/sound quality, and external video playback were not verified. The full Sinhala Level 3 browser matrix and separate Level 1/4/Screening UI suites were not rerun in this task; their question/answer logic is covered by the unit suite, and their presentation branches remain unchanged.
