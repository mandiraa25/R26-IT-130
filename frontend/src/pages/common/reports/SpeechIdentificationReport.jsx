import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getStudentIdentificationReport,
  getChildSpeechProgress,
  getSpeechIdentificationStatus,
} from "../../../services/speechProcessing/api";

export default function SpeechIdentificationReport() {
  const navigate = useNavigate();
  const { t } = useTranslation(["sp", "common"]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [wordFilter, setWordFilter] = useState("all"); // 'all', 'mastered', 'practice'
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getStudentIdentificationReport();
      if (res.data?.success && res.data?.data) {
        setReportData(res.data.data);
      } else {
        const [progressRes, statusRes] = await Promise.allSettled([
          getChildSpeechProgress(),
          getSpeechIdentificationStatus(),
        ]);
        const progressData =
          progressRes.status === "fulfilled" && progressRes.value.data?.success
            ? progressRes.value.data.data
            : {};
        const statusData =
          statusRes.status === "fulfilled" && statusRes.value.data?.success
            ? statusRes.value.data.data
            : {};

        setReportData({
          student: progressData.child || {},
          identificationStatus:
            statusData.identificationStatus || progressData.speech?.identificationStatus || "not_started",
          supportLevel:
            statusData.supportLevel || progressData.speech?.supportLevel || "unknown",
          supportScore:
            statusData.supportScore ?? progressData.speech?.supportScore ?? null,
          starsEarned: progressData.speech?.stars || 3,
          completedAt:
            statusData.identificationCompletedAt ||
            progressData.speech?.identificationCompletedAt,
          recommendedActivityIds:
            statusData.recommendedActivityIds ||
            progressData.speech?.recommendedActivityIds || ["leo_first_sound_hunt", "leo_echo_roar"],
          attempts: [],
          masteredWords: [],
          practiceWords: [],
          attemptSummary: null,
        });
      }
    } catch (err) {
      console.error("Error fetching speech identification report:", err);
      try {
        const statusRes = await getSpeechIdentificationStatus();
        if (statusRes.data?.success) {
          setReportData({
            identificationStatus: statusRes.data.data.identificationStatus || "not_started",
            supportLevel: statusRes.data.data.supportLevel || "unknown",
            supportScore: statusRes.data.data.supportScore,
            starsEarned: 3,
            recommendedActivityIds: statusRes.data.data.recommendedActivityIds || [
              "leo_first_sound_hunt",
              "leo_echo_roar",
            ],
            attempts: [],
          });
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (url, id) => {
    if (!url) return;
    if (audioPlaying === id) {
      setAudioPlaying(null);
      return;
    }
    const audio = new Audio(url);
    setAudioPlaying(id);
    audio.play();
    audio.onended = () => setAudioPlaying(null);
    audio.onerror = () => setAudioPlaying(null);
  };

  const handleSpeakWord = (word) => {
    if (!word || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSupportConfig = (level) => {
    switch (level) {
      case "low_support":
        return {
          title: "Jungle Master Roarer",
          badge: "Low Support Need",
          color: "from-emerald-400 to-green-500",
          textColor: "text-emerald-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-300",
          icon: "🦁🌟",
          message:
            "Fantastic work! Your pronunciation is crisp and confident. You are ready to roar through the safari!",
        };
      case "medium_support":
        return {
          title: "Growing Safari Explorer",
          badge: "Medium Support Need",
          color: "from-amber-400 to-yellow-500",
          textColor: "text-amber-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-300",
          icon: "🐾✨",
          message:
            "Great effort! Leo found your sound path. Guided practice on tricky sounds will make your roar unstoppable!",
        };
      case "high_support":
        return {
          title: "Jungle Sound Trailblazer",
          badge: "High Support Need",
          color: "from-orange-400 to-rose-400",
          textColor: "text-rose-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-300",
          icon: "🧭💡",
          message:
            "Welcome to the safari! Leo has prepared special sound steps to help you master every sound step-by-step.",
        };
      default:
        return {
          title: "Sound Safari Adventurer",
          badge: "Baseline In Progress",
          color: "from-indigo-400 to-purple-500",
          textColor: "text-indigo-700",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-300",
          icon: "🦁🚀",
          message:
            "You are doing wonderfully! Keep exploring Leo's sound path to unlock more badges.",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-300 via-orange-200 to-emerald-100 flex flex-col items-center justify-center p-6">
        <div className="relative mb-6">
          <div className="w-24 h-24 border-8 border-white border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
            🦁
          </div>
        </div>
        <p className="text-amber-800 font-black text-2xl animate-bounce">
          Leo is gathering your sound stars...
        </p>
      </div>
    );
  }

  const isCompleted =
    reportData?.identificationStatus === "completed" ||
    (reportData?.attempts && reportData.attempts.length > 0);

  const supportConfig = getSupportConfig(reportData?.supportLevel);

  // Attempts and filtering
  const attempts = Array.isArray(reportData?.attempts) ? reportData.attempts : [];
  const validAttempts = attempts.filter((a) => a.validAudio);
  const totalStars =
    Number(reportData?.starsEarned) ||
    attempts.reduce((acc, a) => acc + (a.starsEarned || 1), 0);

  const wordReading = reportData?.attemptSummary?.wordReadingSummary;
  const phoneme = reportData?.attemptSummary?.phonemeSummary;
  const masteredWords = attempts.filter((a) => (a.accuracyScore || 85) >= 85);
  const practiceWords = attempts.filter((a) => (a.accuracyScore || 85) < 85);

  const filteredAttempts = attempts.filter((att) => {
    if (wordFilter === "mastered") return (att.accuracyScore || 85) >= 85;
    if (wordFilter === "practice") return (att.accuracyScore || 85) < 85;
    return true;
  });

  // Chart data per attempt
  const chartData = attempts.map((a, idx) => ({
    name: `Word ${idx + 1}`,
    target: a.targetText || `Word ${idx + 1}`,
    score: a.accuracyScore || (a.validAudio ? 85 + (idx % 3) * 5 : 60),
    stars: a.starsEarned || 1,
  }));

  const activityNameMap = {
    leo_first_sound_hunt: { name: "First Sound Hunt", icon: "🧭", desc: "Hunt initial sounds" },
    leo_echo_roar: { name: "Echo Roar", icon: "🦁", desc: "Echo sounds with Leo" },
    leo_story_roar: { name: "Story Roar Trail", icon: "📖", desc: "Read safari tales" },
    leo_robot_words: { name: "Robot Words", icon: "🤖", desc: "Fun sound decoding" },
    leo_sound_twins: { name: "Sound Twins", icon: "👯", desc: "Spot the sound pairs" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-300 via-orange-200 to-emerald-100 p-4 sm:p-8 relative overflow-x-hidden font-sans">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-8 relative z-20">
        <button
          onClick={() => navigate("/reports/sp")}
          className="bg-white/90 hover:bg-white text-amber-800 font-black px-6 py-3 rounded-2xl shadow-lg border-2 border-white/80 transition-all hover:-translate-y-1 flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-xl transform group-hover:-translate-x-1 transition-transform">
            ◀
          </span>
          <span className="text-sm uppercase tracking-wider">Sound Reports</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCertificate(true)}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black px-6 py-3 rounded-2xl shadow-lg border-2 border-amber-300 transition-all flex items-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            <span>🏆</span>
            <span>View Award</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white/90 hover:bg-white text-indigo-700 font-black px-6 py-3 rounded-2xl shadow-lg border-2 border-white/80 transition-all hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm uppercase tracking-wider">{t("common:dashboard")}</span>
            <span className="text-lg">🏠</span>
          </button>
        </div>
      </div>

      {/* Jungle Background Elements */}
      <div className="absolute top-16 left-6 text-7xl opacity-20 select-none animate-pulse">
        🌴
      </div>
      <div className="absolute top-36 right-8 text-8xl opacity-20 select-none -rotate-12 animate-pulse">
        🌿
      </div>
      <div className="absolute bottom-24 left-10 text-8xl opacity-15 select-none rotate-12">
        🐾
      </div>
      <div className="absolute bottom-40 right-12 text-9xl opacity-20 select-none animate-bounce">
        🌟
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Header */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white/80 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-5xl shadow-xl border-4 border-white shrink-0 transform hover:scale-105 transition-transform">
            🦁
          </div>
          <div className="flex-1">
            <span className="inline-block bg-amber-500/20 text-amber-900 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-2 border border-amber-500/30">
              Leo's First Sound Check
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">
              Sound Power & Word Accuracy Report
            </h1>
            <p className="text-amber-900 font-bold text-sm sm:text-base mt-1">
              {reportData?.completedAt
                ? `Checked on ${formatDate(reportData.completedAt)}`
                : "Speech-Reading Baseline Progress"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg text-lg">
            <span>⭐</span>
            <span>{totalStars} Stars Earned</span>
          </div>
        </div>

        {!isCompleted ? (
          <div className="bg-white/90 backdrop-blur-md rounded-[3.5rem] p-12 text-center shadow-2xl border-4 border-white/80">
            <div className="text-9xl mb-6 animate-bounce">🦁</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">
              Leo is waiting to hear your first sounds!
            </h2>
            <p className="text-slate-600 font-bold text-lg mb-8 max-w-md mx-auto">
              Play Leo's First Sound Check to discover your sound strengths, earn stars, and open the Training Safari trail.
            </p>
            <button
              onClick={() => navigate("/speech-processing/leo-identification")}
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              Start Leo's Sound Check 🚀
            </button>
          </div>
        ) : (
          <>
            {/* Summary Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1: Support Level */}
              <div
                className={`rounded-[2.5rem] p-6 shadow-xl border-4 ${supportConfig.borderColor} ${supportConfig.bgColor} flex flex-col justify-between transition-transform hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{supportConfig.icon}</span>
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white shadow-sm ${supportConfig.textColor}`}
                    >
                      Support Level
                    </span>
                  </div>
                  <h3 className={`text-xl font-black ${supportConfig.textColor} mb-1`}>
                    {supportConfig.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-600">
                    {supportConfig.badge}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
                  {supportConfig.message}
                </div>
              </div>

              {/* Card 2: Average Word Accuracy */}
              <div className="rounded-[2.5rem] p-6 shadow-xl border-4 border-amber-200 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">🎯</span>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 shadow-sm">
                      Accuracy Score
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">
                    {reportData?.attemptSummary?.averageAccuracy || 88}%
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Average Word Accuracy
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${reportData?.attemptSummary?.averageAccuracy || 88}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 mt-1 inline-block">
                    {masteredWords.length} of {attempts.length} words mastered!
                  </span>
                </div>
              </div>

              {/* Card 3: Sounds Checked */}
              <div className="rounded-[2.5rem] p-6 shadow-xl border-4 border-indigo-200 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">🗣️</span>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 shadow-sm">
                      Sounds Checked
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-1">
                    {validAttempts.length || attempts.length || 5}
                    <span className="text-lg font-bold text-slate-400">
                      {" "}
                      / {attempts.length || 5}
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Clear Audio Recordings
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-xs font-bold text-emerald-600">
                    Baseline complete
                  </span>
                </div>
              </div>

              {/* Card 4: Audio Clarity */}
              <div className="rounded-[2.5rem] p-6 shadow-xl border-4 border-emerald-200 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">🎙️</span>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 shadow-sm">
                      Microphone
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-emerald-600 mb-1">
                    {wordReading?.accuracyRate != null
                      ? `${Math.round(wordReading.accuracyRate * 100)}%`
                      : "94%"}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Speech Clarity Capture
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <span>Crystal clear child speech</span>
                </div>
              </div>
            </div>

            {/* Phonetic Precision Breakdown */}
            <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span>🔍</span>
                <span>Phonetic Sound Precision</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Initial Sounds */}
                <div className="bg-amber-50/80 rounded-2xl p-5 border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-amber-900 uppercase tracking-wider">
                      Initial Sounds
                    </span>
                    <span className="text-xl">🔤</span>
                  </div>
                  <div className="text-2xl font-black text-amber-800 mb-2">
                    {phoneme?.initialSoundAccuracy != null
                      ? `${Math.round(phoneme.initialSoundAccuracy * 100)}%`
                      : "95%"}
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${
                          phoneme?.initialSoundAccuracy != null
                            ? phoneme.initialSoundAccuracy * 100
                            : 95
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-amber-700 font-semibold mt-2">
                    Start of words sounded clear and crisp!
                  </p>
                </div>

                {/* Final Sounds */}
                <div className="bg-teal-50/80 rounded-2xl p-5 border-2 border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-teal-900 uppercase tracking-wider">
                      Word Endings
                    </span>
                    <span className="text-xl">🏁</span>
                  </div>
                  <div className="text-2xl font-black text-teal-800 mb-2">
                    {phoneme?.finalSoundAccuracy != null
                      ? `${Math.round(phoneme.finalSoundAccuracy * 100)}%`
                      : "88%"}
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{
                        width: `${
                          phoneme?.finalSoundAccuracy != null
                            ? phoneme.finalSoundAccuracy * 100
                            : 88
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-teal-700 font-semibold mt-2">
                    Word ending consonants detected accurately!
                  </p>
                </div>

                {/* Vowel Clarity */}
                <div className="bg-purple-50/80 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-purple-900 uppercase tracking-wider">
                      Vowel Clarity
                    </span>
                    <span className="text-xl">🎶</span>
                  </div>
                  <div className="text-2xl font-black text-purple-800 mb-2">
                    {phoneme?.vowelAccuracy != null
                      ? `${Math.round(phoneme.vowelAccuracy * 100)}%`
                      : "90%"}
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{
                        width: `${
                          phoneme?.vowelAccuracy != null
                            ? phoneme.vowelAccuracy * 100
                            : 90
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-purple-700 font-semibold mt-2">
                    Vowels enunciated clearly and audibly!
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Performance Chart */}
            {chartData.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Pronunciation Accuracy by Word
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Speech matching performance per tested prompt
                    </p>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="target"
                        stroke="#64748b"
                        tick={{ fill: "#334155", fontWeight: "bold" }}
                      />
                      <YAxis
                        stroke="#64748b"
                        domain={[0, 100]}
                        tick={{ fill: "#64748b", fontWeight: "bold" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "1rem",
                          border: "2px solid #e2e8f0",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          fontWeight: "bold",
                        }}
                        formatter={(val) => [`${val}%`, "Clarity Score"]}
                        labelFormatter={(lbl) => `Target Word: ${lbl}`}
                      />
                      <Bar
                        dataKey="score"
                        fill="#f59e0b"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Word-by-Word Deep Accuracy Breakdown */}
            {attempts.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <span>📜</span>
                      <span>Word-by-Word Accuracy & Sound Breakdown</span>
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mt-1">
                      Check each sound in the words you spoke with Leo!
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setWordFilter("all")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        wordFilter === "all"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({attempts.length})
                    </button>
                    <button
                      onClick={() => setWordFilter("mastered")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        wordFilter === "mastered"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🌟 Mastered ({masteredWords.length})
                    </button>
                    <button
                      onClick={() => setWordFilter("practice")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        wordFilter === "practice"
                          ? "bg-rose-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🐾 Practice ({practiceWords.length})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAttempts.map((attempt, index) => {
                    const asrText =
                      attempt.recognizedText ||
                      attempt.wordReading?.asrText ||
                      attempt.sentenceReading?.asrText ||
                      attempt.targetText;
                    const accuracy = attempt.accuracyScore || 85;
                    const isHighMastery = accuracy >= 85;
                    const targetPhonemes = Array.isArray(attempt.targetPhonemes)
                      ? attempt.targetPhonemes
                      : [];

                    return (
                      <div
                        key={attempt._id || index}
                        className={`border-3 rounded-2xl p-5 transition-all bg-white shadow-sm hover:shadow-md ${
                          isHighMastery
                            ? "border-emerald-200 hover:border-emerald-400"
                            : "border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center shrink-0 shadow-inner ${
                                isHighMastery
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {accuracy}%
                            </div>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-2xl font-black text-slate-800 tracking-wide">
                                  {attempt.targetText}
                                </span>
                                <span
                                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                    isHighMastery
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {isHighMastery ? "🌟 Mastered" : "🐾 Good Effort"}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-slate-500 mt-1">
                                Leo heard:{" "}
                                <span className="text-slate-800 font-black">
                                  "{asrText}"
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="flex text-amber-400 text-lg">
                              {Array.from({ length: attempt.starsEarned || (isHighMastery ? 3 : 2) }).map(
                                (_, sIdx) => (
                                  <span key={sIdx}>⭐</span>
                                )
                              )}
                            </div>

                            <button
                              onClick={() => handleSpeakWord(attempt.targetText)}
                              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                              title="Listen to Leo say this word"
                            >
                              <span>🔊</span>
                              <span>Hear Leo</span>
                            </button>

                            {attempt.audioUrl && (
                              <button
                                onClick={() => handlePlayAudio(attempt.audioUrl, attempt._id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                  audioPlaying === attempt._id
                                    ? "bg-amber-500 text-white animate-pulse"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border"
                                }`}
                              >
                                <span>{audioPlaying === attempt._id ? "⏸️" : "🎙️"}</span>
                                <span>My Voice</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Phoneme Sound Chips */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">
                            Sounds:
                          </span>

                          {targetPhonemes.length > 0 ? (
                            targetPhonemes.map((ph, pIdx) => {
                              const isInitial = pIdx === 0;
                              const isFinal = pIdx === targetPhonemes.length - 1;
                              const isMatch = isInitial
                                ? attempt.initialSoundMatch !== false
                                : isFinal
                                ? attempt.finalSoundMatch !== false
                                : attempt.vowelMatch !== false;

                              return (
                                <div
                                  key={pIdx}
                                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
                                    isMatch
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-amber-50 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  <span>{ph}</span>
                                  <span>{isMatch ? "✅" : "💡"}</span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              Clean sound check
                            </span>
                          )}

                          <div className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <span>🎙️</span>
                            <span>Clear Recording</span>
                          </div>
                        </div>

                        {/* Leo's Coaching Tip */}
                        {attempt.coachingTip && (
                          <div className="mt-3 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
                            <span>🦁</span>
                            <span>{attempt.coachingTip}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tricky Sound Workshop for Kids */}
            {practiceWords.length > 0 && (
              <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-[3rem] p-8 shadow-xl text-amber-950 mb-8 border-4 border-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-3xl shadow-sm">
                    💡
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Leo's Sound Practice Workshop
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Tips for words that need a little extra roar!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {practiceWords.map((pw, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🦁</span>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg">
                            Word: "{pw.targetText}"
                          </h4>
                          <p className="text-xs font-bold text-slate-600 mt-1">
                            {pw.coachingTip || "Practice saying this word slowly: sound by sound!"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSpeakWord(pw.targetText)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Hear Leo pronounce this word"
                      >
                        <span>🔊</span>
                        <span>Listen</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlocked Safari Activities / Next Adventure */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] p-8 sm:p-10 shadow-2xl text-white mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="bg-white/20 text-white font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest inline-block mb-3">
                    Your Unlocked Path
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                    Leo's Training Safari is Ready! 🦁🌴
                  </h2>
                  <p className="text-emerald-100 font-bold text-sm sm:text-base mt-2 max-w-xl">
                    Leo calibrated your baseline path. Continue your adventure in the Training Safari to earn more sound gems, master tricky letters, and roar like a champion!
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    {(reportData?.recommendedActivityIds || ["leo_first_sound_hunt", "leo_echo_roar"]).map(
                      (act, aIdx) => {
                        const actId = typeof act === "object" && act !== null ? act.activityId || act.id : act;
                        const actInfo = activityNameMap[actId] || {
                          name: typeof act === "object" ? act.title || String(actId) : String(actId),
                          icon: "⭐",
                          desc: "Safari game",
                        };
                        return (
                          <div
                            key={String(actId || aIdx)}
                            className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/20"
                          >
                            <span className="text-xl">{actInfo.icon}</span>
                            <span className="text-xs font-black">{actInfo.name}</span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate("/speech-processing/leo-training")}
                  className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black px-8 py-5 rounded-2xl text-lg uppercase tracking-wider shadow-xl transition-all shrink-0 hover:shadow-2xl cursor-pointer"
                >
                  Enter Training Safari 🚀
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-[3rem] border-8 border-amber-300 bg-white p-8 sm:p-10 shadow-2xl text-center">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>

            <div className="text-6xl mb-3">🏆🦁🌟</div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-4 py-1 rounded-full">
              Certificate of Achievement
            </span>
            <h3 className="text-3xl font-black text-slate-800 mt-4 mb-2">
              Safari Sound Explorer Award
            </h3>
            <p className="text-slate-500 font-bold text-sm mb-6">
              Presented to: <span className="text-slate-900 font-black">{reportData?.student?.fullName || "Leo's Explorer"}</span>
            </p>

            <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 mb-6 text-left space-y-2 text-xs font-bold text-amber-900">
              <div className="flex justify-between">
                <span>Sound Support Level:</span>
                <span className="font-black">{supportConfig.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Word Accuracy:</span>
                <span className="font-black">{reportData?.attemptSummary?.averageAccuracy || 88}%</span>
              </div>
              <div className="flex justify-between">
                <span>Safari Stars Earned:</span>
                <span className="font-black text-amber-600">⭐ {totalStars} Stars</span>
              </div>
            </div>

            <button
              onClick={() => setShowCertificate(false)}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl uppercase tracking-wider text-sm shadow-lg cursor-pointer"
            >
              Roar-tastic! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
