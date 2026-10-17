/*
 * Working Memory: game settings and on-screen text
 *
 * What is inside
 *   - VALID_GRADES, VALID_LEVELS: the grades (2-4) and levels (1-4) that exist.
 *   - SUBCATEGORY_ORDER: the order the four games unlock in a level. The keys
 *     are stored in saved progress, so do not rename them ("words" = Picture Memory).
 *   - LEVEL_DISPLAY_TIMES_MS / getLevelDisplaySeconds: how long items are shown
 *     before the child answers, per level.
 *   - GAME_CATEGORIES: the English and Sinhala names and icon of each game.
 *   - HOW_TO_PLAY_VIDEOS / getHowToPlayVideo: the tutorial video link per game,
 *     level and language.
 *   - numberStageInstruction: the instruction text shown in the Numbers game.
 *   - getImprovementBunnyMessage / getImprovementFeedback: short, shared guidance
 *     and encouragement for every Improvement level.
 *   - DASHBOARD_CONTENT: the messages on the results and level-complete screens.
 *
 * Why it is here
 *   These are settings and text, not game logic. Keeping them together means a
 *   timing, a video link or a message can be changed without editing any game.
 *
 * Where it is used
 *   - improvement/ImprovementPage.jsx  getLevelDisplaySeconds, SUBCATEGORY_ORDER
 *   - improvement/data/index.js        VALID_GRADES, VALID_LEVELS (question bank lookup)
 *   - improvement/games/NumberMemoryGame.jsx, improvement/ActivityScreen.jsx  numberStageInstruction
 *   - shared/HowToPlay.jsx             getHowToPlayVideo
 *   - shared/ActivityResults.jsx, shared/LevelCompletion.jsx  GAME_CATEGORIES, DASHBOARD_CONTENT
 *   - tests (unit and e2e)             grades, levels, game order and timings
 */

// ---------------------------------------------------------------------------
// Grades, levels, game order and display timings
// ---------------------------------------------------------------------------

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


export const GAME_CATEGORIES = [
  { key: "pattern", en: "Pattern Recognition", si: "රටා හඳුනාගැනීම", icon: "Shapes" },
  { key: "words", en: "Picture Memory", si: "පින්තූර මතකය", icon: "Images" },
  { key: "instructions", en: "Following Instructions", si: "උපදෙස් අනුගමනය", icon: "ListOrdered" },
  { key: "numbers", en: "Number Memory", si: "අංක මතකය", icon: "Hash" },
];

// ---------------------------------------------------------------------------
// How to Play tutorial videos
// ---------------------------------------------------------------------------

// Add/replace tutorial links here. YouTube URLs and direct video URLs work.
// Empty entries retain the existing game's configured video as a fallback.
// Each language can use its own video without changing the shared UI.
export const HOW_TO_PLAY_VIDEOS = {
  pattern: { en: "", si: "" },
  words: { en: "", si: "" },
  instructions: { en: "", si: "" },
  numbers: { en: "", si: "" },
};

// Optional per-level overrides, for example:
// 2: { numbers: { en: "/videos/number-memory-level-2.mp4" } }
export const HOW_TO_PLAY_LEVEL_VIDEOS = { 1: {}, 2: {}, 3: {}, 4: {} };

export function getHowToPlayVideo(game, level, language, fallback = "") {
  const lang = language?.startsWith("si") ? "si" : "en";
  return HOW_TO_PLAY_LEVEL_VIDEOS[Number(level)]?.[game]?.[lang]
    || HOW_TO_PLAY_VIDEOS[game]?.[lang]
    || fallback;
}

// ---------------------------------------------------------------------------
// Numbers game instruction text (English / Sinhala)
// ---------------------------------------------------------------------------

export function numberStageInstruction({ recall, awaiting, backward, si }) {
  return getImprovementBunnyMessage({ game: "numbers", phase: recall ? "answer" : "show", awaiting, backward, si });
}

export function getImprovementFeedback({ correct = false, si = false } = {}) {
  return correct
    ? { title: si ? "හොඳයි!" : "Well done!", note: si ? "ඔබ නිවැරදි පිළිතුර සොයා ගත්තා!" : "You found the answer!" }
    : { title: si ? "අයියෝ!" : "Oops!", note: si ? "එය නිවැරදි පිළිතුර නොවේ. පසුව නැවත උත්සාහ කරන්න!" : "That’s not the correct answer. Try again later!" };
}

