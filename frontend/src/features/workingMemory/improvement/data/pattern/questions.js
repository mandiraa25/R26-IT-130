/*
 * FILE PURPOSE
 * Current authored visual Pattern Recognition question pools for each grade and level.
 *
 * HOW IT CONNECTS
 * getSubCategoryData uses PATTERN_QUESTIONS instead of the empty pattern bank arrays. PatternGame
 * displays showItems/options; evaluatePatternAnswer compares the selection with missingAnswer.
 * Direct source importers: ../index.js.
 *
 * THINGS TO REMEMBER
 * visualQuestion builds a consistent record from supplied data; it does not invent a pattern.
 * gridQuestion marks a single-board layout. Level 4 adds a sixth grid question; selectAttemptQuestions
 * chooses up to five. Symbol images are resolved by shared/artwork/patternSymbols.js.
 */

const visualQuestion = (id, showItems, options, answer) => ({
  id,
  type: "tap",
  instruction: "Look carefully at the visual pattern.",
  showItems,
  options,
  dragPool: options,
  correct: [answer],
  missingAnswer: answer,
});

// A 2x2 picture with one square missing; the child picks the piece that fits.
// The leaves turn a quarter clockwise from square to square, so the missing
// bottom-left piece is leaf-tile-b. Images: pattern/grade{2,3,4}/level4/leaf-*.png
const gridQuestion = (id, board, options, answer) => ({
  ...visualQuestion(id, [board], options, answer),
  layout: "grid",
  instruction: "Look at the four squares. The leaves turn around the middle. Which piece fits in the empty square?",
  prompt: { en: "Which piece completes the picture?", si: "පින්තූරය සම්පූර්ණ කරන්නේ කුමන කොටසද?" },
});
const leafGridQuestion = grade =>
  gridQuestion(`g${grade}_l4_pattern_6`, "leaf-grid", ["leaf-tile-a", "leaf-tile-b", "leaf-tile-c", "leaf-tile-d"], "leaf-tile-b");

