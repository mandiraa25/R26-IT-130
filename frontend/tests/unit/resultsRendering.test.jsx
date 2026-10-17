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

function bubbleMarkup(message) {
  return renderToStaticMarkup(<aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>);
}

// Keep the frozen fixtures intact. Only these intentional copy changes may
// differ; scores, stars, saved progress, button states and all other markup
// still have to match the original screens exactly.
function expectedWithUpdatedCopy(markup, { level, si }, screen) {
  const bubbleChanges = screen === "activity"
    ? si
      ? [["හොඳයි!", "හොඳයි! ඔබ දිගටම උත්සාහ කළා!"], ["හොඳ උත්සාහයක්! දිගටම ඉගෙන ගනිමු.", "හොඳ උත්සාහයක්! ඉගෙන ගනිමු."]]
      : [["Well done!", "Well done! You kept going!"], ["Good try! Let's keep learning.", "Good effort! Keep learning."]]
    : si
      ? [["හොඳයි! අපූරු වික්‍රමයක්!", "ඔබ කළා! හොඳයි!"], ["සෑම පියවරක්ම ඔබට උපකාරී වේ!", "දිගටම යමු. ඔබ ඉගෙන ගන්නවා!"]]
      : [["Well done! What an adventure!", "You did it! Well done!"], ["Every step helps you grow!", "Keep going. You are learning!"]];
  let expected = markup;
  for (const [before, after] of bubbleChanges) expected = expected.replace(bubbleMarkup(before), bubbleMarkup(after));
  if (level === 2 && si) {
    const levelTwoCorrections = [
      ["Unchanged game title · මට්ටම 1", "Unchanged game title · මට්ටම 2"],
      ["මට්ටම 1 සම්පූර්ණයි!", "මට්ටම 2 සම්පූර්ණයි!"],
      ["මට්ටම 1 ප්‍රගතිය", "මට්ටම 2 ප්‍රගතිය"],
      ["මට්ටම 1 මුළු තරු", "මට්ටම 2 මුළු තරු"],
      ['aria-label="මට්ටම 1 සම්පූර්ණ කිරීම"', 'aria-label="මට්ටම 2 සම්පූර්ණ කිරීම"'],
      ["ප්‍රගතිය සුරැකී ඇත. පළමු මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!", "ප්‍රගතිය සුරැකී ඇත. මට්ටම 2 ක්‍රීඩා හතරම සම්පූර්ණයි!"],
      ["දෙවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!", "මට්ටම 3 විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!"],
      ["දෙවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට පළමු මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න.", "මට්ටම 3 විවෘත කිරීමට මට්ටම 2 ක්‍රීඩා හතරේම 5 න් 3 ක් ලබා ගන්න."],
    ];
    for (const [before, after] of levelTwoCorrections) expected = expected.replaceAll(before, after);
  }
  if (level === 4 && !si && screen === "completion") {
    expected = expected.replace("<h2>Number Recall</h2>", "<h2>Number Memory</h2>");
  }
  return expected;
}

describe("Shared result screens preserve scores, save states and progression while using the updated copy", () => {
  it.each(cases)("Level $level / Sinhala $si / $game / score $score / $mode", scenario => {
    const props = { p: propsFor(scenario), si: scenario.si, title: "Unchanged game title" };
    const Original = ORIGINAL_DASHBOARDS[scenario.level];
    const activity = renderToStaticMarkup(<ActivityResults {...props} />);
    const expectedActivity = expectedWithUpdatedCopy(renderToStaticMarkup(<Original.ActivityResults {...props} />), scenario, "activity");
    expect(activity).toBe(expectedActivity);
    const actual = renderToStaticMarkup(<LevelCompletion {...props} />);
    const expected = expectedWithUpdatedCopy(renderToStaticMarkup(<Original.LevelCompletion {...props} />), scenario, "completion");
    const offset = Array.from({ length: actual.length }, (_, index) => index).find(index => actual[index] !== expected[index]);
    expect(actual, JSON.stringify({ actual: actual.slice(offset - 70, offset + 180), expected: expected.slice(offset - 70, offset + 180) })).toBe(expected);
  });
});

