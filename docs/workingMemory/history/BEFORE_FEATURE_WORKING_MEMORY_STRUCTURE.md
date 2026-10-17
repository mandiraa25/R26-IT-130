> Historical inventory recorded before the safe reorganization. Its original contents are preserved below. For the current workspace, see [the final tree](WORKING_MEMORY_FINAL_TREE.md), [current assets](WORKING_MEMORY_ASSETS_CURRENT.csv), [file moves and verification](WORKING_MEMORY_REORGANIZATION.md), and [the module README](../frontend/src/pages/workingMemory/README.md). `WORKING_MEMORY_ASSETS.csv` is the corresponding original inventory.

# Working Memory module: structure and asset guide

Inventory date: 2026-10-17. This describes the current workspace, including existing uncommitted files. It does not rename, delete, regenerate, or modify application assets.

## Quick orientation

- Screening/identification: pages/workingMemory/identify ? identifyApi.js ? identification routes/controller/model.
- Improvement: ImprovementLevelsWM.jsx ? ImprovementActivityWM.jsx ? games wrappers ? shared GamePresentation/PatternPresentation and MemoryUI. The activity controller owns question stages, timers, validation, scoring and submission.
- Questions are frontend data, not image files or backend question-bank documents: data/improvement/index.js selects grade/language banks; config.js holds activity configuration. Grade 2, 3, 4 are school grades, separate from difficulty Levels 1?4.
- API persistence lives under backend/src/modules/workingMemory. MongoDB stores results/progress and answer data; shipped game artwork lives in frontend/public.
- Exact saved asset filenames, byte sizes and browser URLs are in [WORKING_MEMORY_ASSETS.csv](WORKING_MEMORY_ASSETS.csv). The full image tree is included below.

## Folder counts

| Folder | Files |
|---|---:|
| frontend/src/pages/workingMemory | 79 |
| frontend/src/services/workingMemory | 3 |
| frontend/src/utils/workingMemory | 5 |
| backend/src/modules/workingMemory | 6 |
| frontend/public/images/workingMemory | 313 |
| frontend/public/audio/workingMemory | 1 |
| frontend/public/fonts/workingMemory | 12 |
| frontend/scripts/wm-redesign | 23 |

## Frontend responsibilities

