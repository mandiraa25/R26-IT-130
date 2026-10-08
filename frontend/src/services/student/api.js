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

// Update Student Profile
export const updateStudentProfile = async (data) => {
  const res = await API.put("/students/profile", data);
  if (res.data?.student) {
    setCachedProfile(res.data.student);
  }
  return res;
};

// Get Phonological Awareness Identification Results
export const getPhonologicalIdentifyResults = (studentId) => {
  return API.get(`/phonological-awareness/identification/student-results/${studentId}`);
};
