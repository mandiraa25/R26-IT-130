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
