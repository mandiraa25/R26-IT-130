import { BookOpen, FileChartColumnIncreasing, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReportShell, { ReportActionLink, ReportBackLink, WoodenReportIcon } from "./components/ReportShell";
import { getReportModule } from "./reportModules";
import useReportProfile from "./hooks/useReportProfile";

// VIVA: REPORT CHOICE - :componentId selects metadata; assessment/practice links open existing detail reports.
export default function ComponentReportSelect() {
  const { componentId } = useParams();
  const { i18n } = useTranslation("common");
  const si = i18n.language?.startsWith("si");
  const profile = useReportProfile();
  const module = getReportModule(componentId);
  const title = si ? module.siTitle : module.title;
  const types = [
    { id: "identification", title: si ? "තක්සේරු වාර්තා" : "Assessment reports", subtitle: si ? "හඳුනා ගැනීම" : "Identification", icon: Search, path: module.identificationPath },
    { id: "improvement", title: si ? "පුහුණු වාර්තා" : "Practice reports", subtitle: si ? "දියුණු කිරීම" : "Improvement", icon: FileChartColumnIncreasing, path: module.improvementPath },
  ];
  return <ReportShell moduleId={module.id} profile={profile}>
    <ReportBackLink to="/reports">{si ? "සියලු වාර්තා" : "All reports"}</ReportBackLink>
    <header className="reports-module-heading"><img className="reports-mascot" src={module.mascot} alt="" /><div><h1>{title}</h1><p>{si ? "වාර්තා වර්ගයක් තෝරන්න." : "Choose a report type."}</p></div></header>
    {/* VIVA: REPORT CHOICE BUTTONS - assessment and practice links are generated from types. */}
    <div className="reports-type-list">
      {types.map(type => <article key={type.id} className="reports-type-row">
        <WoodenReportIcon icon={type.icon} />
        <div className="reports-row-copy"><h2>{type.title}</h2><p>{type.subtitle}</p></div>
        <ReportActionLink to={type.path} aria-label={si ? title + " " + type.title + " බලන්න" : "View " + title + " " + type.title.toLowerCase()}>{si ? "වාර්තා බලන්න" : "View reports"}</ReportActionLink>
      </article>)}
    </div>
    {module.openBook && <footer className="reports-reading-link"><ReportActionLink to="/reading-processing"><BookOpen aria-hidden="true" />{si ? "පොත විවෘත කරන්න" : "Open book"}</ReportActionLink></footer>}
  </ReportShell>;
}
