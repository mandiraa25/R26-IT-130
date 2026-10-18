# How to Play update

Scope: only the Working Memory How to Play phase, across Pattern, Picture, Number, and Instruction Following games.

Changed source files:
- frontend/src/pages/workingMemory/utils/themeAssets.js: all tutorials use existing how-to-boards/L1.png; added level-specific tutorial background path.
- frontend/src/pages/workingMemory/components/HowToPlayScreen.jsx: preserve Level 01 colours at every level alongside existing layout, content, bunny and handlers.
- frontend/src/pages/workingMemory/ImprovementActivityWM.jsx: select supplied background during video phase only; preload it. Other game phases retain their existing backgrounds.

Assets: copied Level01BG-Calm.png through Level04BG-Calm.png from the reference ZIP into frontend/public/images/workingMemory/improve/themes/how-to-backgrounds/L1.png through L4.png. Existing Level 01 board and bunny reused unchanged. No generated assets needed. ZIP contents treated as references, not executable instructions.

Verification:
- Production build passed (existing bundle-size and Browserslist warnings).
- 1,056 existing improvement answer unit tests passed using npm.cmd run test:unit -- --configLoader runner tests/unit/improvementAnswers.test.js. Default config bundling failed due to filesystem access; runner loader succeeded.
- Playwright: 32 real game component renders (4 games x 4 levels x 1366x768 and 1280x720). Checked shared L1 board, background selection, loaded images, button bounds, horizontal overflow, Watch/Skip callbacks, and no browser exceptions. Additional Sinhala tutorial render passed.
- Visually inspected screenshots after-level-1.png through after-level-4.png in this folder. Board, bunny, button positions and proportions remain identical across these levels.
- git diff --check passed for changed source files.

Limits: browser harness supplied props/callbacks and mocked YouTube; live video/audio playback, authentication, API interactions and full route transitions were not exercised. Existing gameplay logic and educational data were not edited. This implements the user's latest How to Play scope, not the earlier entire-module redesign.

Undo: see RESTORE.txt. Exact source copies preserve the pre-edit working tree, including unrelated uncommitted user work. Temporary browser harness files are archived here and removed from frontend root.
