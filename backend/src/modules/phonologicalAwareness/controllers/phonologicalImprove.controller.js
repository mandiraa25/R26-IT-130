const {
  PhonologicalImproveProgress,
  PhonologicalImproveAttempt,
} = require("../models/phonologicalImprove.model");
const PhonologicalIdentify = require("../models/phonologicalIdentify.model");

const SUB_CATEGORIES = [
  "phonological_awareness",
  "visual_processing",
  "orthographic_skills",
  "segmentation_counting",
];

// Helper to construct empty/default levels progress structure (Levels 1 to 4)
const createInitialLevelsProgress = (maxUnlockedLevel = 1) => {
  const levels = [];
  for (let lvl = 1; lvl <= 4; lvl++) {
    const isLevelUnlocked = lvl <= maxUnlockedLevel;
    levels.push({
      levelNumber: lvl,
      isCompleted: false,
      completedAt: null,
      subCategories: SUB_CATEGORIES.map((catKey, index) => ({
        subCategoryKey: catKey,
        // Within unlocked levels, subcategory 1 is unlocked initially; others unlock sequentially
        isUnlocked: isLevelUnlocked && index === 0,
        isCompleted: false,
        videoWatched: false,
        bestScore: 0,
        totalAttempts: 0,
        lastAttemptAt: null,
      })),
    });
  }
  return levels;
};

// Map identification quiz result to starting level (1 to 4)
const determineLevelFromIdentification = (firstIdentifyResult) => {
  if (!firstIdentifyResult) return 1;

  // Check ML prediction risk level first if available
  const riskLevel =
    firstIdentifyResult.mlPrediction?.predicted_risk_level ||
    firstIdentifyResult.metrics?.riskLevel;

  if (riskLevel === "High" || riskLevel === "Severe") return 1;
  if (riskLevel === "Moderate" || riskLevel === "Medium") return 2;
  if (riskLevel === "Low" || riskLevel === "Mild") return 3;
  if (riskLevel === "No Risk" || riskLevel === "Minimal") return 4;

  // Fallback based on overall accuracy percentage
  const totalScore = firstIdentifyResult.totalScore || 0;
  const totalQuestions = firstIdentifyResult.totalQuestions || 1;
  const percentage = (totalScore / totalQuestions) * 100;

  if (percentage < 40) return 1;
  if (percentage < 65) return 2;
  if (percentage < 85) return 3;
  return 4;
};

// GET: Fetch student improvement progress & level unlocks
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    let progress = await PhonologicalImproveProgress.findOne({ studentId });

    if (!progress) {
      // Find the first attempt of the student's identification quiz
      const firstIdentify = await PhonologicalIdentify.findOne({ studentId }).sort({
        createdAt: 1,
      });

      if (!firstIdentify) {
        // Identification quiz has not been attempted yet -> all improvement levels locked
        return res.status(200).json({
          success: true,
          data: {
            studentId,
            isIdentificationCompleted: false,
            initialIdentifiedLevel: 0,
            maxUnlockedLevel: 0,
            levelsProgress: createInitialLevelsProgress(0),
          },
        });
      }

      // Calculate initial unlocked level from first identification attempt
      const identifiedLevel = determineLevelFromIdentification(firstIdentify);

      progress = new PhonologicalImproveProgress({
        studentId,
        initialIdentifiedLevel: identifiedLevel,
        maxUnlockedLevel: identifiedLevel,
        isIdentificationCompleted: true,
        levelsProgress: createInitialLevelsProgress(identifiedLevel),
      });

      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error fetching improvement progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch improvement progress",
      error: error.message,
    });
  }
};