describe("Result guidance and translated level labels", () => {
  it("keeps the Number Memory category name consistent across all four level summaries", () => {
    for (const level of [1, 2, 3, 4]) {
      const p = propsFor({ level, score: 3, game: "numbers", mode: "level-complete" });
      const markup = renderToStaticMarkup(<LevelCompletion p={p} />);
      expect(markup).toContain("<h2>Number Memory</h2>");
      expect(markup).not.toContain("Number Recall");
    }
  });

  const guidanceCases = [1, 2, 3, 4].flatMap(level => [false, true].flatMap(si => [false, true].map(complete => ({ level, si, complete }))));
  it.each(guidanceCases)("uses short result bubbles in Level $level / Sinhala $si / complete $complete", ({ level, si, complete }) => {
    const p = propsFor({ level, score: complete ? 3 : 1, game: "numbers", mode: complete ? "level-complete" : "saved" });
    const activity = renderToStaticMarkup(<ActivityResults p={p} si={si} title="Game title" />);
    const completion = renderToStaticMarkup(<LevelCompletion p={p} si={si} />);
    const expectedActivity = si
      ? complete ? "හොඳයි! ඔබ දිගටම උත්සාහ කළා!" : "හොඳ උත්සාහයක්! ඉගෙන ගනිමු."
      : complete ? "Well done! You kept going!" : "Good effort! Keep learning.";
    const expectedCompletion = si
      ? complete ? "ඔබ කළා! හොඳයි!" : "දිගටම යමු. ඔබ ඉගෙන ගන්නවා!"
      : complete ? "You did it! Well done!" : "Keep going. You are learning!";
    expect(activity).toContain(bubbleMarkup(expectedActivity));
    expect(completion).toContain(bubbleMarkup(expectedCompletion));
  });

  it("labels Level 2 accurately in Sinhala and points to Level 3 after completion", () => {
    const complete = propsFor({ level: 2, score: 3, game: "numbers", mode: "level-complete" });
    const activity = renderToStaticMarkup(<ActivityResults p={complete} si title="Unchanged game title" />);
    const completion = renderToStaticMarkup(<LevelCompletion p={complete} si />);
    expect(activity).toContain("Unchanged game title · මට්ටම 2");
    expect(activity).toContain("ප්‍රගතිය සුරැකී ඇත. මට්ටම 2 ක්‍රීඩා හතරම සම්පූර්ණයි!");
    expect(completion).toContain("මට්ටම 2 සම්පූර්ණයි!");
    expect(completion).toContain("මට්ටම 2 මුළු තරු");
    expect(completion).toContain('aria-label="මට්ටම 2 සම්පූර්ණ කිරීම"');
    expect(completion).toContain("මට්ටම 3 විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!");
    const incomplete = propsFor({ level: 2, score: 1, game: "numbers", mode: "saved" });
    const progress = renderToStaticMarkup(<LevelCompletion p={incomplete} si />);
    expect(progress).toContain("මට්ටම 2 ප්‍රගතිය");
    expect(progress).toContain("මට්ටම 3 විවෘත කිරීමට මට්ටම 2 ක්‍රීඩා හතරේම 5 න් 3 ක් ලබා ගන්න.");
    for (const markup of [activity, completion, progress]) expect(markup).not.toContain("මට්ටම 1");
  });
});

describe("Level 4 recorded-star request states", () => {
  const copy = si => ({
    saving: si ? "ප්‍රගතිය සුරකිමින්…" : "Saving your progress…",
    loading: si ? "තරු ලබා ගනිමින්..." : "Loading recorded stars...",
    unavailable: si ? "සුරැකි තරු ලබා ගත නොහැක." : "Recorded stars unavailable",
    retry: si ? "තරු නැවත ලබා ගන්න" : "Refresh recorded stars",
  });

  it.each([false, true])("shows saving without reporting unrequested star history as unavailable / Sinhala %s", si => {
    const p = { ...propsFor({ level: 4, score: 3, game: "pattern", mode: "saving" }), submitResult: null, levelHistory: null, historyLoading: false, historyError: false };
    const markup = renderToStaticMarkup(<ActivityResults p={p} si={si} title="Pattern Recognition" />);
    expect(markup).toContain(copy(si).saving);
    expect(markup).not.toContain(copy(si).unavailable);
    expect(markup).not.toContain(copy(si).loading);
    expect(markup).not.toContain("lx-category-record");
  });

  it.each([false, true])("shows recorded-star loading after the current result has saved / Sinhala %s", si => {
    const p = { ...propsFor({ level: 4, score: 3, game: "pattern", mode: "saved" }), levelHistory: null, historyLoading: true, historyError: false };
    const markup = renderToStaticMarkup(<ActivityResults p={p} si={si} title="Pattern Recognition" />);
    expect(markup).toContain(copy(si).loading);
    expect(markup).not.toContain(copy(si).saving);
    expect(markup).not.toContain(copy(si).unavailable);
    expect(markup).not.toContain(copy(si).retry);
  });

  it.each([false, true])("shows unavailable stars and a refresh action only after a history error / Sinhala %s", si => {
    const p = { ...propsFor({ level: 4, score: 3, game: "pattern", mode: "saved" }), levelHistory: null, historyLoading: false, historyError: true };
    const markup = renderToStaticMarkup(<ActivityResults p={p} si={si} title="Pattern Recognition" />);
    expect(markup).toContain(copy(si).unavailable);
    expect(markup).toMatch(new RegExp(`<button[^>]*>${copy(si).retry}</button>`));
    expect(markup).not.toContain(copy(si).loading);
  });
});
