import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { getInstructionAudioUrl } from "../../src/features/workingMemory/config/instructionAudio";

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));

// Listening (Following Instructions) game: Sinhala uses the Grade 3 questions
// in every grade so each one has its recording; English stays per grade.
describe("Listening game Sinhala questions", () => {
  for (const grade of ["2", "3", "4"]) for (const level of [1, 2, 3, 4]) {
    it(`Grade ${grade}, Level ${level} uses the Grade 3 Sinhala questions with recordings`, () => {
      const si = getSubCategoryData(grade, level, "instructions", "si").questions;
      expect(si).toEqual(getSubCategoryData("3", level, "instructions", "si").questions);
      expect(si).toHaveLength(5);
      for (const question of si) {
        const url = getInstructionAudioUrl(question.id, "si");
        expect(url, question.id).toBeTruthy();
        expect(existsSync(path.join(publicRoot, url.replace(/^\//, ""))), url).toBe(true);
      }
    });
    it(`Grade ${grade}, Level ${level} keeps its own English questions`, () => {
      const en = getSubCategoryData(grade, level, "instructions", "en").questions;
      expect(en).toHaveLength(5);
      for (const question of en) expect(question.id.startsWith(`g${grade}_l${level}_`)).toBe(true);
    });
  }
});
