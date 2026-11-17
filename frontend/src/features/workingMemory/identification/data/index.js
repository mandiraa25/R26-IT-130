/*
 * FILE PURPOSE
 * Data entry point that groups the three grade-specific screening banks.
 *
 * HOW IT CONNECTS
 * ScreeningPage reads QUIZ_DATA[grade][language]. This file imports grade2Data, grade3Data and
 * grade4Data.
 * Direct source importers: ../ScreeningPage.jsx.
 * Local feature/style dependencies: grade2.js, grade3.js, grade4.js.
 *
 * THINGS TO REMEMBER
 * Grade keys are strings. Each grade contains en and si arrays. The real quiz takes the full authored
 * array; the demo can select a small subset. UI translations are separate from question data.
 */

import { grade2Data } from "./grade2";
import { grade3Data } from "./grade3";
import { grade4Data } from "./grade4";

export const QUIZ_DATA = {
  "2": grade2Data,
  "3": grade3Data,
  "4": grade4Data,
};
