import { describe, expect, it } from "vitest";
import { PATTERN_QUESTIONS } from "../../src/features/workingMemory/improvement/data/pattern/questions.js";
import { grade2Data } from "../../src/features/workingMemory/identification/data/grade2.js";
import { grade3Data } from "../../src/features/workingMemory/identification/data/grade3.js";
import { grade4Data } from "../../src/features/workingMemory/identification/data/grade4.js";
import { PATTERN_ARTWORK, resolvePatternArtwork } from "../../src/features/workingMemory/shared/artwork/patternSymbols.js";

const improvement = Object.values(PATTERN_QUESTIONS).flatMap(grade => Object.values(grade).flat());
const screening = [grade2Data, grade3Data, grade4Data].flatMap(grade => Object.values(grade).flat())
  .filter(question => question.category === "Pattern");
const questionTokens = question => [
  ...(question.showItems ?? question.text.split(/[\s,]+/)), ...question.options,
];
const isText = value => /^[\p{L}\p{N}_?]+$/u.test(value);

describe("Pattern illustration coverage", () => {
  it("covers every visual symbol in all existing improvement and screening questions", () => {
    const missing = [...new Set(improvement.concat(screening).flatMap(questionTokens))]
      .filter(value => !isText(value) && !resolvePatternArtwork(value));
    expect(missing).toEqual([]);
  });

  it.each(["🔴🔺", "🔵🟦", "🔵🔺", "🔴🟦"])("preserves both symbols in the order of %s", value => {
    expect(resolvePatternArtwork(value).map(symbol => symbol.value)).toEqual(Array.from(value));
  });

  it("keeps geometric colour and shape distinctions in separate image files", () => {
    const shapes = ["🔴", "🔵", "🟡", "🟢", "🟠", "🟣", "⚪", "🔺", "🟥", "🟦", "🟩", "🟨", "🟧", "🟪", "🔷", "✚"];
    const files = shapes.map(value => resolvePatternArtwork(value)[0].file);
    expect(new Set(files).size).toBe(shapes.length);
  });

  it("supports optional emoji presentation selectors without changing the question value", () => {
    expect(resolvePatternArtwork("☀")).toEqual(resolvePatternArtwork("☀️"));
    expect(resolvePatternArtwork("❤")).toEqual(resolvePatternArtwork("❤️"));
    expect(resolvePatternArtwork("☁")).toEqual(resolvePatternArtwork("☁️"));
  });

  it.each(["A", "B", "C", "1", "2", "3", "?", "__", "__?"])("leaves the text token %s as text", token => {
    expect(resolvePatternArtwork(token)).toBeNull();
  });

  it("gives every symbol its own image file", () => {
    const entries = Object.values(PATTERN_ARTWORK);
    const files = entries.map(symbol => symbol.file);
    expect(new Set(files).size).toBe(entries.length);
  });
});