export const PATTERN_QUESTIONS = Object.freeze({
  "2": {
    level1: [
      visualQuestion("g2_l1_pattern_1", ["🔴", "🔵", "🔴", "🔵", "?"], ["🔴", "🔵", "🟡"], "🔴"),
      visualQuestion("g2_l1_pattern_2", ["⭐", "🌙", "⭐", "🌙", "?"], ["🌙", "⭐", "☀️"], "⭐"),
      visualQuestion("g2_l1_pattern_3", ["🍎", "🍌", "🍎", "🍌", "?"], ["🍌", "🍎", "🍊"], "🍎"),
      visualQuestion("g2_l1_pattern_4", ["🌸", "❤️", "🌸", "❤️", "?"], ["❤️", "⭐", "🌸"], "🌸"),
      visualQuestion("g2_l1_pattern_5", ["🐱", "🐶", "🐱", "🐶", "?"], ["🐶", "🐱", "🐰"], "🐱"),
    ],
    level2: [
      visualQuestion("g2_l2_pattern_1", ["🟢", "🟡", "🟢", "🟡", "🟢", "?"], ["🟢", "🟡", "🔴"], "🟡"),
      visualQuestion("g2_l2_pattern_2", ["☀️", "☁️", "☀️", "☁️", "☀️", "?"], ["🌙", "☀️", "☁️"], "☁️"),
      visualQuestion("g2_l2_pattern_3", ["🐟", "🐠", "🐟", "🐠", "🐟", "?"], ["🐠", "🐟", "🐙"], "🐠"),
      visualQuestion("g2_l2_pattern_4", ["🍓", "🍇", "🍓", "🍇", "🍓", "?"], ["🍎", "🍓", "🍇"], "🍇"),
      visualQuestion("g2_l2_pattern_5", ["🚗", "🚌", "🚗", "🚌", "🚗", "?"], ["🚌", "🚲", "🚗"], "🚌"),
    ],
    level3: [
      visualQuestion("g2_l3_pattern_1", ["🔴", "🔴", "🔵", "🔴", "🔴", "🔵", "?"], ["🔵", "🟡", "🔴", "🟢"], "🔴"),
      visualQuestion("g2_l3_pattern_2", ["⭐", "🌙", "🌙", "⭐", "🌙", "🌙", "?"], ["🌙", "☀️", "⭐", "🌸"], "⭐"),
      visualQuestion("g2_l3_pattern_3", ["🍎", "🍌", "🍌", "🍎", "🍌", "🍌", "?"], ["🍊", "🍌", "🍇", "🍎"], "🍎"),
      visualQuestion("g2_l3_pattern_4", ["🐰", "🐰", "🐢", "🐰", "🐰", "🐢", "?"], ["🐢", "🐶", "🐰", "🐱"], "🐰"),
      visualQuestion("g2_l3_pattern_5", ["🌸", "❤️", "❤️", "🌸", "❤️", "❤️", "?"], ["⭐", "❤️", "🌸", "🌙"], "🌸"),
    ],
    level4: [
      visualQuestion("g2_l4_pattern_1", ["🔴", "🔵", "🟡", "🔴", "🔵", "🟡", "🔴", "?"], ["🟢", "🔴", "🟡", "🔵"], "🔵"),
      visualQuestion("g2_l4_pattern_2", ["⭐", "🌙", "☀️", "⭐", "🌙", "☀️", "⭐", "?"], ["☀️", "🌸", "🌙", "⭐"], "🌙"),
      visualQuestion("g2_l4_pattern_3", ["🍎", "🍌", "🍇", "🍎", "🍌", "🍇", "🍎", "?"], ["🍇", "🍊", "🍎", "🍌"], "🍌"),
      visualQuestion("g2_l4_pattern_4", ["🐱", "🐶", "🐰", "🐱", "🐶", "🐰", "🐱", "?"], ["🐰", "🐢", "🐶", "🐱"], "🐶"),
      visualQuestion("g2_l4_pattern_5", ["🌸", "❤️", "⭐", "🌸", "❤️", "⭐", "🌸", "?"], ["🌸", "⭐", "🌙", "❤️"], "❤️"),
      leafGridQuestion(2),
    ],
  },
  "3": {
    level1: [
      visualQuestion("g3_l1_pattern_1", ["🟥", "⚪", "🟥", "⚪", "🟥", "?"], ["🟥", "🔺", "⚪"], "⚪"),
      visualQuestion("g3_l1_pattern_2", ["🟠", "🟢", "🟠", "🟢", "🟠", "?"], ["🟢", "🟠", "🟣"], "🟢"),
      visualQuestion("g3_l1_pattern_3", ["🔺", "🔷", "🔺", "🔷", "🔺", "?"], ["🔺", "🟨", "🔷"], "🔷"),
      visualQuestion("g3_l1_pattern_4", ["🐘", "🦁", "🐘", "🦁", "🐘", "?"], ["🐘", "🦁", "🐒"], "🦁"),
      visualQuestion("g3_l1_pattern_5", ["🍉", "🍍", "🍉", "🍍", "🍉", "?"], ["🍓", "🍉", "🍍"], "🍍"),
    ],
    level2: [
      visualQuestion("g3_l2_pattern_1", ["🔵", "🟣", "🟪", "🔵", "🟣", "🟪", "?"], ["🟣", "🔵", "🟪"], "🔵"),
      visualQuestion("g3_l2_pattern_2", ["🟢", "🟢", "🟡", "🟢", "🟢", "🟡", "?"], ["🟡", "🔴", "🟢"], "🟢"),
      visualQuestion("g3_l2_pattern_3", ["⭐", "⭐", "🌙", "⭐", "⭐", "🌙", "?"], ["☀️", "🌙", "⭐"], "⭐"),
      visualQuestion("g3_l2_pattern_4", ["🐟", "🐠", "🐙", "🐟", "🐠", "🐙", "?"], ["🐠", "🐙", "🐟"], "🐟"),
      visualQuestion("g3_l2_pattern_5", ["🍎", "🍎", "🍌", "🍎", "🍎", "🍌", "?"], ["🍌", "🍎", "🍊"], "🍎"),
    ],
    level3: [
      visualQuestion("g3_l3_pattern_1", ["🟠", "🟠", "🟢", "🟣", "🟠", "🟠", "🟢", "?"], ["🟣", "🟠", "🟢", "🟧"], "🟣"),
      visualQuestion("g3_l3_pattern_2", ["🔴", "🔵", "🔵", "🔴", "🔵", "🔵", "🔴", "?"], ["🟡", "🔴", "🟢", "🔵"], "🔵"),
      visualQuestion("g3_l3_pattern_3", ["🌸", "⭐", "🌙", "🌸", "⭐", "🌙", "🌸", "?"], ["🌙", "❤️", "🌸", "⭐"], "⭐"),
      visualQuestion("g3_l3_pattern_4", ["🐱", "🐶", "🐦", "🐱", "🐶", "🐦", "🐱", "?"], ["🐦", "🐰", "🐱", "🐶"], "🐶"),
      visualQuestion("g3_l3_pattern_5", ["🍓", "🍇", "🍊", "🍓", "🍇", "🍊", "🍓", "?"], ["🍊", "🍎", "🍇", "🍓"], "🍇"),
    ],
    level4: [
      visualQuestion("g3_l4_pattern_1", ["🔴", "🔴", "🔵", "🟢", "🔴", "🔴", "🔵", "?"], ["🔴", "🟢", "🔵", "🟡"], "🟢"),
      visualQuestion("g3_l4_pattern_2", ["🟨", "🔺", "🟦", "🔺", "🟨", "🔺", "🟦", "?"], ["🟨", "🟦", "🟩", "🔺"], "🔺"),
      visualQuestion("g3_l4_pattern_3", ["⭐", "🌙", "🌙", "☀️", "⭐", "🌙", "🌙", "?"], ["🌙", "⭐", "🌸", "☀️"], "☀️"),
      visualQuestion("g3_l4_pattern_4", ["🐘", "🐒", "🦁", "🐒", "🐘", "🐒", "🦁", "?"], ["🐒", "🐘", "🦁", "🐯"], "🐒"),
      visualQuestion("g3_l4_pattern_5", ["🍎", "🍌", "🍌", "🍇", "🍎", "🍌", "🍌", "?"], ["🍌", "🍊", "🍎", "🍇"], "🍇"),
      leafGridQuestion(3),
    ],
  },
  "4": {
    level1: [
      visualQuestion("g4_l1_pattern_1", ["🟢", "🟡", "🔴", "🟢", "🟡", "?"], ["🔴", "🟢", "🟡"], "🔴"),
      visualQuestion("g4_l1_pattern_2", ["⭐", "🌙", "☀️", "⭐", "🌙", "?"], ["🌙", "☀️", "⭐"], "☀️"),
      visualQuestion("g4_l1_pattern_3", ["🟥", "🟦", "🟨", "🟥", "🟦", "?"], ["🟥", "🟨", "🟦"], "🟨"),
      visualQuestion("g4_l1_pattern_4", ["🐱", "🐶", "🐰", "🐱", "🐶", "?"], ["🐶", "🐰", "🐱"], "🐰"),
      visualQuestion("g4_l1_pattern_5", ["🍊", "🍋", "🍊", "🍋", "🍊", "?"], ["🍋", "🍊", "🍎"], "🍋"),
    ],
    level2: [
      visualQuestion("g4_l2_pattern_1", ["🔴", "🔵", "🟢", "🔴", "🔵", "🟢", "?"], ["🔵", "🟢", "🔴"], "🔴"),
      visualQuestion("g4_l2_pattern_2", ["🟠", "🟡", "🟠", "🟡", "🟠", "🟡", "?"], ["🟡", "🟠", "🟨"], "🟠"),
      visualQuestion("g4_l2_pattern_3", ["🌸", "⭐", "❤️", "🌸", "⭐", "❤️", "?"], ["❤️", "🌸", "⭐"], "🌸"),
      visualQuestion("g4_l2_pattern_4", ["🐟", "🐠", "🐙", "🐟", "🐠", "🐙", "?"], ["🐙", "🐟", "🐠"], "🐟"),
      visualQuestion("g4_l2_pattern_5", ["🍎", "🍌", "🍇", "🍎", "🍌", "🍇", "?"], ["🍌", "🍎", "🍇"], "🍎"),
    ],
    level3: [
      visualQuestion("g4_l3_pattern_1", ["🟥", "🟦", "✚", "🟥", "🟦", "✚", "🟥", "?"], ["🟥", "🟦", "✚", "🟩"], "🟦"),
      visualQuestion("g4_l3_pattern_2", ["🟨", "🔺", "🟦", "🔺", "🟨", "🔺", "🟦", "?"], ["🟨", "🟦", "🟩", "🔺"], "🔺"),
      visualQuestion("g4_l3_pattern_3", ["🔴", "🔴", "🔵", "🔴", "🔴", "🔵", "🔴", "?"], ["🔵", "🟢", "🔴", "🟡"], "🔴"),
      visualQuestion("g4_l3_pattern_4", ["⭐", "🌙", "☀️", "🌙", "⭐", "🌙", "☀️", "?"], ["☀️", "⭐", "🌸", "🌙"], "🌙"),
      visualQuestion("g4_l3_pattern_5", ["🐱", "🐶", "🐦", "🐶", "🐱", "🐶", "🐦", "?"], ["🐱", "🐦", "🐰", "🐶"], "🐶"),
    ],
    level4: [
      visualQuestion("g4_l4_pattern_1", ["🔴", "🔴", "🔵", "🟢", "🔴", "🔴", "🔵", "?"], ["🟢", "🔴", "🔵", "🟡"], "🟢"),
      visualQuestion("g4_l4_pattern_2", ["🟠", "🟢", "🟣", "🟢", "🟠", "🟢", "🟣", "?"], ["🟠", "🟢", "🟣", "🟧"], "🟢"),
      visualQuestion("g4_l4_pattern_3", ["🔴🔺", "🔵🟦", "🔴🔺", "🔵🟦", "🔴🔺", "🔵🟦", "🔴🔺", "?"], ["🔵🟦", "🔴🔺", "🔵🔺", "🔴🟦"], "🔵🟦"),
      visualQuestion("g4_l4_pattern_4", ["🌸", "⭐", "🌙", "❤️", "🌸", "⭐", "🌙", "?"], ["🌙", "🌸", "❤️", "⭐"], "❤️"),
      visualQuestion("g4_l4_pattern_5", ["🐟", "🐠", "🐙", "🦀", "🐟", "🐠", "🐙", "?"], ["🐙", "🐟", "🦀", "🐠"], "🦀"),
      leafGridQuestion(4),
    ],
  },
});
