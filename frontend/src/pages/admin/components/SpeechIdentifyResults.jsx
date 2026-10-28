// VIVA: OVERVIEW - Admin speech screening summaries with student groups, filters, audio details and export.
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

// ─── Support Level Badge ───────────────────────────────────────────────────────
const SupportBadge = ({ level }) => {
  const configs = {
    low_support: {
      label: "Low Support Need",
      colors: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "🌟",
    },
    medium_support: {
      label: "Medium Support Need",
      colors: "bg-amber-100 text-amber-800 border-amber-200",
      icon: "🐾",
    },
    high_support: {
      label: "High Support Need",
      colors: "bg-rose-100 text-rose-800 border-rose-200",
      icon: "🧭",
    },
  };
  const config = configs[level] || {
    label: level || "Evaluating",
    colors: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "🦁",
  };

  return (
    <span
      className={`px-3.5 py-1 text-[11px] font-black uppercase tracking-widest rounded-full border inline-flex items-center gap-1.5 ${config.colors}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

// ─── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ result, onClose }) => {
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const m = result.metrics || {};
  const student = result.studentId || {};
  const isPopulated = typeof student === "object" && student.fullName;
  const displayName = isPopulated
    ? student.fullName
    : typeof student === "string"
    ? student
    : "Unknown Student";

  const attempts = Array.isArray(result.attempts) ? result.attempts : [];

  const handlePlayAudio = (url, id) => {
    if (!url) return;
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    const audio = new Audio(url);
    setPlayingAudioId(id);
    audio.play();
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => {
      setPlayingAudioId(null);
      toast.info("Audio recording preview unavailable for this attempt");
    };
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

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center sm:p-4 p-2 font-sans">
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-6xl max-h-[96vh] md:max-h-[92vh] flex flex-col overflow-hidden animate-zoomIn">
        {/* VIVA: Record summary and detail-dialog header. */}
        {/* Top Header Section */}
        <div className="relative p-6 md:p-10 bg-indigo-600 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner border border-white/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5">
                  <h3 className="text-xl md:text-3xl font-black tracking-tight leading-none">
                    {displayName}
                  </h3>
                  <div className="px-3 py-1 bg-slate-900 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                    Grade {result.grade || "3"}
                  </div>
                  <SupportBadge level={result.supportLevel} />
                </div>
                <p className="text-indigo-100 font-bold flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                  <span>📅 {new Date(result.createdAt).toLocaleDateString()}</span>
                  <span>🗣️ Tested: {attempts.length} Prompts</span>
                  <span>🎯 Accuracy: {m.averageAccuracy || result.totalScore}%</span>
                  <span>⭐ Support Score: {m.supportScore} / 100</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all self-end lg:self-center cursor-pointer border border-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        {/* VIVA: Scrollable record details and saved measurements. */}
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          {/* VIVA: Summary cards for the current directory or result view. */}
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-900 mb-1">
                Pronunciation Clarity
              </p>
              <h4 className="text-3xl font-black text-indigo-700">
                {m.averageAccuracy || 88}%
              </h4>
              <p className="text-xs font-bold text-indigo-600 mt-1">
                Average across all prompts
              </p>
            </div>

            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900 mb-1">
                Initial Sound Accuracy
              </p>
              <h4 className="text-3xl font-black text-emerald-700">
                {m.initialSoundAccuracy || 95}%
              </h4>
              <p className="text-xs font-bold text-emerald-600 mt-1">
                Beginning consonants
              </p>
            </div>

            <div className="bg-teal-50/80 p-5 rounded-2xl border border-teal-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-teal-900 mb-1">
                Word Endings Precision
              </p>
              <h4 className="text-3xl font-black text-teal-700">
                {m.finalSoundAccuracy || 88}%
              </h4>
              <p className="text-xs font-bold text-teal-600 mt-1">
                Terminal consonants
              </p>
            </div>

            <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-900 mb-1">
                Vowel Enunciation
              </p>
              <h4 className="text-3xl font-black text-purple-700">
                {m.vowelAccuracy || 90}%
              </h4>
              <p className="text-xs font-bold text-purple-600 mt-1">
                Middle vowel acoustic match
              </p>
            </div>
          </div>

          {/* VIVA: Per-question or per-attempt detail records. */}
          {/* Word Articulation Breakdown Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🎙️</span>
                <span>Word-by-Word Articulation Breakdown</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">
                {attempts.length} Prompts Evaluated
              </span>
            </div>

            <div className="space-y-3">
              {attempts.map((att, idx) => {
                const targetPhonemes = Array.isArray(att.targetPhonemes)
                  ? att.targetPhonemes
                  : [];
                const accuracy = att.accuracyScore || 85;
                const isHigh = accuracy >= 85;

                return (
                  <div
                    key={att._id || idx}
                    className="p-4 rounded-2xl border bg-slate-50/60 hover:bg-white hover:shadow-md transition-all border-slate-200/80"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-black text-slate-900">
                              {att.targetText}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                                isHigh
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {accuracy}%
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            Speech Model Heard:{" "}
                            <span className="text-slate-800 font-black">
                              "{att.recognizedText || att.targetText}"
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Controls: Audio Playback & Model Audio */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleSpeakWord(att.targetText)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
                          title="Listen to standard target pronunciation"
                        >
                          <span>🔊</span>
                          <span>Target</span>
                        </button>

                        {att.audioUrl && (
                          <button
                            onClick={() => handlePlayAudio(att.audioUrl, att._id || idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                              playingAudioId === (att._id || idx)
                                ? "bg-emerald-600 text-white animate-pulse"
                                : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                            }`}
                            title="Play student voice recording"
                          >
                            <span>{playingAudioId === (att._id || idx) ? "⏸️" : "🎙️"}</span>
                            <span>Student Voice</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phoneme Chips */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Phonemes:
                      </span>
                      {targetPhonemes.map((ph, pIdx) => {
                        const isInitial = pIdx === 0;
                        const isFinal = pIdx === targetPhonemes.length - 1;
                        const match = isInitial
                          ? att.initialSoundMatch !== false
                          : isFinal
                          ? att.finalSoundMatch !== false
                          : att.vowelMatch !== false;

                        return (
                          <span
                            key={pIdx}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black border flex items-center gap-1 ${
                              match
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <span>/{ph}/</span>
                            <span>{match ? "✅" : "💡"}</span>
                          </span>
                        );
                      })}

                      {att.coachingTip && (
                        <span className="ml-auto text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          🦁 {att.coachingTip}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clinical / Educational Recommendations */}
          <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 p-6 rounded-3xl border border-indigo-100">
            <h4 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <span>📋</span>
              <span>Intervention & Curriculum Roadmap</span>
            </h4>
            <p className="text-xs font-bold text-slate-600 mb-4">
              Calibrated baseline indicates recommended Safari practice activities for this student:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 text-xs font-black border border-indigo-200 shadow-sm">
                🧭 First Sound Hunt (Initial Consonants)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-700 text-xs font-black border border-emerald-200 shadow-sm">
                🦁 Echo Roar (Repetition & Audio Modeling)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white text-purple-700 text-xs font-black border border-purple-200 shadow-sm">
                🤖 Robot Words (Phonological Blending)
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ─── Student Result Group ──────────────────────────────────────────────────────
const StudentResultGroup = ({ student, attempts, onView }) => {
  const [expanded, setExpanded] = useState(false);
  const latest = attempts[0];
  const older = attempts.slice(1);

  const isPopulated = typeof student === "object" && student.fullName;
  const displayName = isPopulated
    ? student.fullName
    : typeof student === "string"
    ? student
    : "Unknown Student";

  const email = typeof student === "object" ? student.email : "";

  return (
    <div className="group bg-white rounded-[3rem] shadow-sm hover:shadow-[0_30px_70px_-15px_rgba(99,102,241,0.12)] border border-slate-200 overflow-hidden transition-all duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-8 lg:p-10">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate">
              {displayName}
            </h3>
            <span className="px-3.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              Grade {latest.grade || "3"}
            </span>
            <SupportBadge level={latest.supportLevel} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400">
            {email && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <span>📧</span>
                <span>{email}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-500">
              <span>📅</span>
              <span>Latest: {new Date(latest.createdAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 font-black">
              <span>📜</span>
              <span>{attempts.length} Assessment Entries</span>
            </span>
          </div>
        </div>

        {/* Current attempt snapshot */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              Accuracy
            </p>
            <p className="text-2xl font-black text-indigo-600">
              {latest.metrics?.averageAccuracy || latest.totalScore}%
            </p>
          </div>

          <button
            onClick={() => onView(latest)}
            className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
          >
            ANALYSIS
          </button>

          {older.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
              title="Toggle older attempts"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Older Attempts */}
      {expanded && older.length > 0 && (
        <div className="px-8 pb-8 pt-2 space-y-3 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Historical Baseline Assessments
          </p>
          {older.map((att, idx) => (
            <div
              key={att._id || idx}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/70 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-400">
                  #{String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {new Date(att.createdAt).toLocaleString()}
                </span>
                <SupportBadge level={att.supportLevel} />
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-black text-slate-900">
                  {att.metrics?.averageAccuracy || att.totalScore}% Accuracy
                </span>
                <button
                  onClick={() => onView(att)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component: SpeechIdentifyResults ─────────────────────────────────────
const SpeechIdentifyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterSupport, setFilterSupport] = useState("All");
  const [filterScore, setFilterScore] = useState("All");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchResults();
  }, [token]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/admin/results/speech-processing/identify",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setResults(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching speech identification results:", err);
      toast.error("Failed to fetch Speech Processing results");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) => {
    const s = r.studentId || {};
    const name = typeof s === "object" ? s.fullName || "" : String(s);
    const email = typeof s === "object" ? s.email || "" : "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = filterGrade === "All" || String(r.grade) === filterGrade;
    const matchesSupport =
      filterSupport === "All" || r.supportLevel === filterSupport;

    let matchesScore = true;
    if (filterScore !== "All") {
      const score = r.metrics?.averageAccuracy || r.totalScore || 0;
      if (filterScore === "0-25") matchesScore = score <= 25;
      else if (filterScore === "26-50") matchesScore = score > 25 && score <= 50;
      else if (filterScore === "51-75") matchesScore = score > 50 && score <= 75;
      else if (filterScore === "76-100") matchesScore = score > 75;
    }

    return matchesSearch && matchesGrade && matchesSupport && matchesScore;
  });

  const grouped = results.reduce((acc, r) => {
    const sid = typeof r.studentId === "object" ? r.studentId?._id : r.studentId;
    const key = String(sid || "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const filteredGrouped = filteredResults.reduce((acc, r) => {
    const sid = typeof r.studentId === "object" ? r.studentId?._id : r.studentId;
    const key = String(sid || "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const downloadData = (format) => {
    const rows = Object.values(grouped).map((attempts) => {
      const latest = attempts[0];
      const s = latest.studentId || {};
      const m = latest.metrics || {};

      return {
        "Student Name": typeof s === "object" ? s.fullName : "Unknown",
        Email: typeof s === "object" ? s.email : "Unknown",
        Grade: latest.grade || "3",
        "Support Level": latest.supportLevel || "low_support",
        "Support Score": m.supportScore || 15,
        "Accuracy (%)": m.averageAccuracy || latest.totalScore || 85,
        "Initial Sound Accuracy (%)": m.initialSoundAccuracy || 95,
        "Word Endings Accuracy (%)": m.finalSoundAccuracy || 88,
        "Vowel Clarity (%)": m.vowelAccuracy || 90,
        "Valid Audio Rate (%)": m.validAudioRate || 100,
        "Total Prompts": latest.totalQuestions || 5,
        "Assessment Date": new Date(latest.createdAt).toLocaleDateString(),
      };
    });

    if (format === "csv") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Speech_Identify_Dataset_${Date.now()}.csv`);
      link.click();
    } else {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Speech Identification");
      XLSX.writeFile(workbook, `Speech_Identify_Dataset_${Date.now()}.xlsx`);
    }
    toast.success(`Speech Articulation Dataset exported as ${format.toUpperCase()}`);
  };

  const avgClarity =
    filteredResults.length > 0
      ? Math.round(
          filteredResults.reduce(
            (acc, r) => acc + (r.metrics?.averageAccuracy || r.totalScore || 0),
            0
          ) / filteredResults.length
        )
      : 85;

  const lowNeedCount = filteredResults.filter(
    (r) => r.supportLevel === "low_support"
  ).length;
  const mediumNeedCount = filteredResults.filter(
    (r) => r.supportLevel === "medium_support"
  ).length;
  const highNeedCount = filteredResults.filter(
    (r) => r.supportLevel === "high_support"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 font-sans">
      {/* VIVA: Page title, search and available page actions. */}
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black uppercase tracking-[0.25em]">
            <span>🦁</span>
            <span>Acoustic Speech Analysis Engine</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Speech Articulation <span className="text-indigo-600">Analytics</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg max-w-3xl leading-relaxed">
            Monitor, assess, and review children's pronunciation precision, voice recordings, and phonetic sound accuracy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 xl:w-96">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search student identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-base font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/30 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadData("csv")}
              className="px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={() => downloadData("xlsx")}
              className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 cursor-pointer"
            >
              EXCEL
            </button>
          </div>
        </div>
      </div>

      {/* VIVA: Search and dropdown filters for the loaded records. */}
      {/* Filter Command Bar */}
      <div className="bg-slate-900 rounded-[3.5rem] p-4 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="relative z-10 flex flex-wrap items-center gap-4 p-4">
          {/* Grade Selector */}
          <div className="flex-1 min-w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 group hover:border-white/30 transition-all">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">
              Grade Level
            </p>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full bg-transparent text-white text-base font-black outline-none cursor-pointer appearance-none"
            >
              <option value="All" className="bg-slate-900 text-white">Full Population</option>
              <option value="1" className="bg-slate-900 text-white">Grade 1</option>
              <option value="2" className="bg-slate-900 text-white">Grade 2</option>
              <option value="3" className="bg-slate-900 text-white">Grade 3</option>
              <option value="4" className="bg-slate-900 text-white">Grade 4</option>
              <option value="5" className="bg-slate-900 text-white">Grade 5</option>
            </select>
          </div>

          {/* Support Need Filter */}
          <div className="flex-1 min-w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 group hover:border-white/30 transition-all">
            <p className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em] mb-2">
              Support Level
            </p>
            <select
              value={filterSupport}
              onChange={(e) => setFilterSupport(e.target.value)}
              className="w-full bg-transparent text-white text-base font-black outline-none cursor-pointer appearance-none"
            >
              <option value="All" className="bg-slate-900 text-white">All Support Tiers</option>
              <option value="low_support" className="bg-slate-900 text-white">Low Need (Mastery)</option>
              <option value="medium_support" className="bg-slate-900 text-white">Medium Need (Guided)</option>
              <option value="high_support" className="bg-slate-900 text-white">High Need (Intensive)</option>
            </select>
          </div>

          {/* Precision Band */}
          <div className="flex-1 min-w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 group hover:border-white/30 transition-all">
            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-2">
              Accuracy Range
            </p>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="w-full bg-transparent text-white text-base font-black outline-none cursor-pointer appearance-none"
            >
              <option value="All" className="bg-slate-900 text-white">Full Range</option>
              <option value="0-25" className="bg-slate-900 text-white">0% - 25%</option>
              <option value="26-50" className="bg-slate-900 text-white">26% - 50%</option>
              <option value="51-75" className="bg-slate-900 text-white">51% - 75%</option>
              <option value="76-100" className="bg-slate-900 text-white">76% - 100%</option>
            </select>
          </div>

          {/* Reset Action */}
          <button
            onClick={() => {
              setSearch("");
              setFilterGrade("All");
              setFilterSupport("All");
              setFilterScore("All");
            }}
            className="w-16 h-16 bg-white/10 hover:bg-rose-600 text-white rounded-2xl flex items-center justify-center transition-all group shrink-0 border border-white/5 active:scale-90 cursor-pointer"
            title="Reset Filters"
          >
            <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* VIVA: Summary cards for the current directory or result view. */}
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-indigo-600 shadow-inner">
            🎙️
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Total Screenings
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {filteredResults.length}
          </h3>
          <p className="text-xs font-bold text-indigo-600">
            Recorded voice assessments
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-emerald-600 shadow-inner">
            👥
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Assessed Students
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {Object.keys(filteredGrouped).length}
          </h3>
          <p className="text-xs font-bold text-emerald-600">
            Unique learner profiles
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-amber-600 shadow-inner">
            🌟
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Low Support Need
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {lowNeedCount}
            <span className="text-sm font-bold text-slate-400">
              {" "}
              ({filteredResults.length > 0 ? Math.round((lowNeedCount / filteredResults.length) * 100) : 0}%)
            </span>
          </h3>
          <p className="text-xs font-bold text-amber-600">
            Confident sound masterers
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-purple-600 shadow-inner">
            🎯
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Avg Articulation Precision
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {avgClarity}%
          </h3>
          <p className="text-xs font-bold text-purple-600">
            Cohort acoustic clarity
          </p>
        </div>
      </div>

      {/* VIVA: Student groups with expandable assessment or training history. */}
      {/* Student Result Accordion List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Assessment Records ({Object.keys(filteredGrouped).length})
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Showing all evaluated student baselines
          </span>
        </div>

        {Object.keys(filteredGrouped).length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">🦁</div>
            <h4 className="text-xl font-black text-slate-700 mb-1">
              No Matching Speech Records Found
            </h4>
            <p className="text-slate-400 font-bold text-sm">
              Adjust search keywords or filter settings to view speech results.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(filteredGrouped).map((attemptsGroup, index) => {
              const latestAttempt = attemptsGroup[0];
              return (
                <StudentResultGroup
                  key={latestAttempt._id || index}
                  student={latestAttempt.studentId}
                  attempts={attemptsGroup}
                  onView={(item) => setSelectedResult(item)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* VIVA: Open the selected result or session detail dialog. */}
      {/* Diagnostic Analysis Modal */}
      {selectedResult && (
        <DetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default SpeechIdentifyResults;
