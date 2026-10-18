import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReadingDashboard } from "../../services/readingProcessing/resultsApi";
import ReadingDashboard from "./ReadingDashboard";
import "./reading.css";

export default function ReadingReport({ mode }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getReadingDashboard(mode)
      .then(({ data: payload }) => { if (mounted) setData(payload); })
      .catch((err) => { if (mounted) setError(err.response?.data?.message || "Could not load the reading report"); });
    return () => { mounted = false; };
  }, [mode]);

  const title = mode === "improvement" ? "Practice report" : "Screening report";

  return (
    <div className="reading-friend">
      <div className="container stack">
        <div className="row">
          <h1 style={{ margin: 0 }}>{title}</h1>
          <span className="spacer" />
          <Link to="/reports/rp">All reading reports</Link>
          <Link to="/dashboard">Home</Link>
        </div>
        {error && <div className="card error">{error}</div>}
        {!error && !data && <div className="card">Loading reports…</div>}
        {data && <ReadingDashboard data={data} />}
      </div>
    </div>
  );
}
