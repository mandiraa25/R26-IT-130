# Working Memory safe reorganization

Started: 2026-10-17. The baseline is the workspace at the start of this task, including the user's modified and untracked files, rather than the Git HEAD revision.

## Plan recorded before application edits

1. Save the initial Git status, file hashes and a private local copy of the module, assets, integrations, scripts and tests. Run the available build, unit, lint and isolated browser checks.
2. Move screening questions into `data/screening` and improvement translations into `data/improvement/grade{2,3,4}/{en,si}.js`. Compare all loaded question data with the baseline.
3. Organize image files by shared UI, screening and improvement responsibility. Preserve image bytes and atlas coordinates, update generated paths and tooling, and copy any required assets owned by other modules.
4. Separate `identification` and `improvement`, rename the four game wrappers consistently, and update every import. Keep CSS rules and their order intact.
5. Remove only verified unused source and duplicated helpers. Add short comments around the existing flow without changing algorithms.
6. Move only images with complete non-usage evidence into the review folder outside `public`; document uncertain images separately.
7. Run the checks again, compare question content, asset bytes and browser output, and document remaining limitations.

## Dependency map

```text
App routes
  -> identification/Identify
       -> screening question banks by grade and language
       -> IdentifyIntroScreens / ScreeningUI
       -> answer evaluator / metrics / identification API
  -> improvement/ImprovementLevelsWM
       -> LevelMenu / improvement access API
  -> improvement/ImprovementActivityWM
       -> data/improvement/index -> translated banks + pattern/picture mappings
       -> PatternGame / PictureMemoryGame / InstructionsGame / NumbersGame
            -> GamePresentation -> PatternPresentation and level dashboards
                 -> MemoryUI / HowToPlayScreen / artwork renderers
       -> attempt selection / audio / themes / answer evaluation / improvement API

Screening and improvement both use artwork and UI helpers.
API services -> shared API client -> existing Express routes/controllers/models.
Public image URLs -> standalone files, generated card paths and atlas cells.
Asset preparation scripts -> retained source PNGs -> delivered WebP files.
```

The backend schemas, API contracts, saved `words` category key, translations, question IDs, scoring, timers and progression rules remain the baseline. Retained CSS rules preserve their content and order apart from image URLs; removing dead source also removes unused Tailwind output.

## Completed organization

The module now separates `identification/` from `improvement/`. Screening banks are under `data/screening/`; the six translated improvement banks are under `data/improvement/grade{2,3,4}/{en,si}.js`. Four consistently named game wrappers reuse the existing presentation. Necessary artwork renderers, level dashboards, mappings and scoped styles remain separate.

