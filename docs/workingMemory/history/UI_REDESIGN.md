# Working Memory UI redesign

Implemented directly in the existing frontend. The separate How to Play rule remains: every level uses the original Level 01 how-to board asset, unchanged. Level backgrounds vary automatically.

## Source changes

- `ImprovementLevelsWM.jsx`: illustrated level scenes, existing progress/access gates, keyboard activation and shared Play artwork.
- `ImprovementActivityWM.jsx`: supplied backgrounds and approved cropped card backs; removed one nonexistent image preload. State handlers, timings, selection, validation, scoring and API payload logic are unchanged.
- `utils/themeAssets.js`: supplied jungle backgrounds and clean game board; invariant L1 tutorial board; existing instruction-frame fallback.
- `components/ActionButton.jsx` (new): native accessible buttons with individual PNG artwork, original labels/handlers/disabled props, Sinhala captions.
- `components/SharedScreens.jsx`: shared ready/result presentation, transparent tracker, existing bunny poses cropped to remove empty canvas, labelled navigation/audio controls.
- `components/GameSelectionModal.jsx`: selected-level background, dialog semantics, keyboard focus containment and Escape dismissal; original selection/unlock behavior.
- `components/WordCard.jsx`: keyboard selection and clearer empty slots.
- All four files under `games/`: action artwork and scoped shared presentation. Existing Picture Memory drag/drop, swap and undo handlers remain. Number Memory now displays the existing question-specific instruction so backward-recall questions are identified; correct answers/data were not changed.
- `styles/redesign.css` (new) and `styles/Gamestyles.jsx`: consistent board, headings, cards, keypad, feedback, responsive layouts, focus and reduced-motion styles, scoped to Working Memory.
- `identify/ScreeningUI.jsx`, `identify/IdentifyIntroScreens.jsx`, `identify/screening.css`: supplied screening background/board styling; existing question counts and flow retained.

## Reference audit

All 93 images in `LexiLand_WorkingMemory_References.zip` were inventoried and inspected, including six contact sheets. Originals remain under `.design-backups/references/`; inventory and indexed paths are under `.design-backups/full-redesign-before/`.

| Category | Supplied references and use |
| --- | --- |
| Current UI/screens | Level 1-4 JPG collections: game selection, pattern questions, listening/answering, number and picture phases, results |
| Approved target compositions | `game 01.png` (pattern), `game 2.png` (picture), `game 3.png` (instructions), `game 4.png` (numbers) |
| Picture/card themes | `Four-Level Colorful Learning Cards.png`: carrot, leaf, flower, bunny face; original picture identifiers/pools retained |
| Word Memory | No separate Word Memory game/reference; existing `WordsGame` is Picture Memory; no game invented |
| Backgrounds | All four `Level0xBG-Calm.png` supplied; no background generation required |
| Bunny | Supplied sitting/standing bunny plus existing question/answer poses |
| Board | Supplied `Vineboard.png` for game screens; existing Level 01 How to Play board preserved |
| Buttons/navigation | Glossy circular colour collection and polished wooden UI reference; illustrated game actions generated to match the glossy family |
| Tracker | Supplied wooden vine strip; white-background removal via built-in image generation, cropped and integrated with real state indicators |
| Results/retry | `Pattern Recognition Level Complete.png`, `Bunny Pattern Recognition Try Again Screen.png`, and per-level results screenshots |
| Selection/map | `Jungle Learning Adventure Level Select.png`, `Level 1 Kids’ Game Selection Board.png` |
| Screentest | Background supplied; existing independent screening screens retained and restyled |

Missing as independent assets: nine labelled pill buttons; independent card-back files; transparent tracker. These were generated or extracted as described below. No new question data or audio was invented.

## Assets

Reused/extracted:
- Four supplied calm jungle backgrounds in `public/images/workingMemory/improvement/how-to-play/how-to-backgrounds/L1.png` through `L4.png`, shared by game/tutorial themes without duplicate background copies.
- Supplied board, sitting/standing bunny, screening background and four cropped card backs under `public/images/workingMemory/improve/reference-art/`.
- Existing picture art, number-button art, game-selection assets, tutorial board, and existing bunny poses. Cropped bunny derivatives remove empty canvas without altering character artwork.

Generated with the built-in image tool, then cropped to retain outlines/shadows:
- `public/images/workingMemory/shared/buttons/actions/`: `check-button.png`, `next-button.png`, `continue-button.png`, `play-button.png`, `try-again-button.png`, `listen-again-button.png`, `show-question-button.png`, `back-button.png`, `finish-button.png`.
- Transparent `reference-art/question-tracker.png`, derived from the supplied tracker.

