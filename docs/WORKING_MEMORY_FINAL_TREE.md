# Current Working Memory tree

Generated from the workspace on 2026-10-17.

```text
frontend/src/features/workingMemory/
|-- config
|   |-- dashboardContent.js
|   |-- gameConfig.js
|   |-- levelThemes.js
|   |-- numberInstructions.js
|   |-- patternArtwork.js
|   |-- patternBounds.json
|   |-- screeningAssets.js
|   |-- themeAssets.js
|   `-- tutorialVideos.js
|-- identification
|   |-- data
|   |   |-- grade2.js
|   |   |-- grade3.js
|   |   |-- grade4.js
|   |   |-- index.js
|   |   `-- legacyQuestions.js
|   |-- ScreeningIntro.jsx
|   |-- ScreeningPage.jsx
|   `-- ScreeningQuestions.jsx
|-- improvement
|   |-- data
|   |   |-- index.js
|   |   |-- instructions
|   |   |   `-- bank.js
|   |   |-- numbers
|   |   |   `-- bank.js
|   |   |-- pattern
|   |   |   |-- bank.js
|   |   |   `-- questions.js
|   |   `-- pictures
|   |       |-- bank.js
|   |       `-- questions.js
|   |-- games
|   |   |-- InstructionsGame.jsx
|   |   |-- NumberMemoryGame.jsx
|   |   |-- PatternGame.jsx
|   |   `-- PictureMemoryGame.jsx
|   |-- ImprovementPage.jsx
|   `-- LevelSelection.jsx
|-- logic
|   |-- answerChecking.js
|   |-- attempts.js
|   |-- audio.js
|   |-- errorAnalysis.js
|   |-- presentation.js
|   |-- progression.js
|   |-- recommendations.js
|   `-- scoring.js
|-- README.md
|-- services
|   |-- identifyApi.js
|   `-- improveApi.js
|-- shared
|   |-- ActivityResults.jsx
|   |-- ActivityScreen.jsx
|   |-- artwork
|   |   |-- PatternArtwork.jsx
|   |   |-- PictureArtwork.jsx
|   |   `-- PictureSprite.jsx
|   |-- Feedback.jsx
|   |-- GameLayout.jsx
|   |-- GameMenu.jsx
|   |-- HowToPlay.jsx
|   |-- LevelCompletion.jsx
|   |-- RecommendedPractice.jsx
|   `-- ScreeningResults.jsx
`-- styles
    |-- contentRefinement.css
    |-- howToPlay.css
    |-- identification.css
    |-- identificationIntro.css
    |-- identificationLayout.css
    |-- levelFour.css
    |-- levelOne.css
    |-- levelOneDashboard.css
    |-- levelThree.css
    |-- levelTwo.css
    |-- memoryUI.css
    |-- patternArtwork.css
    |-- patternReference.css
    `-- popupMap.css

backend/src/modules/workingMemory/
|-- controllers
|   |-- workingMemoryIdentify.controller.js
|   `-- workingMemoryImprove.controller.js
|-- models
|   |-- workingMemoryIdentify.model.js
|   `-- workingMemoryImprove.model.js
`-- routes
    |-- workingMemoryIdentify.routes.js
    `-- workingMemoryImprove.routes.js

frontend/public/images/workingMemory/
|-- identification
|   |-- intro
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
|   |-- objects
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
|   `-- practice
|       |-- instructions.png
|       |-- numbers.png
|       |-- pattern.png
|       |-- pictures.png
|       `-- README.md
|-- instructions
|   `-- instruction-frame.png
|-- numbers
|   |-- number-button-level1.png
|   |-- number-button-level2.png
|   |-- number-button-level3.png
|   `-- number-button-level4.png
|-- pattern
|   |-- README.md
|   `-- symbols
|       |-- objects-a.png
|       |-- objects-a.webp
|       |-- objects-b.png
|       |-- objects-b.webp
|       |-- README.md
|       |-- shapes.png
|       `-- shapes.webp
|-- pictures
|   |-- cards
|   |   |-- card-back-level-1.png
|   |   |-- card-back-level-2.png
|   |   |-- card-back-level-3.png
|   |   |-- card-back-level-4.png
|   |   |-- front-card.png
|   |   |-- level1
|   |   |   `-- level1-carrot-card-back.png
|   |   |-- level2
|   |   |   `-- level2-carrot-card-back.png
|   |   |-- level3
|   |   |   `-- level3-carrot-card-back.png
|   |   |-- level4
|   |   |   `-- level4-carrot-card-back.png
|   |   |-- pic-l1-apple.png
|   |   |-- pic-l1-back.png
|   |   |-- pic-l1-bird.png
|   |   |-- pic-l1-butterfly.png
|   |   |-- pic-l1-tree.png
|   |   |-- pic-l2-apple.png
|   |   |-- pic-l2-back.png
|   |   |-- pic-l2-balloon.png
|   |   |-- pic-l2-bird.png
|   |   |-- pic-l2-bunny.png
|   |   |-- pic-l2-butterfly.png
|   |   |-- pic-l2-carrot.png
|   |   |-- pic-l2-flower.png
|   |   |-- pic-l2-strawberry.png
|   |   |-- pic-l2-tree.png
|   |   |-- pic-l3-apple.png
|   |   |-- pic-l3-back.png
|   |   |-- pic-l3-balloon.png
|   |   |-- pic-l3-bird.png
|   |   |-- pic-l3-bunny.png
|   |   |-- pic-l3-butterfly.png
|   |   |-- pic-l3-carrot.png
|   |   |-- pic-l3-strawberry.png
|   |   |-- pic-l3-tree.png
|   |   |-- pic-l4-apple.png
|   |   |-- pic-l4-back.png
|   |   |-- pic-l4-balloon.png
|   |   |-- pic-l4-bird.png
|   |   |-- pic-l4-butterfly.png
|   |   |-- pic-l4-carrot.png
|   |   |-- pic-l4-flower.png
|   |   |-- pic-l4-strawberry.png
|   |   `-- pic-l4-tree.png
|   |-- grade3
|   |   |-- level1
|   |   |   |-- wm-picture-g3-l1-apple.png
|   |   |   |-- wm-picture-g3-l1-balloon.png
|   |   |   |-- wm-picture-g3-l1-book.png
|   |   |   |-- wm-picture-g3-l1-car.png
|   |   |   |-- wm-picture-g3-l1-duck.png
|   |   |   |-- wm-picture-g3-l1-flower.png
|   |   |   |-- wm-picture-g3-l1-grapes.png
|   |   |   |-- wm-picture-g3-l1-house.png
|   |   |   |-- wm-picture-g3-l1-key.png
|   |   |   |-- wm-picture-g3-l1-mushroom.png
|   |   |   |-- wm-picture-g3-l1-star.png
|   |   |   |-- wm-picture-g3-l1-strawberry.png
|   |   |   |-- wm-picture-g3-l1-tree.png
|   |   |   `-- wm-picture-g3-l1-turtle.png
|   |   |-- level2
|   |   |   |-- wm-picture-g3-l2-apple.png
|   |   |   |-- wm-picture-g3-l2-bag.png
|   |   |   |-- wm-picture-g3-l2-bird.png
|   |   |   |-- wm-picture-g3-l2-book.png
|   |   |   |-- wm-picture-g3-l2-car.png
|   |   |   |-- wm-picture-g3-l2-crown.png
|   |   |   |-- wm-picture-g3-l2-duck.png
|   |   |   |-- wm-picture-g3-l2-flower.png
|   |   |   |-- wm-picture-g3-l2-frog.png
|   |   |   |-- wm-picture-g3-l2-grapes.png
|   |   |   |-- wm-picture-g3-l2-house.png
|   |   |   |-- wm-picture-g3-l2-key.png
|   |   |   |-- wm-picture-g3-l2-orange.png
|   |   |   |-- wm-picture-g3-l2-pencil.png
|   |   |   |-- wm-picture-g3-l2-star.png
|   |   |   |-- wm-picture-g3-l2-sun.png
|   |   |   `-- wm-picture-g3-l2-turtle.png
|   |   |-- level3
|   |   |   |-- wm-picture-g3-l3-apple.png
|   |   |   |-- wm-picture-g3-l3-bag.png
|   |   |   |-- wm-picture-g3-l3-banana.png
|   |   |   |-- wm-picture-g3-l3-bird.png
|   |   |   |-- wm-picture-g3-l3-book.png
|   |   |   |-- wm-picture-g3-l3-car.png
|   |   |   |-- wm-picture-g3-l3-duck.png
|   |   |   |-- wm-picture-g3-l3-flower.png
|   |   |   |-- wm-picture-g3-l3-house.png
|   |   |   |-- wm-picture-g3-l3-key.png
|   |   |   |-- wm-picture-g3-l3-pen.png
|   |   |   |-- wm-picture-g3-l3-pencil.png
|   |   |   |-- wm-picture-g3-l3-rabbit.png
|   |   |   |-- wm-picture-g3-l3-spoon.png
|   |   |   |-- wm-picture-g3-l3-star.png
|   |   |   |-- wm-picture-g3-l3-sun.png
|   |   |   |-- wm-picture-g3-l3-tortoise.png
|   |   |   |-- wm-picture-g3-l3-tree.png
|   |   |   `-- wm-picture-g3-l3-turtle.png
|   |   `-- level4
|   |       |-- wm-picture-g3-l4-apple.png
|   |       |-- wm-picture-g3-l4-bag.png
|   |       |-- wm-picture-g3-l4-banana.png
|   |       |-- wm-picture-g3-l4-bird.png
|   |       |-- wm-picture-g3-l4-book.png
|   |       |-- wm-picture-g3-l4-butterfly.png
|   |       |-- wm-picture-g3-l4-car.png
|   |       |-- wm-picture-g3-l4-duck.png
|   |       |-- wm-picture-g3-l4-flower.png
|   |       |-- wm-picture-g3-l4-frog.png
|   |       |-- wm-picture-g3-l4-house.png
|   |       |-- wm-picture-g3-l4-key.png
|   |       |-- wm-picture-g3-l4-orange.png
|   |       |-- wm-picture-g3-l4-pen.png
|   |       |-- wm-picture-g3-l4-pencil.png
|   |       |-- wm-picture-g3-l4-rabbit.png
|   |       |-- wm-picture-g3-l4-spoon.png
|   |       |-- wm-picture-g3-l4-star.png
|   |       |-- wm-picture-g3-l4-sun.png
|   |       |-- wm-picture-g3-l4-tortoise.png
|   |       |-- wm-picture-g3-l4-tree.png
|   |       `-- wm-picture-g3-l4-turtle.png
|   |-- objects
|   |   |-- ball.png
|   |   |-- bird.png
|   |   |-- book.png
|   |   |-- cat.png
|   |   |-- cup.png
|   |   |-- dog.png
|   |   |-- fish.png
|   |   |-- house.png
|   |   |-- sun.png
|   |   |-- tree.png
|   |   `-- wm-flower.png
|   `-- picture-memory-sprites.png
`-- shared
    |-- backgrounds
    |   |-- bg-level1.webp
    |   |-- bg-level2.webp
    |   |-- bg-level3.webp
    |   |-- bg-level4.webp
    |   |-- common-background.png
    |   |-- how-to-play
    |   |   |-- video-poster.png
    |   |   `-- video-poster.webp
    |   |-- level-map
    |   |   |-- ASSETS.md
    |   |   |-- level-scene-1.png
    |   |   |-- level-scene-1.webp
    |   |   |-- level-scene-2.png
    |   |   |-- level-scene-2.webp
    |   |   |-- level-scene-3.png
    |   |   |-- level-scene-3.webp
    |   |   |-- level-scene-4.png
    |   |   |-- level-scene-4.webp
    |   |   |-- map-background.png
    |   |   `-- map-background.webp
    |   `-- screening
    |       |-- forest.png
    |       |-- forest.webp
    |       |-- README.md
    |       |-- screening-background.png
    |       `-- working-memory-identify-quiz-bg.jpeg
    |-- boards
    |   |-- buckets
    |   |   |-- bucket-level1.png
    |   |   |-- bucket-level2.png
    |   |   |-- bucket-level3.png
    |   |   `-- bucket-level4.png
    |   |-- how-to-play
    |   |   |-- README.md
    |   |   |-- wm-level1-how-to-board.png
    |   |   |-- wm-level2-how-to-board.png
    |   |   |-- wm-level3-how-to-board.png
    |   |   `-- wm-level4-how-to-board.png
    |   |-- level-map
    |   |   |-- game-selection-vine-board.png
    |   |   |-- level-card-frame.png
    |   |   |-- level-card-frame.webp
    |   |   |-- map-heading.png
    |   |   |-- map-heading.webp
    |   |   |-- popup-vine-board.png
    |   |   `-- popup-vine-board.webp
    |   |-- navigation
    |   |   |-- nav-star-pill.png
    |   |   |-- nav-title-plank.png
    |   |   |-- nav-tracker.png
    |   |   `-- question-tracker.png
    |   |-- screening
    |   |   `-- vine-board.png
    |   `-- vine
    |       |-- level4
    |       |   |-- how-to-play-vine-board.png
    |       |   |-- level4-vine-board.png
    |       |   `-- wm-level4-vine-board-source.png
    |       |-- wm-level1-question-board.png
    |       |-- wm-level3-question-board.png
    |       |-- wm-level4-question-board.png
    |       |-- wm-vine-board-game.png
    |       |-- wm-vine-board-reference.png
    |       |-- wm-vine-board-wide.png
    |       |-- wm-vine-board-wide.webp
    |       `-- wm-vine-board.webp
    |-- bunny
    |   |-- bunny-happy.png
    |   |-- bunny-happy.webp
    |   |-- bunny-sad.png
    |   |-- bunny-sad.webp
    |   |-- bunny.webp
    |   |-- screening
    |   |   |-- bunny.png
    |   |   |-- bunny.webp
    |   |   `-- standing-bunny.png
    |   |-- wm-bunny-answer.png
    |   |-- wm-bunny-question.png
    |   |-- wm-bunny-ready.png
    |   |-- wm-intro-bunny.png
    |   |-- wm-reference-bunny-answer.png
    |   |-- wm-reference-bunny-question.png
    |   `-- wm-reference-bunny.png
    |-- buttons
    |   |-- actions
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
    |   |-- navigation
    |   |   |-- nav-back.png
    |   |   |-- nav-lang-en.png
    |   |   |-- nav-lang-si.png
    |   |   |-- nav-music.png
    |   |   `-- progress
    |   |       |-- level-1-wooden-button.png
    |   |       |-- level-2-wooden-button.png
    |   |       |-- level-3-wooden-button.png
    |   |       |-- level-4-wooden-button.png
    |   |       |-- level-5-wooden-button.png
    |   |       `-- lexiland-wooden-stick.png
    |   `-- wm-close.png
    |-- feedback
    |   |-- star.png
    |   |-- star.webp
    |   |-- trophy.png
    |   `-- trophy.webp
    `-- icons
        |-- apple.svg
        |-- c-blue.svg
        |-- c-green.svg
        |-- c-orange.svg
        |-- c-purple.svg
        |-- carrot.svg
        |-- flower.svg
        |-- games
        |   |-- level3
        |   |   |-- instructions.png
        |   |   |-- numbers.png
        |   |   |-- pattern.png
        |   |   `-- words.png
        |   |-- level4
        |   |   |-- instruction.png
        |   |   |-- numbers.png
        |   |   |-- pattern.png
        |   |   `-- words.png
        |   |-- menu
        |   |   |-- instructions.png
        |   |   |-- numbers.png
        |   |   |-- pattern.png
        |   |   `-- picture-memory.png
        |   |-- thumb-instructions.png
        |   |-- thumb-instructions.webp
        |   |-- thumb-numbers.png
        |   |-- thumb-numbers.webp
        |   |-- thumb-pattern.png
        |   |-- thumb-pattern.webp
        |   |-- thumb-words.png
        |   `-- thumb-words.webp
        |-- heart.svg
        |-- leaf.svg
        |-- moon.svg
        |-- sq-yellow.svg
        |-- star.svg
        |-- tri-red.svg
        |-- wm-magnifier.png
        `-- wm-speaker.png
```
