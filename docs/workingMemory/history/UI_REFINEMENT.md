# Reference-based content refinement

## Scope and reference audit

Inspected all 35 PNGs in `UIs.zip`: 19 current screenshots and 16 reference designs. The ZIP contains screenshots rather than reusable source artwork. Its examples guide layout only; actual educational data remains authoritative.

| Current screenshot suffix | Reference | Implementation |
| --- | --- | --- |
| 112101 | 09_45_59 AM-1 | Screening pattern symbols, missing token, pastel choices, prompt/speaker and nearby helper |
| 112114 | 09_46_00 AM-2 | Screening picture study panel, larger image-only sequence |
| 112121 | 09_46_05 AM-6 | Screening picture answer rows, evenly distributed artwork and count-aware sizing |
| 112146 | 09_46_01 AM-3 | Screening numbered instruction steps and soft badges |
| 112155 | 09_46_02 AM-4 | Screening action choices grouped closer to heading; existing immediate selection preserved |
| 112213 | 09_46_06 AM-7 | Screening large numeral tiles in central pastel panel |
| 112222 | 09_46_04 AM-5 | Screening readable horizontal numeral sequences in pastel answer rows |
| 112255 | No final reference | Existing two-column score/recommendation layout, balanced headings/rows/actions |
| 111742 | LexiLand Pattern Adventure | Wider pattern, clearer missing item, three equal answer cards and nearby helper |
| 111833, 111842 | memory screen 1, 2 | Improvement picture Ready/study: larger matching cards, grouped timing notice/bar |
| 111911, 111934 | memory screen 3 | Larger aligned picture slots and pool, consistent Undo/Start over/Submit row |
| 111945, 112007 | instruction following scrren 1 | Centred bunny, audio indicators/status and prominent Listen; replay/question controls stay in same activity |
| 112015 | Calm reference answer-card family | Four instruction options in a 2 x 2 pastel grid |
| 112024, 112036 | number screen 1, 2 | Larger study tokens, integrated timer, larger slots and 5 x 2 numeric keypad |
| 111820 | Try Again / Level Complete references | Less dominant result heading, balanced dynamic score/stars/stat cards and aligned actions |

## Root causes and changes

- Fixed-size small activity elements did not use the existing board's available interior. New `styles/contentRefinement.css` scopes the proportions and spacing to working-memory question/results content.
- Large transparent image canvases made some objects look much smaller than others. Extracted the existing screening alpha-bounds display fitting into shared `components/PictureArtwork.jsx` and reused it for improvement picture fronts. Original image files/pixels and identifiers are unchanged. Sprite previews scale with their cards.
- Picture-answer row sizing now accounts for the actual option count so three-choice questions fit as well as two-choice questions.
- `components/GamePresentation.jsx` retains the answered activity with a compact inline feedback footer. It no longer replaces each non-pattern question with a large feedback panel. Existing answer handlers, correctness, Next, scoring, timers and save callbacks remain connected.
- Instruction question components are keyed by question ID so listening state resets for every new question while the same-question answer/feedback presentation stays stable.
- Result content fits inside the original boards. Correct, Incorrect and Stars Earned have equal card widths; total stars remain in the top navigation.

No board asset, board external bounds/placement, background, outside mascot, basket, navigation, tracker logic, How to Play layout, question dataset, API, timer configuration or scoring/unlock rule was changed. The normal board's computed bounds remain left 300, top 175, width 1000, height 580 in the existing 1600 x 900 stage. Pattern results keep their existing separate board.

All existing artwork was reused; no new raster generation was necessary. Current source and the supplied references are preserved under `.design-backups/ui-refinement-before/` for undo and comparison. Earlier uncommitted map work remains intact.

## Executed validation

- Production build and targeted ESLint: passed. Existing large-bundle and stale Browserslist warnings remain.
- Unit suite: 1,246 tests passed (186 screening answer checks, 1,056 improvement answer checks, four recommendation checks).
- `playwright.screening.config.js`: all 12 tests passed, exercising all 15 questions for grades 2/3/4 in English/Sinhala, study/answer stages, picture-only sequences, audio failure fallback, recommendations, completion save failure/retry and desktop/laptop/tablet/phone containment.
- `scripts/wm-redesign/content-refinement.mjs`: all four games at all four levels passed with five real questions per game, mixed correct/incorrect answers, one score per answer, drag/drop, Undo, Start over, numeric input, results and replay reset. Music/mute navigation regression passed.
- `scripts/wm-redesign/pattern-reference.mjs`: 1/5, 3/5 and 4/5 outcomes across all four levels, retry saving, dynamic stars, passing gate, next-game route, fresh retry, same-board subtle feedback, Sinhala/laptop and transparent art checks passed.
- `scripts/wm-redesign/edges.mjs`: 2/5 blocks Next, failed save/retry, reset, ordered English speech with real one-second gaps, persistent music object and mute passed.
- `scripts/wm-redesign/backend-policy.cjs`: actual backend controller exercised with in-memory model doubles; scores 0-5, five stars per correct answer, 3/5 threshold, game/level unlocks, retained completion and grade-specific screening gate passed. No database writes.
- `scripts/wm-redesign/refinement-visual.mjs`: 1920 x 1080 rendered captures of all Level 1 activity types/stages, original board bounds, no off-board controls, and a complete real-order fifteen-question screening flow passed. Screenshots were inspected and refined against the supplied references.

Latest screenshots: `.design-backups/ui-refinement-before/qa/visual/`, `qa/flows/`, and `qa/pattern-results/`.

## Verification limits

### Follow-up: separate screening artwork

The user's later instruction explicitly supersedes preservation of the seated screening mascot and improvement Level 1 background. Located the exact existing supplied `identify/screening/bunny.png` (standing waving presenter) and `forest.png` (daytime tropical clearing); their duplicates in `improve/reference-art/` have identical SHA-256 hashes. Reused those originals without new generation. `prepare-screening-assets.mjs` exports alpha-preserving `bunny.webp` and exact 1600 x 900 `forest.webp`, retaining both PNG originals. `identify/screeningAssets.js` supplies their shared URLs to screening questions, demo/completion and intro backgrounds. Improvement artwork and all board geometry are unaffected. The standing presenter is sized and positioned only by `.lx-screening .wm-screen__standing-bunny`.

Re-executed all 12 screening tests, the 1920 x 1080 full fifteen-question visual flow, targeted screening ESLint and production build after integrating these assets: passed. Rendered standing-bunny/forest question screenshots were visually inspected. Before this follow-up, preserved source in `.design-backups/ui-refinement-before/screening-standing-before/`.

Browser tests mock account/save endpoints and speech completion; no live student attempt was written and actual speaker output was not audited by ear. Tests verify the playback callbacks, ordering, fallback and mute behavior. Visual fidelity follows the supplied internal-content references while deliberately preserving the original boards/backgrounds/mascots as requested; pixel identity with different reference examples is not claimed.
