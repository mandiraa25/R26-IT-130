const THEME_ROOT = "/images/workingMemory/improve/themes";

export const getWorkingMemoryThemeAssets = (levelNumber) => {
  const level = Math.min(Math.max(Number(levelNumber) || 1, 1), 4);

  return {
    background: `/images/workingMemory/ui/backgrounds/bg-level${level}.webp`,
    // Every tutorial uses the original Level 01 board, without recolouring.
    howToBoard: `${THEME_ROOT}/how-to-boards/L1.png`,
    howToBackground: `/images/workingMemory/ui/backgrounds/bg-level${level}.webp`,
    questionBoard: "/images/workingMemory/ui/vine-board.webp",
    instructionFrame: "/images/workingMemory/improve/level4/boards/frame.png",
  };
};

