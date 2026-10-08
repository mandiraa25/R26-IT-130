import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getStudentImprovementReport,
  getImprovementStatus,
  getChildSpeechProgress,
} from "../../../services/speechProcessing/api";

export default function SpeechImprovementReport() {
  const navigate = useNavigate();
  const { t } = useTranslation(["sp", "common"]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [activeTab, setActiveTab] = useState("sessions"); // 'sessions', 'words', 'parent_guide'

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getStudentImprovementReport();
      if (res.data?.success && res.data?.data) {
        setReportData(res.data.data);
      } else {
        const [statusRes, progressRes] = await Promise.allSettled([
          getImprovementStatus(),
          getChildSpeechProgress(),
        ]);

        const statusData =
          statusRes.status === "fulfilled" && statusRes.value.data?.success
            ? statusRes.value.data.data
            : {};
        const progressData =
          progressRes.status === "fulfilled" && progressRes.value.data?.success
            ? progressRes.value.data.data
            : {};

        setReportData({
          student: progressData.child || {},
          improvementUnlocked: Boolean(
            statusData.improvementUnlocked || progressData.speech?.improvementUnlocked
          ),
          totalStars: statusData.stars || progressData.speech?.stars || 0,
          completedActivityIds:
            statusData.completedActivityIds ||
            progressData.speech?.completedActivityIds ||
            [],
          currentActivityId:
            statusData.currentActivityId || "leo_first_sound_hunt",
          recommendedActivityIds: statusData.recommendedActivityIds || [],
          weakSkillFocus: statusData.weakSkillFocus || "Initial sounds",
          recommendation: statusData.recommendation || {
            nextActivity: "First Sound Hunt",
            childMessage: "Explore Leo's sound trail!",
          },
          activities: statusData.activities || [],
          sessions: progressData.sessions || [],
          allWordsPracticed: [],
          snapshots: { baseline: null, checkpoints: [] },
        });
      }
    } catch (err) {
      console.error("Error fetching speech improvement report:", err);
      try {
        const statusRes = await getImprovementStatus();
        if (statusRes.data?.success) {
          setReportData({
            totalStars: statusRes.data.data.stars || 0,
            completedActivityIds: statusRes.data.data.completedActivityIds || [],
            currentActivityId: statusRes.data.data.currentActivityId || "leo_first_sound_hunt",
            activities: statusRes.data.data.activities || [],
            sessions: [],
            allWordsPracticed: [],
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-300 to-amber-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="relative mb-6">
          <div className="w-24 h-24 border-8 border-white border-t-emerald-600 rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
            🌴
          </div>
        </div>
        <p className="text-emerald-900 font-black text-2xl animate-bounce">
          Leo is mapping your Safari trail...
        </p>
      </div>
    );
  }

  const sessions = Array.isArray(reportData?.sessions) ? reportData.sessions : [];
  const completedIds = Array.isArray(reportData?.completedActivityIds)
    ? reportData.completedActivityIds
    : [];
  const totalStars = Number(reportData?.totalStars) || 0;
  const allWords = Array.isArray(reportData?.allWordsPracticed)
    ? reportData.allWordsPracticed
    : [];

  const nextActivityObj = reportData?.recommendation?.nextActivity;
  const nextActivityTitle =
    typeof nextActivityObj === "object" && nextActivityObj !== null
      ? nextActivityObj?.title || nextActivityObj?.shortTitle || nextActivityObj?.name || "First Sound Hunt"
      : typeof nextActivityObj === "string" && nextActivityObj
      ? nextActivityObj
      : "First Sound Hunt";

  const nextActivityId =
    typeof nextActivityObj === "object" && nextActivityObj !== null
      ? nextActivityObj?.activityId || "leo_first_sound_hunt"
      : reportData?.currentActivityId || "leo_first_sound_hunt";

  const weakSkillFocus =
    typeof reportData?.weakSkillFocus === "object" && reportData?.weakSkillFocus !== null
      ? reportData?.weakSkillFocus?.name || reportData?.weakSkillFocus?.label || "Initial Consonants"
      : typeof reportData?.weakSkillFocus === "string" && reportData.weakSkillFocus
      ? reportData.weakSkillFocus
      : "Initial Consonants";

  // Chart data from sessions
  const chartData = [...sessions]
    .reverse()
    .map((s, idx) => {
      const d = s.createdAt
        ? new Date(s.createdAt)
        : s.completedAt
        ? new Date(s.completedAt)
        : new Date();
      const dateLabel = isNaN(d.getTime())
        ? `Session ${idx + 1}`
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

      const actTitle =
        typeof s.activityTitle === "object" && s.activityTitle !== null
          ? s.activityTitle?.title || s.activityTitle?.shortTitle || "Safari Practice"
          : typeof s.activityTitle === "string" && s.activityTitle
          ? s.activityTitle
          : s.activityId || `Game ${idx + 1}`;

      return {
        name: `Session ${idx + 1}`,
        activity: actTitle,
        score: Number(s.score) || (s.starsEarned ? s.starsEarned * 30 : 80),
        stars: Number(s.starsEarned) || 1,
        date: dateLabel,
      };
    });

  const safariActivitiesList = [
    {
      id: "leo_first_sound_hunt",
      name: "First Sound Hunt",
      icon: "🧭",
      category: "Initial Sounds",
      color: "border-amber-400 bg-amber-50 text-amber-900",
      accent: "bg-amber-500",
    },
    {
      id: "leo_echo_roar",
      name: "Echo Roar",
      icon: "🦁",
      category: "Sound Repetition",
      color: "border-orange-400 bg-orange-50 text-orange-900",
      accent: "bg-orange-500",
    },
    {
      id: "leo_story_roar",
      name: "Story Roar Trail",
      icon: "📖",
      category: "Sentence Fluency",
      color: "border-emerald-400 bg-emerald-50 text-emerald-900",
      accent: "bg-emerald-500",
    },
    {
      id: "leo_robot_words",
      name: "Robot Word Safari",
      icon: "🤖",
      category: "Decoding & Blends",
      color: "border-cyan-400 bg-cyan-50 text-cyan-900",
      accent: "bg-cyan-500",
    },
    {
      id: "leo_sound_twins",
      name: "Sound Twins",
      icon: "👯",
      category: "Phoneme Matching",
      color: "border-purple-400 bg-purple-50 text-purple-900",
      accent: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-300 to-amber-100 p-4 sm:p-8 relative overflow-x-hidden font-sans">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-8 relative z-20">
        <button
          onClick={() => navigate("/reports/sp")}
          className="bg-white/90 hover:bg-white text-emerald-900 font-black px-6 py-3 rounded-2xl shadow-lg border-2 border-white/80 transition-all hover:-translate-y-1 flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-xl transform group-hover:-translate-x-1 transition-transform">
            ◀
          </span>
          <span className="text-sm uppercase tracking-wider">Sound Reports</span>
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white/90 hover:bg-white text-indigo-700 font-black px-6 py-3 rounded-2xl shadow-lg border-2 border-white/80 transition-all hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-sm uppercase tracking-wider">{t("common:dashboard")}</span>
          <span className="text-lg">🏠</span>
        </button>
      </div>

      {/* Jungle Background Elements */}
      <div className="absolute top-20 left-4 text-8xl opacity-15 select-none animate-pulse">
        🌴
      </div>
      <div className="absolute top-48 right-6 text-9xl opacity-15 select-none rotate-12">
        🦒
      </div>
      <div className="absolute bottom-28 left-8 text-7xl opacity-20 select-none -rotate-12">
        💎
      </div>
      <div className="absolute bottom-44 right-10 text-9xl opacity-20 select-none animate-bounce">
        🌟
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Header */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white/80 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-5xl shadow-xl border-4 border-white shrink-0 transform hover:scale-105 transition-transform">
            🦁
          </div>
          <div className="flex-1">
            <span className="inline-block bg-emerald-600/20 text-emerald-950 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-2 border border-emerald-600/30">
              Training Safari Adventure
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">
              Pronunciation Improvement & Mastery Report
            </h1>
            <p className="text-emerald-900 font-bold text-sm sm:text-base mt-1">
              Safari Trail Mastery & Word Growth Tracker
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-amber-400 text-amber-950 font-black px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-lg">
              <span>⭐</span>
              <span>{totalStars} Safari Stars</span>
            </div>
            <button
              onClick={() => navigate("/speech-processing/leo-training")}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-6 py-3 rounded-2xl shadow-lg text-sm uppercase tracking-wider transition-all cursor-pointer"
            >
              Play Safari 🚀
            </button>
          </div>
        </div>

        {/* Highlights Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Metric 1: Safari Stars */}
          <div className="bg-white/90 rounded-[2.5rem] p-6 shadow-xl border-4 border-amber-300 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🌟</span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 shadow-sm">
                  Sound Gems
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-1">
                {totalStars} Stars
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Earned in Training Safari
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-amber-800">
              Keep practicing to collect more gems!
            </div>
          </div>

          {/* Metric 2: Completed Zones */}
          <div className="bg-white/90 rounded-[2.5rem] p-6 shadow-xl border-4 border-emerald-300 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🏆</span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 shadow-sm">
                  Safari Zones
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-1">
                {completedIds.length}
                <span className="text-lg font-bold text-slate-400"> / 5</span>
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Jungle Activities Conquered
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (completedIds.length / 5) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Metric 3: Current Focus */}
          <div className="bg-white/90 rounded-[2.5rem] p-6 shadow-xl border-4 border-teal-300 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🎯</span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100 text-teal-900 shadow-sm">
                  Focus Skill
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">
                {weakSkillFocus}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Leo's Targeted Practice
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-teal-700">
              Personalized speech coaching
            </div>
          </div>

          {/* Metric 4: Next Challenge */}
          <div className="bg-white/90 rounded-[2.5rem] p-6 shadow-xl border-4 border-purple-300 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🦁</span>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-900 shadow-sm">
                  Leo's Pick
                </span>
              </div>
              <h3 className="text-lg font-black text-purple-900 mb-1 truncate">
                {nextActivityTitle}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Recommended Next Step
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate(`/speech-processing/leo-training/${nextActivityId}`)}
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Start Mission 🚀
              </button>
            </div>
          </div>
        </div>

        {/* Longitudinal Progress Chart */}
        {chartData.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  Safari Progress & Accuracy Trend
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Pronunciation score progression across training sessions
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
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
                    labelFormatter={(lbl) => `Session Date: ${lbl}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#059669"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab Navigation for Detailed Reports */}
        <div className="flex items-center gap-3 mb-6 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-white/60 w-fit">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "sessions"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📜 Session History ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("words")}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "words"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔤 Words Practiced ({allWords.length})
          </button>
          <button
            onClick={() => setActiveTab("parent_guide")}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "parent_guide"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👨‍👩‍👧 Parent & Teacher Guide
          </button>
        </div>

        {/* TAB 1: Session History with Word Details */}
        {activeTab === "sessions" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <span>📜</span>
              <span>Training Safari Practice History</span>
            </h2>

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🦁</div>
                <h3 className="text-xl font-black text-slate-700 mb-2">
                  No Training Sessions Logged Yet
                </h3>
                <p className="text-slate-500 font-bold text-sm mb-6 max-w-sm mx-auto">
                  Start your first Training Safari session to collect stars and track your improvements here!
                </p>
                <button
                  onClick={() => navigate("/speech-processing/leo-training")}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Start Training Safari 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, sIdx) => {
                  const isExpanded = expandedSession === session._id;
                  const attemptsList = Array.isArray(session.attempts) ? session.attempts : [];
                  const sessionTitle =
                    typeof session.activityTitle === "object" && session.activityTitle !== null
                      ? session.activityTitle?.title || session.activityTitle?.shortTitle || "Safari Practice"
                      : typeof session.activityTitle === "string" && session.activityTitle
                      ? session.activityTitle
                      : session.activityId || "Safari Practice";

                  return (
                    <div
                      key={session._id || sIdx}
                      className="border-2 border-slate-100 rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center shrink-0">
                            #{sessions.length - sIdx}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-slate-800">
                                {sessionTitle}
                              </h4>
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Completed ✅
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {formatDate(session.createdAt || session.completedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <div className="flex text-amber-400 text-base justify-end">
                              {Array.from({ length: Number(session.starsEarned) || 3 }).map((_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              Score: {Number(session.score) || 85}%
                            </span>
                          </div>

                          {attemptsList.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedSession(isExpanded ? null : session._id)
                              }
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              {isExpanded ? "Hide Word Details ▲" : "View Word Details ▼"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Attempt Word History */}
                      {isExpanded && attemptsList.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Words Practiced in This Session:
                          </h5>
                          {attemptsList.map((att, aIdx) => {
                            const asr =
                              typeof att.recognizedText === "string" && att.recognizedText
                                ? att.recognizedText
                                : typeof att.wordReading?.asrText === "string"
                                ? att.wordReading.asrText
                                : typeof att.sentenceReading?.asrText === "string"
                                ? att.sentenceReading.asrText
                                : String(att.targetText || "");

                            const accuracy = att.accuracyScore || 85;
                            const isHigh = accuracy >= 85;

                            return (
                              <div
                                key={att._id || aIdx}
                                className="bg-slate-50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-slate-200/60"
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                      isHigh
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {accuracy}%
                                  </span>
                                  <span className="font-black text-slate-800 text-base">
                                    {String(att.targetText || "")}
                                  </span>
                                  <span className="text-slate-400">➜</span>
                                  <span className="text-slate-600 font-bold">
                                    Heard: "{asr}"
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {att.coachingTip ? (
                                    <span className="text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                                      🦁 {att.coachingTip}
                                    </span>
                                  ) : att.childFeedback ? (
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                                      🦁 {att.childFeedback}
                                    </span>
                                  ) : null}

                                  <button
                                    onClick={() => handleSpeakWord(att.targetText)}
                                    className="px-2.5 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300"
                                    title="Listen to Leo say this word"
                                  >
                                    <span>🔊</span>
                                    <span>Hear Leo</span>
                                  </button>

                                  {att.audioUrl && (
                                    <button
                                      onClick={() => handlePlayAudio(att.audioUrl, att._id)}
                                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                                        audioPlaying === att._id
                                          ? "bg-emerald-600 text-white animate-pulse"
                                          : "bg-white hover:bg-slate-200 text-slate-700 border"
                                      }`}
                                    >
                                      <span>{audioPlaying === att._id ? "⏸️" : "🎙️"}</span>
                                      <span>My Voice</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: All Words Practiced / Mastery Journey */}
        {activeTab === "words" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
            <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
              <span>🔤</span>
              <span>All Words Practiced on the Safari Trail</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-6">
              Track how your pronunciation improved word by word!
            </p>

            {allWords.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold">
                Play more safari games to see your word mastery list grow!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allWords.map((wItem, wIdx) => {
                  const growth = wItem.latestScore - wItem.initialScore;
                  const isMastered = wItem.mastered;

                  return (
                    <div
                      key={wIdx}
                      className={`p-5 rounded-2xl border-3 bg-white shadow-sm flex flex-col justify-between ${
                        isMastered ? "border-emerald-200" : "border-amber-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-black text-slate-800">
                              {wItem.word}
                            </h4>
                            <button
                              onClick={() => handleSpeakWord(wItem.word)}
                              className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm transition-colors cursor-pointer"
                              title="Listen to how this word sounds"
                            >
                              🔊
                            </button>
                          </div>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              isMastered
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isMastered ? "🏆 Mastered" : "🚀 Leveling Up"}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-500 space-y-1">
                          <div>Times Practiced: <span className="font-black text-slate-700">{wItem.attemptsCount}</span></div>
                          <div>Best Accuracy: <span className="font-black text-emerald-600">{wItem.bestScore}%</span></div>
                          <div>Latest Accuracy: <span className="font-black text-slate-800">{wItem.latestScore}%</span></div>
                        </div>
                      </div>

                      {growth > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-black text-emerald-600 flex items-center gap-1">
                          <span>📈</span>
                          <span>+{growth}% Accuracy Growth!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Parent & Teacher Guide */}
        {activeTab === "parent_guide" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
            <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
              <span>👨‍👩‍👧</span>
              <span>Parent & Teacher Coaching Guide</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-6">
              How to support this child's pronunciation at home and school
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
                <span className="text-3xl mb-2 block">🌟</span>
                <h4 className="text-lg font-black text-emerald-950 mb-2">
                  Key Strengths
                </h4>
                <ul className="text-xs font-bold text-emerald-800 space-y-2 list-disc list-inside">
                  <li>Shows high confidence speaking into the microphone.</li>
                  <li>Good initial consonant awareness on core CVC words.</li>
                  <li>Consistent participation across safari games.</li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <span className="text-3xl mb-2 block">🎯</span>
                <h4 className="text-lg font-black text-amber-950 mb-2">
                  Fun Home Activities
                </h4>
                <ul className="text-xs font-bold text-amber-800 space-y-2 list-disc list-inside">
                  <li>Play "Echo Roar" at the dinner table: repeat words with exaggerated end consonants.</li>
                  <li>Mirror Practice: Look in a mirror together to watch tongue and lip shapes.</li>
                  <li>Celebrate every sound gem earned in Leo's Training Safari!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Safari Zones Map Grid */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 sm:p-8 shadow-xl border-4 border-white mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span>🗺️</span>
            <span>Safari Trail Zones</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safariActivitiesList.map((act) => {
              const isCompleted = completedIds.includes(act.id);
              const isCurrent =
                reportData?.currentActivityId === act.id ||
                (!isCompleted && completedIds.length === 0 && act.id === "leo_first_sound_hunt");

              return (
                <div
                  key={act.id}
                  className={`rounded-[2rem] p-6 border-4 transition-all hover:-translate-y-1 ${act.color} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{act.icon}</span>
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-amber-500 text-white animate-pulse"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? "Completed 🏆" : isCurrent ? "Leo's Pick 🦁" : "Ready 🧭"}
                      </span>
                    </div>

                    <h3 className="text-xl font-black mb-1">{act.name}</h3>
                    <p className="text-xs font-bold opacity-75 mb-3">{act.category}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-black">
                      {isCompleted ? "⭐ Mastered" : "3 Stars Available"}
                    </span>
                    <button
                      onClick={() => navigate(`/speech-processing/leo-training/${act.id}`)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-white ${act.accent} hover:opacity-90 active:scale-95 shadow-md cursor-pointer`}
                    >
                      {isCompleted ? "Play Again" : "Play"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
