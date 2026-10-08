const fs = require("fs");
const path = require("path");

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    const resolved = path.resolve(filePath);
    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
    }
  } catch (error) {
    console.warn("Speech audio cleanup skipped:", error.message);
  }
};

const cleanupSpeechAttemptFiles = ({
  originalAudioPath,
  normalizedAudioPath,
} = {}) => {
  safeUnlink(originalAudioPath);
  safeUnlink(normalizedAudioPath);
};

module.exports = {
  safeUnlink,
  cleanupSpeechAttemptFiles,
};
