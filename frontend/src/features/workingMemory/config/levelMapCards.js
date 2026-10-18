const CARD_ROOT = "/images/workingMemory/level-map/cards";

// Artwork only: access, completion counts and navigation remain page-owned.
export const LEVEL_MAP_CARDS = Object.freeze([1, 2, 3, 4].map(level => ({
  level,
  artwork: `${CARD_ROOT}/level-${level}.png`,
})));
