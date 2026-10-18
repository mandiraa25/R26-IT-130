import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { VALID_GRADES, VALID_LEVELS } from "../../src/features/workingMemory/config/gameConfig";
import { patternImageSrc, resolvePatternArtwork } from "../../src/features/workingMemory/shared/artwork/patternSymbols";
import { QUIZ_DATA } from "../../src/features/workingMemory/identification/data";
import { getWorkingMemoryThemeAssets } from "../../src/features/workingMemory/config/levelThemes";

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
const publicFile = url => path.join(publicRoot, url.replace(/^\//, ""));

describe("Working Memory reorganized assets", () => {
  for (const grade of VALID_GRADES) for (const language of ["en", "si"]) for (const level of VALID_LEVELS) {
    it(`resolves every picture card for Grade ${grade}, ${language}, Level ${level}`, () => {
      const questions = getSubCategoryData(grade, level, "words", language).questions;
      const sharedArtwork = new Map();
      for (const question of questions) for (const item of question.dragPool) {
        // One PNG per picture in this grade/level's own folder.
        expect(item.image).toBe(`/images/workingMemory/pictures/grade${grade}/level${level}/wm-picture-g${grade}-l${level}-${item.id.toLowerCase()}.png`);
        expect(existsSync(publicFile(item.image)), `${question.id}: ${item.image}`).toBe(true);
        if (sharedArtwork.has(item.id)) expect(item.image).toBe(sharedArtwork.get(item.id));
        sharedArtwork.set(item.id, item.image);
      }
    });
  }

  // Every pattern symbol a grade/level (or a grade's screening) shows must exist in its own folder.
  const patternTokens = question => [...(question.showItems ?? String(question.text ?? "").split(/[s,]+/)), ...(question.options ?? [])];
  const patternSymbols = questions => questions.flatMap(question => patternTokens(question).flatMap(token => resolvePatternArtwork(token) || []));
  for (const grade of VALID_GRADES) {
    for (const level of VALID_LEVELS) it(`has every pattern image for Grade ${grade}, Level ${level}`, () => {
      const questions = ["en", "si"].flatMap(language => getSubCategoryData(grade, level, "pattern", language).questions);
      for (const symbol of patternSymbols(questions)) {
        const src = patternImageSrc(symbol, grade, level);
        expect(src).toBe(`/images/workingMemory/pattern/grade${grade}/level${level}/${symbol.file}`);
        expect(existsSync(publicFile(src)), src).toBe(true);
      }
    });
    it(`has every pattern image for Grade ${grade} screening`, () => {
      const questions = Object.values(QUIZ_DATA[grade]).flat().filter(question => question.category === "Pattern");
      for (const symbol of patternSymbols(questions)) expect(existsSync(publicFile(patternImageSrc(symbol, grade))), symbol.file).toBe(true);
    });
  }

  it("resolves all level theme backgrounds and boards", () => {
    for (const level of VALID_LEVELS) {
      for (const url of Object.values(getWorkingMemoryThemeAssets(level))) {
        expect(existsSync(publicFile(url)), url).toBe(true);
      }
    }
  });

  it("keeps the background music and every locally declared font", () => {
    expect(existsSync(publicFile("/audio/workingMemory/bgmusic.mp3"))).toBe(true);
    const css = readFileSync(publicFile("/fonts/workingMemory/fonts.css"), "utf8");
    for (const [, url] of css.matchAll(/url\(([^)]+)\)/g)) {
      expect(existsSync(publicFile(url.replace(/['"]/g, ""))), url).toBe(true);
    }
  });
});
