import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getReadingPlan } from "../../services/readingProcessing/identifyApi";
import GameScreen from "./components/GameScreen";
import { MemoryStage, MemoryNav, MemoryBoard, MemoryButton, MemoryBunny } from "../workingMemory/shared/GameLayout";
import { SCREENING_ART } from "../workingMemory/config/levelThemes";
import "../workingMemory/styles/popupMap.css";
import "./reading.css";

const LEVELS = [
  { id: "shapes", label: "Shapes", desc: "Find the matching shape", accent: "#E07B1F", dark: "#B5560B" },
  { id: "letters", label: "Letters", desc: "Find the same letter", accent: "#5BA35A", dark: "#3A7A39" },
  { id: "words", label: "Words", desc: "Read a simple word", accent: "#E77FA6", dark: "#B23C6C" },
  { id: "sentences", label: "Sentences", desc: "Read a full sentence", accent: "#8A6BC9", dark: "#5E3FA3" },
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
  const mapTitle = mode === "improvement" ? "READING PRACTICE" : "READING SCREENING";

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
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title={title} onBack={() => { setError(""); setPicking(true); }} controls={false} />
        <MemoryBoard className="rf-pick-board">
          <div className="rf-eye-copy">
            <h1>Could not start</h1>
            <p>{error}</p>
            <MemoryButton onClick={() => { setError(""); setPicking(true); }}>Back to levels</MemoryButton>
          </div>
        </MemoryBoard>
      </MemoryStage>
    );
  } else if (picking) {
    body = (
      <MemoryStage level={2} className="lx-map lx-adventure-map rf-level-map" background="/images/workingMemory/shared/backgrounds/level-map/map-background.webp">
        <MemoryNav title={title} onBack={() => nav("/dashboard")} map controls={false} />
        <h1 className="lx-adventure-heading">{mapTitle}</h1>
        <h2 className="lx-adventure-subtitle">Choose a level</h2>
        <div className="lx-level-cards">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              className="lx-level-card"
              style={{ "--card-accent": level.accent, "--card-dark": level.dark }}
              onClick={() => loadLevel(level.id)}
            >
              <h2>{level.label}</h2>
              <p>{level.desc}</p>
              <span className="lx-level-cta">Play</span>
            </button>
          ))}
        </div>
        <div className="lx-map-notice">
          <MemoryButton onClick={() => loadLevel()}>Continue</MemoryButton>
        </div>
      </MemoryStage>
    );
  } else if (!plan) {
    body = (
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title={title} onBack={() => setPicking(true)} controls={false} />
        <MemoryBoard className="rf-pick-board">
          <div className="rf-eye-copy"><h1>Loading</h1><p>Getting your level ready.</p></div>
        </MemoryBoard>
      </MemoryStage>
    );
  } else if (result) {
    const score = result.result;
    body = (
      <MemoryStage level={1} background={SCREENING_ART.background}>
        <MemoryNav title={title} onBack={() => nav("/dashboard")} controls={false} />
        <MemoryBoard className="rf-pick-board">
          <div className="rf-eye-copy">
            <h1>Nice work</h1>
            <p>You got {score.correct} out of {score.total} right.</p>
            {score.brainSpeed && <p>Brain speed: {score.brainSpeed}</p>}
            {score.promoted && <p>Level up. Next: {result.next.level}</p>}
            <div className="rf-eye-actions">
              <MemoryButton onClick={() => { setResult(null); setPlan(null); setPicking(true); }}>Play again</MemoryButton>
              <MemoryButton onClick={() => nav(reportPath)}>See report</MemoryButton>
              <MemoryButton onClick={() => nav("/dashboard")}>Home</MemoryButton>
            </div>
          </div>
        </MemoryBoard>
        <MemoryBunny message="Great job!" />
      </MemoryStage>
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
