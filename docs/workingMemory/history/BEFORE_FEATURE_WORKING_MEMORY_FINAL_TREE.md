# Final Working Memory structure

Generated from the workspace after reorganization. Public image filenames and byte sizes are listed in [the current inventory](WORKING_MEMORY_ASSETS_CURRENT.csv); every original-to-final image path is in [the move manifest](WORKING_MEMORY_ASSET_MOVES.csv).

```text
frontend/src/pages/workingMemory/
|-- data/
|   |-- improvement/
|   |   |-- grade2/
|   |   |   |-- en.js
|   |   |   `-- si.js
|   |   |-- grade3/
|   |   |   |-- en.js
|   |   |   `-- si.js
|   |   |-- grade4/
|   |   |   |-- en.js
|   |   |   `-- si.js
|   |   |-- config.js
|   |   |-- index.js
|   |   |-- patternQuestions.js
|   |   `-- pictureMemoryQuestions.js
|   |-- screening/
|   |   |-- grade2.js
|   |   |-- grade3.js
|   |   |-- grade4.js
|   |   |-- index.js
|   |   `-- legacyQuestions.js
|   |-- howToPlayVideos.js
|   |-- patternArtworkBounds.json
|   `-- patternArtworkManifest.js
|-- identification/
|   |-- Identify.jsx
|   |-- IdentifyIntroScreens.jsx
|   |-- screeningAssets.js
|   |-- ScreeningUI.jsx
|   `-- UI_AUDIT.md
|-- improvement/
|   |-- components/
|   |   |-- GamePresentation.jsx
|   |   |-- HowToPlayScreen.jsx
|   |   |-- LevelFourDashboard.jsx
|   |   |-- LevelMenu.jsx
|   |   |-- LevelOneDashboard.jsx
|   |   |-- LevelOneUI.jsx
|   |   |-- LevelThreeDashboard.jsx
|   |   |-- LevelThreeSprite.jsx
|   |   |-- LevelTwoDashboard.jsx
|   |   |-- MemoryUI.jsx
|   |   |-- PatternArtwork.jsx
|   |   |-- PatternPresentation.jsx
|   |   |-- PictureArtwork.jsx
|   |   `-- RecommendedPractice.jsx
|   |-- games/
|   |   |-- InstructionsGame.jsx
|   |   |-- NumbersGame.jsx
|   |   |-- PatternGame.jsx
|   |   `-- PictureMemoryGame.jsx
|   |-- ImprovementActivityWM.jsx
|   `-- ImprovementLevelsWM.jsx
|-- styles/
|   |-- contentRefinement.css
|   |-- howToPlay.css
|   |-- identification.css
|   |-- identificationIntro.css
|   |-- identificationLayout.css
|   |-- levelFour.css
|   |-- levelOne.css
|   |-- levelOneDashboard.css
|   |-- levelThree.css
|   |-- levelTwo.css
|   |-- memoryUI.css
|   |-- patternArtwork.css
|   |-- patternReference.css
|   `-- popupMap.css
|-- utils/
|   |-- attemptQuestions.js
|   |-- audio.js
|   |-- gameHelpers.js
|   |-- levelThreePresentation.js
|   |-- themeAssets.js
|   `-- themes.js
|-- APPROVED_REDESIGN_REPORT.md
|-- LEVEL_FOUR_REFINEMENT.md
|-- LEVEL_THREE_REFINEMENT.md
|-- LEVEL_TWO_REFINEMENT.md
|-- README.md
|-- UI_REDESIGN.md
`-- UI_REFINEMENT.md
```

```text
frontend/public/images/workingMemory/
|-- improvement/
|   |-- how-to-play/
|   |   |-- boards/
|   |   |   |-- wm-level1-how-to-board.png
|   |   |   |-- wm-level2-how-to-board.png
|   |   |   |-- wm-level3-how-to-board.png
|   |   |   `-- wm-level4-how-to-board.png
|   |   |-- README.md
|   |   |-- video-poster.png
|   |   `-- video-poster.webp
|   |-- instructions/
|   |   `-- level4/
|   |       `-- frame.png
|   |-- level-selection/
|   |   |-- game-selection/
|   |   |   |-- instructions.png
|   |   |   |-- numbers.png
|   |   |   |-- pattern.png
|   |   |   |-- picture-memory.png
|   |   |   `-- vine-board.png
|   |   |-- icons/
|   |   |   |-- level3/
|   |   |   |   |-- instructions.png
|   |   |   |   |-- numbers.png
|   |   |   |   |-- pattern.png
|   |   |   |   `-- words.png
|   |   |   `-- level4/
|   |   |       |-- instruction.png
|   |   |       |-- numbers.png
|   |   |       |-- pattern.png
|   |   |       `-- words.png
|   |   |-- ASSETS.md
|   |   |-- level-card-frame.png
|   |   |-- level-card-frame.webp
|   |   |-- level-scene-1.png
|   |   |-- level-scene-1.webp
|   |   |-- level-scene-2.png
|   |   |-- level-scene-2.webp
|   |   |-- level-scene-3.png
|   |   |-- level-scene-3.webp
|   |   |-- level-scene-4.png
|   |   |-- level-scene-4.webp
|   |   |-- map-background.png
|   |   |-- map-background.webp
|   |   |-- map-heading.png
|   |   |-- map-heading.webp
|   |   |-- popup-vine-board.png
|   |   |-- popup-vine-board.webp
|   |   |-- thumb-instructions.png
|   |   |-- thumb-instructions.webp
|   |   |-- thumb-numbers.png
|   |   |-- thumb-numbers.webp
|   |   |-- thumb-pattern.png
|   |   |-- thumb-pattern.webp
|   |   |-- thumb-words.png
|   |   `-- thumb-words.webp
|   |-- numbers/
|   |   |-- level1/
|   |   |   `-- number-button-level1.png
|   |   |-- level2/
|   |   |   `-- number-button-level2.png
|   |   |-- level3/
|   |   |   `-- number-button-level3.png
|   |   `-- level4/
|   |       `-- number-button-level4.png
|   |-- pattern/
|   |   |-- symbols/
|   |   |   |-- objects-a.png
|   |   |   |-- objects-a.webp
|   |   |   |-- objects-b.png
|   |   |   |-- objects-b.webp
|   |   |   |-- README.md
|   |   |   |-- shapes.png
|   |   |   `-- shapes.webp
|   |   `-- README.md
|   `-- picture-memory/
|       |-- cards/
|       |   |-- level1/
|       |   |   `-- level1-carrot-card-back.png
|       |   |-- level2/
|       |   |   `-- level2-carrot-card-back.png
|       |   |-- level3/
|       |   |   `-- level3-carrot-card-back.png
|       |   |-- level4/
|       |   |   `-- level4-carrot-card-back.png
|       |   |-- card-back-level-1.png
|       |   |-- card-back-level-2.png
|       |   |-- card-back-level-3.png
|       |   |-- card-back-level-4.png
|       |   |-- front-card.png
|       |   |-- pic-l1-apple.png
|       |   |-- pic-l1-back.png
|       |   |-- pic-l1-bird.png
|       |   |-- pic-l1-butterfly.png
|       |   |-- pic-l1-tree.png
|       |   |-- pic-l2-apple.png
|       |   |-- pic-l2-back.png
|       |   |-- pic-l2-balloon.png
|       |   |-- pic-l2-bird.png
|       |   |-- pic-l2-bunny.png
|       |   |-- pic-l2-butterfly.png
|       |   |-- pic-l2-carrot.png
|       |   |-- pic-l2-flower.png
|       |   |-- pic-l2-strawberry.png
|       |   |-- pic-l2-tree.png
|       |   |-- pic-l3-apple.png
|       |   |-- pic-l3-back.png
|       |   |-- pic-l3-balloon.png
|       |   |-- pic-l3-bird.png
|       |   |-- pic-l3-bunny.png
|       |   |-- pic-l3-butterfly.png
|       |   |-- pic-l3-carrot.png
|       |   |-- pic-l3-strawberry.png
|       |   |-- pic-l3-tree.png
|       |   |-- pic-l4-apple.png
|       |   |-- pic-l4-back.png
|       |   |-- pic-l4-balloon.png
|       |   |-- pic-l4-bird.png
|       |   |-- pic-l4-butterfly.png
|       |   |-- pic-l4-carrot.png
|       |   |-- pic-l4-flower.png
|       |   |-- pic-l4-strawberry.png
|       |   `-- pic-l4-tree.png
|       |-- grade3/
|       |   |-- level1/
|       |   |   |-- wm-picture-g3-l1-apple.png
|       |   |   |-- wm-picture-g3-l1-balloon.png
|       |   |   |-- wm-picture-g3-l1-book.png
|       |   |   |-- wm-picture-g3-l1-car.png
|       |   |   |-- wm-picture-g3-l1-duck.png
|       |   |   |-- wm-picture-g3-l1-flower.png
|       |   |   |-- wm-picture-g3-l1-grapes.png
|       |   |   |-- wm-picture-g3-l1-house.png
|       |   |   |-- wm-picture-g3-l1-key.png
|       |   |   |-- wm-picture-g3-l1-mushroom.png
|       |   |   |-- wm-picture-g3-l1-star.png
|       |   |   |-- wm-picture-g3-l1-strawberry.png
|       |   |   |-- wm-picture-g3-l1-tree.png
|       |   |   `-- wm-picture-g3-l1-turtle.png
|       |   |-- level2/
|       |   |   |-- wm-picture-g3-l2-apple.png
|       |   |   |-- wm-picture-g3-l2-bag.png
|       |   |   |-- wm-picture-g3-l2-bird.png
|       |   |   |-- wm-picture-g3-l2-book.png
|       |   |   |-- wm-picture-g3-l2-car.png
|       |   |   |-- wm-picture-g3-l2-crown.png
|       |   |   |-- wm-picture-g3-l2-duck.png
|       |   |   |-- wm-picture-g3-l2-flower.png
|       |   |   |-- wm-picture-g3-l2-frog.png
|       |   |   |-- wm-picture-g3-l2-grapes.png
|       |   |   |-- wm-picture-g3-l2-house.png
|       |   |   |-- wm-picture-g3-l2-key.png
|       |   |   |-- wm-picture-g3-l2-orange.png
|       |   |   |-- wm-picture-g3-l2-pencil.png
|       |   |   |-- wm-picture-g3-l2-star.png
|       |   |   |-- wm-picture-g3-l2-sun.png
|       |   |   `-- wm-picture-g3-l2-turtle.png
|       |   |-- level3/
|       |   |   |-- wm-picture-g3-l3-apple.png
|       |   |   |-- wm-picture-g3-l3-bag.png
|       |   |   |-- wm-picture-g3-l3-banana.png
|       |   |   |-- wm-picture-g3-l3-bird.png
|       |   |   |-- wm-picture-g3-l3-book.png
|       |   |   |-- wm-picture-g3-l3-car.png
|       |   |   |-- wm-picture-g3-l3-duck.png
|       |   |   |-- wm-picture-g3-l3-flower.png
|       |   |   |-- wm-picture-g3-l3-house.png
|       |   |   |-- wm-picture-g3-l3-key.png
|       |   |   |-- wm-picture-g3-l3-pen.png
|       |   |   |-- wm-picture-g3-l3-pencil.png
|       |   |   |-- wm-picture-g3-l3-rabbit.png
|       |   |   |-- wm-picture-g3-l3-spoon.png
|       |   |   |-- wm-picture-g3-l3-star.png
|       |   |   |-- wm-picture-g3-l3-sun.png
|       |   |   |-- wm-picture-g3-l3-tortoise.png
|       |   |   |-- wm-picture-g3-l3-tree.png
|       |   |   `-- wm-picture-g3-l3-turtle.png
|       |   `-- level4/
|       |       |-- wm-picture-g3-l4-apple.png
|       |       |-- wm-picture-g3-l4-bag.png
|       |       |-- wm-picture-g3-l4-banana.png
|       |       |-- wm-picture-g3-l4-bird.png
|       |       |-- wm-picture-g3-l4-book.png
|       |       |-- wm-picture-g3-l4-butterfly.png
|       |       |-- wm-picture-g3-l4-car.png
|       |       |-- wm-picture-g3-l4-duck.png
|       |       |-- wm-picture-g3-l4-flower.png
|       |       |-- wm-picture-g3-l4-frog.png
|       |       |-- wm-picture-g3-l4-house.png
|       |       |-- wm-picture-g3-l4-key.png
|       |       |-- wm-picture-g3-l4-orange.png
|       |       |-- wm-picture-g3-l4-pen.png
|       |       |-- wm-picture-g3-l4-pencil.png
|       |       |-- wm-picture-g3-l4-rabbit.png
|       |       |-- wm-picture-g3-l4-spoon.png
|       |       |-- wm-picture-g3-l4-star.png
|       |       |-- wm-picture-g3-l4-sun.png
|       |       |-- wm-picture-g3-l4-tortoise.png
|       |       |-- wm-picture-g3-l4-tree.png
|       |       `-- wm-picture-g3-l4-turtle.png
|       |-- objects/
|       |   |-- ball.png
|       |   |-- bird.png
|       |   |-- book.png
|       |   |-- cat.png
|       |   |-- cup.png
|       |   |-- dog.png
|       |   |-- fish.png
|       |   |-- flower.png
|       |   |-- house.png
|       |   |-- sun.png
|       |   `-- tree.png
|       `-- picture-memory-sprites.png
|-- screening/
|   |-- backgrounds/
|   |   |-- screening-background.png
|   |   `-- working-memory-identify-quiz-bg.jpeg
|   |-- intro/
|   |   |-- answer.png
|   |   |-- choice-board.png
|   |   |-- controller.png
|   |   |-- instructions.png
|   |   |-- look.png
|   |   |-- numbers.png
|   |   |-- pattern.png
|   |   |-- pictures.png
|   |   |-- README.md
|   |   |-- remember.png
|   |   `-- rules-board.png
|   |-- objects/
|   |   |-- ball.png
|   |   |-- bird.png
|   |   |-- book.png
|   |   |-- bottle.png
|   |   |-- cat.png
|   |   |-- cup.png
|   |   |-- dog.png
|   |   |-- fish.png
|   |   |-- house.png
|   |   |-- river.png
|   |   |-- sun.png
|   |   `-- tree.png
|   |-- practice/
|   |   |-- instructions.png
|   |   |-- numbers.png
|   |   |-- pattern.png
|   |   |-- pictures.png
|   |   `-- README.md
|   `-- scene/
|       |-- bunny.png
|       |-- bunny.webp
|       |-- forest.png
|       |-- forest.webp
|       |-- README.md
|       |-- standing-bunny.png
|       `-- vine-board.png
`-- shared/
    |-- backgrounds/
    |   |-- bg-level1.webp
    |   |-- bg-level2.webp
    |   |-- bg-level3.webp
    |   |-- bg-level4.webp
    |   `-- common-background.png
    |-- buckets/
    |   |-- bucket-level1.png
    |   |-- bucket-level2.png
    |   |-- bucket-level3.png
    |   `-- bucket-level4.png
    |-- bunny/
    |   |-- bunny-happy.png
    |   |-- bunny-happy.webp
    |   |-- bunny-intro.png
    |   |-- bunny-sad.png
    |   |-- bunny-sad.webp
    |   |-- bunny.webp
    |   |-- wm-bunny-answer.png
    |   |-- wm-bunny-question.png
    |   |-- wm-bunny-ready.png
    |   |-- wm-reference-bunny-answer.png
    |   |-- wm-reference-bunny-question.png
    |   `-- wm-reference-bunny.png
    |-- buttons/
    |   |-- actions/
    |   |   |-- back-button.png
    |   |   |-- check-button.png
    |   |   |-- continue-button.png
    |   |   |-- finish-button.png
    |   |   |-- listen-again-button.png
    |   |   |-- next-button.png
    |   |   |-- play-button.png
    |   |   |-- show-question-button.png
    |   |   `-- try-again-button.png
    |   |-- btn-green.png
    |   |-- btn-orange.png
    |   |-- btn-pink.png
    |   |-- btn-purple.png
    |   `-- close-wooden.png
    |-- icons/
    |   |-- apple.svg
    |   |-- c-blue.svg
    |   |-- c-green.svg
    |   |-- c-orange.svg
    |   |-- c-purple.svg
    |   |-- carrot.svg
    |   |-- flower.svg
    |   |-- heart.svg
    |   |-- leaf.svg
    |   |-- magnifier.png
    |   |-- moon.svg
    |   |-- speaker.png
    |   |-- sq-yellow.svg
    |   |-- star.png
    |   |-- star.svg
    |   |-- star.webp
    |   |-- tri-red.svg
    |   |-- trophy.png
    |   `-- trophy.webp
    |-- navigation/
    |   |-- progress/
    |   |   |-- level-1-wooden-button.png
    |   |   |-- level-2-wooden-button.png
    |   |   |-- level-3-wooden-button.png
    |   |   |-- level-4-wooden-button.png
    |   |   |-- level-5-wooden-button.png
    |   |   `-- lexiland-wooden-stick.png
    |   |-- nav-back.png
    |   |-- nav-lang-en.png
    |   |-- nav-lang-si.png
    |   |-- nav-music.png
    |   |-- nav-star-pill.png
    |   |-- nav-title-plank.png
    |   |-- nav-tracker.png
    |   `-- question-tracker.png
    `-- vine-boards/
        |-- level4/
        |   |-- how-to-play-vine-board.png
        |   |-- level4-vine-board.png
        |   `-- wm-level4-vine-board-source.png
        |-- wm-level1-question-board.png
        |-- wm-level3-question-board.png
        |-- wm-level4-question-board.png
        |-- wm-vine-board-game.png
        |-- wm-vine-board-reference.png
        |-- wm-vine-board-wide.png
        |-- wm-vine-board-wide.webp
        `-- wm-vine-board.webp
```
