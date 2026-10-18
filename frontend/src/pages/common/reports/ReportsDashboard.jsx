import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReportShell, { ReportActionLink } from "./components/ReportShell";
import { REPORT_MODULES } from "./reportModules";
import useReportProfile from "./hooks/useReportProfile";

export default function ReportsDashboard() {
  const { i18n } = useTranslation("common");
  const si = i18n.language?.startsWith("si");
  const profile = useReportProfile();
  return <ReportShell profile={profile}>
    <header className="reports-heading">
      <h1>{si ? "ඉගෙනුම් වාර්තා" : "Learning Reports"}<span className="reports-title-sprouts" aria-hidden="true" /></h1>
      <p>{si ? "ඔබේ දරුවාගේ ක්‍රියාකාරකම්වල ප්‍රතිඵල බලන්න." : "Review your child’s activity results."}</p>
    </header>
    <ol className="reports-module-list" aria-label={si ? "ඉගෙනුම් අංශ" : "Learning components"}>
      {REPORT_MODULES.map(module => <li key={module.id} className="reports-module-row" style={{ "--report-accent": module.accent }}>
        <span className="reports-row-number" aria-hidden="true">{module.number}</span>
        <img className="reports-mascot" src={module.mascot} alt="" />
        <div className="reports-row-copy"><h2>{si ? module.siTitle : module.title}</h2><p>{si ? "ක්‍රියාකාරකම් ප්‍රතිඵල සහ ලැබුණු තරු." : "Activity results and earned stars."}</p></div>
        <ReportActionLink to={"/reports/" + module.id} aria-label={(si ? module.siTitle + " ප්‍රතිඵල බලන්න" : "View " + module.title + " results")}>{si ? "ප්‍රතිඵල බලන්න" : "View results"}</ReportActionLink>
      </li>)}
    </ol>
    <footer className="reports-guidance"><Leaf aria-hidden="true" /><span>{si ? "වාර්තා බැලීමට අංශයක් තෝරන්න." : "Select a component to open its reports."}</span></footer>
  </ReportShell>;
}
