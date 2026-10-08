import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStudentProgress, getAttemptHistory } from "../../../services/phonologicalAwareness/improveApi";
import { getStudentProfile } from "../../../services/student/api";

export default function PhonologicalImprovementReport() {
  const navigate = useNavigate();
  const { t } = useTranslation(["pa", "common"]);

  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      let activeStudentId = studentId;
      const profileRes = await getStudentProfile();
      if (profileRes?.data) {
        setProfile(profileRes.data);
        if (!activeStudentId) activeStudentId = profileRes.data._id;
      }

      if (activeStudentId) {
        const [progRes, historyRes] = await Promise.all([
          getStudentProgress(activeStudentId),
          getAttemptHistory(activeStudentId),
        ]);

        if (progRes?.success) setProgress(progRes.data);
        if (historyRes?.success) setAttempts(historyRes.data || []);
      }
    } catch (err) {
      console.error("Error loading improvement report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Prepare data points for progress chart
  const chartData = attempts
    .map((att, idx) => ({
      name: `Attempt ${idx + 1}`,
      level: `Lvl ${att.levelNumber}`,
      score: Math.round((att.score / (att.totalQuestions || 1)) * 100),
      time: att.totalTimeTaken || 0,
      date: new Date(att.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))
    .reverse();

  // Helper to format subcategory labels
  const getSubCatName = (key) => {
    const names = {
      phonological_awareness: "Phonological Awareness",
      visual_processing: "Visual Processing",
      orthographic_skills: "Orthographic Skills",
      segmentation_counting: "Segmentation & Counting",
    };
    return names[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-8 border-white border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-pink-600 font-black text-2xl animate-pulse">
          {t("gathering_stars")}
        </p>
      </div>
    );
  }

  const maxLevel = progress?.maxUnlockedLevel || 1;
  const initialLevel = progress?.initialIdentifiedLevel || 1;
  const totalMastered = progress?.levelsProgress
    ? progress.levelsProgress.reduce(
        (acc, lvl) => acc + lvl.subCategories.filter((sc) => sc.isCompleted).length,
        0
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-indigo-100 to-emerald-50 p-4 md:p-8 font-sans select-none relative overflow-x-hidden">
      {/* 🏠 Top Bar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 z-10 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/reports/pa")}
            className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 hover:scale-105 transition-all border-b-4 border-slate-200 font-black text-2xl cursor-pointer"
          >
            ←
          </button>
          <div>
            <span className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest border border-pink-200">
              Phonological Awareness
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              Improvement Progress Report 📈
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white hover:bg-indigo-50 text-indigo-600 font-black px-6 py-2.5 rounded-full shadow-lg border-2 border-white transition-all uppercase tracking-wider text-sm cursor-pointer"
        >
          {t("common:dashboard")} 🏠
        </button>
      </header>

      <main className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* 🌟 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-b-8 border-indigo-400 flex flex-col justify-between">
            <span className="text-4xl mb-2">🏆</span>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Current Max Level</p>
              <h3 className="text-4xl font-black text-indigo-600">Level {maxLevel}</h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-b-8 border-amber-400 flex flex-col justify-between">
            <span className="text-4xl mb-2">🎯</span>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Placement Level</p>
              <h3 className="text-4xl font-black text-amber-600">Level {initialLevel}</h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-b-8 border-emerald-400 flex flex-col justify-between">
            <span className="text-4xl mb-2">🌟</span>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Sub-Categories Mastered</p>
              <h3 className="text-4xl font-black text-emerald-600">{totalMastered} / 16</h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-b-8 border-pink-400 flex flex-col justify-between">
            <span className="text-4xl mb-2">📝</span>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Practice Attempts</p>
              <h3 className="text-4xl font-black text-pink-600">{attempts.length}</h3>
            </div>
          </div>
        </div>

        {/* 📊 Score Trend Chart */}
        {chartData.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-slate-200">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Score Growth Trend 📈</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">Percentage score across historical practice attempts</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    contentStyle={{ borderRadius: "1rem", backgroundColor: "#1e293b", color: "#fff", border: "none" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 🗺️ Level-by-Level Breakdown */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-slate-200">
          <h3 className="text-2xl font-black text-slate-800 mb-6">Level Completion Details</h3>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((lvlNum) => {
              const lvlProg = progress?.levelsProgress?.find((l) => l.levelNumber === lvlNum);
              const isUnlocked = lvlNum <= maxLevel;
              const isCompleted = lvlProg?.isCompleted || false;

              return (
                <div
                  key={lvlNum}
                  className={`p-6 rounded-3xl border-4 ${
                    isCompleted
                      ? "bg-emerald-50 border-emerald-300"
                      : isUnlocked
                      ? "bg-sky-50 border-sky-300"
                      : "bg-gray-100 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{isCompleted ? "🏆" : isUnlocked ? "🔓" : "🔒"}</span>
                      <div>
                        <h4 className="text-xl font-black text-slate-800">Level {lvlNum}</h4>
                        <p className="text-xs font-bold text-slate-500">
                          {isCompleted
                            ? "Completed All Sub-Categories!"
                            : isUnlocked
                            ? "Unlocked & In Progress"
                            : "Locked"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-categories grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {["phonological_awareness", "visual_processing", "orthographic_skills", "segmentation_counting"].map((scKey) => {
                      const subCat = lvlProg?.subCategories?.find((s) => s.subCategoryKey === scKey);
                      const subUnlocked = subCat?.isUnlocked || false;
                      const subDone = subCat?.isCompleted || false;

                      return (
                        <div
                          key={scKey}
                          className={`p-4 rounded-2xl border-2 ${
                            subDone
                              ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                              : subUnlocked
                              ? "bg-white border-sky-300 text-slate-800"
                              : "bg-gray-200 border-gray-300 text-gray-500"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-xs uppercase">{getSubCatName(scKey)}</span>
                            {subDone ? "✓" : subUnlocked ? "●" : "🔒"}
                          </div>
                          <p className="text-xs font-bold mt-1">
                            {subDone
                              ? `Best Score: ${subCat?.bestScore || 0}`
                              : subUnlocked
                              ? "Attempts: " + (subCat?.totalAttempts || 0)
                              : "Locked"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📜 Detailed Attempt Logs Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-slate-200">
          <h3 className="text-2xl font-black text-slate-800 mb-6">Historical Attempt Log 📜</h3>

          {attempts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-bold">
              No attempt records found yet. Complete a practice activity to see detailed logs here!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-400 text-xs uppercase font-black tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Sub-Category</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-sm text-slate-700">
                  {attempts.map((att) => {
                    const percentage = Math.round((att.score / (att.totalQuestions || 1)) * 100);
                    return (
                      <tr key={att._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">{formatDate(att.createdAt)}</td>
                        <td className="py-4 px-4">Level {att.levelNumber}</td>
                        <td className="py-4 px-4">{getSubCatName(att.subCategoryKey)}</td>
                        <td className="py-4 px-4 text-center">
                          {att.score} / {att.totalQuestions} ({percentage}%)
                        </td>
                        <td className="py-4 px-4 text-center">{att.totalTimeTaken || 0}s</td>
                        <td className="py-4 px-4 text-center">
                          {att.isPassed ? (
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black">
                              PASSED ✓
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black">
                              PRACTICE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