// Deliberately independent of level: the same activity gets the same short guide.
export function getImprovementBunnyMessage({ game, phase, awaiting = false, correct = false, backward = false, si = false } = {}) {
  const text = (en, sinhala) => si ? sinhala : en;
  if (phase === "feedback") return correct
    ? getImprovementFeedback({ correct, si }).note
    : text("Every go helps you learn.", "හැම උත්සාහයකින්ම අපි ඉගෙන ගනිමු.");
  if (phase === "result" || phase === "levelComplete") return text("You worked hard. Well done!", "ඔබ හොඳින් උත්සාහ කළා!");
  if (game === "pattern") return text("Look at the pattern. What comes next?", "රටාව බලන්න. ඊළඟට එන්නේ කුමක්ද?");
  if (game === "words") {
    if (phase === "answer") return text("Put the pictures in the same order.", "පින්තූර එම අනුපිළිවෙලට තබන්න.");
    if (awaiting || phase === "ready") return text("Tap Ready to see the pictures.", "පින්තූර බැලීමට සූදානම් ඔබන්න.");
    return text("Remember the picture order.", "පින්තූර අනුපිළිවෙල මතක තබා ගන්න.");
  }
  if (game === "numbers") {
    if (phase === "answer") return backward
      ? text("Tap the numbers from last to first.", "අන්තිම අංකයේ සිට මුලට ඔබන්න.")
      : text("Tap the numbers in the same order.", "අංක එම අනුපිළිවෙලට ඔබන්න.");
    if (awaiting || phase === "ready") return backward
      ? text("Tap Ready. Later, start with the last number.", "සූදානම් ඔබන්න. පසුව අන්තිම අංකයෙන් පටන් ගන්න.")
      : text("Tap Ready to see the numbers.", "අංක බැලීමට සූදානම් ඔබන්න.");
    return backward
      ? text("Remember the numbers. Start with the last one.", "අංක මතක තබා ගන්න. අන්තිම අංකයෙන් පටන් ගන්න.")
      : text("Remember the number order.", "අංක අනුපිළිවෙල මතක තබා ගන්න.");
  }
  if (game === "instructions") return phase === "answer"
    ? text("Think about the steps. Choose your answer.", "පියවර ගැන සිතන්න. පිළිතුර තෝරන්න.")
    : awaiting || phase === "ready"
      ? text("Tap Listen when you are ready.", "සූදානම් වූ විට සවන් දෙන්න ඔබන්න.")
      : text("Listen and remember the steps.", "සවන් දී පියවර මතක තබා ගන්න.");
  return text("Take your time. You can do it!", "සෙමින් කරන්න. ඔබට පුළුවන්!");
}

// ---------------------------------------------------------------------------
// Results and level-complete screen messages (English / Sinhala)
// ---------------------------------------------------------------------------

