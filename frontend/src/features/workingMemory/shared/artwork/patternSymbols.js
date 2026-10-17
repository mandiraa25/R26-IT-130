/*
 * Working Memory: pattern symbol map
 *
 * What is inside
 *   - PATTERN_ARTWORK: for every pattern emoji (⭐, 🍎, 🔴 ...), its readable label,
 *     its image file name and the image size in pixels.
 *   - resolvePatternArtwork(value): turns a question value into the symbol(s) to
 *     draw; returns null for plain text such as "A", "1" or "?".
 *   - patternImageSrc(symbol, grade, level): the image path for the current
 *     grade and level, or the grade's screening folder when there is no level.
 *
 * Why it is here
 *   Pattern questions keep their emoji values in the question data. This map only
 *   decides which picture is drawn for each emoji, so it lives next to the
 *   component that draws them.
 *
 * Images
 *   One PNG per symbol, organised by where it is used:
 *     /images/workingMemory/pattern/grade{2,3,4}/level{1,2,3,4}/<name>.png   improvement games
 *     /images/workingMemory/pattern/grade{2,3,4}/screening/<name>.png       screening test
 *   Each folder holds only the symbols that grade/level's questions use
 *   (checked by tests/unit/workingMemoryAssets.test.js).
 *
 * Where it is used
 *   - shared/artwork/PatternArtwork.jsx   resolvePatternArtwork, patternImageSrc
 *   - tests/unit/patternArtwork.test.js, workingMemoryAssets.test.js
 */

const ROOT = "/images/workingMemory/pattern";

// [emoji, label, image file, width, height]
const SYMBOLS = [
  ["⭐", "Yellow star", "yellow-star.png", 271, 254],
  ["🌙", "Crescent moon", "crescent-moon.png", 249, 262],
  ["☀️", "Sun", "sun.png", 301, 287],
  ["🌸", "Pink flower", "pink-flower.png", 260, 249],
  ["🍎", "Red apple", "red-apple.png", 259, 284],
  ["🍌", "Yellow banana", "yellow-banana.png", 284, 240],
  ["🍊", "Orange fruit", "orange-fruit.png", 269, 272],
  ["🍓", "Strawberry", "strawberry.png", 232, 277],
  ["🍇", "Purple grapes", "purple-grapes.png", 248, 292],
  ["🍉", "Watermelon slice", "watermelon-slice.png", 282, 260],
  ["🍍", "Pineapple", "pineapple.png", 218, 315],
  ["🍋", "Yellow lemon", "yellow-lemon.png", 261, 260],
  ["❤️", "Red heart", "red-heart.png", 286, 242],
  ["☁️", "White cloud", "white-cloud.png", 314, 215],
  ["🐱", "Cat face", "cat-face.png", 282, 249],
  ["🐶", "Dog face", "dog-face.png", 323, 240],
  ["🐰", "White rabbit face", "white-rabbit-face.png", 255, 289],
  ["🐟", "Yellow-orange fish", "yellow-orange-fish.png", 292, 216],
  ["🐠", "Blue tropical fish", "blue-tropical-fish.png", 301, 225],
  ["🐙", "Pink octopus", "pink-octopus.png", 318, 256],
  ["🐢", "Green turtle", "green-turtle.png", 312, 232],
  ["🐘", "Grey elephant", "grey-elephant.png", 315, 283],
  ["🦁", "Lion face", "lion-face.png", 307, 316],
  ["🐒", "Brown monkey face", "brown-monkey-face.png", 311, 257],
  ["🐯", "Orange tiger face", "orange-tiger-face.png", 292, 259],
  ["🐦", "Blue bird", "blue-bird.png", 265, 257],
  ["🦀", "Red crab", "red-crab.png", 291, 245],
  ["🚗", "Red car", "red-car.png", 306, 193],
  ["🚌", "Yellow bus", "yellow-bus.png", 314, 196],
  ["🚲", "Teal bicycle", "teal-bicycle.png", 300, 225],
  ["🔴", "Red circle", "red-circle.png", 254, 253],
  ["🔵", "Blue circle", "blue-circle.png", 254, 252],
  ["🟡", "Yellow circle", "yellow-circle.png", 254, 252],
  ["🟢", "Green circle", "green-circle.png", 254, 252],
  ["🟠", "Orange circle", "orange-circle.png", 254, 253],
  ["🟣", "Purple circle", "purple-circle.png", 255, 254],
  ["⚪", "White circle", "white-circle.png", 255, 252],
  ["🔺", "Red triangle", "red-triangle.png", 268, 234],
  ["🟥", "Red square", "red-square.png", 235, 230],
  ["🟦", "Blue square", "blue-square.png", 236, 232],
  ["🟩", "Green square", "green-square.png", 234, 230],
  ["🟨", "Yellow square", "yellow-square.png", 232, 230],
  ["🟧", "Orange square", "orange-square.png", 237, 235],
  ["🟪", "Purple square", "purple-square.png", 236, 235],
  ["🔷", "Blue diamond", "blue-diamond.png", 253, 254],
  ["✚", "Teal plus sign", "teal-plus-sign.png", 246, 248],
];

const normalize = value => String(value ?? "").replace(/️/g, "");

export const PATTERN_ARTWORK = Object.freeze(Object.fromEntries(SYMBOLS.map(([value, label, file, width, height]) => [
  normalize(value), Object.freeze({ value, label, file, width, height }),
])));

export function resolvePatternArtwork(value) {
  const token = normalize(value);
  if (PATTERN_ARTWORK[token]) return [PATTERN_ARTWORK[token]];
  // The Grade 4 composite tokens are pairs, not new question values.
  const parts = Array.from(token).map(symbol => PATTERN_ARTWORK[symbol]);
  return parts.length > 1 && parts.every(Boolean) ? parts : null;
}

// Improvement pages have a level (/improvement-activity-wm/:grade/:levelNumber/...);
// the screening page (/working-memory/:grade) has none, so it uses the screening folder.
export function patternImageSrc(symbol, grade, level) {
  const folder = level ? `level${Number(level)}` : "screening";
  return `${ROOT}/grade${grade}/${folder}/${symbol.file}`;
}
