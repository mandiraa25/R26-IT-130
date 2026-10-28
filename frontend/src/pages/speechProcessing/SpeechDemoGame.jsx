// VIVA: Demo/assignment session: current word prompt, Start/Stop Recording, submit/next/complete controls and result feedback.
import { useEffect, useMemo, useRef, useState } from "react";
import { getStudentProfile } from "../../services/student/api";
import {
  completeSpeechSession,
  getSpeechPrompts,
  startSpeechSession,
  uploadSpeechAttempt,
} from "../../services/speechProcessing/api";
import RecorderButton from "./components/RecorderButton";
import SpeechResultCard from "./components/SpeechResultCard";

const LOCAL_PROMPTS = [
  {
    promptId: "SP001",
    taskType: "read_aloud_word",
    targetText: "cat",
    grade: "2",
    targetPhonemes: ["K", "AE", "T"],
    instructionSi: "වචනය බලලා කියන්න",
  },
  {
    promptId: "SP002",
    taskType: "read_aloud_word",
    targetText: "bat",
    grade: "2",
    targetPhonemes: ["B", "AE", "T"],
    instructionSi: "වචනය බලලා කියන්න",
  },
  {
    promptId: "SP004",
    taskType: "pseudoword_read",
    targetText: "blim",
    grade: "3",
    targetPhonemes: ["B", "L", "IH", "M"],
    instructionSi: "මෙම රොබෝ වචනය කියවන්න",
  },
];

const instructionByTask = {
  sentence_read: "වාක්‍යය කියවන්න",
  read_aloud_word: "වචනය බලලා කියන්න",
  pseudoword_read: "මෙම රොබෝ වචනය කියවන්න",
  minimal_pair_read: "වචනය බලලා කියන්න",
  listen_repeat: "අහලා නැවත කියන්න",
};

const normalizePrompt = (prompt) => ({
  ...prompt,
  grade: prompt.grade || prompt.gradeMin || "2",
  targetPhonemes: prompt.targetPhonemes || [],
});

const SpeechDemoGame = ({ onExit, assignment }) => {
  const [profile, setProfile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [result, setResult] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptsByPrompt, setAttemptsByPrompt] = useState({});
  const initializedRef = useRef(false);

  const currentPrompt = prompts[currentIndex] || LOCAL_PROMPTS[0];
  const attemptNo = useMemo(
    () => (attemptsByPrompt[currentPrompt.promptId] || 0) + 1,
    [attemptsByPrompt, currentPrompt.promptId]
  );

  useEffect(() => {
    const setupSession = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      setLoading(true);
      setError("");

      try {
        const profileRes = await getStudentProfile();
        const studentProfile = profileRes.data;
        const grade = String(studentProfile.grade || "2");
        setProfile(studentProfile);

        let selectedPrompts = assignment?.prompts || [];
        if (!selectedPrompts.length && assignment?.promptIds?.length) {
          const promptRes = await getSpeechPrompts({ grade });
          selectedPrompts = (promptRes.data?.data || []).filter((prompt) =>
            assignment.promptIds.includes(prompt.promptId)
          );
        }
        if (!selectedPrompts.length) {
          const promptRes = await getSpeechPrompts({ grade });
          selectedPrompts = promptRes.data?.data || [];
        }
        if (!selectedPrompts.length) selectedPrompts = LOCAL_PROMPTS;

        const normalized = selectedPrompts.map(normalizePrompt);
        setPrompts(normalized);

        const sessionRes = await startSpeechSession({
          grade,
          mode: assignment ? "assigned" : "demo",
          assignmentId: assignment?._id,
          promptSet: normalized.map((prompt) => prompt.promptId),
        });
        setSessionId(sessionRes.data?.data?.sessionId);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not start Sound Adventure. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    setupSession();
  }, [assignment]);

  const handleSubmit = async () => {
    if (!recording || !sessionId) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append(
        "audio",
        recording.audioBlob,
        `${currentPrompt.promptId}_attempt_${attemptNo}.webm`
      );
      formData.append("sessionId", sessionId);
      if (assignment?._id) formData.append("assignmentId", assignment._id);
      formData.append("promptId", currentPrompt.promptId);
      formData.append("taskType", currentPrompt.taskType);
      formData.append("targetText", currentPrompt.targetText);
      formData.append(
        "targetPhonemes",
        JSON.stringify(currentPrompt.targetPhonemes || [])
      );
      formData.append("attemptNo", attemptNo);
      formData.append("audioDurationMs", recording.audioDurationMs);
      formData.append("playedAudioFirst", false);

      const res = await uploadSpeechAttempt(formData);
      setResult(res.data?.data);
      setAttemptsByPrompt((prev) => ({
        ...prev,
        [currentPrompt.promptId]: attemptNo,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "The speech upload could not finish. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setRecording(null);
    setResult(null);
    setCurrentIndex((index) => Math.min(index + 1, prompts.length - 1));
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await completeSpeechSession(sessionId);
      setCompletion(res.data?.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not complete Sound Adventure."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main
        className="child-game-shell flex min-h-screen items-center justify-center p-8"
        style={{
          backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div className="rounded-[2.5rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-8 text-center shadow-2xl">
          <p className="text-xl font-black text-[#2e1910]">
            Preparing Sound Adventure...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="child-game-shell min-h-screen p-5 text-slate-900 sm:p-8"
      style={{
        backgroundImage: "url(/images/reports/jungle_waterfall_bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border-3 border-[#6b4122] bg-[#a86532] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#8f5224]"
          >
            Back to Sound Adventure
          </button>
          <div className="rounded-full border-2 border-[#ecdac2] bg-[#fbf7ed] px-5 py-3 text-sm font-black text-[#2e1910]">
            {assignment ? "Teacher Activity" : "Demo"} | Prompt {currentIndex + 1} of {prompts.length}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        <section className="rounded-[2.5rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-6 text-center shadow-2xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#786154]">
            {currentPrompt.taskType.replaceAll("_", " ")}
          </p>
          <h1 className="mt-4 break-words text-6xl font-black tracking-tight text-[#2e1910] sm:text-8xl">
            {currentPrompt.targetText}
          </h1>
          <p className="mt-5 text-2xl font-black text-[#7c2d12]">
            {currentPrompt.instructionSi ||
              instructionByTask[currentPrompt.taskType] ||
              "වචනය බලලා කියන්න"}
          </p>
          <p className="mt-3 text-base font-bold text-[#786154]">
            Great try! Say the word clearly, then stop recording and submit.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <RecorderButton onRecordingComplete={setRecording} />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!recording || submitting || Boolean(result)}
                className="rounded-2xl border-3 border-[#6b4122] bg-[#a86532] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8f5224] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Submit Attempt"}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!result || currentIndex === prompts.length - 1}
                className="rounded-2xl border-2 border-[#ecdac2] bg-[#fbf7ed] px-6 py-4 text-sm font-black text-[#2e1910] transition hover:bg-amber-100/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Prompt
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting || !sessionId || !Object.keys(attemptsByPrompt).length}
                className="rounded-2xl border-3 border-emerald-800 bg-emerald-700 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Complete Session
              </button>
            </div>
          </div>

          <SpeechResultCard result={result} completion={completion} />
        </div>
      </div>
    </main>
  );
};

export default SpeechDemoGame;
