const {
  WorkingMemoryImproveProgress,
  WorkingMemoryImproveAttempt,
} = require("../models/workingMemoryImprove.model");
const WorkingMemoryIdentify = require("../models/workingMemoryIdentify.model");
const Student = require("../../common/models/student.model");

const STARS_PER_CORRECT = 5;

const readProgressStars = (progressDoc) =>
  Math.max(0, Number(progressDoc?.totalStars ?? progressDoc?.totalCarrots) || 0);

const SUB_CATEGORIES = [
  "pattern",
  "words",
  "instructions",
  "numbers",
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
    firstIdentifyResult.metrics?.mlPrediction ||
    firstIdentifyResult.metrics?.riskLevel;

  if (riskLevel === "High" || riskLevel === "Severe") return 1;
  if (riskLevel === "Moderate" || riskLevel === "Medium") return 2;
  if (riskLevel === "Low" || riskLevel === "Mild") return 3;
  if (riskLevel === "No Risk" || riskLevel === "Minimal" || riskLevel === "Low Risk") return 4;

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

    let progress = await WorkingMemoryImproveProgress.findOne({ studentId });

    if (!progress) {
      // Find the first attempt of the student's identification quiz
      const firstIdentify = await WorkingMemoryIdentify.findOne({ studentId }).sort({
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
            totalStars: 0,
            levelsProgress: createInitialLevelsProgress(0),
          },
        });
      }

      // Calculate initial unlocked level from first identification attempt
      const identifiedLevel = determineLevelFromIdentification(firstIdentify);

      progress = new WorkingMemoryImproveProgress({
        studentId,
        initialIdentifiedLevel: identifiedLevel,
        maxUnlockedLevel: identifiedLevel,
        isIdentificationCompleted: true,
        levelsProgress: createInitialLevelsProgress(identifiedLevel),
      });

      await progress.save();
    }

    const progressPayload = progress.toObject ? progress.toObject() : progress;
    progressPayload.totalStars = readProgressStars(progressPayload);

    res.status(200).json({
      success: true,
      data: progressPayload,
    });
  } catch (error) {
    console.error("Error fetching working memory improvement progress:", error);
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

    const normalizedLevel = Number(levelNumber);
    const normalizedScore = Number(score);
    const normalizedTotalQuestions = Number(totalQuestions);
    if (!["2", "3", "4"].includes(String(grade)) || ![1, 2, 3, 4].includes(normalizedLevel) || !SUB_CATEGORIES.includes(subCategoryKey)) {
      return res.status(400).json({ success: false, message: "Invalid working memory attempt details." });
    }
    if (!Number.isInteger(normalizedTotalQuestions) || normalizedTotalQuestions < 1 || !Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > normalizedTotalQuestions || !Array.isArray(questionResults) || questionResults.length !== normalizedTotalQuestions) {
      return res.status(400).json({ success: false, message: "An attempt must include one result for every question." });
    }

    // Students may have screening history in several grades. Checking an
    // arbitrary first record can reject a valid attempt for their current grade.
    const identification = await WorkingMemoryIdentify.findOne({ studentId, grade: String(grade) });
    if (!identification) {
      return res.status(403).json({ success: false, message: `Please complete the Grade ${grade} Identification Screening Test first.` });
    }

    // 1. Fetch or initialize progress
    let progress = await WorkingMemoryImproveProgress.findOne({ studentId });
    if (!progress) {
      const firstIdentify = await WorkingMemoryIdentify.findOne({ studentId }).sort({
        createdAt: 1,
      });
      const identifiedLevel = determineLevelFromIdentification(firstIdentify);
      progress = new WorkingMemoryImproveProgress({
        studentId,
        initialIdentifiedLevel: identifiedLevel,
        maxUnlockedLevel: identifiedLevel,
        isIdentificationCompleted: true,
        levelsProgress: createInitialLevelsProgress(identifiedLevel),
      });
    }

    // Find current level progress
    let currentLevel = progress.levelsProgress.find(
      (lvl) => lvl.levelNumber === normalizedLevel
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
    if (!targetSubCat.isUnlocked) {
      return res.status(403).json({ success: false, message: "This activity is locked until the previous activity is completed." });
    }
    const attemptNumber = (targetSubCat.totalAttempts || 0) + 1;
    const tQ = normalizedTotalQuestions;

    // New attempts require 3/5; previously earned completions stay intact.
    const isPassed = normalizedScore >= 3;
    const achievePercentage = (normalizedScore / tQ) * 100;
    const starsEarned = normalizedScore * STARS_PER_CORRECT;

    // 2. Save detailed attempt log
    const newAttempt = new WorkingMemoryImproveAttempt({
      studentId,
      grade,
      language,
      levelNumber: normalizedLevel,
      subCategoryKey,
      attemptNumber,
      score: normalizedScore,
      totalQuestions: tQ,
      isPassed,
      starsEarned,
      carrotsEarned: starsEarned,
      questionResults,
      totalTimeTaken,
    });

    await newAttempt.save();

    // 3. Update Progress Document
    targetSubCat.totalAttempts = attemptNumber;
    targetSubCat.lastAttemptAt = new Date();
    targetSubCat.bestScore = Math.max(targetSubCat.bestScore || 0, normalizedScore);
    const nextTotalStars = readProgressStars(progress) + starsEarned;
    progress.totalStars = nextTotalStars;
    progress.totalCarrots = nextTotalStars;

    await Student.findByIdAndUpdate(studentId, {
      $inc: { totalStars: starsEarned },
    });

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
        : `Attempt recorded. Minimum mark not reached (${score} / ${tQ}). Re-attempt to unlock next activity.`,
      data: {
        isPassed,
        achievePercentage,
        attempt: newAttempt,
        progress,
        starsEarned,
        carrotsEarned: starsEarned,
        totalStars: nextTotalStars,
        totalCarrots: nextTotalStars,
      },
    });
  } catch (error) {
    console.error("Error submitting Working Memory improvement attempt:", error);
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

    const attempts = await WorkingMemoryImproveAttempt.find(query).sort({
      completedAt: -1,
    });

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching Working Memory attempt history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempt history",
      error: error.message,
    });
  }
};