| Location | Purpose |
|---|---|
| ImprovementLevelsWM.jsx | Level map, saved progress and activity access |
| ImprovementActivityWM.jsx | Main four-game flow, Ready/memorize/recall/feedback/results, timer cleanup, Undo and API submission |
| games/ | Thin wrappers for pattern, picture (WordsGame), instructions and number games |
| components/MemoryUI.jsx | Shared stage, navigation, original wooden tracker, board, buttons and card rendering |
| components/GamePresentation.jsx; PatternPresentation.jsx | Question and feedback presentation |
| components/HowToPlayScreen.jsx | Tutorial/video and Skip/Ready flow |
| components/Level*Dashboard.jsx | Per-level results and completion presentation |
| components/PatternArtwork.jsx; PictureArtwork.jsx; LevelThreeSprite.jsx | Atlas/sprite/standalone-image display and cropping |
| data/ | English/Sinhala question banks, configuration, video overrides, artwork manifest and bounds |
| identify/ | Screening intro, screening UI, quiz bank and screening asset mappings |
| styles/ | Shared layout plus scoped per-level themes |
| utils/ | Themes, audio/music lifecycle, attempt helpers and shared presentation helpers |
| services/workingMemory/ | HTTP calls and short-lived token-bound improvement access cache |
| src/utils/workingMemory/ | Scoring, answer evaluation, error analysis and recommendations |
| pages/common/reports/*WorkingMemoryReport.jsx | Saved screening and improvement report views |

### Full module source tree

```text
??? backend/
?   ??? src/
?       ??? modules/
?           ??? workingMemory/
?               ??? controllers/
?               ?   ??? workingMemoryIdentify.controller.js
?               ?   ??? workingMemoryImprove.controller.js
?               ??? models/
?               ?   ??? workingMemoryIdentify.model.js
?               ?   ??? workingMemoryImprove.model.js
?               ??? routes/
?                   ??? workingMemoryIdentify.routes.js
?                   ??? workingMemoryImprove.routes.js
??? frontend/
    ??? src/
        ??? pages/
        ?   ??? workingMemory/
        ?       ??? APPROVED_REDESIGN_REPORT.md
        ?       ??? Helpers.js
        ?       ??? ImprovementActivityWM.jsx
        ?       ??? ImprovementLevelsWM.jsx
        ?       ??? LEVEL_FOUR_REFINEMENT.md
        ?       ??? LEVEL_THREE_REFINEMENT.md
        ?       ??? LEVEL_TWO_REFINEMENT.md
        ?       ??? UI_REDESIGN.md
        ?       ??? UI_REFINEMENT.md
        ?       ??? components/
        ?       ?   ??? ActionButton.jsx
        ?       ?   ??? GamePresentation.jsx
        ?       ?   ??? GameSelectionModal.jsx
        ?       ?   ??? HowToPlayScreen.jsx
        ?       ?   ??? LevelFourDashboard.jsx
        ?       ?   ??? LevelMenu.jsx
        ?       ?   ??? LevelOneDashboard.jsx
        ?       ?   ??? LevelOneUI.jsx
        ?       ?   ??? LevelThreeDashboard.jsx
        ?       ?   ??? LevelThreeSprite.jsx
        ?       ?   ??? LevelThreeUI.jsx
        ?       ?   ??? LevelTwoDashboard.jsx
        ?       ?   ??? MemoryUI.jsx
        ?       ?   ??? PatternArtwork.jsx
        ?       ?   ??? PatternPresentation.jsx
        ?       ?   ??? Picnicbasket.jsx
        ?       ?   ??? PictureArtwork.jsx
        ?       ?   ??? RecommendedPractice.jsx
        ?       ?   ??? SharedScreens.jsx
        ?       ?   ??? WordCard.jsx
        ?       ?   ??? levelOneDashboard.css
        ?       ??? data/
        ?       ?   ??? grade2.js
        ?       ?   ??? grade3.js
        ?       ?   ??? grade4.js
        ?       ?   ??? howToPlayVideos.js
        ?       ?   ??? improvement/
        ?       ?   ?   ??? config.js
        ?       ?   ?   ??? improvementGrade2_en.js
        ?       ?   ?   ??? improvementGrade2_si.js
        ?       ?   ?   ??? improvementGrade3_en.js
        ?       ?   ?   ??? improvementGrade3_si.js
        ?       ?   ?   ??? improvementGrade4_en.js
        ?       ?   ?   ??? improvementGrade4_si.js
        ?       ?   ?   ??? index.js
        ?       ?   ?   ??? patternQuestions.js
        ?       ?   ?   ??? pictureMemoryQuestions.js
        ?       ?   ??? patternArtworkBounds.json
        ?       ?   ??? patternArtworkManifest.js
        ?       ??? games/
        ?       ?   ??? Instructionsgame.jsx
        ?       ?   ??? Numbersgame.jsx
        ?       ?   ??? Patterngame.jsx
        ?       ?   ??? WordsGame.jsx
        ?       ??? identify/
        ?       ?   ??? Identify.jsx
        ?       ?   ??? IdentifyIntroScreens.jsx
        ?       ?   ??? ScreeningUI.jsx
        ?       ?   ??? UI_AUDIT.md
        ?       ?   ??? identifyIntro.css
        ?       ?   ??? quizData.js
        ?       ?   ??? screening.css
        ?       ?   ??? screeningAssets.js
        ?       ?   ??? screeningLayout.css
        ?       ??? quizData.js
        ?       ??? sample.jsx
        ?       ??? styles/
        ?       ?   ??? Gamestyles.jsx
        ?       ?   ??? contentRefinement.css
        ?       ?   ??? howToPlay.css
        ?       ?   ??? levelFour.css
        ?       ?   ??? levelOne.css
        ?       ?   ??? levelThree.css
        ?       ?   ??? levelTwo.css
        ?       ?   ??? memoryUI.css
        ?       ?   ??? patternArtwork.css
        ?       ?   ??? patternReference.css
        ?       ?   ??? popupMap.css
        ?       ?   ??? redesign.css
        ?       ??? utils/
        ?           ??? attemptQuestions.js
        ?           ??? helpers.js
        ?           ??? levelThreePresentation.js
        ?           ??? memoryMusic.js
        ?           ??? memoryTheme.js
        ?           ??? themeAssets.js
        ??? services/
        ?   ??? workingMemory/
        ?       ??? identifyApi.js
        ?       ??? improveApi.js
        ?       ??? resultsApi.js
        ??? utils/
            ??? workingMemory/
                ??? errorAnalysis.js
                ??? evaluateIdentifyAnswer.util.js
                ??? evaluateImprovementAnswer.util.js
                ??? practiceRecommendations.util.js
                ??? scoring.util.js
```

## Routes and backend storage

Frontend routes are registered in frontend/src/App.jsx:

| Route | Screen |
|---|---|
| /working-memory/:grade | Screening |
| /improvement-wm/:grade | Improvement level menu |
| /improvement-activity-wm/:grade/:levelNumber/:subCategoryKey | Improvement activity |
| /reports/wm/identification | Screening report |
| /reports/wm/improvement | Improvement report |

Backend mounts are in backend/src/app.js. Services use the shared services/api.js client.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/working-memory/identification/save-result | Save screening result/metrics |
| GET | /api/working-memory/identification/student-results/:studentId | Screening history |
| GET | /api/working-memory/improvement/progress/:studentId | Saved levels, access and totals |
| POST | /api/working-memory/improvement/submit-attempt | Save attempt, rewards and progression |
| GET | /api/working-memory/improvement/history/:studentId | Attempts; optional levelNumber/subCategoryKey query filters |

Models:

- WorkingMemoryIdentify: student, grade, score, question results (answers, correctness, error type, timings), total time, metrics/risk/weak areas/ML fields and timestamps.
- WorkingMemoryImproveProgress: one student document, initial identified level, maximum unlocked level, identification completion, totalStars/legacy totalCarrots, per-level completion and per-category access, best score, attempts and dates.
- WorkingMemoryImproveAttempt: grade, language, level/category, attempt number, score, passed status, stars/legacy carrots, answer results and timing.

These are Mongoose model names; physical collection names follow Mongoose defaults unless deployment configuration overrides them. No live database was queried for this inventory. The controller imports the shared Student model. Admin/student integrations are listed below. Existing improvement rules read from the controller: passing score ?3/5, five stars per correct answer, sequential category access, all categories completed for level completion, and next-level progression capped at Level 4.

Category keys are identifiers, not renamed files:

| Stored key | UI game |
|---|---|
| pattern | Pattern Recognition |
| words | Picture Memory (legacy WordsGame naming) |
| instructions | Following Instructions |
| numbers | Number Memory / Number Recall |

## Asset names and how they resolve

A file saved at frontend/public/images/workingMemory/ui/vine-board.webp is served as /images/workingMemory/ui/vine-board.webp. The public prefix is omitted in browser URLs. Folder/file case matters on case-sensitive hosting: workingMemory is camel case; working-memory in routes is hyphenated.

| Filename or pattern | Meaning / reference |
|---|---|
| ui/backgrounds/bg-level1.webp ? bg-level4.webp | Level 1 orange, 2 green, 3 pink, 4 purple; memoryTheme.js/themeAssets.js and MemoryUI |
| ui/buttons/btn-{color}.png | Level-themed button artwork |
| ui/nav/nav-*.png | Wooden header, star badge, sound/language controls and original tracker |
| ui/cards/pic-l{level}-back.png | Hidden leaf card back per difficulty level |
| ui/cards/pic-l{level}-{object}.png | Supplied illustrated front card; FRONTS in MemoryUI decides use (currently Level 1) |
| improve/cards/grade3/words/g3_l{level}_words_q{question}_{object}_i{item}.png | Grade 3 Picture Memory standalone image, generated URL in pictureMemoryQuestions.js; q/i are 1-based positions |
| improve/cards/picture-memory-sprites.png | 6?6 picture sprite sheet; spriteIndex chooses the cell, not another saved file |
| pattern/symbols/objects-a.webp; objects-b.webp; shapes.webp | 4?4 pattern atlases; manifest maps question symbols to rows/columns |
| data/patternArtworkBounds.json | Display crop metadata for pattern atlas cells; not an image |
| identify/*.png | Standalone screening objects also reused by Picture Memory |
| improve/themes/how-to-boards/L1.png | Deliberately shared tutorial board across levels; filename does not force Level 1 background |
| pattern/bunny-happy.webp; bunny-sad.webp | Dashboard expressions |
| ui/buckets/bucket-level{level}.png | Retained bucket artwork; existence is not proof it is displayed |
| audio/workingMemory/bgmusic.mp3 | Background music |
| fonts/workingMemory/* | Local font files, CSS and font licenses |

Example: g3_l4_words_q1_bag_i3.png means school Grade 3, difficulty Level 4, Picture Memory question 1, Bag at pool position 3. Distractors are also included in item numbering. English and Sinhala use the same object artwork with translated labels. The question ID convention g3_level4_g2_1 is a separate identifier; its legacy g2 token is not a filesystem path.

Runtime aliases: rabbit ? bunny selects illustrated card filenames in MemoryUI; Bike and Bicycle both map to picture sprite cell 17. These mappings do not rename physical files. Other sprite examples: Shoe=0, Apple=1, Spoon=8, Duck=9, Pen=29, YoYo=33. The full mapping is in data/improvement/pictureMemoryQuestions.js. Pattern emoji values normalize variation selectors and map through patternArtworkManifest.js; some composite tokens draw two atlas cells.

### Confirmed format conversions (not destructive renames)

- prepare-pattern-artwork.mjs exports objects-a.png, objects-b.png and shapes.png to same-basename .webp, preserving originals and dimensions. measure-pattern-artwork.mjs measures crop metadata separately.
- prepare-screening-assets.mjs exports screening forest.png/bunny.png to .webp; forest delivery is framed to 1600?900.
- optimize-map-assets.mjs exports map-menu PNGs to same-basename WebP; map background delivery is 1600?900.
- Other PNG/WebP pairs may coexist; their historical source/rename relationship is not established merely by matching names. No conversion scripts were run during this audit. No comprehensive historical rename claim is made.

Tutorial URL overrides live in data/howToPlayVideos.js; empty entries use the configured game fallback. Images/posters are separate from video URLs. Check these sources before renaming a poster or video.

### Complete WM public tree (exact saved names)

```text
??? frontend/
    ??? public/
        ??? audio/
        ?   ??? workingMemory/
        ?       ??? bgmusic.mp3
        ??? fonts/
        ?   ??? workingMemory/
        ?       ??? fonts.css
        ?       ??? fredoka-600.ttf
        ?       ??? fredoka-700.ttf
        ?       ??? fredoka-OFL.txt
        ?       ??? lexend-500.ttf
        ?       ??? lexend-600.ttf
        ?       ??? lexend-700.ttf
        ?       ??? lexend-OFL.txt
        ?       ??? noto-sans-sinhala-500.ttf
        ?       ??? noto-sans-sinhala-600.ttf
        ?       ??? noto-sans-sinhala-700.ttf
        ?       ??? notosanssinhala-OFL.txt
        ??? images/
            ??? workingMemory/
                ??? how-to-play/
                ?   ??? README.md
                ?   ??? video-poster.png
                ?   ??? video-poster.webp
                ??? identify/
                ?   ??? ball.png
                ?   ??? bird.png
                ?   ??? book.png
                ?   ??? bottle.png
                ?   ??? cat.png
                ?   ??? cup.png
                ?   ??? dog.png
                ?   ??? fish.png
                ?   ??? house.png
                ?   ??? intro/
                ?   ?   ??? README.md
                ?   ?   ??? answer.png
                ?   ?   ??? choice-board.png
                ?   ?   ??? controller.png
                ?   ?   ??? instructions.png
                ?   ?   ??? look.png
                ?   ?   ??? numbers.png
                ?   ?   ??? pattern.png
                ?   ?   ??? pictures.png
                ?   ?   ??? remember.png
                ?   ?   ??? rules-board.png
                ?   ??? river.png
                ?   ??? screening/
                ?   ?   ??? README.md
                ?   ?   ??? bunny.png
                ?   ?   ??? bunny.webp
                ?   ?   ??? forest.png
                ?   ?   ??? forest.webp
                ?   ?   ??? practice/
                ?   ?   ?   ??? README.md
                ?   ?   ?   ??? instructions.png
                ?   ?   ?   ??? numbers.png
                ?   ?   ?   ??? pattern.png
                ?   ?   ?   ??? pictures.png
                ?   ?   ??? vine-board.png
                ?   ??? sun.png
                ?   ??? tree.png
                ?   ??? working-memory-identify-quiz-bg.jpeg
                ??? improve/
                ?   ??? boards/
                ?   ?   ??? wm_bunny_answer.png
                ?   ?   ??? wm_bunny_question.png
                ?   ?   ??? wm_bunny_ready.png
                ?   ?   ??? wm_vine_board.png
                ?   ??? buttons/
                ?   ?   ??? LexiLand_3D_Buttons/
                ?   ?   ?   ??? back-button.png
                ?   ?   ?   ??? check-button.png
                ?   ?   ?   ??? continue-button.png
                ?   ?   ?   ??? finish-button.png
                ?   ?   ?   ??? listen-again-button.png
                ?   ?   ?   ??? next-button.png
                ?   ?   ?   ??? play-button.png
                ?   ?   ?   ??? show-question-button.png
                ?   ?   ?   ??? try-again-button.png
                ?   ?   ??? number_button_level1.png
                ?   ?   ??? number_button_level2.png
                ?   ?   ??? number_button_level3.png
                ?   ?   ??? number_button_level4.png
                ?   ??? cards/
                ?   ?   ??? front_card.png
                ?   ?   ??? grade3/
                ?   ?   ?   ??? words/
                ?   ?   ?       ??? g3_l1_words_q1_apple_i2.png
                ?   ?   ?       ??? g3_l1_words_q1_balloon_i3.png
                ?   ?   ?       ??? g3_l1_words_q1_strawberry_i1.png
                ?   ?   ?       ??? g3_l1_words_q2_grapes_i3.png
                ?   ?   ?       ??? g3_l1_words_q2_house_i1.png
                ?   ?   ?       ??? g3_l1_words_q2_tree_i2.png
                ?   ?   ?       ??? g3_l1_words_q3_book_i3.png
                ?   ?   ?       ??? g3_l1_words_q3_car_i2.png
                ?   ?   ?       ??? g3_l1_words_q3_key_i1.png
                ?   ?   ?       ??? g3_l1_words_q4_apple_i3.png
                ?   ?   ?       ??? g3_l1_words_q4_mushroom_i2.png
                ?   ?   ?       ??? g3_l1_words_q4_turtle_i1.png
                ?   ?   ?       ??? g3_l1_words_q5_duck_i2.png
                ?   ?   ?       ??? g3_l1_words_q5_flower_i1.png
                ?   ?   ?       ??? g3_l1_words_q5_star_i3.png
                ?   ?   ?       ??? g3_l2_words_q1_apple_i2.png
                ?   ?   ?       ??? g3_l2_words_q1_car_i4.png
                ?   ?   ?       ??? g3_l2_words_q1_crown_i1.png
                ?   ?   ?       ??? g3_l2_words_q1_flower_i3.png
                ?   ?   ?       ??? g3_l2_words_q2_bag_i3.png
                ?   ?   ?       ??? g3_l2_words_q2_book_i1.png
                ?   ?   ?       ??? g3_l2_words_q2_frog_i4.png
                ?   ?   ?       ??? g3_l2_words_q2_pencil_i2.png
                ?   ?   ?       ??? g3_l2_words_q3_bird_i3.png
                ?   ?   ?       ??? g3_l2_words_q3_grapes_i4.png
                ?   ?   ?       ??? g3_l2_words_q3_house_i1.png
                ?   ?   ?       ??? g3_l2_words_q3_sun_i2.png
                ?   ?   ?       ??? g3_l2_words_q4_book_i4.png
                ?   ?   ?       ??? g3_l2_words_q4_key_i2.png
                ?   ?   ?       ??? g3_l2_words_q4_orange_i3.png
                ?   ?   ?       ??? g3_l2_words_q4_turtle_i1.png
                ?   ?   ?       ??? g3_l2_words_q5_car_i3.png
                ?   ?   ?       ??? g3_l2_words_q5_duck_i1.png
                ?   ?   ?       ??? g3_l2_words_q5_flower_i2.png
                ?   ?   ?       ??? g3_l2_words_q5_star_i4.png
                ?   ?   ?       ??? g3_l3_words_q1_banana_i2.png
                ?   ?   ?       ??? g3_l3_words_q1_book_i3.png
                ?   ?   ?       ??? g3_l3_words_q1_flower_i5.png
                ?   ?   ?       ??? g3_l3_words_q1_rabbit_i1.png
                ?   ?   ?       ??? g3_l3_words_q1_star_i4.png
                ?   ?   ?       ??? g3_l3_words_q2_bird_i4.png
                ?   ?   ?       ??? g3_l3_words_q2_car_i5.png
                ?   ?   ?       ??? g3_l3_words_q2_house_i1.png
                ?   ?   ?       ??? g3_l3_words_q2_sun_i3.png
                ?   ?   ?       ??? g3_l3_words_q2_tree_i2.png
                ?   ?   ?       ??? g3_l3_words_q3_apple_i3.png
                ?   ?   ?       ??? g3_l3_words_q3_bag_i5.png
                ?   ?   ?       ??? g3_l3_words_q3_car_i1.png
                ?   ?   ?       ??? g3_l3_words_q3_flower_i4.png
                ?   ?   ?       ??? g3_l3_words_q3_key_i2.png
                ?   ?   ?       ??? g3_l3_words_q4_bag_i3.png
                ?   ?   ?       ??? g3_l3_words_q4_book_i2.png
                ?   ?   ?       ??? g3_l3_words_q4_pen_i5.png
                ?   ?   ?       ??? g3_l3_words_q4_pencil_i1.png
                ?   ?   ?       ??? g3_l3_words_q4_star_i4.png
                ?   ?   ?       ??? g3_l3_words_q5_apple_i3.png
                ?   ?   ?       ??? g3_l3_words_q5_duck_i4.png
                ?   ?   ?       ??? g3_l3_words_q5_spoon_i2.png
                ?   ?   ?       ??? g3_l3_words_q5_tortoise_i5.png
                ?   ?   ?       ??? g3_l3_words_q5_turtle_i1.png
                ?   ?   ?       ??? g3_l4_words_q1_apple_i7.png
                ?   ?   ?       ??? g3_l4_words_q1_bag_i3.png
                ?   ?   ?       ??? g3_l4_words_q1_banana_i2.png
                ?   ?   ?       ??? g3_l4_words_q1_book_i3.png
                ?   ?   ?       ??? g3_l4_words_q1_butterfly_i6.png
                ?   ?   ?       ??? g3_l4_words_q1_car_i5.png
                ?   ?   ?       ??? g3_l4_words_q1_flower_i4.png
                ?   ?   ?       ??? g3_l4_words_q1_frog_i6.png
                ?   ?   ?       ??? g3_l4_words_q1_rabbit_i1.png
                ?   ?   ?       ??? g3_l4_words_q1_star_i5.png
                ?   ?   ?       ??? g3_l4_words_q2_bag_i6.png
                ?   ?   ?       ??? g3_l4_words_q2_bird_i3.png
                ?   ?   ?       ??? g3_l4_words_q2_car_i7.png
                ?   ?   ?       ??? g3_l4_words_q2_house_i1.png
                ?   ?   ?       ??? g3_l4_words_q2_orange_i5.png
                ?   ?   ?       ??? g3_l4_words_q2_sun_i4.png
                ?   ?   ?       ??? g3_l4_words_q2_tree_i2.png
                ?   ?   ?       ??? g3_l4_words_q3_bag_i7.png
                ?   ?   ?       ??? g3_l4_words_q3_book_i4.png
                ?   ?   ?       ??? g3_l4_words_q3_car_i1.png
                ?   ?   ?       ??? g3_l4_words_q3_duck_i5.png
                ?   ?   ?       ??? g3_l4_words_q3_duck_i6.png
                ?   ?   ?       ??? g3_l4_words_q3_key_i2.png
                ?   ?   ?       ??? g3_l4_words_q3_pen_i5.png
                ?   ?   ?       ??? g3_l4_words_q3_pen_i6.png
                ?   ?   ?       ??? g3_l4_words_q3_pencil_i3.png
                ?   ?   ?       ??? g3_l4_words_q4_apple_i7.png
                ?   ?   ?       ??? g3_l4_words_q4_bag_i3.png
                ?   ?   ?       ??? g3_l4_words_q4_banana_i2.png
                ?   ?   ?       ??? g3_l4_words_q4_butterfly_i6.png
                ?   ?   ?       ??? g3_l4_words_q4_flower_i4.png
                ?   ?   ?       ??? g3_l4_words_q4_rabbit_i1.png
                ?   ?   ?       ??? g3_l4_words_q4_star_i5.png
                ?   ?   ?       ??? g3_l4_words_q5_apple_i3.png
                ?   ?   ?       ??? g3_l4_words_q5_bird_i5.png
                ?   ?   ?       ??? g3_l4_words_q5_duck_i4.png
                ?   ?   ?       ??? g3_l4_words_q5_frog_i7.png
                ?   ?   ?       ??? g3_l4_words_q5_spoon_i2.png
                ?   ?   ?       ??? g3_l4_words_q5_tortoise_i6.png
                ?   ?   ?       ??? g3_l4_words_q5_turtle_i1.png
                ?   ?   ??? level1/
                ?   ?   ?   ??? level1carrot_card_back.png
                ?   ?   ??? level2/
                ?   ?   ?   ??? level2carrot_card_back.png
                ?   ?   ??? level3/
                ?   ?   ?   ??? level3carrot_card_back.png
                ?   ?   ??? level4/
                ?   ?   ?   ??? level4carrot_card_back.png
                ?   ?   ??? picture-memory-sprites.png
                ?   ??? common/
                ?   ?   ??? common_bg.png
                ?   ??? gameselection/
                ?   ?   ??? instructions.png
                ?   ?   ??? numbers.png
                ?   ?   ??? pattern.png
                ?   ?   ??? picture-memory.png
                ?   ?   ??? vine-board.png
                ?   ??? icons/
                ?   ?   ??? level3/
                ?   ?   ?   ??? instructions.png
                ?   ?   ?   ??? numbers.png
                ?   ?   ?   ??? pattern.png
                ?   ?   ?   ??? words.png
                ?   ?   ??? level4/
                ?   ?       ??? instruction.png
                ?   ?       ??? numbers.png
                ?   ?       ??? pattern.png
                ?   ?       ??? words.png
                ?   ??? level4/
                ?   ?   ??? boards/
                ?   ?       ??? frame.png
                ?   ?       ??? how_to_play_vine_board.png
                ?   ?       ??? level4_vine_board.png
                ?   ??? levels/
                ?   ?   ??? ChatGPT Image Aug 29, 2026, 04_06_37 AM.png
                ?   ??? progress/
                ?   ?   ??? level_1_wooden_button.png
                ?   ?   ??? level_2_wooden_button.png
                ?   ?   ??? level_3_wooden_button.png
                ?   ?   ??? level_4_wooden_button.png
                ?   ?   ??? level_5_wooden_button.png
                ?   ?   ??? lexiland_wooden_stick.png
                ?   ??? reference-art/
                ?   ?   ??? bunny-answer.png
                ?   ?   ??? bunny-question.png
                ?   ?   ??? bunny.png
                ?   ?   ??? card-back-level-1.png
                ?   ?   ??? card-back-level-2.png
                ?   ?   ??? card-back-level-3.png
                ?   ?   ??? card-back-level-4.png
                ?   ?   ??? question-tracker.png
                ?   ?   ??? screening-background.png
                ?   ?   ??? standing-bunny.png
                ?   ?   ??? vine-board.png
                ?   ??? themes/
                ?       ??? how-to-boards/
                ?       ?   ??? L1.png
                ?       ?   ??? L2.png
                ?       ?   ??? L3.png
                ?       ?   ??? L4.png
                ?       ??? question-boards/
                ?           ??? L1.png
                ?           ??? L3.png
                ?           ??? L4.png
                ??? map-menu/
                ?   ??? ASSETS.md
                ?   ??? level-card-frame.png
                ?   ??? level-card-frame.webp
                ?   ??? level-scene-1.png
                ?   ??? level-scene-1.webp
                ?   ??? level-scene-2.png
                ?   ??? level-scene-2.webp
                ?   ??? level-scene-3.png
                ?   ??? level-scene-3.webp
                ?   ??? level-scene-4.png
                ?   ??? level-scene-4.webp
                ?   ??? map-background.png
                ?   ??? map-background.webp
                ?   ??? map-heading.png
                ?   ??? map-heading.webp
                ?   ??? popup-vine-board.png
                ?   ??? popup-vine-board.webp
                ?   ??? thumb-instructions.png
                ?   ??? thumb-instructions.webp
                ?   ??? thumb-numbers.png
                ?   ??? thumb-numbers.webp
                ?   ??? thumb-pattern.png
                ?   ??? thumb-pattern.webp
                ?   ??? thumb-words.png
                ?   ??? thumb-words.webp
                ??? pattern/
                ?   ??? README.md
                ?   ??? bunny-happy.png
                ?   ??? bunny-happy.webp
                ?   ??? bunny-sad.png
                ?   ??? bunny-sad.webp
                ?   ??? star.png
                ?   ??? star.webp
                ?   ??? symbols/
                ?   ?   ??? README.md
                ?   ?   ??? objects-a.png
                ?   ?   ??? objects-a.webp
                ?   ?   ??? objects-b.png
                ?   ?   ??? objects-b.webp
                ?   ?   ??? shapes.png
                ?   ?   ??? shapes.webp
                ?   ??? trophy.png
                ?   ??? trophy.webp
                ?   ??? vine-board.png
                ?   ??? vine-board.webp
                ??? ui/
                    ??? backgrounds/
                    ?   ??? bg-level1.webp
                    ?   ??? bg-level2.webp
                    ?   ??? bg-level3.webp
                    ?   ??? bg-level4.webp
                    ??? buckets/
                    ?   ??? bucket-level1.png
                    ?   ??? bucket-level2.png
                    ?   ??? bucket-level3.png
                    ?   ??? bucket-level4.png
                    ??? buttons/
                    ?   ??? btn-green.png
                    ?   ??? btn-orange.png
                    ?   ??? btn-pink.png
                    ?   ??? btn-purple.png
                    ??? cards/
                    ?   ??? pic-l1-apple.png
                    ?   ??? pic-l1-back.png
                    ?   ??? pic-l1-bird.png
                    ?   ??? pic-l1-butterfly.png
                    ?   ??? pic-l1-tree.png
                    ?   ??? pic-l2-apple.png
                    ?   ??? pic-l2-back.png
                    ?   ??? pic-l2-balloon.png
                    ?   ??? pic-l2-bird.png
                    ?   ??? pic-l2-bunny.png
                    ?   ??? pic-l2-butterfly.png
                    ?   ??? pic-l2-carrot.png
                    ?   ??? pic-l2-flower.png
                    ?   ??? pic-l2-strawberry.png
                    ?   ??? pic-l2-tree.png
                    ?   ??? pic-l3-apple.png
                    ?   ??? pic-l3-back.png
                    ?   ??? pic-l3-balloon.png
                    ?   ??? pic-l3-bird.png
                    ?   ??? pic-l3-bunny.png
                    ?   ??? pic-l3-butterfly.png
                    ?   ??? pic-l3-carrot.png
                    ?   ??? pic-l3-strawberry.png
                    ?   ??? pic-l3-tree.png
                    ?   ??? pic-l4-apple.png
                    ?   ??? pic-l4-back.png
                    ?   ??? pic-l4-balloon.png
                    ?   ??? pic-l4-bird.png
                    ?   ??? pic-l4-butterfly.png
                    ?   ??? pic-l4-carrot.png
                    ?   ??? pic-l4-flower.png
                    ?   ??? pic-l4-strawberry.png
                    ?   ??? pic-l4-tree.png
                    ??? characters/
                    ?   ??? bunny.webp
                    ??? icons/
                    ?   ??? apple.svg
                    ?   ??? c-blue.svg
                    ?   ??? c-green.svg
                    ?   ??? c-orange.svg
                    ?   ??? c-purple.svg
                    ?   ??? carrot.svg
                    ?   ??? flower.svg
                    ?   ??? heart.svg
                    ?   ??? leaf.svg
                    ?   ??? moon.svg
                    ?   ??? sq-yellow.svg
                    ?   ??? star.svg
                    ?   ??? tri-red.svg
                    ??? nav/
                    ?   ??? nav-back.png
                    ?   ??? nav-lang-en.png
                    ?   ??? nav-lang-si.png
                    ?   ??? nav-music.png
                    ?   ??? nav-star-pill.png
                    ?   ??? nav-title-plank.png
                    ?   ??? nav-tracker.png
                    ??? vine-board.webp
```

### Shared assets outside the WM image root

```text
??? frontend/
    ??? public/
        ??? images/
            ??? dashboard/
            ?   ??? activity-popup/
            ?       ??? 
            ??? phonologicalAwareness/
                ??? Improvement/
                ?   ??? speaker.png
                ??? flower.png
```

The shared image list also includes the dashboard WM category card and popup artwork:

- frontend/public/images/dashboard/category-cards/working-memory-removebg-preview.png
- frontend/public/images/dashboard/activity-popup/working-memory-reference.png
- frontend/public/images/dashboard/activity-popup/working-memory-outline.svg

The tree covers resolvable literal public paths in WM source (activity-popup is a directory prefix). Template-based paths are documented above; indirect shared component references can add further shared resources. Do not treat an asset as unused based only on a text search: generated URLs, atlases, fallback components and source-to-WebP exports need checking.

## Other integration files

These files mention WM routes/modules or consume their results outside the dedicated module folders:

```text
??? frontend/
?   ??? src/
?       ??? App.jsx
?       ??? pages/
?           ??? admin/
?           ?   ??? components/
?           ?       ??? WMIdentifyResults.jsx
?           ??? common/
?               ??? Dashboard.jsx
?               ??? reports/
?                   ??? ComponentReportSelect.jsx
?                   ??? IdentifyWorkingMemoryReport.jsx
?                   ??? ImproveWorkingMemoryReport.jsx
??? backend/
    ??? src/
        ??? app.js
        ??? modules/
            ??? admin/
            ?   ??? controllers/
            ?   ?   ??? admin.controller.js
            ?   ??? routes/
            ?       ??? admin.routes.js
            ??? common/
                ??? controllers/
                    ??? student.controller.js
```

## Tooling and verification files

```text
??? frontend/
    ??? playwright.level-four.config.js
    ??? playwright.level-one.config.js
    ??? playwright.level-three.config.js
    ??? playwright.level-two.config.js
    ??? scripts/
    ?   ??? wm-redesign/
    ?       ??? access.mjs
    ?       ??? backend-policy.cjs
    ?       ??? check.mjs
    ?       ??? content-refinement.mjs
    ?       ??? edges.mjs
    ?       ??? final-visual.mjs
    ?       ??? flows.mjs
    ?       ??? how-to-play.mjs
    ?       ??? measure-pattern-artwork.mjs
    ?       ??? navigation.mjs
    ?       ??? optimize-map-assets.mjs
    ?       ??? pattern-artwork-visual.mjs
    ?       ??? pattern-check.mjs
    ?       ??? pattern-reference.mjs
    ?       ??? popup-map.mjs
    ?       ??? prepare-pattern-artwork.mjs
    ?       ??? prepare-screening-assets.mjs
    ?       ??? references.mjs
    ?       ??? refinement-visual.mjs
    ?       ??? responsive.mjs
    ?       ??? retry.mjs
    ?       ??? tutorial-video.mjs
    ?       ??? visual.mjs
    ??? tests/
        ??? e2e/
        ?   ??? auth-to-working-memory.spec.js
        ?   ??? identify-full-coverage.spec.js
        ?   ??? improvement-full-coverage.spec.js
        ?   ??? level-four-ui.spec.js
        ?   ??? level-one-ui.spec.js
        ?   ??? level-three-ui.spec.js
        ?   ??? level-two-ui.spec.js
        ?   ??? page-load-smoke.spec.js
        ?   ??? screening-ui.spec.js
        ?   ??? speech-integration.spec.js
        ?   ??? test-cases.spec.js
        ??? unit/
            ??? identifyAnswers.test.js
            ??? improvementAnswers.test.js
            ??? patternArtwork.test.js
            ??? practiceRecommendations.test.js
```

## Scope and verification

The inventory walks all files recursively in the dedicated source/backend/public/script roots above. CSV contains 331 public files, including documentation/licenses and 306 image files inside the WM image root. Related source/test lists are content-based discovery. node_modules, .git, build output, .cache and .design-backups are excluded: they contain dependencies, generated captures or historical snapshots rather than shipped module sources. Existing modified/untracked application files were preserved.

Checked filenames, file sizes, URL conversion, router mounts, endpoint handlers, model schemas and the naming/conversion code. This was a read-only application audit with documentation output; game/browser tests and live database checks were not run because no runtime behavior changed.