See [the complete final source and image tree](WORKING_MEMORY_FINAL_TREE.md) and [the beginner's module guide](../frontend/src/pages/workingMemory/README.md).

| Deliverable | Location |
| --- | --- |
| Every source relocation/rename | [WORKING_MEMORY_SOURCE_MOVES.json](WORKING_MEMORY_SOURCE_MOVES.json) |
| Removed source files, baseline hashes and evidence | [WORKING_MEMORY_REMOVED_SOURCES.csv](WORKING_MEMORY_REMOVED_SOURCES.csv) |
| Every original asset path, final path, URL, hash and reason | [WORKING_MEMORY_ASSET_MOVES.csv](WORKING_MEMORY_ASSET_MOVES.csv) |
| Current public assets, sizes and hashes | [WORKING_MEMORY_ASSETS_CURRENT.csv](WORKING_MEMORY_ASSETS_CURRENT.csv) |
| Usage evidence and uncertain retained images | [WORKING_MEMORY_ASSET_USAGE.csv](WORKING_MEMORY_ASSET_USAGE.csv) |
| Image review explanation and manifest | [okay to delete/README.md](../frontend/_workingMemoryReview/okay%20to%20delete/README.md), [manifest.csv](../frontend/_workingMemoryReview/okay%20to%20delete/manifest.csv) |
| Actual gameplay, timings and API behavior | [WORKING_MEMORY_BEHAVIOR.md](WORKING_MEMORY_BEHAVIOR.md) |

There were 49 source relocations. Six moved components were subsequently confirmed unused and removed; their entries explicitly say `removed after relocation`. The removal manifest lists all ten removed files. No screening or improvement question bank was removed or combined.

## Asset changes and review folder

The original 313 files in the WM image tree were accounted for: 285 were relocated and 28 images were placed in the review folder. Fifteen exact copies provide WM-owned artwork: the flower, speaker and three intro decorations previously owned by other modules, plus ten screening objects now also owned by Picture Memory. Original assets belonging to other modules were preserved.

The final public WM image tree contains 300 files, including 293 images and seven documentation files. Adding the unchanged audio and font roots gives 313 files in the current public inventory.

Assets are organized under `shared/`, `screening/` and `improvement/`. Grade 3 Picture Memory cards use `improvement/picture-memory/grade3/level{n}/wm-picture-g3-l{n}-{object}.png`; repeated artwork within the same grade and level shares one file. Pattern atlas cells, sprite indices and crop metadata are unchanged. The original PNG inputs to WebP preparation and measurement scripts remain available at their new paths, and those scripts were updated.

The review folder contains:

- Five Grade 3 files that no current English or Sinhala question generates: `g3_l4_words_q1_book_i3.png`, `g3_l4_words_q1_car_i5.png`, `g3_l4_words_q1_frog_i6.png`, `g3_l4_words_q3_duck_i6.png`, and `g3_l4_words_q3_pen_i5.png`.
- Twenty-three byte-identical copies of artwork repeated within the same Grade 3 level. Every affected question points to the retained identical image. The manifest identifies each retained destination and matching SHA-256.

No images were permanently deleted. No images were generated: all required active artwork was found, including standalone images and sprites. The only missing literal images belonged to the unimported prototype `sample.jsx`, which was removed. They were not active game dependencies.

The usage CSV explicitly retains 85 images whose use could not be established confidently from literal references and the audited dynamic families. Additional higher-level card fronts are also retained conservatively and identified as a retained card family. A text-search miss alone was not used as deletion evidence.

## Cleanup and responsibilities

Ten unreferenced files were removed: `Helpers.js`, `sample.jsx`, `Picnicbasket.jsx`, `WordCard.jsx`, `SharedScreens.jsx`, `GameSelectionModal.jsx`, `LevelThreeUI.jsx`, `ActionButton.jsx`, `Gamestyles.jsx` and `redesign.css`. The duplicate helper module is superseded by the existing `utils/gameHelpers.js`. The older screen/button/style chain had no live entry point; current screens are rendered by `GamePresentation`, `PatternPresentation` and the level dashboards.

`Identify.jsx` remains the screening controller. `ImprovementLevelsWM.jsx` remains the saved-progress level map. `ImprovementActivityWM.jsx` remains the sole improvement controller for question selection, stages, timers, answers, Undo, stars, submission and navigation. `PatternGame`, `PictureMemoryGame`, `InstructionsGame` and `NumbersGame` remain thin wrappers. `MemoryUI` supplies common visual elements, and `HowToPlayScreen` owns the tutorial presentation. Short comments explain the preserved controller flow.

Existing API services, scoring/evaluation utilities, backend modules, audio and fonts were checked against the starting snapshot: all 28 files in those groups are byte-identical. App route URLs and stored category keys are unchanged; route imports now point to the relocated screens.

## Preservation evidence

- Initial status, 478 file snapshots and baseline hashes are retained locally under `.cache/wm-reorganization/`. This includes existing modified and untracked work; Git HEAD was not used as the functional baseline. No reset, checkout, commit or staging operation was performed.
- Every loaded screening bank and all 96 improvement configurations were compared with the baseline. Question content, IDs, order, translations, answers, timing values and sprite associations match; only the approved image URL mapping is normalized for this comparison.
- All 306 original images, including the 28 review images, and all 15 exact copies retain their image bytes and SHA-256 hashes. No image transformation or conversion script was run.
- Structural comparison covered 62 retained JS/JSX/CSS/JSON files. Import paths, asset paths, the Picture Memory wrapper name and comments were allowed to change. Two remaining differences were manually reviewed: pattern artwork preloading names, and ScreeningPicture's relocated re-export. The Picture Memory URL generator was separately checked against the full loaded question snapshot.
- Browser snapshots were captured before and after: 291 of 456 are byte-identical, 158 have small raster/crop differences, and seven have larger capture differences. Inspected larger differences include baseline captures taken before CSS boards/buttons or cropped artwork loaded. The snapshot collection is supporting evidence, not a claim that every capture passed an exact pixel comparison. The reusable capture script now waits for CSS backgrounds as well as image elements.

## Verification

Baseline build, scoped lint, 1,263 unit tests and the existing in-memory backend policy checks passed. The default Vitest config bundler encountered a sandbox ancestor-directory access issue; `--configLoader runner` worked. All subsequent build/unit commands used that supported loader.

Final checks completed:

| Check | Result |
| --- | --- |
| Frontend production build | Passed; existing large-bundle and outdated Browserslist warnings remain. |
| Scoped ESLint: WM pages/services/utilities and App | Passed, no errors. |
| Unit tests | 1,290 passed: 1,263 existing tests plus 27 asset checks. |
| Actual backend improvement controller with in-memory models | Passed: scores 0–5, pass threshold, stars, retained completion, activity/level unlocking and grade screening prerequisite. No database writes. |
| Browser smoke: 96 improvement combinations | Passed: Grades 2–4, English/Sinhala, Levels 1–4, all four games through tutorial, Ready/listening, applicable memorization/recall and first-answer feedback. |
| Browser smoke: 24 representative screening screens | Passed: four categories across all three grades and both languages. |
| Browser asset/page diagnostics | No broken images, local asset HTTP errors or page errors in the completed smoke run. |
| Existing Level 4 and screening browser suites | All 32 passed against the production preview: every screening question across six grade/language banks; five-question game attempts at 1/5, 3/5 and 4/5; dashboards, rewards, sound controls, completion, save/retry, audio fallback, intro and responsive layouts. |
| Repaired Level 1–3 browser suites | All 41 distinct cases passed. Initial stale-expectation failures were preserved, corrected against baseline behavior, and rerun successfully without production edits. |
| Map, navigation and refresh | Passed: four level cards/four game choices, popup refresh, entering Picture Memory and returning, activity refresh, and Sinhala language selection surviving refresh; no page errors or writes. |
| Relative module imports | Checked across frontend source, scripts and tests; no unresolved relative imports. |
| Git whitespace check | Passed. |

The smoke run contains 120 screen scenarios and six diagnostic records. It captures 456 images locally in `.cache/wm-reorganization/final-stable/smoke/`. It does not claim completion of all five questions in all 96 combinations.

The five existing isolated browser suites have **73 distinct passing cases, zero remaining failures** across verified runs. `frontend/.cache/wm-reorganization/browser-final-summary.json` aggregates the latest result for each file and full test title. The 32-case run passed in one invocation. The first repaired 41-case run had 29 passes and 12 stale-expectation failures; after correcting those expectations, 11 passed in the targeted rerun and the final cross-level case passed in its own rerun. Raw reports and failure contexts are retained, including `final-preview32-results.json`, `repaired-levels-initial-results.json`, `repaired-levels-rerun.log` and `repaired-cross-level.log`. ESLint also passes for the three repaired test files.

Earlier browser runs were interrupted by a stopped local Vite server and later by the user interruption. Their partial results and connection failures are retained and are not counted as passing runs. An initial temporary screening smoke harness also used English IDs for Sinhala; after using the banks' actual Sinhala IDs, all 24 representative screening scenarios passed.

Baseline Level 1/3 suites encountered stale `.lx-step-circle` selectors; Level 2 contained the same assumption. Those test helpers now inspect the existing `.lx-step` cells, actual answered/current states, completion marks and existing tracker geometry. Other stale assertions concerned the Level 1 `Number Recall` activity label, Level 2's existing Ready flow, and the one-question tracker produced by an explicit demo ID. These expectations were corrected against the saved baseline source. No production UI or gameplay change was made to satisfy an obsolete test.

## Remaining verification limits

No live database was queried or written. Browser APIs, speech and media were mocked, so real account persistence, network recovery against a deployed backend, audible playback and external YouTube availability still need a normal signed-in manual check. Backend request/response behavior was exercised with the real controller and in-memory models, not a live HTTP/database deployment.

Existing policy differences were documented rather than changed: stars are awarded on replays, progress is student-wide while submissions require screening for the submitted grade, the backend trusts submitted correctness, and `Low` risk initializes Level 3. See the behavior guide for details.
