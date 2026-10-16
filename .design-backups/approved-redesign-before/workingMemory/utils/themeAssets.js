const THEME_ROOT = "/images/workingMemory/improve/themes";

export const getWorkingMemoryThemeAssets = (levelNumber) => {
  const level = Math.min(Math.max(Number(levelNumber) || 1, 1), 4);

  return {
    background: `${THEME_ROOT}/how-to-backgrounds/L${level}.png`,
    // Every tutorial uses the original Level 01 board, without recolouring.
    howToBoard: `${THEME_ROOT}/how-to-boards/L1.png`,
    howToBackground: `${THEME_ROOT}/how-to-backgrounds/L${level}.png`,
    questionBoard: "/images/workingMemory/improve/reference-art/vine-board.png",
    instructionFrame: "/images/workingMemory/improve/level4/boards/frame.png",
  };
};

