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
    <section className="min-w-0 overflow-x-hidden rounded-[2.4rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-5 shadow-2xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            className="rounded-full border-2 border-[#6b4122] bg-[#a86532] px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm"
          >
            {theme?.taskLabel || activity?.gameType || t("sound")}
          </span>
          <h2 className="mt-3 text-3xl font-black text-[#2e1910] sm:text-4xl">
            {t("level_progress", { current: level, total: totalLevels })}
          </h2>
        </div>
        {promptPlaybackAvailable && (
          <button
            type="button"
            onClick={speakPrompt}
            disabled={isRecording}
            className="rounded-full border-3 border-[#6b4122] bg-[#a86532] px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#8f5224] focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("play_sound")}
          </button>
        )}
      </div>

      {longReadingPrompt ? (
        <div className="mt-5 min-w-0 px-1 py-2 text-center sm:px-4">
          <p className="text-sm font-black leading-6 text-[#7c2d12]">
            {paragraphPrompt ? t("paragraph_read_instruction") : t("sentence_read_instruction")}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#786154]">
            {t("sentence_read_instruction_en")}
          </p>
          <div className="mt-4 min-w-0">
            <LeoSentencePrompt prompt={prompt} />
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[2rem] border-2 border-[#ecdac2] bg-[#fbf7ed] p-6 text-center shadow-inner">
          <p className="text-sm font-black text-[#7c2d12]">
            {prompt?.instructionSi || t("leo_says_try_sound")}
          </p>
          <p className="mt-1 text-xs font-bold text-[#786154]">
            {prompt?.instructionEn || theme?.animalMessage || t("follow_sound_path")}
          </p>
          <h3 className="mt-4 break-words text-5xl font-black text-[#2e1910] sm:text-6xl">
            {prompt?.targetText || t("sound")}
          </h3>
          {prompt?.pairText && (
            <p className="mt-2 text-2xl font-black text-[#786154]">
              {t("or_label")} {prompt.pairText}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {feedback ? (
            <div
              className="rounded-[2rem] border-2 border-[#ecdac2] bg-[#fbf7ed] px-5 py-6 text-center text-sm font-black text-[#2e1910] shadow-md"
              aria-live="polite"
            >
              {t("feedback_action_ready")}
            </div>
          ) : selectionPrompt ? (
            <div className="rounded-[2rem] border-2 border-[#ecdac2] bg-[#fffdf7] p-4 shadow-md">
              <p className="text-sm font-black text-[#2e1910]">{t("choose_sound_gem")}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelectAnswer(option)}
                    disabled={submitting}
                    className={`rounded-[1.5rem] px-5 py-5 text-2xl font-black transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-amber-200 ${
                      selectedAnswer === option
                        ? "border-3 border-[#6b4122] bg-[#a86532] text-white shadow-lg"
                        : "border-2 border-[#ecdac2] bg-[#fbf7ed] text-[#2e1910] shadow-sm hover:border-[#a86532] hover:bg-amber-100/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <aside className="rounded-[2rem] border-2 border-[#ecdac2] bg-[#fffdf7] p-5 shadow-lg">
          <p className="text-lg font-black text-[#2e1910]">
            {t(guideKeys.headingKey)}
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#786154]">
            {t(guideKeys.descriptionKey)}
          </p>

          {error && (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {longReadingPrompt ? t("sentence_feedback_retry") : error}
            </p>
          )}

          {!recorderSupported && !selectionPrompt && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {t("recording_not_supported")}
            </p>
          )}

          {primaryAction === "submit" || (primaryAction === "checking" && selectionPrompt) ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={
                submitting ||
                (selectionPrompt && !selectedAnswer) ||
                (!selectionPrompt && !recording && recorderSupported)
              }
              className="mt-5 w-full rounded-[1.5rem] border-3 border-[#6b4122] bg-[#a86532] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8f5224] disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-400"
            >
              {submitting && longReadingPrompt
                ? t("sentence_feedback_processing")
                : submitting
                  ? t("sending_to_leo")
                  : t("send_to_leo")}
            </button>
          ) : primaryAction === "record" || primaryAction === "checking" ? (
            <div className="mt-5 rounded-[1.5rem] border border-[#ecdac2] bg-[#fbf7ed] px-4 py-4 text-center" aria-live="polite">
              <p className="text-sm font-black text-[#2e1910]">
                {submitting ? t("sending_to_leo") : t("recorder_auto_submit_hint")}
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-[#786154]">
                {t("recorder_auto_submit_desc")}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.75rem] border-2 border-[#ecdac2] bg-[#fbf7ed] p-4">
              <p className="text-lg font-black text-[#2e1910]">
                {feedback.submissionFailed
                  ? feedback.childFeedback
                  : longReadingPrompt
                    ? sentenceMessage
                    : feedback.childFeedback || t("great_safari_work")}
              </p>
              <p className="mt-2 text-sm font-bold text-[#786154]">
                {feedback.submissionFailed
                  ? feedback.leoMessage
                  : longReadingPrompt
                    ? t("sentence_feedback_encouragement")
                    : feedback.leoMessage || t("found_sound_gem")}
              </p>
              {!longReadingPrompt && feedback.wordReading?.attemptStatus !== "processing" && feedback.wordReading && (
                <div className="mt-4 rounded-[1.25rem] border border-[#ecdac2] bg-[#fffdf7] p-3 text-left">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c2d12]">
                    {t("word_reading")}
                  </p>
                  <div className="mt-2 grid gap-2 text-sm font-bold text-[#2e1910]">
                    <span>{t("target_word")}: {feedback.wordReading.targetWord || prompt?.targetText || "-"}</span>
                    <span>{t("leo_heard")}: {feedback.wordReading.normalizedAsrText || "..."}</span>
                    <span>
                      {t("correct")}: {feedback.wordReading.wordCorrect ? t("yes") : t("try_again_label")}
                    </span>
                  </div>
                  {wordMessage && (
                    <p className="mt-3 rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] px-3 py-2 text-sm font-black text-[#2e1910]">
                      {wordMessage}
                    </p>
                  )}
                </div>
              )}
              {!longReadingPrompt && feedback.soundFeedback && (
                <div className={`mt-4 rounded-[1.25rem] border p-3 text-left ${getSoundHelperTone(feedback.soundFeedback.state)}`}>
                  <p className="text-xs font-black uppercase tracking-[0.12em]">
                    {t("leo_sound_helper")}
                  </p>
                  <p className="mt-2 text-sm font-black">
                    {feedback.soundFeedback.message || t("sound_helper_waiting")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(feedback.soundFeedback.focusAreas || []).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white/80 px-3 py-1 text-xs font-black shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-[#ecdac2] bg-[#fffdf7] px-4 py-2 text-sm font-black text-amber-500">
                <span>★</span>
                <span>+{feedback.starsEarned || 0} {theme?.collectible || "sound gems"}</span>
              </p>
              {primaryAction === "retry" ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 w-full rounded-[1.5rem] border-3 border-orange-700 bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  {t(retryLabelKey)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  className="mt-4 w-full rounded-[1.5rem] border-3 border-[#6b4122] bg-[#a86532] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8f5224]"
                >
                  {level < totalLevels ? t("unlock_next_step") : t("open_final_reward")}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default LeoCurrentLevelPanel;
