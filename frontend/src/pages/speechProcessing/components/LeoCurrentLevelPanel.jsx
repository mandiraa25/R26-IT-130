import { useTranslation } from "react-i18next";
import LeoSentencePrompt from "./LeoSentencePrompt";
import SpeechRecorder from "./SpeechRecorder";
import {
  canUsePromptPlayback,
  getLeoGuideTranslationKeys,
  getLeoPromptPrimaryAction,
  getSubmissionRetryLabelKey,
} from "./speechGameFlow.utils";

const isSelectionPrompt = (prompt) =>
  prompt?.taskType === "first_sound" || prompt?.taskType === "minimal_pair";

const isLongReadingPrompt = (prompt) =>
  prompt?.taskType === "sentence_read" || prompt?.taskType === "paragraph_segment_read";

const isParagraphPrompt = (prompt) =>
  prompt?.taskType === "paragraph_segment_read" ||
  prompt?.contentType === "paragraph_segment" ||
  Boolean(prompt?.paragraphId);

const getWordReadingMessage = (wordReading, t) => {
  if (!wordReading) return "";
  if (wordReading.attemptStatus === "invalid_audio") return t("word_feedback_invalid");
  if (wordReading.wordCorrect) return t("word_feedback_correct");
  if (wordReading.attemptStatus === "valid") return t("word_feedback_retry");
  return "";
};

const getSoundHelperTone = (state) => {
  if (state === "strong") return "border-emerald-100 bg-emerald-50 text-emerald-900";
  if (state === "retry") return "border-orange-100 bg-orange-50 text-orange-900";
  return "border-violet-100 bg-violet-50 text-violet-900";
};

const getSentenceFeedbackMessage = (sentenceFeedback, t) => {
  switch (sentenceFeedback?.state) {
    case "complete":
      return t("sentence_feedback_complete");
    case "saved":
      return t("sentence_feedback_saved");
    case "processing":
      return t("sentence_feedback_processing");
    case "retry":
      return t("sentence_feedback_retry");
    default:
      return t("sentence_feedback_checking");
  }
};

