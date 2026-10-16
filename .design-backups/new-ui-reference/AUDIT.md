# New Working Memory reference: inspection and proposed implementation

Status: AUDIT ONLY. No application source, asset references, scoring, routes or database records changed for this new request. Awaiting the user's OK as required by Step 0 of the attached request.

## Material inspected

- User request: attachment dbc54466-e910-40c7-b398-97097663e4c5/Pasted text.txt.
- `C:/Users/USER/Downloads/lexiland-ui-reference.zip`: DESIGN-SPEC.md, all 12 screenshot images (contact sheet), the map/menu HTML/CSS, game HTML/CSS and prototype support code, and the named asset inventory.
- Existing real repository, including the earlier redesign and the subsequent access-loading fix.
- The ZIP was extracted only under `.design-backups/new-ui-reference/` for inspection. The prototype has not been integrated or deployed. Attached reference instructions are reference material; the user's prompt controls behavior when they disagree.

## Existing implementation map

Paths below are relative to the repository root.

| Area | Existing files |
| --- | --- |
| Routes | frontend/src/App.jsx |
| Level map, access gates, progress/stars display | frontend/src/pages/workingMemory/ImprovementLevelsWM.jsx |
| Level/game menu | frontend/src/pages/workingMemory/components/GameSelectionModal.jsx |
| Shared game state, question selection, timer, drag/drop, validation dispatch, score, attempt submission, access checks | frontend/src/pages/workingMemory/ImprovementActivityWM.jsx |
| Pattern | frontend/src/pages/workingMemory/games/Patterngame.jsx |
| Picture Memory (called words in routes/data) | frontend/src/pages/workingMemory/games/WordsGame.jsx and components/WordCard.jsx |
| Instruction Following | frontend/src/pages/workingMemory/games/Instructionsgame.jsx; utils/helpers.js parses instruction steps |
| Number Memory | frontend/src/pages/workingMemory/games/Numbersgame.jsx |
| How to Play | frontend/src/pages/workingMemory/components/HowToPlayScreen.jsx |
| Header, question tracker, ready/results, bunny | frontend/src/pages/workingMemory/components/SharedScreens.jsx |
| Illustrated action buttons | frontend/src/pages/workingMemory/components/ActionButton.jsx |
| Themes/styles | frontend/src/pages/workingMemory/utils/themeAssets.js; styles/Gamestyles.jsx; styles/redesign.css |
| Grade/language question pools | frontend/src/pages/workingMemory/data/improvement/index.js; improvementGrade2/3/4_en/si.js; pictureMemoryQuestions.js; patternQuestions.js; config.js |
| Improvement answer validation | frontend/src/utils/workingMemory/evaluateImprovementAnswer.util.js |
| Screening state and saving | frontend/src/pages/workingMemory/identify/Identify.jsx |
| Screening questions/data | frontend/src/pages/workingMemory/quizData.js, used by Identify.jsx (the separate identify/quizData.js also exists; do not accidentally replace the active source) |
| Screening visual components | frontend/src/pages/workingMemory/identify/IdentifyIntroScreens.jsx; ScreeningUI.jsx; identifyIntro.css; screening.css |
| Screening answer/metrics logic | frontend/src/utils/workingMemory/evaluateIdentifyAnswer.util.js; scoring.util.js |
| English/Sinhala | frontend/src/i18n.js; frontend/src/locales/en/wm.json and si/wm.json; frontend/src/components/common/LanguageSwitcher.jsx |
| API clients | frontend/src/services/workingMemory/improveApi.js and identifyApi.js; services/student/api.js |
| Backend progress, stars, pass and unlocking | backend/src/modules/workingMemory/controllers/workingMemoryImprove.controller.js; models/workingMemoryImprove.model.js |
| Backend screening | backend/src/modules/workingMemory/controllers/workingMemoryIdentify.controller.js; models/workingMemoryIdentify.model.js |
| Feedback precedent | frontend/src/pages/phonologicalAwareness/ImprovementActivityPA.jsx and existing frontend/src/components/ui/Toast.jsx; inspect and adapt presentation without changing that module |

## Current behavior