// Result labels and progression guidance in both interface languages.
export const DASHBOARD_CONTENT = {
  "1": {
    "gamesComplete": {
      "en": "Progress saved. All four Level 1 games are complete!",
      "si": "ප්‍රගතිය සුරැකී ඇත. පළමු මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!"
    },
    "level": {
      "en": "Level 1",
      "si": "මට්ටම 1"
    },
    "nextUnlocked": {
      "en": "Level 2 is unlocked. Your next adventure is ready!",
      "si": "දෙවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!"
    },
    "nextLocked": {
      "en": "Level 2 is locked. Complete all four Level 1 games with at least 3 out of 5 to unlock it.",
      "si": "දෙවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට පළමු මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න."
    },
    "completionTitle": {
      "en": "Level 1 Complete!",
      "si": "මට්ටම 1 සම්පූර්ණයි!"
    },
    "progressTitle": {
      "en": "Level 1 Progress",
      "si": "මට්ටම 1 ප්‍රගතිය"
    },
    "totalStarsLabel": {
      "en": "Total Level 1 stars",
      "si": "මට්ටම 1 මුළු තරු"
    },
    "completionLabel": {
      "en": "Level 1 completion",
      "si": "මට්ටම 1 සම්පූර්ණ කිරීම"
    },
    "ids": {
      "results": "level-one-results",
      "score": "level-one-score",
      "earnedStars": "level-one-earned-stars",
      "completion": "level-one-completion",
      "totalStars": "level-one-total-stars"
    }
  },
  "2": {
    "gamesComplete": {
      "en": "Progress saved. All four Level 2 games are complete!",
      "si": "ප්‍රගතිය සුරැකී ඇත. මට්ටම 2 ක්‍රීඩා හතරම සම්පූර්ණයි!"
    },
    "level": {
      "en": "Level 2",
      "si": "මට්ටම 2"
    },
    "nextUnlocked": {
      "en": "Level 3 is unlocked. Your next adventure is ready!",
      "si": "මට්ටම 3 විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!"
    },
    "nextLocked": {
      "en": "Level 3 is locked. Complete all four Level 2 games with at least 3 out of 5 to unlock it.",
      "si": "මට්ටම 3 විවෘත කිරීමට මට්ටම 2 ක්‍රීඩා හතරේම 5 න් 3 ක් ලබා ගන්න."
    },
    "completionTitle": {
      "en": "Level 2 Complete!",
      "si": "මට්ටම 2 සම්පූර්ණයි!"
    },
    "progressTitle": {
      "en": "Level 2 Progress",
      "si": "මට්ටම 2 ප්‍රගතිය"
    },
    "totalStarsLabel": {
      "en": "Total Level 2 stars",
      "si": "මට්ටම 2 මුළු තරු"
    },
    "completionLabel": {
      "en": "Level 2 completion",
      "si": "මට්ටම 2 සම්පූර්ණ කිරීම"
    },
    "ids": {
      "results": "level-two-results",
      "score": "level-two-score",
      "earnedStars": "level-two-earned-stars",
      "completion": "level-two-completion",
      "totalStars": "level-two-total-stars"
    }
  },
  "3": {
    "gamesComplete": {
      "en": "Progress saved. All four Level 3 games are complete!",
      "si": "ප්‍රගතිය සුරැකී ඇත. තෙවන මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!"
    },
    "level": {
      "en": "Level 3",
      "si": "මට්ටම 3"
    },
    "nextUnlocked": {
      "en": "Level 4 is unlocked. Your next adventure is ready!",
      "si": "හතරවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!"
    },
    "nextLocked": {
      "en": "Level 4 is locked. Complete all four Level 3 games with at least 3 out of 5 to unlock it.",
      "si": "හතරවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට තෙවන මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න."
    },
    "completionTitle": {
      "en": "Level 3 Complete!",
      "si": "මට්ටම 3 සම්පූර්ණයි!"
    },
    "progressTitle": {
      "en": "Level 3 Progress",
      "si": "මට්ටම 3 ප්‍රගතිය"
    },
    "totalStarsLabel": {
      "en": "Total Level 3 stars",
      "si": "මට්ටම 3 මුළු තරු"
    },
    "completionLabel": {
      "en": "Level 3 completion",
      "si": "මට්ටම 3 සම්පූර්ණ කිරීම"
    },
    "ids": {
      "results": "level-three-results",
      "score": "level-three-score",
      "earnedStars": "level-three-earned-stars",
      "completion": "level-three-completion",
      "totalStars": "level-three-total-stars"
    }
  },
  "4": {
    "gamesComplete": {
      "en": "Progress saved. All four Level 4 games are complete!",
      "si": "ප්‍රගතිය සුරැකී ඇත. හතරවන මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!"
    },
    "level": {
      "en": "Level 4",
      "si": "මට්ටම 4"
    },
    "completionTitle": {
      "en": "Level 4 Complete!",
      "si": "මට්ටම 4 සම්පූර්ණයි!"
    },
    "progressTitle": {
      "en": "Level 4 Progress",
      "si": "මට්ටම 4 ප්‍රගතිය"
    },
    "totalStarsLabel": {
      "en": "Total Level 4 stars",
      "si": "මට්ටම 4 මුළු තරු"
    },
    "completionLabel": {
      "en": "Level 4 completion",
      "si": "මට්ටම 4 සම්පූර්ණ කිරීම"
    },
    "ids": {
      "results": "level-four-results",
      "score": "level-four-score",
      "earnedStars": "level-four-earned-stars",
      "completion": "level-four-completion",
      "totalStars": "level-four-total-stars"
    }
  }
};
