import { PATTERN_BANKS } from "./pattern/bank";
import { PICTURE_BANKS } from "./pictures/bank";
import { INSTRUCTION_BANKS } from "./instructions/bank";
import { NUMBER_BANKS } from "./numbers/bank";
import { PATTERN_QUESTIONS } from "./pattern/questions";
import { PICTURE_MEMORY_QUESTIONS } from "./pictures/questions";
import { VALID_GRADES, VALID_LEVELS } from "../../config/gameConfig";

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
export const getSubCategoryData = (grade, levelNum, subCategoryKey, language = "en") => {
  const gradeKey = normalizeGradeKey(grade);
  const levelKey = normalizeLevelKey(levelNum);
  if (!gradeKey || !levelKey || !VALID_GRADES.includes(gradeKey) || !VALID_LEVELS.includes(Number(levelNum))) return null;
  const gradeData = IMPROVEMENT_DATA[gradeKey];
  const langData = gradeData[language] || gradeData["en"];
  const levelData = langData[levelKey];
  const subCategory = levelData[subCategoryKey] || null;
  if (!subCategory) return null;

  if (subCategoryKey === "words") {
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
