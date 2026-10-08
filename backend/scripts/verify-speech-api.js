/**
 * One-off Speech API verification (uses existing DB student, no new records).
 * Run from backend/: node scripts/verify-speech-api.js
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");

const Student = require("../src/modules/common/models/student.model");
const SpeechSession = require("../src/modules/speechProcessing/models/speechSession.model");
const SpeechAttempt = require("../src/modules/speechProcessing/models/speechAttempt.model");
const SpeechProgress = require("../src/modules/speechProcessing/models/speechProgress.model");

const PORT = Number(process.env.SPEECH_VERIFY_PORT || 5010);

const request = (server, { method, path, token, body }) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const http = require("http");
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: server.address().port,
        path,
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload
            ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
            : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch {
            /* keep text */
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const student = await Student.findOne({ isActive: { $ne: false }, role: "student" })
    .select("_id grade")
    .lean();
  if (!student) {
    throw new Error("No active student found for verification");
  }

  const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const server = app.listen(PORT);
  await new Promise((resolve) => server.once("listening", resolve));

  const unauth = await request(server, {
    method: "GET",
    path: "/api/speech-processing/identification/status",
  });

  const status = await request(server, {
    method: "GET",
    path: "/api/speech-processing/identification/status",
    token,
  });

  const prompts = await request(server, {
    method: "GET",
    path: "/api/speech-processing/identification/prompts",
    token,
  });

  const improvementMap = await request(server, {
    method: "GET",
    path: "/api/speech-processing/improvement/map",
    token,
  });

  const start = await request(server, {
    method: "POST",
    path: "/api/speech-processing/identification/start",
    token,
    body: {},
  });

  const progressBefore = await SpeechProgress.findOne({ studentId: student._id }).lean();
  const sessionsBefore = await SpeechSession.countDocuments({ studentId: student._id });
  const attemptsBefore = await SpeechAttempt.countDocuments({ studentId: student._id });

  server.close();
  await mongoose.disconnect();

  console.log(
    JSON.stringify(
      {
        studentIdVerified: String(student._id),
        studentGrade: student.grade,
        unauthenticatedStatus: unauth.status,
        identificationStatus: status.status,
        identificationPrompts: prompts.status,
        improvementMap: improvementMap.status,
        identificationStart: start.status,
        progressExists: Boolean(progressBefore),
        sessionCount: sessionsBefore,
        attemptCount: attemptsBefore,
        identificationStartHasSessionId: Boolean(start.body?.data?.sessionId || start.body?.sessionId),
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error("verify-speech-api failed:", error.message);
  process.exit(1);
});
