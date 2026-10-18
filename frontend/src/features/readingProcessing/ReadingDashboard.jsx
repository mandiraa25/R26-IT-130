import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Heatmap from "./components/Heatmap";

const SPEED_NUM = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const SPEED_LABEL = { LOW: "Slow", MEDIUM: "Moderate", HIGH: "Fast" };
const SPEED_COLOR = { LOW: "#ff6b8a", MEDIUM: "#ffd84d", HIGH: "#6cf2a8" };

const ACTION_LABELS = {
  HIGHLIGHT_LETTERS: "Highlighted letters",
  SPLIT_WORD: "Split word into parts",
  SIMPLIFY_UI: "Simplified the screen",
  ATTENTION_PROMPT: "Attention prompt",
  PLAY_AUDIO: "Played audio help",
  DIFFICULTY_DOWN: "Lowered difficulty",
  DIFFICULTY_UP: "Raised difficulty",
};

export default function ReadingDashboard({ data }) {
  const trend = (data.brainSpeedTrend || []).map((point) => ({
    at: new Date(point.at).toLocaleDateString(),
    speed: SPEED_NUM[point.brainSpeed] || 0,
    level: point.level,
  }));
  const latestResult = data.results?.[0];
  const totalSessions = data.results?.length || 0;
  const avgScore = totalSessions
    ? Math.round(data.results.reduce((sum, result) => sum + (result.total ? result.correct / result.total : 0), 0) / totalSessions * 100)
    : 0;

  return (
    <div className="container stack">
      <div className="grid cols-3">
        <div className="card stack" style={{ textAlign: "center" }}>
          <span className="muted">Sessions played</span>
          <h1 style={{ margin: 0, fontSize: "2.5rem" }}>{totalSessions}</h1>
        </div>
        <div className="card stack" style={{ textAlign: "center" }}>
          <span className="muted">Average accuracy</span>
          <h1 style={{ margin: 0, fontSize: "2.5rem", color: avgScore >= 70 ? "var(--rf-good)" : avgScore >= 40 ? "var(--rf-accent)" : "var(--rf-bad)" }}>{avgScore}%</h1>
        </div>
        <div className="card stack" style={{ textAlign: "center" }}>
          <span className="muted">Latest processing speed</span>
          {latestResult?.brainSpeed ? (
            <h1 style={{ margin: 0, fontSize: "2rem", color: SPEED_COLOR[latestResult.brainSpeed] }}>{SPEED_LABEL[latestResult.brainSpeed]}</h1>
          ) : <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--rf-ink-soft)" }}>—</h1>}
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card stack">
          <h2>Processing speed over time</h2>
          <p className="note">How quickly the student recognises and responds. Faster sits higher on the chart.</p>
          {trend.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid stroke="#2c3666" strokeDasharray="3 3" />
                <XAxis dataKey="at" stroke="#c0c8e8" fontSize={11} />
                <YAxis domain={[0, 3]} ticks={[1, 2, 3]} stroke="#c0c8e8" tickFormatter={(value) => ({ 1: "Slow", 2: "Mid", 3: "Fast" }[value] || "")} />
                <Tooltip
                  contentStyle={{ background: "#1a2347", border: 0, borderRadius: 12, color: "#f5f7ff" }}
                  formatter={(value) => [{ 1: "Slow", 2: "Moderate", 3: "Fast" }[value] || "—", "Speed"]}
                />
                <Line type="monotone" dataKey="speed" stroke="#ffd84d" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>Play a session to see the trend.</div>}
        </div>

        <div className="card stack">
          <h2>Real-time help given</h2>
          <p className="note">Help the system offered when it noticed struggle.</p>
          {data.actionDensity?.length ? (
            <div className="stack" style={{ gap: "0.5rem" }}>
              {data.actionDensity.map((action) => (
                <div key={action.action} className="row" style={{ justifyContent: "space-between" }}>
                  <span>{ACTION_LABELS[action.action] || action.action}</span>
                  <span className="badge">{action.count}</span>
                </div>
              ))}
            </div>
          ) : <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>No extra help was needed.</div>}
        </div>

        <div className="card stack" style={{ gridColumn: "1 / -1" }}>
          <h2>Eye tracking heatmap</h2>
          <p className="note">Bright spots are where the student looked during the session.</p>
          <Heatmap points={data.heatmap || []} />
        </div>

        <div className="card stack" style={{ gridColumn: "1 / -1" }}>
          <h2>Challenging areas</h2>
          {data.difficultyZones?.length ? (
            <div className="grid cols-3" style={{ gap: "0.5rem" }}>
              {data.difficultyZones.map((zone, index) => (
                <div key={index} className="card" style={{ padding: "0.75rem", background: "var(--rf-bg-soft)" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{zone.target || "—"}</div>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>
                    {zone.type === "CONFUSION" ? "Got confused" : "Decoding issue"} · {zone.count}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>No struggles recorded.</div>}
        </div>

        <div className="card stack" style={{ gridColumn: "1 / -1" }}>
          <h2>Session history</h2>
          {data.results?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Speed</th>
                  <th>Leveled up</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((result) => (
                  <tr key={result._id}>
                    <td>{new Date(result.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge">{result.level}</span></td>
                    <td><strong>{result.correct}/{result.total}</strong></td>
                    <td style={{ color: SPEED_COLOR[result.brainSpeed] || "var(--rf-ink-soft)" }}>{SPEED_LABEL[result.brainSpeed] || "—"}</td>
                    <td>{result.promoted ? "Yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>No sessions yet.</div>}
        </div>
      </div>
    </div>
  );
}