// POST: Submit a sub-category attempt & update unlock status
exports.submitSubCategoryAttempt = async (req, res) => {
  try {
    const {
      studentId,
      grade,
      language,
      levelNumber,
      subCategoryKey,
      score,
      totalQuestions,
      questionResults,
      totalTimeTaken,
    } = req.body;

    // 1. Fetch or initialize progress
    let progress = await PhonologicalImproveProgress.findOne({ studentId });
    if (!progress) {
      const firstIdentify = await PhonologicalIdentify.findOne({ studentId }).sort({
        createdAt: 1,
      });
      const identifiedLevel = determineLevelFromIdentification(firstIdentify);
      progress = new PhonologicalImproveProgress({
        studentId,
        initialIdentifiedLevel: identifiedLevel,
        maxUnlockedLevel: identifiedLevel,
        isIdentificationCompleted: true,
        levelsProgress: createInitialLevelsProgress(identifiedLevel),
      });
    }

    // Find current level progress
    let currentLevel = progress.levelsProgress.find(
      (lvl) => lvl.levelNumber === Number(levelNumber)
    );

    if (!currentLevel) {
      return res.status(400).json({
        success: false,
        message: `Invalid level number: ${levelNumber}`,
      });
    }

    // Find subcategory inside level
    let subCatIndex = currentLevel.subCategories.findIndex(
      (sc) => sc.subCategoryKey === subCategoryKey
    );

    if (subCatIndex === -1) {
      return res.status(400).json({
        success: false,
        message: `Invalid sub-category key: ${subCategoryKey}`,
      });
    }

    const targetSubCat = currentLevel.subCategories[subCatIndex];
    const attemptNumber = (targetSubCat.totalAttempts || 0) + 1;
    const tQ = totalQuestions || 2;

    // Minimum passing percentage required (Default: 50% or passed in req.body.minPassPercentage)
    const minPassPercentage = req.body.minPassPercentage !== undefined ? req.body.minPassPercentage : 50;
    const achievePercentage = (score / tQ) * 100;
    const isPassed = achievePercentage >= minPassPercentage;

    // 2. Save detailed attempt log for unlimited re-attempts
    const newAttempt = new PhonologicalImproveAttempt({
      studentId,
      grade,
      language,
      levelNumber: Number(levelNumber),
      subCategoryKey,
      attemptNumber,
      score,
      totalQuestions: tQ,
      isPassed,
      questionResults,
      totalTimeTaken,
    });

    await newAttempt.save();

    // 3. Update Progress Document
    targetSubCat.totalAttempts = attemptNumber;
    targetSubCat.lastAttemptAt = new Date();
    targetSubCat.bestScore = Math.max(targetSubCat.bestScore || 0, score);

    // Only mark as completed and unlock next steps if minimum mark is achieved (or if already completed previously)
    if (isPassed) {
      targetSubCat.isCompleted = true;

      // Unlock next sequential sub-category within the same level if exists
      if (subCatIndex + 1 < currentLevel.subCategories.length) {
        currentLevel.subCategories[subCatIndex + 1].isUnlocked = true;
      }

      // Check if ALL 4 sub-categories in this level are completed
      const allSubCatsCompleted = currentLevel.subCategories.every((sc) => sc.isCompleted);

      if (allSubCatsCompleted) {
        currentLevel.isCompleted = true;
        currentLevel.completedAt = new Date();

        // Unlock the next Level if current level was the highest unlocked
        if (
          Number(levelNumber) >= progress.maxUnlockedLevel &&
          Number(levelNumber) < 4
        ) {
          progress.maxUnlockedLevel = Number(levelNumber) + 1;

          // Unlock Level (levelNumber + 1) and its first sub-category
          const nextLevelObj = progress.levelsProgress.find(
            (lvl) => lvl.levelNumber === Number(levelNumber) + 1
          );
          if (nextLevelObj) {
            if (nextLevelObj.subCategories.length > 0) {
              nextLevelObj.subCategories[0].isUnlocked = true;
            }
          }
        }
      }
    }

    // Save updated progress document
    await progress.save();

    res.status(201).json({
      success: true,
      message: isPassed
        ? "Attempt recorded! Minimum mark achieved. Next step unlocked."
        : `Attempt recorded. Minimum mark not reached (${achievePercentage.toFixed(0)}% < ${minPassPercentage}%). Re-attempt to unlock next level.`,
      data: {
        isPassed,
        achievePercentage,
        minPassPercentage,
        attempt: newAttempt,
        progress,
      },
    });
  } catch (error) {
    console.error("Error submitting improvement attempt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit attempt",
      error: error.message,
    });
  }
};

// GET: Fetch attempt history for a student
exports.getAttemptHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { levelNumber, subCategoryKey } = req.query;

    const query = { studentId };
    if (levelNumber) query.levelNumber = Number(levelNumber);
    if (subCategoryKey) query.subCategoryKey = subCategoryKey;

    const attempts = await PhonologicalImproveAttempt.find(query).sort({
      completedAt: -1,
    });

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching attempt history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempt history",
      error: error.message,
    });
  }
};
