import { improvementGrade2_en } from "./improvementGrade2_en";
import { improvementGrade2_si } from "./improvementGrade2_si";
import { improvementGrade3_en } from "./improvementGrade3_en";
import { improvementGrade3_si } from "./improvementGrade3_si";
import { improvementGrade4_en } from "./improvementGrade4_en";
import { improvementGrade4_si } from "./improvementGrade4_si";

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

/**
 * Helper function to retrieve improvement questions for a given grade, level, subcategory and language
 */
export const getSubCategoryData = (grade, levelNum, subCategoryKey, language = "en") => {
  const gradeData = IMPROVEMENT_DATA[String(grade)] || IMPROVEMENT_DATA["2"];
  const langData = gradeData[language] || gradeData["en"];
  const levelKey = `level${levelNum}`;
  const levelData = langData[levelKey] || langData["level1"];
  return levelData[subCategoryKey] || null;
};
