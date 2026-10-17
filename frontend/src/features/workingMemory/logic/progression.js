// Read saved progress without changing any unlock, reward or completion rules.
export const getSavedLevel = (progress, levelNumber) =>
  progress?.levelsProgress?.find(level => Number(level.levelNumber) === Number(levelNumber));

export const readTotalStars = payload =>
  Math.max(0, Number(payload?.totalStars ?? payload?.totalCarrots) || 0);
