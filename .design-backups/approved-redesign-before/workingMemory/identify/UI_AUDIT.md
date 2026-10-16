# Working Memory screentest UI audit — October 15, 2026

## Scope and reference comparison

Reviewed the supplied golden vine-board question references (instruction study/recall, picture recall, number study/recall), the memory-check choice/rules references, completion reference, and the latest practice-card crop. Duplicate reference files depict the same layouts. The existing supplied bunny, forest and board images were retained. Earlier requirements for one star tracker, no LexiLand logo, immediate Pattern answers, and Home/Improvement completion navigation remain in effect.

The latest crop was applied to the **screentest results panel**. The home dashboard was not edited. Its SHA256 before/after this audit is `3A2F1DA6341586D420898A10DCD4CC0F52A6F1F9D4D9EBD7D09F6853CC868BF2`.

## Findings and fixes

| Finding from rendered screens | Correction |
| --- | --- |
| Results reused tiny game-selection thumbnails and verbose action labels | Four individual imagegen illustrations; cream cards with green borders, prominent medallions and reference-style category labels |
| A desktop selector overrode new illustration sizing | Scoped the illustrated results variant explicitly; other practice screens keep their existing presentation |
| Number study digits looked small relative to the board | Larger readable study tiles; sequence values and answer tiles unchanged |
| Picture recall said “words”; number recall retained a study instruction | Phase-aware localized display headings; no question data or correct-answer changes |
| Hover changed pink/blue/yellow cards to green | Retain each pastel surface, with a border/brightness interaction state |
| Bunny was smaller and farther from the board than the reference | Adjusted its desktop CSS size and position; original artwork untouched |
| Instruction badges had low visual prominence | Consistent, slightly larger numbered pastel badges |
| Saving/error text could overlap the score panel | Separate notification row; compact result panels while notices are displayed; visible retry button |
| Welcome/rules scaled desktop text to tiny sizes on phones | Flowing, vertically scrollable mobile layout with readable text and 48px primary controls |
| Briefing speaker target was too small | Wooden speaker image with a practical desktop touch target |
| Demo completion used an unrelated blue gradient | Reused screentest forest, golden board and bunny with the existing demo actions |

## Files changed in this audit

- `Identify.jsx`: localized recall display headings only.
- `ScreeningUI.jsx`: illustrated recommendations, themed demo completion, separated save notices.
- `IdentifyIntroScreens.jsx`: wooden briefing speaker and shared demo-completion presentation.
- `screening.css`, `identifyIntro.css`: the scoped layout and readability fixes above.
- `../components/RecommendedPractice.jsx`: optional illustrated screentest variant; ranking and routing unchanged.
- `src/locales/en/wm.json`, `src/locales/si/wm.json`: category captions and recall prompts.
- `public/images/workingMemory/identify/screening/practice/`: four generated PNGs and exact prompt documentation in README.md.
- `tests/e2e/screening-ui.spec.js`, `playwright.screening.config.js`: isolated mocked browser regression coverage.

## Human visual inspection of rendered output

- Captured and inspected **every Grade 3 English question, 1–15, before and after changes**, including study and recall states where applicable. Review sheets show all four patterns, all three picture questions, all four instruction questions, and all four number questions. Pattern study/answer are intentionally the same simultaneous screen.
- Inspected welcome/rules and demo completion in English and Sinhala, including narrow-phone layouts.
- Inspected completion at 1366×768 and 390×844, and captured/checked 1920×1080 and 768×1024 variants.
- Inspected English and Sinhala save-error screenshots, found the original overlap, fixed it, and inspected the corrected screenshots.
- Inspected all four generated illustrations individually before integration. Their actual browser images were decoded and checked in the completion tests.
- Local capture evidence: `frontend/.cache/popup-review/audit-before-*`, `audit-after-*`, `contact-before-*`, `contact-after-*`, `final-*`, `intro-*`, `demo-complete-*`. The completion capture with decoded images is `final-completion-1366.png`; an earlier immediate capture can show partially loaded large PNGs and is not used as final evidence.

## Automated verification (distinct from visual inspection)

- All **90 questions** across grades 2–4 and English/Sinhala: real browser rendering, asset decoding, board/control containment, no horizontal overflow, progress states, hidden-sequence phases, and repeated-tap protection.
- A complete 15-question run with actual Grade 3 seven-second memory exposures, before and after the question changes: one mocked save, 15 unique responses, unchanged score calculation, correct allocated durations, and Home navigation.
- All four recommendation artwork mappings, completion at laptop/desktop/tablet/phone sizes, and Improvement navigation.
- Speech-failure fallback: readable steps remain until Continue, then hide for recall.
- Save loading/failure/retry in both languages: practice disabled until a successful save; retry succeeds without duplicate final-answer submission. Panel-specific containment was added after visual review exposed an overlap that board-only geometry checks missed.
- Intro mobile primary controls are at least 48px high with at least 16px text; demo can transition to the real briefing.
- 1,246 unit tests passed, including existing answer evaluation and practice-ranking tests.
- Focused ESLint and production build passed. Build retains existing large-bundle and stale Browserslist warnings.

Reproduce browser checks with the frontend running:

```sh
npx playwright test --config=playwright.screening.config.js
```

The dedicated browser suite contains 12 tests; six cover all 15 questions for each grade/language pair. API reads/writes are mocked and memory timers are accelerated only inside these isolated tests. The separate full-length run used actual exposure durations. No test results were written to a real student's database.

## Limits and remaining issues

- All 15 Grade 3 English questions were visually inspected; the other grade/language combinations received browser/geometry checks, not a claim of 90 separate human pixel reviews.
- Speech lifecycle and failure behavior were tested with mocked synthesis events. Actual speaker output and installed Sinhala voice quality were not manually listened to.
- Generated practice illustrations match the reference's visual family; they are new artwork, not pixel-identical extractions. Question stimuli were not replaced.
- No remaining clipping or panel overlap was found in the inspected final screens. Mobile introductory screens intentionally scroll rather than shrinking text to fit one viewport.
- Browser verification is Chromium-based; this audit does not claim a Safari/Firefox pass or user testing with children.
