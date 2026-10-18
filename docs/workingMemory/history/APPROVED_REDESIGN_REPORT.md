# Approved reference redesign — 16 October 2026

This report describes the latest `lexiland-ui-reference.zip` implementation. `UI_REDESIGN.md` describes an earlier design and is historical.

## Implemented

- Shared 1600×900 stage scales uniformly and centers over full-window level backgrounds.
- New supplied backgrounds, clean stretched vine board, bunny, buckets, wooden navigation, live trackers, four number-button colours, card backs/fronts, and matching supplied icons. All 67 supplied assets are stored unchanged under `public/images/workingMemory/shared/`.
- The original Level 01 How to Play board remains identical across levels; only the background and action theme change. Optional tutorial videos remain available, with keyboard focus containment and Escape dismissal.
- Level map and selected-level menu use real progress/unlocks. Language selection is available on the map. Existing grade/language question pools remain intact.
- Pattern answers give immediate feedback. Picture Memory has hidden cards, Ready, the existing ten-second reveal, real shuffled cards, drag/drop, tap placement, swapping, Undo and Start over. Picture validation compares stable identifiers.
- Number Memory retains existing configured timings and forward/backward answers, with all ten reusable digits and deletion of only the last input. Instruction Following starts audio manually, sequences the selected-language steps with one-second gaps, prevents overlapping playback, and reveals the question after completion.
- Five questions per attempt; first response counts once; Next proceeds after either outcome. Frontend and backend require three correct to pass. Previously earned completions remain intact. Results include save failure recovery. Level completion uses saved backend progress.
- One background-music object persists across internal navigation; mute is remembered.
- Screening keeps its independent question selection, timings, validation, scores, completion, demo and save flow. Its shared presentation includes fifteen numbered vine steps for the full test, its existing fifteen-star tracker and question count. A deliberately filtered one-question demo continues to show its actual one-question length.
- Lexend, Fredoka and Noto Sans Sinhala are served locally with their OFL licenses.
- Twelve superseded level-background files were removed only after verifying identical backup hashes. No new images were generated for this reference revision.

## Main files

`components/MemoryUI.jsx`, `components/GamePresentation.jsx`, `components/HowToPlayScreen.jsx`, `components/LevelMenu.jsx`, `styles/memoryUI.css`, `utils/memoryTheme.js`, `utils/memoryMusic.js`, `utils/attemptQuestions.js`, the four `games/` presentation wrappers, `ImprovementActivityWM.jsx`, `ImprovementLevelsWM.jsx`, `identify/ScreeningUI.jsx`, `identify/IdentifyIntroScreens.jsx`, `identify/identifyIntro.css`, `utils/themeAssets.js`, `src/App.jsx`, `src/utils/workingMemory/evaluateImprovementAnswer.util.js`, and the backend improvement controller.

Question data: all thirteen files under `workingMemory/data/` match the exact pre-redesign backup byte for byte. Existing unrelated dirty files were preserved. `backend/.env` was not modified.

## Executed verification

From `frontend/`:

- `npm.cmd run build` — passed. Existing large-bundle and outdated Browserslist warnings remain.
- `npm.cmd run test:unit -- --configLoader runner` — 1,246 passed.
- Targeted ESLint on the new/updated shared UI, map, controller component, tutorial, screening components and utilities — passed. Whole-repository lint was not claimed.
- `npx.cmd playwright test --config=playwright.screening.config.js` — twelve passed, including all questions for grades 2–4 in both languages, audio failure, completion, navigation and save recovery. Subsequent completion checks repeated after the footer alignment refinement.
- `node scripts/wm-redesign/flows.mjs` — all sixteen level/game combinations passed five real questions each, with three correct and two incorrect answers. Verified single scoring/submission despite duplicate clicks, real correct-answer identity, drag/drop, Undo, Start over, repeated digit entry, retry reset, map-only language, remembered mute and laptop scaling. Countdown and instruction-delay acceleration exists only in the test browser.
- `node scripts/wm-redesign/edges.mjs` — passed two-correct failure gating, failed-save recovery, reset, manual audio, real one-second speech gaps, persistent music object, remembered mute, local font loading and tutorial Escape dismissal.
- `node scripts/wm-redesign/backend-policy.cjs` — real controller executed with in-memory model doubles: scores zero through five, five stars per correct answer, three-correct boundary, retained historical completion, game/level unlocking. No database writes.
- `node scripts/wm-redesign/final-visual.mjs` — captured all four How to Play/theme variations, Sinhala game screens, laptop layout, full fifteen-step screening and screening intro. Confirmed identical Level 01 tutorial board and no missing requested assets.

Screenshots are under `.design-backups/approved-redesign-before/qa/`, particularly `final-1792102333694/` and `flows-1792102130278/`. Game, map, menu, tutorial, picture, keypad, instructions, results and screening screenshots were visually inspected. This is a reference-based implementation, not a claim of pixel-perfect matching.

The backend was restarted successfully and reported MongoDB connected on port 5000. Account API writes in browser regression tests were mocked; no live student attempt was submitted.

## Limits

- Each current pool contains exactly five questions. Retry can shuffle question/option order but cannot supply five unseen questions without additional approved content. No educational content was invented.
- Missing game-specific How to Play illustrations were not invented: existing supplied icon previews are reused. Existing picture artwork remains the fallback wherever the new ZIP has no matching front.
- Real audible output, installed Sinhala speech voices, external YouTube availability, and live authenticated attempt persistence need checking on the user's laptop/account. Speech callbacks and playback sequencing were browser-tested with a speech mock.
- Uniform stage scaling follows the approved laptop design. On narrow phones, touch targets scale down; this is not a separate mobile reflow redesign.

## Undo

The exact pre-revision Working Memory source tree and image tree, plus `App.jsx`, answer evaluator and backend controller, are preserved in `.design-backups/approved-redesign-before/`. Earlier original-design snapshots remain in `.design-backups/how-to-play-before/` and `.design-backups/full-redesign-before/`. Undo must restore the requested snapshot and its deleted backgrounds, remove only this revision's new files/assets, and preserve unrelated user edits. Do not use `git reset --hard` or restore the repository wholesale.