- Game flow currently contains video/tutorial -> separate intro/ready -> game question phase -> separate feedback -> Next -> results after five questions. Picture Memory also has its own Play gate before memorisation.
- Pattern currently selects an answer and requires Check. Instructions automatically start speaking on entering the listening phase; they already use a one-second gap with a playback cancellation token. They allow moving to the question before playback finishes.
- Number memorisation starts on entry, but answer digits are currently removed from the pool after selection, and clearing can remove a chosen slot rather than exclusively the last digit.
- Picture Memory supports tap placement, native drag/drop, slot swapping and returning selected cards to the pool. Explicit shared Undo/Start over controls need to be added as requested.
- Existing improvement memorisation configuration is Level 1: 12s, Level 2: 10s, Level 3: 8s, Level 4: 6s. It is used by number/picture games. Some existing number questions require backward recall and have stored reversed correct answers; these must remain intact.
- All 96 combinations of grade (2-4), level (1-4), game (4), language (2) were checked through the active data selector: **each contains exactly five questions**. Picture order is currently kept, while other game question lists are shuffled. Existing retry does not select a different question set.
- A correct answer adds one score point and five stars; Next advances and submits at the end. There is no universal synchronous first-answer guard in the shared improvement evaluator, so add one to prevent rapid duplicate submissions.
- The backend and frontend result fallback currently use **2/5** to pass. Backend awards five stars per correct answer, records the attempt, updates student/progress stars, unlocks the next game sequentially, and unlocks the next level when all four games are complete.
- Initial unlocked levels derive from the first screening result/ML risk or accuracy. Do not replace this with the prototype's hardcoded Level-1-only start.
- Screening currently has exactly **15 questions for each of grades 2, 3, 4 in English and Sinhala**. Its memorisation durations are grade-based: 8s, 7s, 6s. It has its own scoring, completion, save/retry and star tracker; preserve those.
- Music file exists at frontend/public/audio/workingMemory/bgmusic.mp3, but Working Memory currently has no persistent music player consuming it. Map/game sound toggles are local state. Improvement feedback uses Web Audio chimes; instruction speech uses browser speech synthesis. correct.mp3, wrong.mp3 and click.mp3 also exist.
- App.jsx cancels registered question audio on route changes. Persistent module music must have a separate lifecycle so question audio still stops while the music does not restart.
- The recent access fix resolves the authenticated profile ID before fetching progress. Keep it, real screening restrictions, locked-game checks and retryable network errors.

## Assets: present and missing

No project `/shared` directory was found outside dependencies/backups. No second project ZIP was supplied in this message. The real repository is available, so it can be used without reconstructing a project from a ZIP.

The new named assets directory contains **67 files**:
- Four new WebP backgrounds; one WebP vine board; one WebP bunny.
- Four level-specific bucket PNGs.
- Four level-specific glossy round number-button PNGs.
- Seven navigation PNGs, including the five-step tracker.
- Thirteen supplied SVG icons (use files as images; do not redraw them).
- Four card backs and 29 card-front images.

Card-front coverage in the ZIP:
- L1: apple, bird, butterfly, tree.
- L2: apple, balloon, bird, bunny, butterfly, carrot, flower, strawberry, tree.
- L3: apple, balloon, bird, bunny, butterfly, carrot, strawberry, tree (no flower front).
- L4: apple, balloon, bird, butterfly, carrot, flower, strawberry, tree (no bunny front).

Existing data contains many other pictures (cat, book, key, car, turtle, etc.) with existing illustrations or sprite references. Keep these questions and their stable identifiers. Reuse existing picture art inside a frame matching the new level theme; do not substitute new sample questions merely to fit the ZIP's limited fronts.

Not supplied as distinct reference assets/screens:
- Dedicated How to Play illustration set and target screenshot.
- Screening target screenshots and a finished fifteen-step vine tracker image.
- Dedicated level-completion screen/reference distinct from the game-results screen.
- Local Lexend/Fredoka/Noto Sans Sinhala font files; prototype loads Google Fonts.
- Separate blank card-front frames for all existing question objects.

No placeholder or final missing artwork will be generated without further authorization. How to Play can use approved existing bunny/card/icon assets and real instructional text. The fifteen-step tracker can be composed from supplied assets and real counters after approval; it is not present as a ready-made PNG.

## Exact visual baseline

