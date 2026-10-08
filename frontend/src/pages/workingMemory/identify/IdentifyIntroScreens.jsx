import React from "react";

const IDENTIFY_BG = "/images/workingMemory/identify/working-memory-identify-quiz-bg.jpeg";

const IntroShell = ({ gradeLabel, t, children, onBack }) => (
  <div
    className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-cover bg-center bg-no-repeat relative overflow-y-auto"
    style={{ backgroundImage: `url('${IDENTIFY_BG}')` }}
  >
    <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-[2px]" />
    <div className="relative z-10 w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-amber-800 shadow-md hover:bg-white"
        >
          ← {t("back_home")}
        </button>
        <span className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-md">
          {gradeLabel}
        </span>
      </div>
      {children}
    </div>
  </div>
);

export const WelcomeScreen = ({ gradeLabel, t, onTryDemo, onStartTest, onBack }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onBack={onBack}>
    <div
      data-testid="wm-identify-welcome"
      className="rounded-[2.5rem] border-4 border-white/50 bg-white/95 p-8 sm:p-10 text-center shadow-2xl animate-fadeIn"
    >
      <div className="mx-auto mb-4 text-6xl">🐰</div>
      <h1 className="text-3xl sm:text-4xl font-black text-amber-900 mb-3">{t("identify_welcome_title")}</h1>
      <p className="text-base sm:text-lg font-bold text-slate-600 leading-relaxed mb-6">{t("identify_welcome_subtitle")}</p>

      <div className="mb-8 rounded-2xl border-2 border-sky-200 bg-sky-50 px-5 py-4 text-left">
        <p className="flex items-start gap-2 text-sm sm:text-base font-bold text-sky-900">
          <span className="text-xl shrink-0">💡</span>
          {t("identify_try_demo_hint")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          data-testid="wm-identify-try-demo"
          onClick={onTryDemo}
          className="flex-1 rounded-2xl border-b-6 border-sky-700 bg-gradient-to-b from-sky-400 to-sky-600 px-6 py-4 text-lg font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          🎮 {t("identify_try_demo")}
        </button>
        <button
          type="button"
          data-testid="wm-identify-start-test"
          onClick={onStartTest}
          className="flex-1 rounded-2xl border-b-6 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-4 text-lg font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          ▶ {t("identify_start_test")}
        </button>
      </div>
    </div>
  </IntroShell>
);

const briefingItems = [
  { icon: "🔴🔵", key: "identify_briefing_pattern" },
  { icon: "🖼️", key: "identify_briefing_words" },
  { icon: "👂", key: "identify_briefing_instructions" },
  { icon: "🔢", key: "identify_briefing_numbers" },
];

export const BriefingScreen = ({ gradeLabel, t, onReady, onBack, onListen }) => (
  <IntroShell gradeLabel={gradeLabel} t={t} onBack={onBack}>
    <div
      data-testid="wm-identify-briefing"
      className="rounded-[2.5rem] border-4 border-white/50 bg-white/95 p-6 sm:p-9 shadow-2xl animate-fadeIn"
    >
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 text-5xl">🧠</div>
        <h1 className="text-3xl font-black text-amber-900">{t("identify_briefing_title")}</h1>
        <p className="mt-3 text-base font-bold text-slate-600 leading-relaxed">{t("identify_briefing_intro")}</p>
        <button
          type="button"
          onClick={onListen}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-800"
        >
          🔊 {t("identify_listen_briefing")}
        </button>
      </div>

      <p className="mb-4 text-center text-sm font-black uppercase tracking-wider text-amber-700">{t("identify_briefing_flow")}</p>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {briefingItems.map((item) => (
          <div key={item.key} className="flex items-center gap-3 rounded-2xl border-2 border-amber-100 bg-amber-50/80 px-4 py-3">
            <span className="text-2xl shrink-0">{item.icon}</span>
            <span className="text-sm font-bold text-amber-950 text-left">{t(item.key)}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="wm-identify-ready"
        onClick={onReady}
        className="w-full rounded-2xl border-b-6 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-4 text-xl font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
      >
        {t("identify_ready_button")}
      </button>
    </div>
  </IntroShell>
);

export const DemoCompleteScreen = ({ t, onStartReal, onTryAgain, onBackHome }) => (
  <div
    data-testid="wm-demo-finished"
    className="min-h-screen bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center p-6 font-sans"
  >
    <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] p-10 text-center">
      <div className="text-6xl mb-4">🎮✨</div>
      <h2 className="text-4xl font-black text-slate-800 mb-3">{t("identify_demo_complete_title")}</h2>
      <p className="text-lg font-bold text-slate-500 mb-8">{t("identify_demo_complete_msg")}</p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          data-testid="wm-identify-start-real-after-demo"
          onClick={onStartReal}
          className="w-full rounded-2xl border-b-6 border-emerald-700 bg-emerald-500 py-4 text-lg font-black uppercase text-white shadow-lg"
        >
          {t("identify_start_real_test")} ➔
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="w-full rounded-2xl border-b-6 border-sky-600 bg-sky-100 py-4 text-lg font-black uppercase text-sky-800"
        >
          {t("identify_try_demo_again")}
        </button>
        <button
          type="button"
          onClick={onBackHome}
          className="w-full rounded-2xl border-b-6 border-slate-300 bg-slate-100 py-4 text-lg font-black uppercase text-slate-600"
        >
          {t("identify_back_dashboard")}
        </button>
      </div>
    </div>
  </div>
);
