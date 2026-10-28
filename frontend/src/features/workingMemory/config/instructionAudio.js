/*
 * FILE PURPOSE
 * Question-ID-to-recording-path lookup for the listening improvement game.
 *
 * HOW IT CONNECTS
 * InstructionsGame calls getInstructionAudioUrl before trying text-to-speech. instructionRecording
 * plays the returned path.
 * Direct source importers: ../improvement/games/InstructionsGame.jsx.
 *
 * THINGS TO REMEMBER
 * Only g3_l1..4_g3_1..5 IDs match the recording convention. Language is reduced to en or si. Sinhala
 * Grades 2/4 reuse Grade 3 question IDs. Returning null means use speech fallback; building a URL does
 * not prove the media exists or can play.
 * The current asset folders contain 20 Grade 3 Sinhala MP4 recordings. The English folder
 * contains a README only, so those English recording requests currently use the speech fallback.
 */

// Match by question ID, so shuffled questions always keep their own recording.
/*
 * FUNCTION: getInstructionAudioUrl
 * Build the recording URL for a supported question ID and language.
 * WHEN: InstructionsGame Listen calls this.
 * HOW / RESULT: Returns null for unmatched IDs/locales; the caller chooses browser speech fallback.
 */
export function getInstructionAudioUrl(questionId, language = "en") {
  // VIVA: Only Grade 3-form IDs have recording paths. Sinhala grade 2/4 banks
  // intentionally reuse Grade 3 Sinhala questions and therefore these same IDs.
  if (!/^g3_l[1-4]_g3_[1-5]$/.test(questionId || "")) return null;
  const locale = language.split("-")[0];
  if (!["en", "si"].includes(locale)) return null;
  return `/audio/workingMemory/instructions/grade3/${locale}/${questionId}.mp4`;
}
