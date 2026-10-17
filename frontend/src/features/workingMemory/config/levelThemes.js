/*
 * Working Memory: level themes and image paths
 *
 * What is inside
 *   - LEVEL_THEMES: the accent colours and button colour for Levels 1-4.
 *   - UI: the root folder for the shared images (navigation, bunny, boards...).
 *   - getWorkingMemoryThemeAssets(level): background, How to Play board and
 *     question board images for a game level.
 *   - SCREENING_ART: the forest background and standing bunny used only by
 *     the screening (identification) screens.
 *
 * Why it is here
 *   Everything that decides how a level or screen LOOKS (colours and images)
 *   is kept in one place, so changing a theme never touches game logic.
 *
 * Where it is used
 *   - shared/GameLayout.jsx          LEVEL_THEMES, UI (stage, navigation, buttons)
 *   - shared/ActivityScreen.jsx      UI
 *   - shared/ActivityResults.jsx     UI
 *   - improvement/LevelSelection.jsx LEVEL_THEMES (level card colours)
 *   - improvement/games/InstructionsGame.jsx  UI
 *   - improvement/ImprovementPage.jsx         getWorkingMemoryThemeAssets (image preloading)
 *   - identification/ScreeningIntro.jsx, ScreeningQuestions.jsx  SCREENING_ART
 *   - tests/unit/workingMemoryAssets.test.js  checks every theme image exists
 */

// ---------------------------------------------------------------------------
// Level colours and the shared image folder
// ---------------------------------------------------------------------------

export const UI = "/images/workingMemory/shared";
export const LEVEL_THEMES = {
  1: { accent: "#E07B1F", dark: "#B5560B", light: "#FDE3C6", button: "orange" },
  2: { accent: "#5BA35A", dark: "#3A7A39", light: "#DDEFD3", button: "green" },
  3: { accent: "#E77FA6", dark: "#B23C6C", light: "#FBE1EB", button: "pink" },
  4: { accent: "#8A6BC9", dark: "#5E3FA3", light: "#EAE2F8", button: "purple" },
};

// ---------------------------------------------------------------------------
// Images for each game level (backgrounds and boards)
// ---------------------------------------------------------------------------

const THEME_ROOT = "/images/workingMemory/shared/boards/how-to-play";

export const getWorkingMemoryThemeAssets = (levelNumber) => {
  const level = Math.min(Math.max(Number(levelNumber) || 1, 1), 4);

  return {
    background: `/images/workingMemory/shared/backgrounds/bg-level${level}.webp`,
    // Every tutorial uses the original Level 01 board, without recolouring.
    howToBoard: `${THEME_ROOT}/wm-level1-how-to-board.png`,
    howToBackground: `/images/workingMemory/shared/backgrounds/bg-level${level}.webp`,
    questionBoard: "/images/workingMemory/shared/boards/vine/wm-vine-board.webp",
  };
};

// ---------------------------------------------------------------------------
// Screening (identification) images
// ---------------------------------------------------------------------------

// Screening uses its supplied daytime forest and standing presenter, separate
// from the improvement games' level backgrounds and seated bunny.
export const SCREENING_ART = {
  background: "/images/workingMemory/shared/backgrounds/screening/forest.webp",
  bunny: "/images/workingMemory/shared/bunny/screening/bunny.webp",
};
