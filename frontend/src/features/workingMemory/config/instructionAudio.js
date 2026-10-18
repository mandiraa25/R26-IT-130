// Match by question ID, so shuffled questions always keep their own recording.
export function getInstructionAudioUrl(questionId, language = "en") {
  if (!/^g3_l[1-4]_g3_[1-5]$/.test(questionId || "")) return null;
  const locale = language.split("-")[0];
  if (!["en", "si"].includes(locale)) return null;
  return `/audio/workingMemory/instructions/grade3/${locale}/${questionId}.mp4`;
}
