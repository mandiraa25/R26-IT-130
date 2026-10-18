import API from "../api";
import { getCachedProfile, setCachedProfile } from "../../utils/studentProfileCache";

// Get Student Profile (uses session cache unless refresh is true)
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
