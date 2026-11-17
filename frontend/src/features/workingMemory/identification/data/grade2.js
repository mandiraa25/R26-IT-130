/*
 * FILE PURPOSE
 * Authored English and Sinhala screening questions for Grade 2; this is question data, not a React
 * screen.
 *
 * HOW IT CONNECTS
 * identification/data/index.js exposes grade2Data through QUIZ_DATA. ScreeningPage selects the
 * language and ScreeningQuestions renders it; answerChecking checks its expected answer.
 * Direct source importers: index.js.
 *
 * THINGS TO REMEMBER
 * Each language has 15 questions in authored order: 4 Pattern, 4 Picture Memory, 4 Instruction and 3
 * Number Memory. id identifies a response; category/type choose the presentation/checker; options are
 * selectable choices; correct stores the expected choice. words and sequence are the study material.
 * Do not infer difficulty from another grade: each grade owns its own sequences, prompts and options.
 */

export const grade2Data = {
  "en": [
    /*
     * QUESTION: wm-g2-1 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-1",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "What comes next in the pattern?",
      text: "🔴 🔴 🔵 🔴 🔴 🔵 ?",
      options: ["🔴", "🔵", "🟡"],
      correct: "🔴",
    },
    /*
     * QUESTION: wm-g2-2 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-2",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "What number comes next?",
      text: "1, 2, 3, 4, ?",
      options: ["5", "6", "4"],
      correct: "5",
    },
    /*
     * QUESTION: wm-g2-3 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-3",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "Find the missing part of the pattern.",
      text: "⭐ ⭐ 🌙 ⭐ ⭐ 🌙 ?",
      options: ["⭐", "🌙", "☀️"],
      correct: "⭐",
    },
    /*
     * QUESTION: wm-g2-4 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-4",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "What comes next in the pattern?",
      text: "A B A B ?",
      options: ["A", "B", "C"],
      correct: "A",
    },
    /*
     * QUESTION: wm-g2-5 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-5",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Select the pictures in the order you saw them",
      words: ["Cat", "Dog"],
      options: ["Cat, Dog", "Dog, Cat"],
      correct: "Cat, Dog",
    },
    /*
     * QUESTION: wm-g2-6 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-6",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Select the pictures in the order you saw them",
      words: ["Sun", "Fish"],
      options: ["Fish, Sun", "Sun, Fish"],
      correct: "Sun, Fish",
    },
    /*
     * QUESTION: wm-g2-7 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-7",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Select the pictures in the order you saw them",
      words: ["Book", "Ball"],
      options: ["Ball, Book", "Book, Ball"],
      correct: "Book, Ball",
    },
    /*
     * QUESTION: wm-g2-8 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-8",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "Which should you do first?",
      text: "Jump, Sit down",
      options: ["Jump", "Sit down"],
      correct: "Jump",
    },
    /*
     * QUESTION: wm-g2-9 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-9",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "Which should you do second?",
      text: "Stand up, Clap",
      options: ["Stand up", "Clap"],
      correct: "Clap",
    },
    /*
     * QUESTION: wm-g2-10 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-10",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "Which should you do first?",
      text: "Touch nose, Close eyes",
      options: ["Touch nose", "Close eyes"],
      correct: "Touch nose",
    },
    /*
     * QUESTION: wm-g2-11 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-11",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "Which should you do second?",
      text: "Open book, Read page",
      options: ["Open book", "Read page"],
      correct: "Read page",
    },
    /*
     * QUESTION: wm-g2-12 - Number Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-12",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember these numbers in order",
      sequence: [1, 5],
      options: ["5, 1", "1, 5"],
      correct: "1, 5",
    },
    /*
     * QUESTION: wm-g2-13 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-13",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember these numbers in order",
      sequence: [2, 4, 6],
      options: ["6, 4, 2", "2, 6, 4", "2, 4, 6"],
      correct: "2, 4, 6",
    },
    /*
     * QUESTION: wm-g2-14 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-14",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember these numbers in order",
      sequence: [3, 1, 9],
      options: ["9, 1, 3", "3, 9, 1", "3, 1, 9"],
      correct: "3, 1, 9",
    },
    /*
     * QUESTION: wm-g2-15 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-15",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember these numbers in order",
      sequence: [8, 2, 5, 4],
      options: ["4, 5, 2, 8", "8, 5, 2, 4", "8, 2, 5, 4"],
      correct: "8, 2, 5, 4",
    },
  ],
  "si": [
    /*
     * QUESTION: wm-g2-si-1 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-1",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "හිස් තැනට ගැලපෙන පිළිතුර තෝරන්න.",
      text: "🔴 🔴 🔵 🔴 🔴 🔵 ?",
      options: ["🔴", "🔵", "🟡"],
      correct: "🔴",
    },
    /*
     * QUESTION: wm-g2-si-2 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-2",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "හිස් තැනට ගැලපෙන පිළිතුර තෝරන්න.",
      text: "1, 2, 3, 4, ?",
      options: ["5", "6", "4"],
      correct: "5",
    },
    /*
     * QUESTION: wm-g2-si-3 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-3",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "හිස් තැනට ගැලපෙන පිළිතුර තෝරන්න.",
      text: "⭐ ⭐ 🌙 ⭐ ⭐ 🌙 ?",
      options: ["⭐", "🌙", "☀️"],
      correct: "⭐",
    },
    /*
     * QUESTION: wm-g2-si-4 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-4",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "හිස් තැනට ගැලපෙන පිළිතුර තෝරන්න.",
      text: "A B A B ?",
      options: ["A", "B", "C"],
      correct: "A",
    },
    /*
     * QUESTION: wm-g2-si-5 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-5",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "ඔබ දුටු පිළිවෙලින් පින්තූර තෝරන්න.",
      words: ["පූසා", "බල්ලා"],
      options: ["පූසා, බල්ලා", "බල්ලා, පූසා"],
      correct: "පූසා, බල්ලා",
    },
    /*
     * QUESTION: wm-g2-si-6 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-6",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "ඔබ දුටු පිළිවෙලින් පින්තූර තෝරන්න.",
      words: ["ඉර", "මාළුවා"],
      options: ["මාළුවා, ඉර", "ඉර, මාළුවා"],
      correct: "ඉර, මාළුවා",
    },
    /*
     * QUESTION: wm-g2-si-7 - Picture Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-7",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "ඔබ දුටු පිළිවෙලින් පින්තූර තෝරන්න.",
      words: ["පොත", "බෝලය"],
      options: ["බෝලය, පොත", "පොත, බෝලය"],
      correct: "පොත, බෝලය",
    },
    /*
     * QUESTION: wm-g2-si-8 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-8",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "ඔබ මුලින් කළ යුත්තේ කුමක්ද?",
      text: "පනින්න, වාඩිවන්න",
      options: ["පනින්න", "වාඩිවන්න"],
      correct: "පනින්න",
    },
    /*
     * QUESTION: wm-g2-si-9 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-9",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "ඔබ දෙවනුව කළ යුත්තේ කුමක්ද?",
      text: "හිටගන්න, අත්පුඩි ගසන්න",
      options: ["හිටගන්න", "අත්පුඩි ගසන්න"],
      correct: "අත්පුඩි ගසන්න",
    },
    /*
     * QUESTION: wm-g2-si-10 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-10",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "ඔබ මුලින් කළ යුත්තේ කුමක්ද?",
      text: "නාසය අල්ලන්න, ඇස් වසන්න",
      options: ["නාසය අල්ලන්න", "ඇස් වසන්න"],
      correct: "නාසය අල්ලන්න",
    },
    /*
     * QUESTION: wm-g2-si-11 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-11",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "ඔබ දෙවනුව කළ යුත්තේ කුමක්ද?",
      text: "පොත අරින්න, පිටුව කියවන්න",
      options: ["පොත අරින්න", "පිටුව කියවන්න"],
      correct: "පිටුව කියවන්න",
    },
    /*
     * QUESTION: wm-g2-si-12 - Number Memory
     * Study 2 items before choosing the remembered order. There are 2 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-12",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "මෙම ඉලක්කම් පිළිවෙලින් මතක තබා ගන්න.",
      sequence: [1, 5],
      options: ["5, 1", "1, 5"],
      correct: "1, 5",
    },
    /*
     * QUESTION: wm-g2-si-13 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-13",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "මෙම ඉලක්කම් පිළිවෙලින් මතක තබා ගන්න.",
      sequence: [2, 4, 6],
      options: ["6, 4, 2", "2, 6, 4", "2, 4, 6"],
      correct: "2, 4, 6",
    },
    /*
     * QUESTION: wm-g2-si-14 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-14",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "මෙම ඉලක්කම් පිළිවෙලින් මතක තබා ගන්න.",
      sequence: [3, 1, 9],
      options: ["9, 1, 3", "3, 9, 1", "3, 1, 9"],
      correct: "3, 1, 9",
    },
    /*
     * QUESTION: wm-g2-si-15 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g2-si-15",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "මෙම ඉලක්කම් පිළිවෙලින් මතක තබා ගන්න.",
      sequence: [8, 2, 5, 4],
      options: ["4, 5, 2, 8", "8, 5, 2, 4", "8, 2, 5, 4"],
      correct: "8, 2, 5, 4",
    },
  ]
};
