import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { VALID_GRADES, VALID_LEVELS } from "../../src/features/workingMemory/config/gameConfig";
import { PATTERN_ARTWORK } from "../../src/features/workingMemory/shared/artwork/patternSymbols";
import { getWorkingMemoryThemeAssets } from "../../src/features/workingMemory/config/levelThemes";

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
const publicFile = url => path.join(publicRoot, url.replace(/^\//, ""));

describe("Working Memory reorganized assets", () => {
  for (const grade of VALID_GRADES) for (const language of ["en", "si"]) for (const level of VALID_LEVELS) {
    it(`resolves every picture card for Grade ${grade}, ${language}, Level ${level}`, () => {
      const questions = getSubCategoryData(grade, level, "words", language).questions;
      const sharedArtwork = new Map();
      for (const question of questions) for (const item of question.dragPool) {
        expect(item.image).toMatch(/^\/images\/workingMemory\/pictures\//);
        expect(existsSync(publicFile(item.image)), `${question.id}: ${item.image}`).toBe(true);
        if (item.spriteIndex !== null) {
          expect(Number.isInteger(item.spriteIndex)).toBe(true);
          expect(item.spriteIndex).toBeGreaterThanOrEqual(0);
          expect(item.spriteIndex).toBeLessThan(36);
        }
        if (grade === "3") {
          if (sharedArtwork.has(item.id)) expect(item.image).toBe(sharedArtwork.get(item.id));
          sharedArtwork.set(item.id, item.image);
        }
      }
    });
  }

  it("keeps the pattern atlas delivery files", () => {
    for (const src of new Set(Object.values(PATTERN_ARTWORK).map(symbol => symbol.src))) {
      expect(existsSync(publicFile(src))).toBe(true);
    }
  });

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
