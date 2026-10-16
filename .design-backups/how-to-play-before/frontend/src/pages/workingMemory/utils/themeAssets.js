const THEME_ROOT = "/images/workingMemory/improve/themes";
const SHARED_QUESTION_BOARD = "/images/workingMemory/improve/boards/wm_vine_board.png";

export const getWorkingMemoryThemeAssets = (levelNumber) => {
  const level = Math.min(Math.max(Number(levelNumber) || 1, 1), 4);

  return {
    background: `${THEME_ROOT}/backgrounds/L${level}.png`,
    howToBoard: `${THEME_ROOT}/how-to-boards/L${level}.png`,
    questionBoard: level === 2
      ? SHARED_QUESTION_BOARD
      : `${THEME_ROOT}/question-boards/L${level}.png`,
    instructionFrame: `/images/workingMemory/improve/level${level}/boards/frame.png`,
  };
};

