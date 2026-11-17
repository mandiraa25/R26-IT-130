/*
 * FILE PURPOSE
 * Small immutable list of the four complete level-card artwork paths.
 *
 * HOW IT CONNECTS
 * LevelSelection maps LEVEL_MAP_CARDS into LevelMapCard components. No scoring or access data is
 * stored here.
 * Direct source importers: ../improvement/LevelSelection.jsx.
 *
 * THINGS TO REMEMBER
 * The images are public/images/workingMemory/level-map/cards/level-1.png through level-4.png. The
 * browser path omits public. Text/counts remain live JSX over the blank labels in the artwork.
 */

const CARD_ROOT = "/images/workingMemory/level-map/cards";

// Artwork only: access, completion counts and navigation remain page-owned.
export const LEVEL_MAP_CARDS = Object.freeze([1, 2, 3, 4].map(level => ({
  level,
  artwork: `${CARD_ROOT}/level-${level}.png`,
})));
