import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getReadingPlan } from "../../services/readingProcessing/identifyApi";
import GameScreen from "./components/GameScreen";
import "./reading.css";

const LEVELS = [
  { id: "shapes", label: "Shapes", desc: "Identify basic shapes" },
  { id: "letters", label: "Letters", desc: "Recognise individual letters" },
  { id: "words", label: "Words", desc: "Read simple words" },
  { id: "sentences", label: "Sentences", desc: "Read full sentences" },
];

export default function ReadingPlay() {
  const { mode } = useParams();
  const nav = useNavigate();
  const [plan, setPlan] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(true);

  if (mode !== "identification" && mode !== "improvement") {
    return <Navigate to="/reading-processing" replace />;
  }

  const reportPath = mode === "improvement" ? "/reports/rp/improvement" : "/reports/rp/identification";
  const title = mode === "improvement" ? "Practice" : "Screening";

  function loadLevel(level, difficulty = 1) {
    setPicking(false);
    setError("");
    const params = level ? [mode, level, difficulty] : [mode];
    getReadingPlan(...params)
      .then(({ data }) => setPlan({ ...data, level: level || data.level }))
      .catch((err) => setError(err.response?.data?.message || "Could not load level"));
  }

  let body;
  if (error) {
    body = (
      <div className="container stack">
        <div className="card error">{error}</div>
        <button onClick={() => { setError(""); setPicking(true); }}>Back to levels</button>
      </div>
    );
  } else if (picking) {
    body = (
      <div className="container stack">
        <div className="card stack">
          <h1>{title}</h1>
          <p className="muted">
            {mode === "improvement"
              ? "Continue from your last practice level, or pick one yourself."
              : "Start a screening session. Pick a level, or continue where this screening left off."}
          </p>
        </div>
        <div className="grid cols-2">
          {LEVELS.map((level) => (
            <button key={level.id} className="card stack" onClick={() => loadLevel(level.id)} style={{ cursor: "pointer", textAlign: "left" }}>
              <h2 style={{ margin: 0 }}>{level.label}</h2>
              <span className="muted">{level.desc}</span>
            </button>
          ))}
        </div>
        <button className="ghost" onClick={() => loadLevel()}>Continue where I left off</button>
      </div>
    );
  } else if (!plan) {
    body = <div className="container"><div className="card">Loading level…</div></div>;
  } else if (result) {
    const score = result.result;
    body = (
      <div className="container stack">
        <div className="card stack">
          <h1>Nice work</h1>
          <p>You got <strong>{score.correct}</strong> out of <strong>{score.total}</strong> right.</p>
          {score.brainSpeed && <p>Brain speed: <span className="badge">{score.brainSpeed}</span></p>}
          {score.promoted && <p className="badge good">Level up. Next: {result.next.level}</p>}
          <div className="row">
            <button onClick={() => { setResult(null); setPlan(null); setPicking(true); }}>Play again</button>
            <Link to={reportPath}><button className="ghost">See report</button></Link>
            <button className="ghost" onClick={() => nav("/dashboard")}>Home</button>
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <GameScreen
        mode={mode}
        level={plan.level}
        difficulty={plan.difficulty}
        targets={plan.targets}
        onFinish={(data) => (data ? setResult(data) : nav("/reading-processing"))}
      />
    );
  }

  return <div className="reading-friend">{body}</div>;
}
