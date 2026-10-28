import { useEffect, useState } from "react";
import ReportShell, { ReportBackLink } from "../../pages/common/reports/components/ReportShell";
import useReportProfile from "../../pages/common/reports/hooks/useReportProfile";
import { getReadingDashboard } from "../../services/readingProcessing/resultsApi";
import ReadingDashboard from "./ReadingDashboard";
import "./reading.css";

export default function ReadingReport({ mode }) {
  const profile = useReportProfile();
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
    <ReportShell moduleId="rp" profile={profile}>
      <ReportBackLink to="/reports/rp">All reading reports</ReportBackLink>
      <header className="reports-module-heading">
        <img className="reports-mascot" src="/images/reports/mascot_zebra.png" alt="" />
        <div>
          <h1>{title}</h1>
          <p>Sessions, speed, and where the eyes looked.</p>
        </div>
      </header>
      <div className="rf-journal-scroll">
        {error && <p className="rf-journal-note">{error}</p>}
        {!error && !data && <p className="rf-journal-note">Loading reports…</p>}
        {data && <ReadingDashboard data={data} tone="journal" />}
      </div>
    </ReportShell>
  );
}
