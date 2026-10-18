/**
 * Speech E2E database verification (sanitized output).
 * Usage: node scripts/speech-e2e-db.js --email <test-student-email> [--wait-ms 90000] [--cleanup]
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Student = require("../src/modules/common/models/student.model");
const SpeechSession = require("../src/modules/speechProcessing/models/speechSession.model");
const SpeechAttempt = require("../src/modules/speechProcessing/models/speechAttempt.model");
const SpeechProgress = require("../src/modules/speechProcessing/models/speechProgress.model");
const WMIdentifyResult = require("../src/modules/workingMemory/models/workingMemoryIdentify.model");
const PAIdentifyResult = require("../src/modules/phonologicalAwareness/models/phonologicalIdentify.model");

const uploadDir = path.join(__dirname, "../tmp/speech");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = { waitMs: 90000, cleanup: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email") out.email = args[++i];
    else if (args[i] === "--wait-ms") out.waitMs = Number(args[++i]) || 90000;
    else if (args[i] === "--cleanup") out.cleanup = true;
  }
  return out;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeId = (id) => (id ? String(id).slice(-6) : null);

const countTmpSpeechFiles = () => {
  if (!fs.existsSync(uploadDir)) return 0;
  let count = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else count += 1;
    }
  };
  walk(uploadDir);
  return count;
};

const fileExists = (storedPath) => {
  if (!storedPath) return false;
  let relative = String(storedPath).replace(/\\/g, "/");
  if (relative.startsWith("/uploads/speech/")) {
    relative = relative.slice("/uploads/speech/".length);
  } else if (relative.startsWith("uploads/speech/")) {
    relative = relative.slice("uploads/speech/".length);
  }
  const absolute = path.join(uploadDir, relative);
  return fs.existsSync(absolute);
};

const waitForAttemptProcessing = async (studentId, waitMs) => {
  const deadline = Date.now() + waitMs;
  let latest = null;

  const isTerminal = (attempt) => {
    if (!attempt) return true;
    if (attempt.processingStatus === "completed" || attempt.processingStatus === "failed") {
      return true;
    }
    const asr = attempt.processingSteps?.asr;
    const ml = attempt.processingSteps?.pronunciationModel;
    const stepDone = (step) =>
      !step || step === "completed" || step === "skipped" || step === "failed";
    return stepDone(asr) && stepDone(ml);
  };

  while (Date.now() < deadline) {
    latest = await SpeechAttempt.findOne({ studentId })
      .sort({ createdAt: -1 })
      .select(
        "processingStatus processingSteps wordReading pronunciationModel validAudio audioFilePath normalizedAudioPath createdAt"
      )
      .lean();
    if (isTerminal(latest)) break;
    await sleep(2000);
  }
  return latest;
};

const main = async () => {
  const { email, waitMs, cleanup } = parseArgs();
  if (!email) {
    console.error("Missing --email");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const student = await Student.findOne({ email: email.toLowerCase() }).select("_id grade email").lean();
  if (!student) {
    console.log(JSON.stringify({ ok: false, error: "test_student_not_found" }));
    await mongoose.disconnect();
    process.exit(1);
  }

  const wmBefore = await WMIdentifyResult.countDocuments({ studentId: student._id });
  const paBefore = await PAIdentifyResult.countDocuments({ studentId: student._id });

  const latestAttempt = await waitForAttemptProcessing(student._id, waitMs);

  const [sessions, attempts, progress] = await Promise.all([
    SpeechSession.find({ studentId: student._id }).select("_id mode status grade createdAt").lean(),
    SpeechAttempt.find({ studentId: student._id }).select("_id sessionId processingStatus createdAt").lean(),
    SpeechProgress.findOne({ studentId: student._id }).lean(),
  ]);

  const asrText = latestAttempt?.wordReading?.normalizedAsrText || latestAttempt?.wordReading?.asrText || "";
  const asrProvider = latestAttempt?.wordReading?.asrProvider || "";
  const asrStatus = latestAttempt?.processingSteps?.asr || null;
  const mlStatus = latestAttempt?.processingSteps?.pronunciationModel || null;
  const mlModelStatus = latestAttempt?.pronunciationModel?.status || null;

  const result = {
    ok: true,
    studentIdSuffix: safeId(student._id),
    grade: student.grade,
    emailTag: email.includes("@test.lexiland.automation") ? "automated" : "custom",
    sessionCount: sessions.length,
    attemptCount: attempts.length,
    progressExists: Boolean(progress),
    identificationStatus: progress?.identificationStatus || null,
    improvementUnlocked: Boolean(progress?.improvementUnlocked),
    latestAttempt: latestAttempt
      ? {
          idSuffix: safeId(latestAttempt._id),
          processingStatus: latestAttempt.processingStatus,
          asrStep: asrStatus,
          mlStep: mlStatus,
          asrProvider,
          asrText: asrText.slice(0, 120),
          asrTextNonempty: Boolean(String(asrText).trim()),
          asrMocked: asrProvider === "mock",
          mlStatus: mlModelStatus,
          mlMocked: mlModelStatus === "skipped" && mlStatus === "skipped",
          validAudio: latestAttempt.validAudio,
          originalFileExists: fileExists(latestAttempt.audioFilePath),
          normalizedFileExists: fileExists(latestAttempt.normalizedAudioPath),
        }
      : null,
    tmpSpeechFileCount: countTmpSpeechFiles(),
    wmRecordsForStudent: wmBefore,
    paRecordsForStudent: paBefore,
  };

  if (cleanup && email.includes("@test.lexiland.automation")) {
    await SpeechAttempt.deleteMany({ studentId: student._id });
    await SpeechSession.deleteMany({ studentId: student._id });
    await SpeechProgress.deleteOne({ studentId: student._id });
    await Student.deleteOne({ _id: student._id });
    result.cleanedUp = true;
  }

  console.log(JSON.stringify(result));
  await mongoose.disconnect();
};

main().catch((error) => {
  console.log(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
});
