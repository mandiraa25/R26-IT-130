// VIVA: OVERVIEW - Admin speech training sessions with activity filters, attempt details, audio and export.
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

// ─── Session Detail Modal ──────────────────────────────────────────────────────
const SessionModal = ({ session, onClose }) => {
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const student = session.studentId || {};
  const isPopulated = typeof student === "object" && student.fullName;
  const displayName = isPopulated
    ? student.fullName
    : typeof student === "string"
    ? student
    : "Unknown Student";

  const attempts = Array.isArray(session.attempts) ? session.attempts : [];

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
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-5xl max-h-[96vh] md:max-h-[92vh] flex flex-col overflow-hidden animate-zoomIn">
        {/* VIVA: Record summary and detail-dialog header. */}
        {/* Modal Header */}
        <div className="relative p-6 md:p-10 bg-emerald-600 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner border border-white/20">
                {session.activityIcon || "🦁"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5">
                  <h3 className="text-xl md:text-3xl font-black tracking-tight leading-none">
                    {session.activityName || "Safari Session"}
                  </h3>
                  <div className="px-3 py-1 bg-slate-900 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                    Grade {session.grade || "3"}
                  </div>
                </div>
                <p className="text-emerald-100 font-bold flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                  <span>Student: {displayName}</span>
                  <span>📅 {new Date(session.createdAt).toLocaleDateString()}</span>
                  <span>⭐ {session.starsEarned || 3} Stars</span>
                  <span>🎯 Score: {session.score}%</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all self-end sm:self-center cursor-pointer border border-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        {/* VIVA: Scrollable record details and saved measurements. */}
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar">
          {/* Skill Focus Pill */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                Target Skill Focus
              </p>
              <p className="text-sm font-bold text-emerald-700">
                {session.skillFocus || "Linguistic sound repetition and enunciation clarity"}
              </p>
            </div>
          </div>

          {/* VIVA: Per-question or per-attempt detail records. */}
          {/* Attempts List */}
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <span>🎙️</span>
              <span>Session Word Attempts ({attempts.length})</span>
            </h4>

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
                    className="p-4 rounded-2xl border bg-slate-50/70 hover:bg-white hover:shadow-md transition-all border-slate-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
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

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleSpeakWord(att.targetText)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
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
                          >
                            <span>{playingAudioId === (att._id || idx) ? "⏸️" : "🎙️"}</span>
                            <span>Student Voice</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phoneme Chips */}
                    {targetPhonemes.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Phonemes:
                        </span>
                        {targetPhonemes.map((ph, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            /{ph}/
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Student Training Group Card ───────────────────────────────────────────────
const StudentTrainingGroup = ({ student, sessions, onViewSession }) => {
  const [expanded, setExpanded] = useState(false);
  const isPopulated = typeof student === "object" && student.fullName;
  const displayName = isPopulated
    ? student.fullName
    : typeof student === "string"
    ? student
    : "Unknown Student";

  const email = typeof student === "object" ? student.email : "";
  const totalStars = sessions.reduce((acc, s) => acc + (s.starsEarned || 0), 0);
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 85), 0) / sessions.length)
      : 85;

  const uniqueActivities = Array.from(new Set(sessions.map((s) => s.activityId))).length;

  return (
    <div className="group bg-white rounded-[3rem] shadow-sm hover:shadow-[0_30px_70px_-15px_rgba(16,185,129,0.12)] border border-slate-200 overflow-hidden transition-all duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-8 lg:p-10">
        <div className="w-20 h-20 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate">
              {displayName}
            </h3>
            <span className="px-3.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              Grade {sessions[0]?.grade || "3"}
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black inline-flex items-center gap-1">
              <span>⭐</span>
              <span>{totalStars} Safari Stars</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400">
            {email && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <span>📧</span>
                <span>{email}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-500">
              <span>🌴</span>
              <span>{uniqueActivities} Safari Zones Explored</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-black">
              <span>📜</span>
              <span>{sessions.length} Completed Sessions</span>
            </span>
          </div>
        </div>

        {/* VIVA: Summary cards for the current directory or result view. */}
        {/* Aggregate Stats */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              Avg Mastery
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {avgScore}%
            </p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span>{expanded ? "HIDE SESSIONS" : "VIEW SESSIONS"}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Sessions List */}
      {expanded && (
        <div className="px-8 pb-8 pt-2 space-y-3 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Safari Training Practice Logs
          </p>
          {sessions.map((s, idx) => (
            <div
              key={s._id || idx}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{s.activityIcon || "🦁"}</span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {s.activityName}
                  </h4>
                  <p className="text-xs font-bold text-slate-400">
                    {new Date(s.createdAt).toLocaleString()} · {s.skillFocus}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                  <span>⭐</span>
                  <span>{s.starsEarned || 1}</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {s.score}%
                </span>
                <button
                  onClick={() => onViewSession(s)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component: SpeechImproveResults ──────────────────────────────────────
const SpeechImproveResults = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterActivity, setFilterActivity] = useState("All");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchResults();
  }, [token]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/admin/results/speech-processing/improve",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setSessions(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching speech improvement results:", err);
      toast.error("Failed to fetch Speech Improvement results");
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const student = s.studentId || {};
    const name = typeof student === "object" ? student.fullName || "" : String(student);
    const email = typeof student === "object" ? student.email || "" : "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = filterGrade === "All" || String(s.grade) === filterGrade;
    const matchesActivity =
      filterActivity === "All" || s.activityId === filterActivity;

    return matchesSearch && matchesGrade && matchesActivity;
  });

  const grouped = filteredSessions.reduce((acc, s) => {
    const sid = typeof s.studentId === "object" ? s.studentId?._id : s.studentId;
    const key = String(sid || "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const downloadData = (format) => {
    const rows = filteredSessions.map((s) => {
      const student = s.studentId || {};
      return {
        "Student Name": typeof student === "object" ? student.fullName : "Unknown",
        Email: typeof student === "object" ? student.email : "Unknown",
        Grade: s.grade || "3",
        Activity: s.activityName,
        "Skill Focus": s.skillFocus,
        "Score (%)": s.score,
        "Stars Earned": s.starsEarned,
        "Total Word Attempts": s.totalAttempts,
        Date: new Date(s.createdAt).toLocaleDateString(),
      };
    });

    if (format === "csv") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Speech_Improvement_Dataset_${Date.now()}.csv`);
      link.click();
    } else {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Speech Improvement");
      XLSX.writeFile(workbook, `Speech_Improvement_Dataset_${Date.now()}.xlsx`);
    }
    toast.success(`Improvement Dataset exported as ${format.toUpperCase()}`);
  };

  const totalStars = filteredSessions.reduce(
    (acc, s) => acc + (s.starsEarned || 0),
    0
  );
  const avgScore =
    filteredSessions.length > 0
      ? Math.round(
          filteredSessions.reduce((acc, s) => acc + (s.score || 85), 0) /
            filteredSessions.length
        )
      : 85;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 font-sans">
      {/* VIVA: Page title, search and available page actions. */}
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-[0.25em]">
            <span>🌴</span>
            <span>Longitudinal Articulation Training</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Speech Improvement <span className="text-emerald-600">Analytics</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg max-w-3xl leading-relaxed">
            Track student training progression across Safari zones, earned star milestones, and acoustic mastery growth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 xl:w-96">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search student identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-base font-black focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-xl shadow-slate-200/30 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadData("csv")}
              className="px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={() => downloadData("xlsx")}
              className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 cursor-pointer"
            >
              EXCEL
            </button>
          </div>
        </div>
      </div>

      {/* VIVA: Search and dropdown filters for the loaded records. */}
      {/* Filter Command Bar */}
      <div className="bg-slate-900 rounded-[3.5rem] p-4 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-wrap items-center gap-4 p-4">
          {/* Grade Selector */}
          <div className="flex-1 min-w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 group hover:border-white/30 transition-all">
            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-2">
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

          {/* Activity Zone Filter */}
          <div className="flex-1 min-w-[220px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 group hover:border-white/30 transition-all">
            <p className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em] mb-2">
              Safari Zone / Activity
            </p>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full bg-transparent text-white text-base font-black outline-none cursor-pointer appearance-none"
            >
              <option value="All" className="bg-slate-900 text-white">All Safari Zones</option>
              <option value="leo_first_sound_hunt" className="bg-slate-900 text-white">🧭 First Sound Hunt</option>
              <option value="leo_echo_roar" className="bg-slate-900 text-white">🦁 Echo Roar</option>
              <option value="leo_story_roar" className="bg-slate-900 text-white">📖 Story Roar Trail</option>
              <option value="leo_robot_words" className="bg-slate-900 text-white">🤖 Robot Words</option>
              <option value="leo_sound_twins" className="bg-slate-900 text-white">👯 Sound Twins</option>
            </select>
          </div>

          {/* Reset Action */}
          <button
            onClick={() => {
              setSearch("");
              setFilterGrade("All");
              setFilterActivity("All");
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
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-emerald-600 shadow-inner">
            🌴
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Training Sessions
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {filteredSessions.length}
          </h3>
          <p className="text-xs font-bold text-emerald-600">
            Total completed missions
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-indigo-600 shadow-inner">
            👥
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Active Adventurers
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {Object.keys(grouped).length}
          </h3>
          <p className="text-xs font-bold text-indigo-600">
            Students training in Safari
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-amber-600 shadow-inner">
            ⭐
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Safari Stars Earned
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {totalStars}
          </h3>
          <p className="text-xs font-bold text-amber-600">
            Across all training games
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-teal-600 shadow-inner">
            📈
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Average Score
          </p>
          <h3 className="text-4xl font-black text-slate-900 mb-1">
            {avgScore}%
          </h3>
          <p className="text-xs font-bold text-teal-600">
            Cohort pronunciation score
          </p>
        </div>
      </div>

      {/* VIVA: Student groups with expandable assessment or training history. */}
      {/* Student Training Accordion List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Training Profiles ({Object.keys(grouped).length})
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Longitudinal Safari improvement records
          </span>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">🦁</div>
            <h4 className="text-xl font-black text-slate-700 mb-1">
              No Matching Training Logs Found
            </h4>
            <p className="text-slate-400 font-bold text-sm">
              Adjust search keywords or filters to display training sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(grouped).map((sessionsGroup, index) => {
              const firstSession = sessionsGroup[0];
              return (
                <StudentTrainingGroup
                  key={firstSession._id || index}
                  student={firstSession.studentId}
                  sessions={sessionsGroup}
                  onViewSession={(s) => setSelectedSession(s)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* VIVA: Open the selected result or session detail dialog. */}
      {/* Session Modal */}
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default SpeechImproveResults;
