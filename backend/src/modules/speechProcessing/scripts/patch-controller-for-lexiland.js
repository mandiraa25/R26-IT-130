const fs = require("fs");
const path = require("path");

const controllerPath = path.join(
  __dirname,
  "controllers/speechProcessing.controller.js"
);

let source = fs.readFileSync(controllerPath, "utf8");

if (!source.includes("speechProgressStore.service")) {
  source = source.replace(
    'const Student = require("../../common/models/student.model");',
    `const Student = require("../../common/models/student.model");
const {
  applyLexilandProgressSet,
  loadStudentWithSpeech,
  attachSpeechToChild,
} = require("../services/speechProgressStore.service");
const {
  canAccessChild,
  getGuardianChildIds,
  isSuperAdminRequest,
} = require("../services/speechLexilandAuth.service");
const { cleanupSpeechAttemptFiles } = require("../services/audioCleanup.service");`
  );
}

source = source.replace(
  /const isSuperAdminRequest = \(req\) => req\.user\?\.role === "super admin";\n\nconst getLeoRecommendationIds/,
  "const getLeoRecommendationIds"
);

source = source.replace(
  /const getGuardianChildIds = async \(req\) => \{[\s\S]*?\};\n\nconst canAccessChild = \(req, child\) => \{[\s\S]*?\};\n\nconst getLeoPromptsForGrade/,
  "const getLeoPromptsForGrade"
);

source = source.replace(
  'const max = Number(prompt.gradeMax || "5");',
  'const max = Number(prompt.gradeMax || "4");'
);

source = source.replace(
  /const updateSpeechProgressFromAggregate = async \(studentId, aggregate\) => \{[\s\S]*?\};\n\nconst parseJsonArray/,
  `const updateSpeechProgressFromAggregate = async (studentId, aggregate) => {
  const recommendedActivityIds =
    aggregate.recommendedActivityIds?.length
      ? aggregate.recommendedActivityIds
      : getLeoRecommendationIds(aggregate.supportLevel);
  await applyLexilandProgressSet(studentId, {
    "lexilandProgress.overallIdentificationStatus": "in_progress",
    "lexilandProgress.speech.identificationStatus": "completed",
    "lexilandProgress.speech.supportLevel": aggregate.supportLevel,
    "lexilandProgress.speech.supportScore": aggregate.supportScore,
    "lexilandProgress.speech.identificationCompletedAt": new Date(),
    "lexilandProgress.speech.improvementUnlocked": true,
    "lexilandProgress.speech.recommendedActivityIds": recommendedActivityIds,
    "lexilandProgress.speech.currentActivityId": recommendedActivityIds[0] || "",
  });
  return recommendedActivityIds;
};

const parseJsonArray`
);

const replacements = [
  [
    'await Student.findByIdAndUpdate(studentId, {\n    $set: {',
    'await applyLexilandProgressSet(studentId, {',
  ],
  [
    'await Student.findByIdAndUpdate(session.studentId, {\n      $set: {',
    'await applyLexilandProgressSet(session.studentId, {',
  ],
  [
    'await Student.findByIdAndUpdate(req.user.id, {\n      $set: {',
    'await applyLexilandProgressSet(req.user.id, {',
  ],
  [
    'await Student.findByIdAndUpdate(req.user.id, {\n    $set: {',
    'await applyLexilandProgressSet(req.user.id, {',
  ],
];

for (const [from, to] of replacements) {
  source = source.split(from).join(to);
}

source = source.replace(/\}\);\n(\s*)\}/g, (match, indent, offset) => {
  const before = source.slice(Math.max(0, offset - 120), offset);
  if (before.includes("applyLexilandProgressSet")) {
    return `});\n${indent}}`;
  }
  return match;
});

const studentSelectReplacements = [
  [
    'const child = await Student.findById(req.user.id).select("fullName username grade lexilandProgress");',
    'const child = await loadStudentWithSpeech(req.user.id, "fullName email grade isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("lexilandProgress").lean();',
    'const child = await loadStudentWithSpeech(req.user.id, "fullName email grade isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("grade accountStatus lexilandProgress");',
    'const child = await loadStudentWithSpeech(req.user.id, "grade isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("grade lexilandProgress accountStatus");',
    'const child = await loadStudentWithSpeech(req.user.id, "grade isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("accountStatus lexilandProgress");',
    'const child = await loadStudentWithSpeech(req.user.id, "isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("lexilandProgress accountStatus");',
    'const child = await loadStudentWithSpeech(req.user.id, "isActive");',
  ],
  [
    'const child = await Student.findById(req.user.id).select("lexilandProgress");',
    'const child = await loadStudentWithSpeech(req.user.id, "fullName email grade isActive");',
  ],
];

for (const [from, to] of studentSelectReplacements) {
  source = source.split(from).join(to);
}

if (!source.includes("cleanupSpeechAttemptFiles({")) {
  source = source.replace(
    "updates.processingStatus = \"completed\";",
    `updates.processingStatus = "completed";
      cleanupSpeechAttemptFiles({
        originalAudioPath: savedFile?.path,
        normalizedAudioPath: audioAnalysis?.normalizedAudioPath,
      });`
  );
}

fs.writeFileSync(controllerPath, source);
console.log("Patched speechProcessing.controller.js for LexiLand integration");
