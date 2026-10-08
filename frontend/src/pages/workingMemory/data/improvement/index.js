import { improvementGrade2_en } from "./improvementGrade2_en";
import { improvementGrade2_si } from "./improvementGrade2_si";
import { improvementGrade3_en } from "./improvementGrade3_en";
import { improvementGrade3_si } from "./improvementGrade3_si";
import { improvementGrade4_en } from "./improvementGrade4_en";
import { improvementGrade4_si } from "./improvementGrade4_si";
import { PICTURE_MEMORY_QUESTIONS } from "./pictureMemoryQuestions";
import { PATTERN_QUESTIONS } from "./patternQuestions";
import { VALID_GRADES, VALID_LEVELS } from "./config";

export const IMPROVEMENT_DATA = {
  "2": {
    en: improvementGrade2_en,
    si: improvementGrade2_si,
  },
  "3": {
    en: improvementGrade3_en,
    si: improvementGrade3_si,
  },
  "4": {
    en: improvementGrade4_en,
    si: improvementGrade4_si,
  },
};

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