function LeoCurrentLevelPanel({
  activity,
  prompt,
  level,
  totalLevels,
  theme,
  selectedAnswer,
  onSelectAnswer,
  recording,
  onRecordingReady,
  onRecorderSupportChange,
  onRecordingStateChange,
  recorderSupported,
  isRecording = false,
  allowPromptPlayback = false,
  feedback,
  error,
  submitting,
  onSubmit,
  onRetry,
  onNext,
}) {
  const { t } = useTranslation(["sp", "common"]);
  const selectionPrompt = isSelectionPrompt(prompt);
  const longReadingPrompt = isLongReadingPrompt(prompt);
  const paragraphPrompt = isParagraphPrompt(prompt);
  const options = prompt?.options || [prompt?.targetSound, prompt?.pairText, prompt?.targetText].filter(Boolean);
  const wordMessage = getWordReadingMessage(feedback?.wordReading, t);
  const sentenceMessage = getSentenceFeedbackMessage(feedback?.sentenceFeedback, t);
  const recordingLimitMs = longReadingPrompt ? (paragraphPrompt ? 45000 : 30000) : null;
  const primaryAction = getLeoPromptPrimaryAction({ feedback, submitting, selectionPrompt });
  const promptPlaybackAvailable = canUsePromptPlayback({
    allowPromptPlayback,
    isRecording,
    submitting,
    feedback,
  });
  const retryLabelKey = getSubmissionRetryLabelKey({ feedback, longReadingPrompt });
  const guideKeys = getLeoGuideTranslationKeys({ selectionPrompt, longReadingPrompt });

  const speakPrompt = () => {
    if (!promptPlaybackAvailable) return;
    if (!prompt?.targetText || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(prompt.targetText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative min-w-0 flex flex-col justify-between">
      {/* Floating Center Prompt Card */}
      <section className="relative z-10 mx-auto w-full max-w-xl rounded-[2.2rem] sm:rounded-[2.6rem] border-3 sm:border-4 border-[#7a421a] bg-[#fffdf7]/95 p-5 sm:p-6 text-center shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {/* Card Header: Phase Tag + Audio Playback */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white shadow-sm">
            {theme?.taskLabel || activity?.gameType || t("sound")}
          </span>
          <span className="text-xs font-black text-[#7a421a]">
            {t("level_progress", { current: level, total: totalLevels })}
          </span>
          {promptPlaybackAvailable && (
            <button
              type="button"
              onClick={speakPrompt}
              disabled={isRecording}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 px-3 py-1 text-xs font-black text-amber-900 shadow-sm transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <span>🔊</span>
              <span>{t("play_sound")}</span>
            </button>
          )}
        </div>

        {/* Prompt Instructions */}
        <div className="mt-3">
          <p className="text-xs sm:text-sm font-black text-[#7c2d12]">
            {prompt?.instructionSi || (paragraphPrompt ? t("paragraph_read_instruction") : longReadingPrompt ? t("sentence_read_instruction") : t("leo_says_try_sound"))}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-[#786154]">
            {prompt?.instructionEn || (longReadingPrompt ? t("sentence_read_instruction_en") : theme?.animalMessage || t("follow_sound_path"))}
          </p>
        </div>

        {/* Target Text Box */}
        {longReadingPrompt ? (
          <div className="mt-3 min-w-0">
            <LeoSentencePrompt prompt={prompt} />
          </div>
        ) : (
          <div className="mt-3 rounded-[1.8rem] border-2 border-[#ecdac2] bg-[#fbf7ed] py-4 px-6 text-center shadow-inner">
            <h2 className="break-words text-4xl sm:text-5xl md:text-6xl font-black text-[#2e1910] tracking-wide">
              {prompt?.targetText || t("sound")}
            </h2>
            {prompt?.pairText && (
              <p className="mt-1 text-lg sm:text-xl font-black text-[#786154]">
                {t("or_label")} {prompt.pairText}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Center Interactive Action Zone */}
      <div className="relative z-10 mt-4 flex flex-col items-center justify-center">
        {feedback ? (
          /* Feedback / Celebration Card */
          <div
            className="w-full max-w-md rounded-[2.2rem] border-3 border-[#7a421a] bg-[#fffdf7] p-5 text-center shadow-xl"
            aria-live="polite"
          >
            <p className="text-base sm:text-lg font-black text-[#2e1910]">
              {feedback.submissionFailed
                ? feedback.childFeedback
                : longReadingPrompt
                  ? sentenceMessage
                  : feedback.childFeedback || t("great_safari_work")}
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#786154]">
              {feedback.submissionFailed
                ? feedback.leoMessage
                : longReadingPrompt
                  ? t("sentence_feedback_encouragement")
                  : feedback.leoMessage || t("found_sound_gem")}
            </p>

            {/* Stars earned badge */}
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-100 px-4 py-1.5 text-xs sm:text-sm font-black text-amber-900 shadow-sm">
              <span>★</span>
              <span>+{feedback.starsEarned || 0} {theme?.collectible || "sound gems"}</span>
            </p>

            {/* Action button */}
            {primaryAction === "retry" ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 w-full rounded-full border-3 border-orange-700 bg-gradient-to-b from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-102 active:scale-98 cursor-pointer"
              >
                {t(retryLabelKey)}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="mt-4 w-full rounded-full border-3 border-[#6b4122] bg-gradient-to-b from-[#2b7a3e] to-[#1c562a] hover:from-[#348e49] hover:to-[#226732] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-102 active:scale-98 cursor-pointer"
              >
                {level < totalLevels ? t("unlock_next_step") : t("open_final_reward")}
              </button>
            )}
          </div>
        ) : selectionPrompt ? (
          /* Selection Options Pills */
          <div className="w-full max-w-md text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#4d2407]">
              {t("choose_sound_gem")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectAnswer(option)}
                  disabled={submitting}
                  className={`rounded-2xl px-6 py-3.5 text-2xl sm:text-3xl font-black transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    selectedAnswer === option
                      ? "border-3 border-[#6b3d1b] bg-gradient-to-b from-[#b86d38] to-[#8f4f22] text-white shadow-xl ring-4 ring-amber-300/50"
                      : "border-2 border-[#ecdac2] bg-[#fffdf7] text-[#2e1910] shadow-md hover:border-[#8f4f22] hover:bg-amber-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Selection Button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !selectedAnswer}
              className="mt-4 w-full rounded-full border-3 border-[#6b4122] bg-gradient-to-b from-[#2b7a3e] to-[#1c562a] hover:from-[#348e49] hover:to-[#226732] px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-lg transition hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t("sending_to_leo") : t("send_to_leo")}
            </button>
          </div>
        ) : (
          /* Speaking Task Action Zone */
          <div className="flex flex-col items-center">
            <SpeechRecorder
              resetKey={`${activity?.activityId || "leo-check"}-${prompt?.promptId}-${feedback ? "sent" : "ready"}`}
              onRecordingReady={onRecordingReady}
              onSupportChange={onRecorderSupportChange}
              onRecordingStateChange={onRecordingStateChange}
              maxDurationMs={recordingLimitMs}
              showDurationLimit={longReadingPrompt}
              onAutoSubmit={onSubmit}
              submitting={submitting}
            />

            {/* Optional Manual Submit for non-auto scenarios */}
            {primaryAction === "submit" && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || (!recording && recorderSupported)}
                className="mt-3 rounded-full border-3 border-[#6b4122] bg-gradient-to-b from-[#2b7a3e] to-[#1c562a] px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {submitting ? t("sending_to_leo") : t("send_to_leo")}
              </button>
            )}
          </div>
        )}

        {/* Error or warning messages */}
        {error && (
          <p className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm">
            {longReadingPrompt ? t("sentence_feedback_retry") : error}
          </p>
        )}
      </div>

      {/* Cheering Scout Leo Sitting on Mossy Rock */}
      <div className="pointer-events-none mt-2 flex items-end justify-start sm:absolute sm:bottom-0 sm:left-2 z-20">
        <img
          src="/images/speechProcessing/scout_leo_sitting_rock.png"
          alt="Scout Leo cheering"
          className="h-32 sm:h-44 md:h-52 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] select-none"
        />
      </div>
    </div>
  );
}

export default LeoCurrentLevelPanel;
