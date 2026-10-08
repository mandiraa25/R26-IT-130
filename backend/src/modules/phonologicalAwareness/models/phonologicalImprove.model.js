const mongoose = require("mongoose");

// Track single document per student for current improvement level progress & unlocks
const phonologicalImproveProgressSchema = new mongoose.Schema(
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
                "phonological_awareness",
                "visual_processing",
                "orthographic_skills",
                "segmentation_counting",
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
const phonologicalImproveAttemptSchema = new mongoose.Schema(
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
        "phonological_awareness",
        "visual_processing",
        "orthographic_skills",
        "segmentation_counting",
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
      default: 2,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    questionResults: [
      {
        questionId: String,
        instruction: String,
        userAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        timeTaken: Number, // In seconds or ms
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

const PhonologicalImproveProgress = mongoose.model(
  "PhonologicalImproveProgress",
  phonologicalImproveProgressSchema
);
const PhonologicalImproveAttempt = mongoose.model(
  "PhonologicalImproveAttempt",
  phonologicalImproveAttemptSchema
);

module.exports = {
  PhonologicalImproveProgress,
  PhonologicalImproveAttempt,
};
