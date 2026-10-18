import { useEffect, useState } from "react";
import axios from "axios";
import ReadingDashboard from "../../../features/readingProcessing/ReadingDashboard";
import "../../../features/readingProcessing/reading.css";

export default function ReadingAdminResults({ mode }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("adminToken");
  const title = mode === "improvement" ? "Reading practice" : "Reading screening";

  useEffect(() => {
    let mounted = true;
    axios.get("http://localhost:5000/api/admin/students", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!mounted) return;
      const list = res.data?.data || [];
      setStudents(list);
      if (list[0]?._id) setStudentId(list[0]._id);
    }).catch(() => {
      if (mounted) setError("Could not load students");
    });
    return () => { mounted = false; };
  }, [token]);

  useEffect(() => {
    if (!studentId) return undefined;
    let mounted = true;
    axios.get(`http://localhost:5000/api/reading-processing/admin/dashboard/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mode },
    }).then((res) => {
      if (mounted) {
        setError("");
        setData(res.data);
      }
    }).catch((err) => {
      if (mounted) setError(err.response?.data?.message || "Could not load reading results");
    });
    return () => { mounted = false; };
  }, [studentId, mode, token]);

  return (
    <div className="reading-friend" style={{ minHeight: "70vh", borderRadius: 24, overflow: "hidden" }}>
      <div className="container stack">
        <div className="row">
          <h1 style={{ margin: 0 }}>{title}</h1>
          <span className="spacer" />
          <label className="muted" htmlFor="reading-student">Student</label>
          <select id="reading-student" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
            {students.map((student) => (
              <option key={student._id} value={student._id}>{student.fullName || student.email}</option>
            ))}
          </select>
        </div>
        {error && <div className="card error">{error}</div>}
        {!error && !data && <div className="card">Loading reading results…</div>}
        {data && <ReadingDashboard data={data} />}
      </div>
    </div>
  );
}
