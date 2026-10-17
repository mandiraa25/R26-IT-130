# Level 4 Working Memory UI refinement

Changes are scoped to improvement Level 4. Existing workspace edits were preserved. Screening, Levels 1–3, question banks, backend validation, reward constants, and routes were not redesigned.

## Implemented

- Existing Level 4 night/jungle background throughout tutorials, questions, feedback, results, and completion. Purple primary controls, selected states, card frames, and dashboard accents. No carrot buckets.
- Aligned navigation and a padded wooden badge for the actual total stars. Comfortable board padding, consistent action areas, and additional bottom clearance for dashboard buttons.
- Retained the original wooden vine tracker artwork and presentation, as requested. Level 4 keeps the active highlight during feedback and adds a green tick only for correct responses. Levels 1–3 retain their existing tracker behavior.
- Consistent purple picture frames and existing purple bunny card backs; visible slot-number badges; shared object-isolating sprite crops to avoid neighboring slivers. Source image assets are unchanged. Card artwork does not intercept the card's pointer/drag interaction. Start Over is removed; Undo and drag/drop remain functional.
- Number Recall waits for Ready before revealing its sequence or starting the configured six-second period. Repeated Ready clicks are guarded, existing timer cleanup is retained, and headings reflect the current stage and forward/backward direction. Picture Memory retains its existing ten-second memorization period.
- Immediate, compact feedback outside the board, with three decorative stars and existing correct/incorrect sound handling. No correct-answer reveals. Submitted work and answer options retain their positions; Next uses a stable action area.
- Pattern-reference dashboards for all four games, with score, correct/incorrect counts, actual stars earned, cumulative recorded category stars where available, pass/save status, replay, and continuation.
- Exactly 3/5 retains the existing happy bunny expression. The pass mark remains 3/5 and unlocking rules are unchanged.
- Final completion uses saved completion across all four categories, recorded star totals, and overall Level 4 progress. Its centered Back to Levels action uses the existing return route. There is no Level 5 action or unlock.

## Files changed in this task

Existing files:

- [ImprovementActivityWM.jsx](ImprovementActivityWM.jsx): extend Ready/save guards and saved-progress/history refreshes to Level 4.
- [GamePresentation.jsx](components/GamePresentation.jsx): route Level 4 through the refined layout, external feedback, stage text, and dashboards.
- [PatternPresentation.jsx](components/PatternPresentation.jsx): Level 4 controls, feedback presentation, and correct-only tracker flag.
- [MemoryUI.jsx](components/MemoryUI.jsx): optional correct-only tracker behavior and Level 4 card rendering; defaults preserve other levels.
- [HowToPlayScreen.jsx](components/HowToPlayScreen.jsx): Level 4 Ready instructions.

New files:

- [LevelFourDashboard.jsx](components/LevelFourDashboard.jsx)
- [levelFour.css](styles/levelFour.css)
- [playwright.level-four.config.js](../../../playwright.level-four.config.js)
- [level-four-ui.spec.js](../../../tests/e2e/level-four-ui.spec.js)
- This report.

Existing sprite-cropping and number-stage helpers are reused without modifying their Level 3 implementation.

## Verification

- Production build passed. Existing bundle-size and Browserslist warnings remain.
- Targeted ESLint checks passed for changed presentation components, the new dashboard, browser suite, and test configuration.
- All 1,263 unit tests passed, including the existing question/answer banks, pattern artwork, and Screening validation.
- All 17 browser checks passed: all four Level 4 games through five questions at 1/5, 3/5, and 4/5; mute/reward behavior; an incomplete saved-progress scenario; and existing tracker/pattern flows in Levels 1–3.
- Responsive geometry checked at 1366 × 768 and 2878 × 1540 for tutorials, activity states, feedback, results, and completion. Checks cover navigation bounds, large star totals, board padding, tracker alignment, option/sequence stability, and external feedback clearance.
- Verified Ready concealment, six number-countdown ticks, picture timing, forward/backward recall text and validation, repeated Ready/Submit/Next activation, Undo, native drag/drop, one save/reward per answer/attempt, recorded star totals, and existing navigation.
- Verified that completing Number Recall alone does not claim level completion when other saved activities are incomplete.
- Rechecked Number Recall at 3/5 after the final completion-button alignment adjustment; the centered return action and final-level navigation passed.
- Inspected original Level 4 baseline screens and assets, and reviewed generated question, picture-feedback, result, and completion screenshots. Final completion preview is under `frontend/.cache/level-four-final-review`; original baseline captures are under `frontend/.cache/level-four-baseline-results`.

Run from `frontend`, with Vite running at `http://127.0.0.1:5173`:

```powershell
npx.cmd playwright test --config playwright.level-four.config.js --workers 1
```

The browser suite mocks API responses and does not register accounts or write to the live database. Virtual-clock checks advance one second at a time to allow React to commit timer effects; native dragging uses live animation frames after memorization ends.

## Verification limits

Live database persistence, audible speech/sound quality, and external tutorial playback were not verified. The Level 4 browser matrix used Grade 2 English; full Grade 3/4 and Sinhala UI matrices were not run. Their question/answer data is covered by the unit suite. A full Screening UI rerun was not performed; its source and presentation branches were left unchanged.
