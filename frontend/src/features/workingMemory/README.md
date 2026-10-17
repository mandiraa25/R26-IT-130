# Working Memory

Frontend code for the Working Memory screening test and the four improvement games.
Routes are registered in `src/App.jsx`. The backend lives in
`backend/src/modules/workingMemory/` (`routes/`, `controllers/`, `models/`).

## Where things are

| What | Where |
| --- | --- |
| Screening (identification) page and flow | `identification/ScreeningPage.jsx`; intro popups in `ScreeningIntro.jsx`, question screens in `ScreeningQuestions.jsx` |
| Screening questions | `identification/data/grade2.js`, `grade3.js`, `grade4.js` |
| Level map and its game popup | `improvement/LevelSelection.jsx`, `improvement/GameMenu.jsx` |
| Game screen (picks tutorial, question, results or level-complete view) | `improvement/ActivityScreen.jsx` |
| Improvement game controller (question selection, timers, answers, stars, submit) | `improvement/ImprovementPage.jsx` |
| The four games | `improvement/games/PatternGame.jsx`, `PictureMemoryGame.jsx`, `InstructionsGame.jsx`, `NumberMemoryGame.jsx` |
| Improvement questions, one folder per game | `improvement/data/pattern/`, `pictures/`, `instructions/`, `numbers/`; `improvement/data/index.js` picks the bank for a grade, level, game and language |
| Shared screens | `shared/GameLayout.jsx` (background, navigation, bunny, vine board, buttons), `HowToPlay.jsx`, `Feedback.jsx`, `ActivityResults.jsx`, `LevelCompletion.jsx`, `ScreeningResults.jsx` (includes the recommended-practice list) |
| Picture and pattern artwork renderers | `shared/artwork/` (pattern emoji map: `patternSymbols.js` + `patternSymbolBounds.json`) |
| How things look: level colours, level images, screening images | `config/levelThemes.js` |
| Settings and text: grades, levels, game order, timings, game names, tutorial videos, Numbers game text, results-screen messages | `config/gameConfig.js` |
| Answer checking | `logic/answerChecking.js` (screening and the three improvement checkers) |
| Screening scoring | `logic/scoring.js` |
| Saved progress, question selection, practice recommendations | `logic/progression.js`; unlocking rules are applied by the backend improve controller |
| Stars | `STARS_PER_CORRECT` in `improvement/ImprovementPage.jsx` |
| API calls | `services/identifyApi.js` (`/working-memory/identification/...`), `services/improveApi.js` (`/working-memory/improvement/...`) |
| Styles | `styles/` |

The Picture Memory game is stored under the key `words` (routes, saved progress,
data). Do not rename that key; it is part of the API and database records.

## Images

All Working Memory images live in `frontend/public/images/workingMemory/` and are
served from `/images/workingMemory/...`. Do not reference images from other modules.

```text
identification/   intro/ popup art, objects/ for picture questions, practice/ recommendation art
pattern/symbols/  emoji artwork atlases (PNG sources + WebP delivery); mapping in shared/artwork/patternSymbols.js
pictures/         cards/, objects/, picture-memory-sprites.png, grade3/level1-4/ (Grade 3 only cards)
instructions/     instruction-frame.png
numbers/          number buttons
shared/
  backgrounds/    bg-level1-4, level-map/, screening/, how-to-play/ (video poster)
  bunny/          game bunny poses, wm-intro-bunny; screening/ for the standing presenter
  boards/         vine/, how-to-play/, level-map/, navigation/ (title plank, tracker, star pill), buckets/, screening/
  buttons/        level buttons, wm-close, actions/, navigation/ (back, music, language, progress)
  icons/          pattern symbol SVGs, wm-speaker, wm-magnifier; games/ for game thumbnails and menu icons
  feedback/       star and trophy
```

Screening art, Pattern atlases and picture objects are the same for every grade, so
each is stored once instead of being copied into grade folders. Only Grade 3 Picture
Memory has grade-specific cards.

The `wm-` flower, speaker, close button, intro bunny and magnifier are original
Working Memory artwork that replaced images copied from other modules; prompts are in
`docs/workingMemory/ORIGINAL_ARTWORK.md`.

Pattern questions keep their emoji values in data; the artwork is only how they are drawn.
