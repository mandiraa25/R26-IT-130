/*
 * FILE PURPOSE
 * Authored English and Sinhala screening questions for Grade 3; this is question data, not a React
 * screen.
 *
 * HOW IT CONNECTS
 * identification/data/index.js exposes grade3Data through QUIZ_DATA. ScreeningPage selects the
 * language and ScreeningQuestions renders it; answerChecking checks its expected answer.
 * Direct source importers: index.js.
 *
 * THINGS TO REMEMBER
 * Each language has 15 questions in authored order: 4 Pattern, 4 Picture Memory, 4 Instruction and 3
 * Number Memory. id identifies a response; category/type choose the presentation/checker; options are
 * selectable choices; correct stores the expected choice. words and sequence are the study material.
 * Do not infer difficulty from another grade: each grade owns its own sequences, prompts and options.
 */

export const grade3Data = {
  "en": [
    /*
     * QUESTION: wm-g3-1 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-1",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "Complete the following pattern",
      text: "🔴 🔵 🔴 🔵 __ ?",
      options: ["🔴", "🔵", "🟡"],
      correct: "🔴",
    },
    /*
     * QUESTION: wm-g3-2 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-2",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "Complete the following pattern",
      text: "⭐ 🌙 ⭐ 🌙 __?",
      options: ["⭐", "🌙", "☀️"],
      correct: "⭐",
    },
    /*
     * QUESTION: wm-g3-3 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-3",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "What number comes next?",
      text: "5, 10, 15, 20, __?",
      options: ["25", "30", "21"],
      correct: "25",
    },
    /*
     * QUESTION: wm-g3-4 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-4",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "What letter comes next?",
      text: "A, C, E, G, __ ?",
      options: ["H", "I", "J"],
      correct: "I",
    },
    /*
     * QUESTION: wm-g3-5 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-5",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Now select the words in the correct order",
      words: ["Cat", "Ball", "Tree"],
      options: [
        "Tree, Ball, Cat",
        "Cat, Ball, Tree",
        "Ball, Cat, Tree"
      ],
      correct: "Cat, Ball, Tree"
    },
    /*
     * QUESTION: wm-g3-6 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-6",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Now select the words in the correct order",
      words: ["Sun", "Book", "Fish"],
      options: [
        "Fish, Sun, Book",
        "Book, Fish, Sun",
        "Sun, Book, Fish"
      ],
      correct: "Sun, Book, Fish"
    },
    /*
     * QUESTION: wm-g3-7 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-7",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "Now select the words in the correct order",
      words: ["Dog", "Cup", "Bottle"],
      options: [
        "Dog, Cup, Bottle",
        "Bottle, Dog, Cup",
        "Cup, Bottle, Dog"
      ],
      correct: "Dog, Cup, Bottle"
    },
    /*
     * QUESTION: wm-g3-8 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-8",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "According to the instructions, what should you do first?",
      text: "Run, Jump up",
      options: ["Jump up", "Run"],
      correct: "Run",
    },
    /*
     * QUESTION: wm-g3-9 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-9",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "According to the instructions, what should you do second?",
      text: "Sit down, Write, Stand up",
      options: ["Write", "Sit down", "Stand up"],
      correct: "Write",
    },
    /*
     * QUESTION: wm-g3-10 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-10",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "According to the instructions, what should you do last?",
      text: "Clap, Touch nose, Close eyes",
      options: ["Touch nose", "Clap", "Close eyes"],
      correct: "Close eyes",
    },
    /*
     * QUESTION: wm-g3-11 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-11",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "According to the instructions, what should you do second?",
      text: "Open book, Read, Close book",
      options: ["Close book", "Open book", "Read"],
      correct: "Read",
    },
    /*
     * QUESTION: wm-g3-12 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-12",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember the given numbers in order",
      sequence: [3, 7, 2],
      options: ["3, 7, 2", "2, 7, 3", "8, 3, 2"],
      correct: "3, 7, 2"
    },
    /*
     * QUESTION: wm-g3-13 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-13",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember the given numbers in order",
      sequence: [5, 1, 9],
      options: ["9, 1, 5", "5, 1, 9", "1, 5, 9"],
      correct: "5, 1, 9"
    },
    /*
     * QUESTION: wm-g3-14 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-14",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember the given numbers in order",
      sequence: [2, 4, 6, 8],
      options: ["8, 6, 4, 2", "2, 4, 6, 8", "2, 6, 4, 8"],
      correct: "2, 4, 6, 8"
    },
    /*
     * QUESTION: wm-g3-15 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-15",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "Remember the given numbers in order",
      sequence: [2, 4, 10, 20],
      options: ["20, 10, 4, 2", "2, 10, 4, 20", "2, 4, 10, 20"],
      correct: "2, 4, 10, 20"
    },
  ],
  "si": [
    /*
     * QUESTION: wm-g3-si-1 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-1",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "පහත රටාව සම්පූර්ණ කරන්න",
      text: "🔴 🔵 🔴 🔵 __ ?",
      options: ["🔴", "🔵", "🟡"],
      correct: "🔴",
    },
    /*
     * QUESTION: wm-g3-si-2 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-2",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "පහත රටාව සම්පූර්ණ කරන්න",
      text: "⭐ 🌙 ⭐ 🌙 __ ?",
      options: ["⭐", "🌙", "☀️"],
      correct: "⭐",
    },
    /*
     * QUESTION: wm-g3-si-3 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-3",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "පහත රටාව සම්පූර්ණ කරන්න",
      text: "5, 10, 15, 20, __ ?",
      options: ["25", "30", "21"],
      correct: "25",
    },
    /*
     * QUESTION: wm-g3-si-4 - Pattern
     * The pattern stays visible; compare the tapped option with correct. There are 3 authored choices.
     * ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-4",
      category: "Pattern",
      type: "MULTIPLE_CHOICE",
      instruction: "පහත රටාව සම්පූර්ණ කරන්න",
      text: "A, C, E, G ?",
      options: ["H", "I", "J"],
      correct: "I",
    },
    /*
     * QUESTION: wm-g3-si-5 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-5",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "දැන් එම වචන අනුපිළිවෙලින් තෝරන්න.",
      words: ["පූසා", "බෝලය", "ගස"],
      options: [
        "ගස, බෝලය, පූසා",
        "පූසා, බෝලය, ගස",
        "බෝලය, පූසා, ගස"
      ],
      correct: "පූසා, බෝලය, ගස"
    },
    /*
     * QUESTION: wm-g3-si-6 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-6",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "දැන් එම වචන අනුපිළිවෙලින් තෝරන්න.",
      words: ["ඉර", "පොත", "මාළුවා"],
      options: [
        "පොත, මාළුවා, ඉර",
        "මාළුවා, ඉර, පොත",
        "ඉර, පොත, මාළුවා"
      ],
      correct: "ඉර, පොත, මාළුවා"
    },
    /*
     * QUESTION: wm-g3-si-7 - Picture Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-7",
      category: "Picture Memory",
      type: "PICTURE_MEMORY",
      instruction: "දැන් එම වචන අනුපිළිවෙලින් තෝරන්න.",
      words: ["බල්ලා", "කෝප්පය", "බෝතලය"],
      options: [
        "බෝතලය, බල්ලා, කෝප්පය",
        "බල්ලා, කෝප්පය, බෝතලය",
        "කෝප්පය, බෝතලය, බල්ලා"
      ],
      correct: "බල්ලා, කෝප්පය, බෝතලය"
    },
    /*
     * QUESTION: wm-g3-si-8 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 2 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-8",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "එම උපදෙස් වලට අනුව ඔබ මුලින් කළ යුත්තේ කුමක්ද?",
      text: "දුවන්න, උඩ පනින්න්න",
      options: ["උඩ පනින්න්න", "දුවන්න"],
      correct: "දුවන්න",
    },
    /*
     * QUESTION: wm-g3-si-9 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-9",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "එම උපදෙස්වලට අනුව ඔබ දෙවනුව කළ යුත්තේ කුමක්ද?",
      text: "වාඩිවන්න, ලියන්න, හිටගන්න",
      options: ["ලියන්න", "හිටගන්න", "වාඩිවන්න"],
      correct: "ලියන්න",
    },
    /*
     * QUESTION: wm-g3-si-10 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-10",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "එම උපදෙස්වලට අනුව ඔබ අන්තිමට කළ යුත්තේ කුමක්ද?",
      text: "අත්පුඩි ගසන්න, නාසය අල්ලන්න, ඇස් වසන්න",
      options: ["නාසය අල්ලන්න", "අත්පුඩි ගසන්න", "ඇස් වසන්න"],
      correct: "ඇස් වසන්න",
    },
    /*
     * QUESTION: wm-g3-si-11 - Instruction
     * Read/listen to text, then choose the expected action/order from options. There are 3 authored
     * choices. ScreeningPage owns timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-11",
      category: "Instruction",
      type: "MULTIPLE_CHOICE",
      instruction: "එම උපදෙස්වලට අනුව ඔබ දෙවනියට කළ යුත්තේ කුමක්ද?",
      text: "පොත අරින්න, කියවන්න, පොත වසන්න",
      options: ["පොත වසන්න", "පොත අරින්න", "කියවන්න"],
      correct: "කියවන්න",
    },
    /*
     * QUESTION: wm-g3-si-12 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-12",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "දැන් එම නිවැරදි ඉලක්කම් අනුපිළිවෙල පහළින් තෝරන්න.",
      sequence: [3, 7, 2],
      options: ["2, 7, 3", "8, 3, 2", "3, 7, 2"],
      correct: "3, 7, 2"
    },
    /*
     * QUESTION: wm-g3-si-13 - Number Memory
     * Study 3 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-13",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "දැන් එම නිවැරදි ඉලක්කම් අනුපිළිවෙල පහළින් තෝරන්න.",
      sequence: [5, 1, 9],
      options: ["1, 5, 9", "9, 1, 5", "5, 1, 9"],
      correct: "5, 1, 9"
    },
    /*
     * QUESTION: wm-g3-si-14 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-14",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "දැන් එම නිවැරදි ඉලක්කම් අනුපිළිවෙල පහළින් තෝරන්න.",
      sequence: [2, 4, 6, 8],
      options: ["8, 6, 4, 2", "2, 4, 6, 8", "2, 6, 4, 8"],
      correct: "2, 4, 6, 8"
    },
    /*
     * QUESTION: wm-g3-si-15 - Number Memory
     * Study 4 items before choosing the remembered order. There are 3 authored choices. ScreeningPage owns
     * timing; answerChecking owns validation.
     */
    {
      id: "wm-g3-si-15",
      category: "Number Memory",
      type: "SEQUENCE_MEMORY",
      instruction: "දැන් එම නිවැරදි ඉලක්කම් අනුපිළිවෙල පහළින් තෝරන්න.",
      sequence: [2, 4, 10, 20],
      options: ["20, 10, 4, 2", "2, 10, 4, 20", "2, 4, 10, 20"],
      correct: "2, 4, 10, 20"
    },
  ]
};
