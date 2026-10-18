import { Link } from "react-router-dom";
import "./reading.css";

export default function ReadingHome() {
  return (
    <div className="reading-friend">
      <div className="container stack">
        <div className="card stack">
          <h1>Reading Processing</h1>
          <p className="muted">Look, listen, and tap the matching shape, letter, word, or sentence. The camera can follow your eyes and help when reading gets hard.</p>
        </div>
        <div className="grid cols-2">
          <Link to="/reading-processing/play/identification" className="card stack">
            <h2 style={{ margin: 0 }}>Screening</h2>
            <span className="muted">Check reading with a full eye-tracking session.</span>
          </Link>
          <Link to="/reading-processing/play/improvement" className="card stack">
            <h2 style={{ margin: 0 }}>Practice</h2>
            <span className="muted">Continue from the last practice level.</span>
          </Link>
        </div>
        <div className="row">
          <Link to="/reports/rp/identification">Screening report</Link>
          <Link to="/reports/rp/improvement">Practice report</Link>
          <Link to="/dashboard">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
