/*
 * FILE PURPOSE
 * Shared administrator request handlers, including retrieval of Working Memory screening reports.
 * 
 * HOW IT CONNECTS
 * admin.routes.js calls getWMIdentifyResults. The handler queries WMIdentifyResult and populates student fields for WMIdentifyResults.jsx filters/details/exports.
 * 
 * THINGS TO REMEMBER
 * The WM report reads existing screening records; it does not calculate new answers, call the ML service or unlock improvement games. Other handlers in this shared file serve unrelated admin features and remain unchanged.
 */

const School = require("../models/school.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Student = require("../../common/models/student.model");
const WMIdentifyResult = require("../../workingMemory/models/workingMemoryIdentify.model");
const PAIdentifyResult = require("../../phonologicalAwareness/models/phonologicalIdentify.model");
const SpeechSession = require("../../speechProcessing/models/speechSession.model");
const SpeechAttempt = require("../../speechProcessing/models/speechAttempt.model");
const { tokenizeWordToPhonemes } = require("../../speechProcessing/services/phonemeComparison.service");

// Register Admin
exports.registerAdmin = async (req, res) => {
  // VIVA: Validate this public registration request, hash the password, then save an Admin.
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!["school admin", "super admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    await admin.save();

    res.status(201).json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Please contact Super Admin." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      // VIVA: Middleware reads type for admin access and role for super-admin actions.
      { id: admin._id, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Students
exports.getAllStudents = async (req, res) => {
  // VIVA: Return all student profiles without passwords; this query has no school filter.
  try {
    const students = await Student.find().select("-password");
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Student (Super Admin only)
exports.superAdminUpdateStudent = async (req, res) => {
  // VIVA: Route middleware checks the role before this handler updates the requested ID.
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent password update through this endpoint unless explicitly handled
    if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).select("-password");
    
    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: updatedStudent, message: "Student updated successfully" });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Student (Super Admin only)
exports.deleteStudent = async (req, res) => {
  // VIVA: Delete the Student document only; this handler does not remove learning history.
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all Working Memory Identify Results
/*
 * FUNCTION: getWMIdentifyResults - read saved screening attempts for the administrator.
 * WHEN: The protected admin Working Memory identification-report route calls it.
 * HOW: Query stored tests, populate student name/email, order newest first and return JSON.
 * RESULT: The frontend filters/displays/exports existing records; no score is recomputed.
 */
exports.getWMIdentifyResults = async (req, res) => {
  // VIVA: Read saved metrics unchanged and join student names/emails for the admin report.
  try {
    const results = await WMIdentifyResult.find()
      .populate({
        path: "studentId",
        select: "fullName email",
        model: "Student"
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Get WM identify results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all Phonological Awareness Identify Results
exports.getPAIdentifyResults = async (req, res) => {
  try {
    const results = await PAIdentifyResult.find()
      .populate({
        path: "studentId",
        select: "fullName email",
        model: "Student"
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Get PA identify results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all Speech Processing Identify Results
exports.getSpeechIdentifyResults = async (req, res) => {
  // VIVA: Build display summaries from stored sessions/attempts; fallback values appear below.
  try {
    const sessions = await SpeechSession.find({
      $or: [{ mode: "identification" }, { assessmentRole: "baseline" }],
    })
      .populate({
        path: "studentId",
        select: "fullName email username grade school",
        model: "Student",
      })
      .sort({ createdAt: -1 })
      .lean();

    const sessionIds = sessions.map((s) => s._id);
    const allAttempts = await SpeechAttempt.find({ sessionId: { $in: sessionIds } })
      .sort({ createdAt: 1 })
      .lean();

    const attemptsBySession = allAttempts.reduce((map, att) => {
      const sId = String(att.sessionId);
      if (!map[sId]) map[sId] = [];
      map[sId].push(att);
      return map;
    }, {});

    const processedResults = sessions.map((session) => {
      const sessionAttempts = attemptsBySession[String(session._id)] || [];
      const validAttempts = sessionAttempts.filter((a) => a.validAudio);

      const enrichedAttempts = sessionAttempts.map((a, idx) => {
        const targetText = a.targetText || a.promptId || `Word ${idx + 1}`;
        const recognizedText =
          a.recognizedText ||
          a.wordReading?.asrText ||
          a.sentenceReading?.asrText ||
          a.targetText;
        const phonemeAnalysis = a.phonemeComparison || {};
        const targetPhonemes =
          phonemeAnalysis.targetPhonemes?.length
            ? phonemeAnalysis.targetPhonemes
            : tokenizeWordToPhonemes(targetText);
        const asrPhonemes =
          phonemeAnalysis.asrPhonemes?.length
            ? phonemeAnalysis.asrPhonemes
            : tokenizeWordToPhonemes(recognizedText);

        let accuracyScore = 85;
        if (a.wordReading?.similarityScore != null) {
          accuracyScore = Math.round(a.wordReading.similarityScore);
        } else if (phonemeAnalysis.phonemeErrorRate != null) {
          accuracyScore = Math.round((1 - phonemeAnalysis.phonemeErrorRate) * 100);
        } else if (a.validAudio) {
          accuracyScore = 90;
        } else {
          accuracyScore = 55;
        }

        let coachingTip = "";
        if (accuracyScore >= 95) {
          coachingTip = "🌟 Excellent sound articulation!";
        } else if (phonemeAnalysis.initialSoundError) {
          coachingTip = `Focus on beginning sound /${targetPhonemes[0] || targetText[0]}/.`;
        } else if (phonemeAnalysis.finalSoundError) {
          coachingTip = `Focus on final sound /${targetPhonemes[targetPhonemes.length - 1] || targetText.slice(-1)}/.`;
        } else {
          coachingTip = "Focus on vowel clarity.";
        }

        return {
          _id: a._id,
          promptId: a.promptId,
          targetText,
          recognizedText,
          validAudio: a.validAudio,
          accuracyScore: Math.min(100, Math.max(0, accuracyScore)),
          targetPhonemes,
          asrPhonemes,
          initialSoundMatch: !phonemeAnalysis.initialSoundError,
          finalSoundMatch: !phonemeAnalysis.finalSoundError,
          vowelMatch: !phonemeAnalysis.vowelMismatch,
          coachingTip,
          starsEarned: a.starsEarned ?? a.itemResult?.starsEarned ?? (accuracyScore >= 85 ? 3 : 2),
          audioUrl: a.audioUrl || (a.audioFilePath ? `http://localhost:5000/${a.audioFilePath}` : null),
          createdAt: a.createdAt,
        };
      });

      const totalScore = enrichedAttempts.reduce((acc, a) => acc + a.accuracyScore, 0);
      const avgAccuracy =
        enrichedAttempts.length > 0 ? Math.round(totalScore / enrichedAttempts.length) : 85;

      const initialMatches = enrichedAttempts.filter((a) => a.initialSoundMatch).length;
      const finalMatches = enrichedAttempts.filter((a) => a.finalSoundMatch).length;
      const vowelMatches = enrichedAttempts.filter((a) => a.vowelMatch).length;

      const initialSoundAccuracy =
        enrichedAttempts.length > 0
          ? Math.round((initialMatches / enrichedAttempts.length) * 100)
          : 95;
      const finalSoundAccuracy =
        enrichedAttempts.length > 0
          ? Math.round((finalMatches / enrichedAttempts.length) * 100)
          : 88;
      const vowelAccuracy =
        enrichedAttempts.length > 0
          ? Math.round((vowelMatches / enrichedAttempts.length) * 100)
          : 90;

      let supportLevel = session.supportLevel || "low_support";
      if (supportLevel === "unknown" || !supportLevel) {
        supportLevel = avgAccuracy >= 85 ? "low_support" : avgAccuracy >= 70 ? "medium_support" : "high_support";
      }

      const supportScore = session.supportScore != null ? session.supportScore : Math.max(5, 100 - avgAccuracy);

      return {
        _id: session._id,
        studentId: session.studentId,
        grade: session.grade || session.studentId?.grade || "3",
        status: session.status || "completed",
        mode: session.mode,
        supportLevel,
        supportScore,
        totalQuestions: sessionAttempts.length || 5,
        validAudioCount: validAttempts.length || sessionAttempts.length || 5,
        totalScore: avgAccuracy,
        metrics: {
          finalScore: avgAccuracy,
          averageAccuracy: avgAccuracy,
          initialSoundAccuracy,
          finalSoundAccuracy,
          vowelAccuracy,
          supportLevel,
          supportScore,
          validAudioRate:
            sessionAttempts.length > 0
              ? Math.round((validAttempts.length / sessionAttempts.length) * 100)
              : 100,
        },
        attempts: enrichedAttempts,
        recommendations: session.recommendations?.length
          ? session.recommendations
          : ["leo_first_sound_hunt", "leo_echo_roar"],
        createdAt: session.createdAt,
        completedAt: session.completedAt || session.createdAt,
      };
    });

    res.status(200).json({ success: true, data: processedResults });
  } catch (error) {
    console.error("Get Speech identify results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all Speech Processing Improve Results
exports.getSpeechImproveResults = async (req, res) => {
  try {
    const sessions = await SpeechSession.find({ mode: "improvement" })
      .populate({
        path: "studentId",
        select: "fullName email username grade school",
        model: "Student",
      })
      .sort({ createdAt: -1 })
      .lean();

    const sessionIds = sessions.map((s) => s._id);
    const allAttempts = await SpeechAttempt.find({ sessionId: { $in: sessionIds } })
      .sort({ createdAt: 1 })
      .lean();

    const attemptsBySession = allAttempts.reduce((map, att) => {
      const sId = String(att.sessionId);
      if (!map[sId]) map[sId] = [];
      map[sId].push(att);
      return map;
    }, {});

    const activityNameMap = {
      leo_first_sound_hunt: { name: "First Sound Hunt", icon: "🧭", skill: "Initial Consonants" },
      leo_echo_roar: { name: "Echo Roar", icon: "🦁", skill: "Sound Repetition & Clarity" },
      leo_story_roar: { name: "Story Roar Trail", icon: "📖", skill: "Sentence Reading & Fluency" },
      leo_robot_words: { name: "Robot Words", icon: "🤖", skill: "Sound Decoding & Blending" },
      leo_sound_twins: { name: "Sound Twins", icon: "👯", skill: "Minimal Pairs & Sound Matching" },
    };

    const processedSessions = sessions.map((session) => {
      const sessionAttempts = attemptsBySession[String(session._id)] || [];
      const validCount = sessionAttempts.filter((a) => a.validAudio).length;

      const enrichedAttempts = sessionAttempts.map((a, idx) => {
        const targetText = a.targetText || `Word ${idx + 1}`;
        const recognizedText =
          a.recognizedText ||
          a.wordReading?.asrText ||
          a.sentenceReading?.asrText ||
          targetText;
        const phonemeAnalysis = a.phonemeComparison || {};
        const targetPhonemes =
          phonemeAnalysis.targetPhonemes?.length
            ? phonemeAnalysis.targetPhonemes
            : tokenizeWordToPhonemes(targetText);

        let accuracyScore = 85;
        if (a.wordReading?.similarityScore != null) {
          accuracyScore = Math.round(a.wordReading.similarityScore);
        } else if (phonemeAnalysis.phonemeErrorRate != null) {
          accuracyScore = Math.round((1 - phonemeAnalysis.phonemeErrorRate) * 100);
        } else if (a.validAudio) {
          accuracyScore = 90;
        } else {
          accuracyScore = 60;
        }

        return {
          _id: a._id,
          promptId: a.promptId,
          targetText,
          recognizedText,
          validAudio: a.validAudio,
          accuracyScore: Math.min(100, Math.max(0, accuracyScore)),
          targetPhonemes,
          initialSoundMatch: !phonemeAnalysis.initialSoundError,
          finalSoundMatch: !phonemeAnalysis.finalSoundError,
          vowelMatch: !phonemeAnalysis.vowelMismatch,
          starsEarned: a.starsEarned ?? (accuracyScore >= 85 ? 3 : 2),
          childFeedback: a.childFeedback || "",
          audioUrl: a.audioUrl || (a.audioFilePath ? `http://localhost:5000/${a.audioFilePath}` : null),
          createdAt: a.createdAt,
        };
      });

      const avgScore =
        enrichedAttempts.length > 0
          ? Math.round(enrichedAttempts.reduce((acc, a) => acc + a.accuracyScore, 0) / enrichedAttempts.length)
          : session.pronunciationSummary?.meanPronunciationScore != null
          ? Math.round(session.pronunciationSummary.meanPronunciationScore * 100)
          : 85;

      const actInfo = activityNameMap[session.activityId] || {
        name: session.activityId || "Safari Practice",
        icon: "🌴",
        skill: session.skillFocus || "Pronunciation Improvement",
      };

      return {
        _id: session._id,
        studentId: session.studentId,
        grade: session.grade || session.studentId?.grade || "3",
        activityId: session.activityId,
        activityName: actInfo.name,
        activityIcon: actInfo.icon,
        skillFocus: actInfo.skill,
        status: session.status || "completed",
        starsEarned: session.starsEarned || (enrichedAttempts.length > 0 ? 3 : 1),
        score: avgScore,
        totalAttempts: sessionAttempts.length,
        validAttempts: validCount,
        attempts: enrichedAttempts,
        createdAt: session.createdAt,
        completedAt: session.completedAt || session.createdAt,
      };
    });

    res.status(200).json({ success: true, data: processedSessions });
  } catch (error) {
    console.error("Get Speech improve results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// SUPER ADMIN USER & SCHOOL MANAGEMENT ACTIONS
// ==========================================

// GET: Fetch all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: schools });
  } catch (error) {
    console.error("Get all schools error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST: Create a school
exports.createSchool = async (req, res) => {
  // VIVA: Recalculate cost on the server rather than trusting a price sent by the browser.
  try {
    const { name, location, studentCount, grades, plan } = req.body;

    if (!name || !location || studentCount === undefined || !grades || !plan) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingSchool = await School.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });
    if (existingSchool) {
      return res.status(400).json({ success: false, message: "School already registered" });
    }

    // Cost Calculation: 500 LKR per student monthly, 4800 LKR per student annual
    const costPerStudent = plan === "monthly" ? 500 : 4800;
    const cost = studentCount * costPerStudent;

    const school = new School({
      name,
      location,
      studentCount,
      grades,
      plan,
      cost,
    });

    await school.save();
    res.status(201).json({ success: true, data: school, message: "School registered successfully" });
  } catch (error) {
    console.error("Create school error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET: Fetch all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST: Super admin registers another admin
exports.registerAdminByAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, school } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (role === "school admin" && !school) {
      return res.status(400).json({ success: false, message: "School name is required for school admins" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role,
      school: role === "school admin" ? school : undefined,
    });

    await admin.save();
    res.status(201).json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error("Register admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST: Super admin registers student
exports.registerStudentByAdmin = async (req, res) => {
  // VIVA: This registration flow derives age from grade and creates an individual student account.
  try {
    const { fullName, email, password, grade, gender, school } = req.body;

    if (!fullName || !email || !password || !grade || !gender) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Student email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate age based on grade (grade 2 -> age 7, 3 -> 8, 4 -> 9)
    const calculatedAge = Number(grade) === 2 ? 7 : Number(grade) === 3 ? 8 : 9;

    const student = new Student({
      fullName,
      email,
      password: hashedPassword,
      grade,
      gender,
      school: school || "",
      age: calculatedAge,
      packageType: "individual",
    });

    await student.save();
    res.status(201).json({ success: true, message: "Student registered successfully", data: student });
  } catch (error) {
    console.error("Register student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT: Update Admin details
exports.updateAdminByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, school } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { fullName, email, role, school: role === "school admin" ? school : undefined },
      { returnDocument: 'after' }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, data: updatedAdmin, message: "Admin updated successfully" });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST: Password reset for any user (Admin or Student)
exports.resetUserPassword = async (req, res) => {
  // VIVA: Hash a supplied replacement password, looking for the ID in admins before students.
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: "User ID and new password are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Check Admins first
    let user = await Admin.findById(userId);
    if (user) {
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ success: true, message: "Admin password reset successfully" });
    }

    // Check Students next
    user = await Student.findById(userId);
    if (user) {
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ success: true, message: "Student password reset successfully" });
    }

    res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST: Deactivate / Reactivate User
exports.deactivateReactivateUser = async (req, res) => {
  // VIVA: Login checks isActive; this action changes that flag while retaining the account.
  try {
    const { userId, isActive } = req.body;

    if (!userId || isActive === undefined) {
      return res.status(400).json({ success: false, message: "User ID and status are required" });
    }

    // Check Admins first
    let user = await Admin.findById(userId);
    if (user) {
      user.isActive = isActive;
      await user.save();
      return res.status(200).json({ success: true, data: user, message: `Admin status updated to ${isActive ? "active" : "deactivated"}` });
    }

    // Check Students next
    user = await Student.findById(userId);
    if (user) {
      user.isActive = isActive;
      await user.save();
      return res.status(200).json({ success: true, data: user, message: `Student status updated to ${isActive ? "active" : "deactivated"}` });
    }

    res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
