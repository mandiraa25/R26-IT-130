export const LEVEL_DISPLAY_TIMES_MS = Object.freeze({
  1: 12000,
  2: 10000,
  3: 8000,
  4: 6000,
});

export const getLevelDisplaySeconds = (levelNumber) => {
  const milliseconds = LEVEL_DISPLAY_TIMES_MS[Number(levelNumber)];
  return milliseconds ? milliseconds / 1000 : null;
};

export const VALID_GRADES = Object.freeze(["2", "3", "4"]);
export const VALID_LEVELS = Object.freeze([1, 2, 3, 4]);
export const SUBCATEGORY_ORDER = Object.freeze(["pattern", "words", "instructions", "numbers"]);
