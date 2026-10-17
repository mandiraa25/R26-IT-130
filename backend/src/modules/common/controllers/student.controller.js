const Student = require("../models/student.model");
const { WorkingMemoryImproveProgress } = require("../../workingMemory/models/workingMemoryImprove.model");
const { PhonologicalImproveAttempt } = require("../../phonologicalAwareness/models/phonologicalImprove.model");
const SpeechProgress = require("../../speechProcessing/models/speechProgress.model");

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

    const [wmProgress, paStars, speechProgress] = await Promise.all([
      WorkingMemoryImproveProgress.findOne({ studentId: student._id }),
      sumPhonologicalStars(student._id),
      SpeechProgress.findOne({ studentId: student._id }).select("stars"),
    ]);
    // Stars per module. Reading has no activities yet. student.totalStars is only
    // ever added to by Working Memory, so it counts toward Working Memory here.
    const moduleStars = {
      workingMemory: Math.max(Number(student.totalStars) || 0, readProgressStars(wmProgress)),
      phonologicalAwareness: paStars,
      speech: Math.max(0, Number(speechProgress?.stars) || 0),
    };
    // Total shown on the home page and profile: every module's stars added up.
    const totalStars = moduleStars.workingMemory + moduleStars.phonologicalAwareness + moduleStars.speech;

    res.json({ ...student.toObject(), totalStars, moduleStars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/students/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, grade, profilePhoto, gender, school } = req.body;
    
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
