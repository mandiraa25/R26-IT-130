const mongoose = require("mongoose");

// Track single document per student for current improvement level progress & unlocks
const workingMemoryImproveProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    initialIdentifiedLevel: {
      type: Number,
      default: 1, // Determined from first attempt of identification quiz (1 to 4)
    },
    maxUnlockedLevel: {
      type: Number,
      default: 1, // Levels 1 through maxUnlockedLevel are unlocked
    },
    isIdentificationCompleted: {
      type: Boolean,
      default: false,
    },
    totalStars: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCarrots: {
      type: Number,
      default: 0,
      min: 0,
    },
    levelsProgress: [
      {
        levelNumber: { type: Number, required: true }, // 1, 2, 3, 4
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        subCategories: [
          {
            subCategoryKey: {
              type: String,
              enum: [
                "pattern",
                "words",
                "instructions",
                "numbers",
              ],
              required: true,
            },
            isUnlocked: { type: Boolean, default: false },
            isCompleted: { type: Boolean, default: false },
            videoWatched: { type: Boolean, default: false },
            bestScore: { type: Number, default: 0 },
            totalAttempts: { type: Number, default: 0 },
            lastAttemptAt: { type: Date },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Track every individual attempt for detailed history & unlimited re-attempts
const workingMemoryImproveAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    grade: {
      type: String,
      enum: ["2", "3", "4"],
      required: true,
    },
    language: {
      type: String,
      enum: ["en", "si"],
      required: true,
    },
    levelNumber: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    subCategoryKey: {
      type: String,
      enum: [
        "pattern",
        "words",
        "instructions",
        "numbers",
      ],
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    starsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    carrotsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    questionResults: [
      {
        questionId: String,
        instruction: String,
        userAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        timeTaken: Number, // In milliseconds
      },
    ],
    totalTimeTaken: {
      type: Number,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WorkingMemoryImproveProgress = mongoose.model(
  "WorkingMemoryImproveProgress",
  workingMemoryImproveProgressSchema
);
const WorkingMemoryImproveAttempt = mongoose.model(
  "WorkingMemoryImproveAttempt",
  workingMemoryImproveAttemptSchema
);

module.exports = {
  WorkingMemoryImproveProgress,
  WorkingMemoryImproveAttempt,
};
