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
const readingProcessingRoutes = require("./modules/readingProcessing/routes/reading.routes");

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
app.use("/api/reading-processing", readingProcessingRoutes);

module.exports = app;