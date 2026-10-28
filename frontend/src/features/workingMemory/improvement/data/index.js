/*
 * FILE PURPOSE
 * Question-bank assembler and lookup helper for grade, language, level and game.
 *
 * HOW IT CONNECTS
 * ImprovementPage calls getSubCategoryData. Four bank imports supply metadata; pattern/questions and
 * pictures/questions override their corresponding questions.
 * Direct source importers: ../ImprovementPage.jsx.
 * Local feature/style dependencies: pattern/bank.js, pictures/bank.js, instructions/bank.js,
 * numbers/bank.js, pattern/questions.js, pictures/questions.js, ../../config/gameConfig.js.
 *
 * THINGS TO REMEMBER
 * The shape is grade -> en/si -> level1..level4 -> game. Invalid grades/levels return null. Unknown
 * language uses English metadata. words remains the Picture Memory key. Pattern values are shared
 * across languages while prompts and guidance can be bilingual.
 */

import { PATTERN_BANKS } from "./pattern/bank";
import { PICTURE_BANKS } from "./pictures/bank";
import { INSTRUCTION_BANKS } from "./instructions/bank";
import { NUMBER_BANKS } from "./numbers/bank";
import { PATTERN_QUESTIONS } from "./pattern/questions";
import { PICTURE_MEMORY_QUESTIONS } from "./pictures/questions";
import { VALID_GRADES, VALID_LEVELS } from "../../config/gameConfig";

/*
 * DATA: These four game banks provide the common grade/language/level schema.
 * The lookup below additionally overrides Pattern/Picture questions with the current
 * visual/image-object banks. Metadata and the active question source are separate.
 */
const banks = { pattern: PATTERN_BANKS, words: PICTURE_BANKS, instructions: INSTRUCTION_BANKS, numbers: NUMBER_BANKS };

// Keep the existing grade/language/level/category schema and category order.
export const IMPROVEMENT_DATA = Object.fromEntries(VALID_GRADES.map(grade => [grade,
  Object.fromEntries(["en", "si"].map(language => [language,
    Object.fromEntries(VALID_LEVELS.map(level => [`level${level}`,
      Object.fromEntries(Object.entries(banks).map(([key, bank]) => [key, bank[grade][language][`level${level}`]])),
    ])),
  ])),
]));

const normalizeGradeKey = (grade) => {
  const gradeKey = String(grade ?? "");
  return VALID_GRADES.includes(gradeKey) ? gradeKey : null;
};

const normalizeLevelKey = (levelNum) => {
  const parsedLevel = Number(levelNum);
  return VALID_LEVELS.includes(parsedLevel) ? `level${parsedLevel}` : null;
};

/**
 * Helper function to retrieve improvement questions for a given grade, level, subcategory and language
 */
/*
 * FUNCTION: getSubCategoryData
 * Look up the active grade/language/level/game bank.
 * WHEN: ImprovementPage bank-loading effect calls this.
 * HOW / RESULT: Validates grade/level, selects metadata and applies the active Pattern/Picture
 * question overrides. Returns null when the route has no matching data.
 */
export const getSubCategoryData = (grade, levelNum, subCategoryKey, language = "en") => {
  // VIVA: Central lookup keeps components independent of bank structure.
  // Grades/levels are validated; unknown languages use English metadata.
  const gradeKey = normalizeGradeKey(grade);
  const levelKey = normalizeLevelKey(levelNum);
  if (!gradeKey || !levelKey || !VALID_GRADES.includes(gradeKey) || !VALID_LEVELS.includes(Number(levelNum))) return null;
  const gradeData = IMPROVEMENT_DATA[gradeKey];
  const langData = gradeData[language] || gradeData["en"];
  const levelData = langData[levelKey];
  const subCategory = levelData[subCategoryKey] || null;
  if (!subCategory) return null;

  if (subCategoryKey === "words") {
    // VIVA: The current image-object questions replace the older bank questions;
    // metadata (such as tutorial URL) is preserved by spreading subCategory.
    return {
      ...subCategory,
      questions: PICTURE_MEMORY_QUESTIONS[language]?.[gradeKey]?.[levelKey] || subCategory.questions || [],
    };
  }

  if (subCategoryKey !== "pattern") return subCategory;

  return {
    ...subCategory,
    questions: PATTERN_QUESTIONS[gradeKey][levelKey],
  };
};
