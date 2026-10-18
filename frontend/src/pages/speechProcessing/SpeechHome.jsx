import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMySpeechAssignments } from "../../services/speechProcessing/api";
import SpeechDemoGame from "./SpeechDemoGame";
import { SpeechDemoIllustration } from "./components/LeoAssetFallback";

const games = [
  ["Echo Parrot", "Listen and repeat", "bg-sky-50 text-sky-700"],
  ["Treasure Word Read", "Read the word aloud", "bg-yellow-50 text-yellow-700"],
  ["Robot Nonword Challenge", "Read funny robot words", "bg-violet-50 text-violet-700"],
  ["Minimal Pair Castle", "Practice similar sounds", "bg-rose-50 text-rose-700"],
  ["Story Star Reading", "Read a short sentence", "bg-emerald-50 text-emerald-700"],
];

function SpeechHome() {
  const navigate = useNavigate();
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [demoStarted, setDemoStarted] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await getMySpeechAssignments();
        setAssignments(response.data?.data || []);
      } catch {
        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, []);

  if (activeAssignment || demoStarted) {
    return (
      <SpeechDemoGame
        assignment={activeAssignment}
        onExit={() => {
          setActiveAssignment(null);
          setDemoStarted(false);
        }}
      />
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
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full border-3 border-[#6b4122] bg-[#a86532] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#8f5224]"
        >
          Back to Dashboard
        </button>

        <section className="grid items-center gap-8 rounded-[2.5rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-8 shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#2e1910] sm:text-6xl">
              Sound Adventure
            </h1>
            <p className="mt-4 text-2xl font-black text-[#7c2d12]">
              Listen, read, speak and collect stars
            </p>
            <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-[#786154] sm:text-lg">
              You will say English sounds and words. Your guardian can see your progress.
            </p>
            <button
              onClick={() => setDemoStarted(true)}
              className="mt-6 rounded-full border-3 border-[#6b4122] bg-[#a86532] px-8 py-4 text-lg font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#8f5224]"
            >
              Start Demo
            </button>
          </div>

          <div className="rounded-[2rem] border-2 border-[#ecdac2] bg-[#fbf7ed] p-4 shadow-inner">
            <SpeechDemoIllustration className="aspect-[4/3] w-full rounded-[1.5rem]" alt="Sound Adventure game world" />
          </div>
        </section>

        {!loadingAssignments && assignments.length > 0 && (
          <section className="mt-8 rounded-[2rem] border-3 border-[#6e3c1b] bg-[#fffdf7] p-6 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#786154]">
                  Today's Guardian Activity
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#2e1910] sm:text-3xl">
                  {assignments[0].title || "Teacher Activity"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-bold text-[#786154]">
                  {assignments[0].description ||
                    "Your guardian selected a short sound and reading activity."}
                </p>
              </div>
              <button
                onClick={() => setActiveAssignment(assignments[0])}
                className="rounded-full border-3 border-[#6b4122] bg-[#a86532] px-6 py-4 text-sm font-black text-white transition hover:bg-[#8f5224]"
              >
                Start Guardian Activity
              </button>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {games.map(([name, description, color]) => (
            <article
              key={name}
              className="rounded-[2rem] border-2 border-[#ecdac2] bg-[#fffdf7] p-5 shadow-md transition hover:-translate-y-1"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
              >
                <span className="h-3 w-3 rounded-full bg-current" />
              </div>
              <h2 className="text-lg font-black text-[#2e1910]">{name}</h2>
              <p className="mt-2 text-sm font-bold text-[#786154]">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default SpeechHome;
