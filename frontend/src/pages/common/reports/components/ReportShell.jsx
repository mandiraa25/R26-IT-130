import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCachedProfile } from "../../../../utils/studentProfileCache";
import StudentAvatar from "../../../../components/common/StudentAvatar";
import { REPORT_MODULES } from "../reportModules";
import "../reportJournal.css";

function HomeSymbol(props) {
  return <svg viewBox="0 0 24 24" {...props}><path d="M3 10 12 2l9 8v11h-6v-7H9v7H3Z" fill="currentColor" stroke="none" /></svg>;
}

export function WoodenReportIcon({ icon: Icon, className = "", ...props }) {
  return (
    <span className={`reports-wooden-icon ${className}`.trim()} aria-hidden="true" {...props}>
      <img src="/images/reports/journal/wooden-disc.png" alt="" draggable="false" />
      {Icon && <Icon className="reports-wooden-icon__symbol" strokeWidth={2.2} />}
    </span>
  );
}

export function ReportBackLink({ to, children, className = "", ...props }) {
  return (
    <Link to={to} className={`reports-back-link ${className}`.trim()} {...props}>
      <ChevronLeft aria-hidden="true" strokeWidth={2.8} />
      <span>{children}</span>
    </Link>
  );
}

export function ReportActionLink({ to, children, className = "", ...props }) {
  return (
    <Link to={to} className={`reports-action-link ${className}`.trim()} {...props}>
      <span>{children}</span>
      <ChevronRight aria-hidden="true" strokeWidth={2.7} />
    </Link>
  );
}

export default function ReportShell({ children, moduleId = null, profile }) {
  const { i18n } = useTranslation("common");
  const sinhala = i18n.language?.startsWith("si");
  const student = profile ?? getCachedProfile();
  const studentName = student?.fullName || student?.name || student?.username || "Explorer";
  const grade = student?.grade || "—";
  const selectedModule = REPORT_MODULES.find(module => module.id === moduleId);
  const homeLabel = sinhala ? "මුල් පිටුව" : "Home";
  const gradeLabel = sinhala ? "ශ්‍රේණිය" : "Grade";

  return (
    <div
      className={`reports-page reports-page--selection ${moduleId ? "reports-page--module" : "reports-page--hub"}`}
      style={{ "--report-accent": selectedModule?.accent || "#ff5b08" }}
    >
      <header className="reports-navigation">
        <Link to="/dashboard" className="reports-home-link" aria-label={homeLabel}>
          <WoodenReportIcon icon={HomeSymbol} className="reports-home-link__disc" />
          <span>{homeLabel}</span>
        </Link>
        <Link to="/profile" className="reports-profile-link">
          <StudentAvatar photo={student?.profilePhoto} className="reports-profile-link__icon reports-profile-link__avatar" />
          <span className="reports-profile-link__text">
            <span className="reports-profile-link__name">{studentName}</span>
            <span aria-hidden="true"> · </span>
            <span className="reports-profile-link__grade">{gradeLabel} {grade}</span>
          </span>
        </Link>
      </header>

      <main className="reports-journal">
        <nav className="reports-bookmarks" aria-label={sinhala ? "වාර්තා අංශ" : "Report categories"}>
          {REPORT_MODULES.map(module => {
            const title = sinhala ? module.siTitle || module.title : module.title;
            return (
              <Link
                key={module.id}
                to={`/reports/${module.id}`}
                className="reports-bookmark"
                style={{ "--bookmark-color": module.tabColor || module.accent }}
                aria-current={module.id === moduleId ? "page" : undefined}
                aria-label={sinhala ? `${title} වාර්තා` : `${title} reports`}
                title={title}
              >
                <span className="reports-visually-hidden">{title}</span>
              </Link>
            );
          })}
        </nav>
        <img className="reports-journal__frame" src="/images/reports/journal/journal-board.png" alt="" aria-hidden="true" draggable="false" />
        <div className="reports-journal__content">{children}</div>
      </main>
    </div>
  );
}
