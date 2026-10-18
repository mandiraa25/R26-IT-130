const REPORT_ASSETS = "/images/reports";

// Shared order, artwork, palette and destinations. Reading keeps its existing
// activity destination until it has dedicated report routes.
export const REPORT_MODULES = Object.freeze([
  { id: "wm", number: "01", title: "Working Memory", siTitle: "කාර්ය මතකය", mascot: `${REPORT_ASSETS}/mascot_bunny.png`, accent: "#ff570b", tabColor: "#ff931f", identificationPath: "/reports/wm/identification", improvementPath: "/reports/wm/improvement" },
  { id: "rp", number: "02", title: "Reading Processing", siTitle: "කියවීම් සැකසුම්", mascot: `${REPORT_ASSETS}/mascot_zebra.png`, accent: "#0086ff", tabColor: "#159bff", identificationPath: "/reading-processing", improvementPath: "/reading-processing", openBook: true },
  { id: "pa", number: "03", title: "Phonological Awareness", siTitle: "ශබ්දවිද්‍යාත්මක අවබෝධය", mascot: `${REPORT_ASSETS}/mascot_parrot.png`, accent: "#09852a", tabColor: "#6fc552", identificationPath: "/reports/pa/identification", improvementPath: "/reports/pa/improvement" },
  { id: "sp", number: "04", title: "Speech Processing", siTitle: "කථන සැකසුම්", mascot: `${REPORT_ASSETS}/mascot_leo.png`, accent: "#8618e8", tabColor: "#ad38ed", identificationPath: "/reports/sp/identification", improvementPath: "/reports/sp/improvement" },
]);

const MODULE_ALIASES = {
  wm: "wm", "working-memory": "wm", memory: "wm",
  rp: "rp", "reading-processing": "rp", reading: "rp",
  pa: "pa", "phonological-awareness": "pa", phonological: "pa",
  sp: "sp", "speech-processing": "sp", speech: "sp",
};

export const normalizeReportModuleId = id => MODULE_ALIASES[String(id || "").toLowerCase()] || "sp";
export const getReportModule = id => REPORT_MODULES.find(module => module.id === normalizeReportModuleId(id));
