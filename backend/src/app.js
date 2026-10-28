/*
 * FILE PURPOSE
 * Express application wiring, including the two Working Memory API route prefixes.
 *
 * HOW IT CONNECTS
 * server.js starts this app. The /api/working-memory/identification and
 * /api/working-memory/improvement prefixes delegate to their route files, then controllers/models.
 * Direct source importers: server.js.
 *
 * THINGS TO REMEMBER
 * express.json parses request bodies before route handlers. CORS enables browser requests. This app
 * file also mounts other modules; Working Memory router files determine their own middleware.
 */

const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/common/routes/auth.routes");
const studentRoutes = require("./modules/common/routes/student.routes");
const phonologicalIdentifyRoutes = require("./modules/phonologicalAwareness/routes/phonologicalIdentify.routes");
const phonologicalImproveRoutes = require("./modules/phonologicalAwareness/routes/phonologicalImprove.routes");
const workingMemoryIdentifyRoutes = require("./modules/workingMemory/routes/workingMemoryIdentify.routes");
const workingMemoryImproveRoutes = require("./modules/workingMemory/routes/workingMemoryImprove.routes");
const adminRoutes = require("./modules/admin/routes/admin.routes");
const speechProcessingRoutes = require("./modules/speechProcessing/routes/speechProcessing.routes");

// VIVA: BACKEND ENTRY - Express parses JSON, then dispatches URL prefixes to each feature's route file.
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/phonological-awareness/identification", phonologicalIdentifyRoutes);
app.use("/api/phonological-awareness/improvement", phonologicalImproveRoutes);
app.use("/api/working-memory/identification", workingMemoryIdentifyRoutes);
app.use("/api/working-memory/improvement", workingMemoryImproveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/speech-processing", speechProcessingRoutes);

module.exports = app;