- 1600x900 fixed logical stage, scale min(viewportWidth/1600, viewportHeight/900), centered over a window-covering background.
- Nav top 20, sides 28; tracker left 550, top 124, width 500.
- Board left 300, top 175, width 1000, height 580, one stretched background image; no border-image.
- Bunny left 28, bottom 36, height 400, rotation 5 degrees.
- Thought bubble left 20, top 184, width 262; level bucket overlaps the lower-right board corner.
- Spec theme triples accent/dark/light: L1 #E07B1F/#B5560B/#FDE3C6; L2 #5BA35A/#3A7A39/#DDEFD3; L3 #E77FA6/#B23C6C/#FBE1EB; L4 #8A6BC9/#5E3FA3/#EAE2F8.
- Lexend UI, Fredoka large titles, Noto Sans Sinhala; minimum design-stage target 60px.

## Conflicts and proposed resolutions

User prompt takes priority over spec/prototype where already explicit:
- Use immediate Pattern feedback and Next after either answer, despite screenshot/spec Check/Try again.
- Use selected-language instruction speech and manual Listen start, with one-second gaps; do not retain automatic English-only prototype playback or allow Show Question before completion.
- Hide language controls everywhere except the map, despite language buttons in game screenshots/spec.
- Use the requested gentle incorrect sound, despite the spec's no-failure-sound line.
- Number game begins showing the stored sequence with the existing timer, despite prototype's extra Number Ready/Play screen; there is no separate general Get Ready screen.
- Retain actual question options/counts, including questions with four options; do not trim them to the screenshots' three-option example.
- Keep existing timer configuration (12/10/8/6), despite screenshot/prototype examples, and display the real duration rather than a misleading fixed 5-second note.
- New 3/5 threshold requires both backend and frontend changes, not CSS alone.
- Retrying a different set of five is impossible with the present five-item pools. Shuffle existing five and their options; a larger approved pool is required for different sets.
- Use the existing identification-derived initial unlock and sequential unlocking, not prototype localStorage/unlock=all behavior.

Need confirmation:
1. Earlier user requirement explicitly retained the old Level 01 board on every How to Play screen. The new visual system supplies a new shared board. Keep the old How to Play board, or replace it with the new supplied board for consistency?
2. Apply 3/5 to future attempts while preserving already-earned stars/unlocks, or deliberately recalculate historical 2/5 passes? Recommended: preserve existing earned progress; no automatic historical migration.
3. Fixed-stage scaling makes a 60px design button roughly 51px at 1366x768 and 48px at 1280x720. Proposed: use larger design-stage hit areas where possible while keeping the required stage proportions. The fixed-stage requirement also scales phone controls much smaller; laptop fidelity is the explicit target.

## Implementation and review order after OK

1. Preserve the current modified source/assets and access fix in a new exact backup. Record touched files; no reset of unrelated uncommitted work.
2. Shared responsive stage, themes, nav, asset-backed buttons, five/fifteen-step trackers, bunny/bubble/bucket, feedback, persistent music/mute.
3. Map (01) and menu (02): real API access/stars, existing unlocks, language only here, game Back returns to the selected menu.
4. Pattern (03): existing data/options with one-answer guard, instant feedback and Next.
5. Picture (09,10,11): hidden cards until Ready, real timer text, reveal/transition, numbered empty slots, shuffled cards, tap/drag, Undo and Start over, ID validation.
6. Instructions (04,05): manual Listen, selected-language sequential playback, real playing-only waves, no overlap, replay/question controls after completion, all existing answer options.
7. Numbers (06,07,08 with prompt-priority flow): stored numbers and existing timer; full ten-key pad remains visible and supports repeat digits; last-digit Undo; exact forward/backward validation.
8. Results (12), retry and level completion: out of five, 3/5 passes, server-authoritative unlocks, actual persistent stars, fresh shuffled attempt.
9. Screening: same visual stage and new assets, 15 vine steps plus existing star tracker/count; no changes to screening educational data, timings or scoring.
10. After each screen capture 1600x900 app output, compare to the corresponding reference, refine and report the screenshot path. Verify 1366x768/1280x720 stage scaling and keyboard focus.
11. Run build/lint/unit/browser checks, including actual API availability; verify hidden/reveal phases, timer transitions, repeated digits, card identity/conservation, undo/reset, correct/incorrect feedback, first-answer score guard, 2/5 fail versus 3/5 pass, retry, language/music continuity, persisted stars and screening 15-step progress. Distinguish mocked checks from live-service checks.
