const Student = require("../models/student.model");
const { validateProfileUpdate } = require("../validation/studentValidation");
const { WorkingMemoryImproveProgress } = require("../../workingMemory/models/workingMemoryImprove.model");
const { PhonologicalImproveAttempt, PhonologicalImproveProgress } = require("../../phonologicalAwareness/models/phonologicalImprove.model");
const WorkingMemoryIdentify = require("../../workingMemory/models/workingMemoryIdentify.model");
const SpeechProgress = require("../../speechProcessing/models/speechProgress.model");
const ReadingResult = require("../../readingProcessing/models/readingResult.model");
const { summariseReading } = require("../../readingProcessing/services/readingDashboard");

// Phonological Awareness stores no stars, so they are counted the same way as
// Working Memory awards them: 5 stars per correct answer in each saved attempt.
const STARS_PER_CORRECT = 5;
const sumPhonologicalStars = async (studentId) => {
  const [row] = await PhonologicalImproveAttempt.aggregate([
    { $match: { studentId } },
    { $group: { _id: null, correct: { $sum: { $max: [{ $ifNull: ["$score", 0] }, 0] } } } },
  ]);
  return (row?.correct || 0) * STARS_PER_CORRECT;
};

const readProgressStars = (progressDoc) =>
  Math.max(0, Number(progressDoc?.totalStars ?? progressDoc?.totalCarrots) || 0);

// GET /api/students/profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [wmProgress, paStars, speechProgress, readingResults] = await Promise.all([
      WorkingMemoryImproveProgress.findOne({ studentId: student._id }),
      sumPhonologicalStars(student._id),
      SpeechProgress.findOne({ studentId: student._id }).select("stars"),
      ReadingResult.find({ studentId: student._id }).select("level promoted createdAt").sort({ createdAt: 1 }).lean(),
    ]);
    // Stars per module. student.totalStars is only ever added to by Working Memory,
    // so it counts toward Working Memory here. Reading stars are completed sessions.
    const moduleStars = {
      workingMemory: Math.max(Number(student.totalStars) || 0, readProgressStars(wmProgress)),
      phonologicalAwareness: paStars,
      speech: Math.max(0, Number(speechProgress?.stars) || 0),
      reading: readingResults.length,
    };
    // Total shown on the home page and profile: every module's stars added up.
    const totalStars = moduleStars.workingMemory + moduleStars.phonologicalAwareness + moduleStars.speech + moduleStars.reading;

    res.json({ ...student.toObject(), totalStars, moduleStars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/students/profile
exports.updateProfile = async (req, res) => {
  try {
    const { message, errors } = validateProfileUpdate(req.body);
    if (message) return res.status(400).json({ message, errors });
    const { fullName, grade, profilePhoto, gender } = req.body;
    const school = typeof req.body.school === "string" ? req.body.school.trim() : req.body.school;
    
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        grade,
        profilePhoto,
        gender,
        school,
      },
      { returnDocument: 'after', runValidators: true }
    ).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Profile updated successfully",
      student,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------------------------------------
// Learning journey summary for the home page (read-only)
// ---------------------------------------------------------------------------
// Working Memory and Phonological Awareness: 4 levels of 4 games each.
const summariseLevels = (progress) => {
  if (!progress?.isIdentificationCompleted && !progress?.levelsProgress?.some(level => level.subCategories?.some(game => game.totalAttempts > 0))) {
    return { started: false, totalLevels: 4 };
  }
  const levels = [...(progress.levelsProgress || [])].sort((a, b) => a.levelNumber - b.levelNumber);
  const unlockedLevels = Math.max(0, Math.min(4, Number(progress.maxUnlockedLevel) || 0));
  const completedLevels = levels.filter(level => level.isCompleted).length;
  // The level the child is working on: the first unlocked level that is not finished.
  const current = levels.find(level => level.levelNumber <= unlockedLevels && !level.isCompleted) || levels[levels.length - 1];
  const games = current?.subCategories || [];
  return {
    started: true,
    totalLevels: 4,
    currentLevel: current?.levelNumber || 1,
    unlockedLevels,
    completedLevels,
    gamesCompleted: games.filter(game => game.isCompleted).length,
    gamesTotal: games.length || 4,
    finished: completedLevels >= 4,
  };
};

// Speech Processing: 5 Leo safari levels, one activity each, played in order.
const SPEECH_LEVEL_ACTIVITIES = ["leo_first_sound_hunt", "leo_echo_roar", "leo_robot_words", "leo_sound_twins", "leo_story_roar"];
const summariseSpeech = (progress) => {
  if (!progress || (progress.identificationStatus === "not_started" && !progress.completedActivityIds?.length)) {
    return { started: false, totalLevels: SPEECH_LEVEL_ACTIVITIES.length };
  }
  const done = new Set(progress.completedActivityIds || []);
  const completedLevels = SPEECH_LEVEL_ACTIVITIES.filter(id => done.has(id)).length;
  const nextIndex = SPEECH_LEVEL_ACTIVITIES.findIndex(id => !done.has(id));
  return {
    started: true,
    totalLevels: SPEECH_LEVEL_ACTIVITIES.length,
    currentLevel: nextIndex === -1 ? SPEECH_LEVEL_ACTIVITIES.length : nextIndex + 1,
    completedLevels,
    finished: nextIndex === -1,
  };
};

// GET /api/students/learning-summary
// Current level and progress for each learning component, and the areas that
// need attention from the latest Working Memory screening (weakAreas are
// calculated by the screening itself; nothing is re-scored here).
exports.getLearningSummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [wmProgress, paProgress, speechProgress, wmScreening, readingResults] = await Promise.all([
      WorkingMemoryImproveProgress.findOne({ studentId }).lean(),
      PhonologicalImproveProgress.findOne({ studentId }).lean(),
      SpeechProgress.findOne({ studentId }).select("identificationStatus completedActivityIds").lean(),
      WorkingMemoryIdentify.findOne({ studentId }).sort({ createdAt: -1 }).select("metrics.weakAreas createdAt").lean(),
      ReadingResult.find({ studentId }).select("level promoted createdAt").sort({ createdAt: 1 }).lean(),
    ]);

    res.json({
      modules: {
        workingMemory: summariseLevels(wmProgress),
        phonologicalAwareness: summariseLevels(paProgress),
        reading: summariseReading(readingResults),
        speech: summariseSpeech(speechProgress),
      },
      workingMemoryAttention: {
        screened: Boolean(wmScreening),
        screenedAt: wmScreening?.createdAt || null,
        areas: wmScreening?.metrics?.weakAreas || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
