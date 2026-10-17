# Working Memory

This module has two separate activities: Identification screens the student's working memory, and Improvement provides four practice games. The reorganization keeps the existing questions, artwork, timings, saved identifiers and game rules.

## Start here

| File or folder | What it does |
| --- | --- |
| `identification/Identify.jsx` | Loads screening questions, handles answers and timers, calculates results, saves them and navigates between screens. |
| `identification/IdentifyIntroScreens.jsx` | Shows the welcome, instructions and practice preparation. |
| `identification/ScreeningUI.jsx` | Displays screening boards, questions, controls and completion. |
| `improvement/ImprovementLevelsWM.jsx` | Loads saved progress and displays the level map and game selection. |
| `improvement/ImprovementActivityWM.jsx` | Runs one practice attempt, including question selection, timers, answers, Undo, scoring, saving and navigation. |
| `improvement/games/` | Four named entry components that pass the controller's state and actions to the existing shared presentation. |
| `improvement/components/GamePresentation.jsx` | Displays tutorials, Ready, game questions, feedback and results. |
| `improvement/components/PatternPresentation.jsx` | Preserves the pattern game's particular layout and interactions. |
| `improvement/components/MemoryUI.jsx` | Shared navigation, stage, bunny, boards, trackers, buttons and cards. Screening also uses these components. |
| `improvement/components/HowToPlayScreen.jsx` | Displays tutorial videos and the existing Play, Skip and Ready flow. |
| `improvement/components/Level*Dashboard.jsx` | Preserves each level's result and completion design. |
| `data/` | Screening and improvement question banks, video configuration and artwork metadata. |
| `styles/` | Screening, game and level styles. Their import order is preserved. |
| `utils/` | Audio lifecycle, themes, attempt selection and presentation helpers. |

The older, unreferenced `SharedScreens.jsx` was superseded by the live presentation and dashboard components. There is no second gameplay controller.

## How Identification works

The `/working-memory/:grade` route opens `Identify.jsx`. `data/screening/index.js` selects the Grade 2, 3 or 4 bank; each bank contains English and Sinhala questions. The controller handles the existing welcome/practice flow, remembers answers, calls the shared evaluator and metrics utilities, then saves through `services/workingMemory/identifyApi.js`.

`data/screening/legacyQuestions.js` is retained for artwork coverage tests. It is not the current screening bank. Do not substitute it for the grade banks.

## How Improvement works

The `/improvement-wm/:grade` route opens the level map. Selecting a game opens `/improvement-activity-wm/:grade/:levelNumber/:subCategoryKey`.

`data/improvement/index.js` selects `grade2`, `grade3` or `grade4`, then `en.js` or `si.js`, a difficulty level and a game. `patternQuestions.js` and `pictureMemoryQuestions.js` provide the existing specialized question mappings. The six translated banks remain separate; no questions were merged or rewritten.

The controller selects five questions and runs the tutorial, Ready/memorization, answer, feedback and result stages. The four wrappers are `PatternGame`, `PictureMemoryGame`, `InstructionsGame` and `NumbersGame`. They reuse `GamePresentation`; timers, scoring and saving stay in the controller.

The stored game order is `pattern`, `words`, `instructions`, `numbers`. **`words` means Picture Memory** and must remain unchanged in routes, APIs and saved records. School grade and difficulty level are separate values.

Three correct answers pass an attempt. Each correct answer earns five stars, including replays in the current implementation. Passing unlocks the next game; completing all four games unlocks the next level, up to Level 4. A failed replay does not remove an earlier completion. The backend remains the authority for saved progression.

Picture Memory uses ten seconds to memorize. Number Memory uses 12, 10, 8 and 6 seconds at Levels 1–4 after Ready. Pattern and instruction screens retain their own existing stages. See [the behavior guide](../../../../docs/WORKING_MEMORY_BEHAVIOR.md) for the complete timing and persistence details.

## Editing the module

- Change layouts in `identification/`, `improvement/components/` and the matching files in `styles/`. Keep the scoped level styles separate because their layouts differ.
- Edit screening questions in `data/screening/grade*.js`. Edit improvement questions in `data/improvement/grade*/`, with the specialized pattern/picture banks beside them. Preserve IDs, schemas and the `words` key.
- Add images under `frontend/public/images/workingMemory/shared`, `screening` or `improvement`, according to their purpose. Browser URLs start with `/images/workingMemory/`, without `public`.
- Keep pattern atlases and crop metadata together conceptually: the sheets live in the pattern asset folder, while `data/patternArtworkManifest.js` and `patternArtworkBounds.json` describe their cells. Do not rename cells or change sprite coordinates during a file move.
- Picture Memory uses both standalone images and a sprite sheet. Its mapping and generated filenames live in `data/improvement/pictureMemoryQuestions.js`.
- Configure tutorial overrides in `data/howToPlayVideos.js`; empty overrides retain the existing fallback video. Theme asset selection lives in `utils/themeAssets.js`; colors are in `utils/themes.js`.
- Background music remains in `public/audio/workingMemory`, with lifecycle code in `utils/audio.js`. Fonts remain in `public/fonts/workingMemory`.
- Shared answer evaluation, scoring and recommendations remain in `frontend/src/utils/workingMemory`. HTTP services remain in `frontend/src/services/workingMemory`. Express routes, controllers and Mongoose models remain in `backend/src/modules/workingMemory`.

## Run and verify

From `frontend`, run `npm install` if dependencies are missing, then `npm run dev`. A normal signed-in session also needs the existing backend and its configured database; start it with `npm start` from `backend`.

```sh
npm run build
npm run test:unit -- --configLoader runner
npx eslint src/pages/workingMemory src/services/workingMemory src/utils/workingMemory src/App.jsx
node scripts/wm-redesign/backend-policy.cjs
```

`--configLoader runner` avoids an ancestor-directory access problem with Vite's default bundled configuration in this workspace. The backend policy script uses in-memory model doubles and does not write to MongoDB.

With Vite running at `http://127.0.0.1:5173`, the browser verification script checks all supported grade/language/game/level combinations with mocked APIs:

```sh
node scripts/wm-reorganization/verify-browser.mjs
```

The four `playwright.level-*.config.js` files run the existing isolated level suites. To run all four level suites and screening with mocked APIs, use `npx playwright test --config=playwright.wm-refactor.config.js --workers=1`. These suites can also run against `npm run build` followed by `npm run preview -- --host 127.0.0.1 --port 5173`.

The normal `playwright.config.js` also includes real-backend tests that need suitable test accounts and services; these can write test records.

See [the reorganization report](../../../../docs/WORKING_MEMORY_REORGANIZATION.md) for file moves, asset mappings, baseline comparisons, test results and remaining manual checks. Images placed in `frontend/_workingMemoryReview/okay to delete` are retained for review and are not shipped as public assets.
