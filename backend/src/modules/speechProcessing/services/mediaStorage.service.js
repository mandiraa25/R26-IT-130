const localFallback = (reason = "media_storage_provider_local") => ({
  provider: "local",
  uploadStatus: "skipped",
  uploadError: reason,
});

const getConfiguredProvider = () =>
  String(process.env.MEDIA_STORAGE_PROVIDER || "local").trim().toLowerCase();

const syncSpeechAttemptMedia = async () =>
  localFallback("local_private_storage_only");

module.exports = {
  syncSpeechAttemptMedia,
  getConfiguredProvider,
  isTruthy: (value) => value === true || String(value || "").toLowerCase() === "true",
};