All nine button labels were visually inspected. Files have alpha transparency (corner alpha 0) and resolutions from 1461 to 1876 pixels wide. Generation prompts and source paths are recorded in `.design-backups/full-redesign-before/generated-buttons.json`. The tracker prompt requested preservation of the original numbered strip with white background removed and full shadow retained. Original generated files were left in the tool's output folder; application assets are stored in the project.

## Executed checks

- Production build: passed; existing large-bundle/Browserslist warnings remain.
- Unit suite: **1,246 passed** using `npm.cmd run test:unit -- --configLoader runner`. The runner loader avoids the environment's default config-bundling filesystem error.
- Targeted ESLint for changed shared/game/map components: passed.
- Screening Playwright suite: **12 passed**, including all 15 questions for each grade 2-4 in English/Sinhala, completion responsiveness, audio-unavailable fallback and save/retry states.
- Real improvement routes: **16 complete games / 80 questions** at grade 3 across all four levels, with correct answers and score/submission assertions.
- Additional mixed-answer runs: first answer incorrect in each of four games, followed by four correct answers; submitted score asserted as 4/5.
- Additional all-incorrect Pattern attempt: submitted score 0/5 and retry returned to the ready screen.
- Picture tests: native HTML drag/drop, slot swapping with stable IDs, keyboard clearing and pool restoration; correct reconstruction accepted.
- Number tests: keyboard digit selection, slot removal/undo and pool restoration.
- Responsive browser checks: four games x English/Sinhala x 1280x720 and 390x844; no horizontal overflow or reported button-bound violations. Main gameplay screenshots also captured at 1366x768.
- `git diff --check` for Working Memory: passed.
- SHA256 comparison of all Working Memory `data/` files against the pre-redesign backup: **0 changed**. Existing unrelated uncommitted data edits were preserved.

Visual inspection included original reference contact sheets, generated button labels, all four level backgrounds, pattern/number/picture/listening/feedback/results, level map/selection and English/Sinhala responsive examples. Screenshots are in `.design-backups/full-redesign-before/qa/`. This is reference-led work, not a claim of pixel-perfect reproduction.

## Testing limits

Browser tests used the real application components/routes and existing educational data with mocked profile/progress/submission APIs, mocked YouTube and speech synthesis, and accelerated test-browser countdown intervals. Production timers were not altered. Live authentication, database persistence/unlocking, external video availability, actual audio audibility and background music were not verified against real services. Browser full-game coverage uses grade 3; the unit suite covers the available grade/language question pools, and screening browser tests cover all three grades in both languages. Responsive screenshots do not constitute exhaustive device testing.

## Restore / undo

The broader redesign's exact pre-edit source and image trees are in `.design-backups/full-redesign-before/workingMemory/` and `images-workingMemory/`. That backup includes your pre-existing uncommitted changes and the already-completed How to Play update. Restore only the changed files listed above rather than resetting Git or overwriting unrelated later work. Remove only new assets/components/styles created by this redesign, as listed above, after restoring their consumers.

For the original designs from before the earlier How to Play change, `.design-backups/how-to-play-before/RESTORE.txt` and its three exact source copies are also preserved. This allows undoing the broad redesign alone or both stages. No commits, resets, deployments, backend edits or `.env` changes were made for this redesign.

To repeat the standalone improvement browser checks, start the frontend at 127.0.0.1:5173, open a terminal in `frontend`, then run:

```powershell
node scripts/wm-redesign/check.mjs
node scripts/wm-redesign/responsive.mjs
node scripts/wm-redesign/retry.mjs
node scripts/wm-redesign/visual.mjs
```

`check.mjs` also supports `QA_LEVELS` (comma-separated levels) and `QA_WRONG_FIRST=1` to exercise mixed correct/incorrect answers. These are test-runner options only. Map keyboard activation, modal Escape, and final screening/listening screenshots were also executed successfully.

## Access-check correction after navigation report

Game entry now resolves the authenticated student profile, then requests progress with that profile ID (matching the level map). It no longer trusts a separate stored student ID or cached denial for this decision. Profile/progress failures display a retry state rather than falsely declaring screening incomplete. Successful server responses still enforce incomplete-screening and locked-game restrictions; stale requests are cancelled on route changes.

Verified with `node scripts/wm-redesign/access.mjs`: nine browser cases passed, including map -> Level 1 Pattern -> playable question with a stale local ID; all four games with no stored ID; profile/progress failures and retry recovery; actual screening-incomplete and locked-game responses. APIs were mocked for these regressions. Production build and targeted diff whitespace check passed. The pre-fix activity component is preserved in `.design-backups/access-check-before/`.
