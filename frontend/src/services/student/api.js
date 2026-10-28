/*
 * FILE PURPOSE
 * Shared student/profile service used to enter Working Memory with the current student and grade.
 *
 * HOW IT CONNECTS
 * Dashboard reads profile/learning summary; improveApi reads a refreshed authenticated profile before
 * fetching WM progress. studentProfileCache supplies the cached profile.
 * Direct source importers: ../../features/workingMemory/services/improveApi.js,
 * ../../pages/common/Dashboard.jsx, ../../pages/common/Login.jsx, ../../pages/common/Profile.jsx,
 * ../../pages/common/reports/hooks/useReportProfile.js,
 * ../../pages/common/reports/ImproveWorkingMemoryReport.jsx,
 * ../../pages/common/reports/PhonologicalAwarenessReport.jsx,
 * ../../pages/common/reports/PhonologicalImprovementReport.jsx,
 * ../../pages/phonologicalAwareness/ImprovementActivityPA.jsx,
 * ../../pages/phonologicalAwareness/ImprovementLevels.jsx,
 * ../../pages/phonologicalAwareness/sample.jsx, ../../pages/speechProcessing/SpeechDemoGame.jsx.
 *
 * THINGS TO REMEMBER
 * getStudentProfile returns an Axios-style response; getLearningSummary returns module completion and
 * latest WM weak areas. Profile data and progress are separate requests. Other feature wrappers in
 * this shared file keep their existing behaviour.
 */

import API from "../api";
import { getCachedProfile, setCachedProfile } from "../../utils/studentProfileCache";

// Get Student Profile (uses session cache unless refresh is true)
// VIVA: PROFILE READ - use a session cache unless refresh=true; the server identifies the student from JWT.
export const getStudentProfile = async ({ refresh = false } = {}) => {
  if (!refresh) {
    const cached = getCachedProfile();
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  const res = await API.get("/students/profile");
  setCachedProfile(res.data);
  return res;
};

// Current level and progress in each learning component, plus the areas the
// latest Working Memory screening flagged (home page).
export const getLearningSummary = () => API.get("/students/learning-summary");

// Update Student Profile
// VIVA: PROFILE SAVE - Profile.handleSubmit sends editable fields here; cache the saved reply.
export const updateStudentProfile = async (data) => {
  const res = await API.put("/students/profile", data);
  if (res.data?.student) {
    // The update reply has no module stars, and its totalStars is Working Memory
    // only; keep the full total from the last profile read so the home bar is right.
    const cached = getCachedProfile();
    setCachedProfile(cached?.moduleStars
      ? { ...res.data.student, totalStars: cached.totalStars, moduleStars: cached.moduleStars }
      : res.data.student);
  }
  return res;
};

// Get Phonological Awareness Identification Results
export const getPhonologicalIdentifyResults = (studentId) => {
  return API.get(`/phonological-awareness/identification/student-results/${studentId}`);
};
