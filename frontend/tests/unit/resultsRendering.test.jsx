import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../../src/features/workingMemory/logic/audio", () => ({ useMemoryMusic: () => ({ muted: true, toggle() {} }) }));

import ActivityResults from "../../src/features/workingMemory/shared/ActivityResults";
import LevelCompletion from "../../src/features/workingMemory/shared/LevelCompletion";
import { ORIGINAL_DASHBOARDS } from "../fixtures/workingMemory/resultBaseline";

const games = ["pattern", "words", "instructions", "numbers"];
const modes = ["saved", "saving", "save-error", "progress-loading", "progress-error", "prior-completion", "history-loading", "history-error", "missing-save", "level-complete"];
const cases = [1, 2, 3, 4].flatMap(level => [false, true].flatMap(si => [1, 3, 4].flatMap(score => games.flatMap(game => modes.map(mode => ({ level, si, score, game, mode }))))));

function propsFor({ level, score, game, mode }) {
  const progress = {
    maxUnlockedLevel: mode === "level-complete" ? Math.min(level + 1, 4) : level,
    levelsProgress: [1, 2, 3, 4].map(levelNumber => ({ levelNumber,
      isCompleted: levelNumber === level && mode === "level-complete",
      subCategories: games.map(subCategoryKey => ({ subCategoryKey,
        isCompleted: levelNumber === level && (mode === "level-complete" || mode === "prior-completion"),
        isUnlocked: true,
      })),
    })),
  };
  return {
    levelNumber: String(level), subCategoryKey: game, score, earnedStars: score * 5,
    questions: Array.from({ length: 5 }, (_, index) => ({ id: `q${index}` })),
    savedProgress: progress,
    submitResult: mode === "missing-save" ? null : { starsEarned: score * 5, progress },
    isSubmitting: mode === "saving", submissionError: mode === "save-error",
    progressLoading: mode === "progress-loading", progressError: mode === "progress-error",
    historyLoading: mode === "history-loading", historyError: mode === "history-error",
    levelHistory: games.flatMap(subCategoryKey => [3, 4].map(value => ({ levelNumber: level, subCategoryKey, starsEarned: value * 5 }))),
  };
}

describe("Shared result screens preserve the original four level designs", () => {
  it.each(cases)("Level $level / Sinhala $si / $game / score $score / $mode", scenario => {
    const props = { p: propsFor(scenario), si: scenario.si, title: "Unchanged game title" };
    const Original = ORIGINAL_DASHBOARDS[scenario.level];
    expect(renderToStaticMarkup(<ActivityResults {...props} />)).toBe(renderToStaticMarkup(<Original.ActivityResults {...props} />));
    const actual = renderToStaticMarkup(<LevelCompletion {...props} />);
    const expected = renderToStaticMarkup(<Original.LevelCompletion {...props} />);
    const offset = Array.from({ length: actual.length }, (_, index) => index).find(index => actual[index] !== expected[index]);
    expect(actual, JSON.stringify({ actual: actual.slice(offset - 70, offset + 180), expected: expected.slice(offset - 70, offset + 180) })).toBe(expected);
  });
});
