const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // ignore
}
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./modules/readingProcessing/socket");
const app = require("./app");

// Load environment variables
dotenv.config();

// Port
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
  const io = new Server(server, {
    cors: { origin: true, credentials: true },
  });
  registerSocketHandlers(io);
};

// Run
startServer();