// Working Memory improvement: placement from screening, attempts, stars, and unlocks.

const {
  WorkingMemoryImproveProgress,
  WorkingMemoryImproveAttempt,
} = require("../models/workingMemoryImprove.model");
const WorkingMemoryIdentify = require("../models/workingMemoryIdentify.model");
const Student = require("../../common/models/student.model");

const STARS_PER_CORRECT = 5;

const readProgressStars = (progressDoc) =>
  Math.max(0, Number(progressDoc?.totalStars ?? progressDoc?.totalCarrots) || 0);

// Unlock order inside each level
const SUB_CATEGORIES = [
  "pattern",
  "words",
  "instructions",
  "numbers",
];

// Build levels 1–4. Open levels start with Pattern unlocked only.
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

// Screening risk → starting level (ML first, then local risk, then accuracy %)
const determineLevelFromIdentification = (firstIdentifyResult) => {
  if (!firstIdentifyResult) return 1;

  const riskLevel =
    firstIdentifyResult.metrics?.mlPrediction ||
    firstIdentifyResult.metrics?.riskLevel;

  if (riskLevel === "High" || riskLevel === "Severe") return 1;
  if (riskLevel === "Moderate" || riskLevel === "Medium") return 2;
  if (riskLevel === "Low" || riskLevel === "Mild") return 3;
  if (riskLevel === "No Risk" || riskLevel === "Minimal" || riskLevel === "Low Risk") return 4;

  // Fallback: raw screening accuracy
  const totalScore = firstIdentifyResult.totalScore || 0;
  const totalQuestions = firstIdentifyResult.totalQuestions || 1;
  const percentage = (totalScore / totalQuestions) * 100;

  if (percentage < 40) return 1;
  if (percentage < 65) return 2;
  if (percentage < 85) return 3;
  return 4;
};

// GET /progress/:studentId — load progress, or create it from first screening
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    let progress = await WorkingMemoryImproveProgress.findOne({ studentId });

    if (!progress) {
      const firstIdentify = await WorkingMemoryIdentify.findOne({ studentId }).sort({
        createdAt: 1,
      });

      // No screening yet → everything locked
      if (!firstIdentify) {
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

// POST /submit-attempt — save attempt, award stars, unlock next game/level
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

    // Require screening for this grade before improvement attempts
    const identification = await WorkingMemoryIdentify.findOne({ studentId, grade: String(grade) });
    if (!identification) {
      return res.status(403).json({ success: false, message: `Please complete the Grade ${grade} Identification Screening Test first.` });
    }

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

    let currentLevel = progress.levelsProgress.find(
      (lvl) => lvl.levelNumber === normalizedLevel
    );

    if (!currentLevel) {
      return res.status(400).json({
        success: false,
        message: `Invalid level number: ${levelNumber}`,
      });
    }

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

    // Pass = at least 3 correct; stars = 5 per correct answer
    const isPassed = normalizedScore >= 3;
    const achievePercentage = (normalizedScore / tQ) * 100;
    const starsEarned = normalizedScore * STARS_PER_CORRECT;

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

    targetSubCat.totalAttempts = attemptNumber;
    targetSubCat.lastAttemptAt = new Date();
    targetSubCat.bestScore = Math.max(targetSubCat.bestScore || 0, normalizedScore);
    const nextTotalStars = readProgressStars(progress) + starsEarned;
    progress.totalStars = nextTotalStars;
    progress.totalCarrots = nextTotalStars;

    await Student.findByIdAndUpdate(studentId, {
      $inc: { totalStars: starsEarned },
    });

    // On pass: unlock next game; if all 4 done, unlock next level's Pattern
    if (isPassed) {
      targetSubCat.isCompleted = true;

      if (subCatIndex + 1 < currentLevel.subCategories.length) {
        currentLevel.subCategories[subCatIndex + 1].isUnlocked = true;
      }

      const allSubCatsCompleted = currentLevel.subCategories.every((sc) => sc.isCompleted);

      if (allSubCatsCompleted) {
        currentLevel.isCompleted = true;
        currentLevel.completedAt = new Date();

        if (
          Number(levelNumber) >= progress.maxUnlockedLevel &&
          Number(levelNumber) < 4
        ) {
          progress.maxUnlockedLevel = Number(levelNumber) + 1;

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

// GET /history/:studentId — attempt list (optional level / game filters)
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
