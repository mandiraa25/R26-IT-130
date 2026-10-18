import API from "../../../services/api";
import { getStudentProfile } from "../../../services/student/api";

// Reuse a recently verified response during internal navigation. Keep this in
// memory and bind it to the login token, so another account cannot inherit it.
let accessCache;
let accessPending;
const ACCESS_TTL = 30_000;
export const clearWorkingMemoryAccess = () => { accessCache = undefined; accessPending = undefined; };
export const getWorkingMemoryAccess = ({ refresh = false } = {}) => {
  const token = localStorage.getItem("token");
  if (!refresh && accessCache?.token === token && accessCache.expires > Date.now()) return Promise.resolve(accessCache.value);
  if (!refresh && accessPending?.token === token) return accessPending.promise;
  const request = { token };
  request.promise = (async () => {
    const profileResponse = await getStudentProfile({ refresh: true });
    const profile = profileResponse.data;
    if (!profile?._id) throw new Error("Student profile unavailable");
    const response = await getStudentProgress(profile._id);
    if (response?.success === false || typeof response?.data?.isIdentificationCompleted !== "boolean") throw new Error("Improvement progress unavailable");
    const value = { profile, progress: response.data };
    if (accessPending === request && localStorage.getItem("token") === token) accessCache = { token, value, expires: Date.now() + ACCESS_TTL };
    return value;
  })().finally(() => { if (accessPending === request) accessPending = undefined; });
  accessPending = request;
  return request.promise;
};

/**
 * Fetch student improvement progress & level unlocks
 * @param {string} studentId
 */
export const getStudentProgress = async (studentId) => {
  const response = await API.get(`/working-memory/improvement/progress/${studentId}`);
  return response.data;
};

/**
 * Submit a sub-category attempt & update unlock status
 * @param {Object} attemptData
 */
export const submitSubCategoryAttempt = async (attemptData) => {
  const response = await API.post("/working-memory/improvement/submit-attempt", attemptData);
  const progress = response.data?.data?.progress;
  if (progress && accessCache?.token === localStorage.getItem("token") && accessCache.value.profile._id === attemptData.studentId) {
    accessCache = { ...accessCache, expires: Date.now() + ACCESS_TTL, value: { ...accessCache.value, progress } };
  } else clearWorkingMemoryAccess();
  return response.data;
};

/**
 * Fetch attempt history for a student
 * @param {string} studentId
 * @param {number} [levelNumber]
 * @param {string} [subCategoryKey]
 */
export const getAttemptHistory = async (studentId, levelNumber, subCategoryKey) => {
  let query = "";
  const params = new URLSearchParams();
  if (levelNumber) params.append("levelNumber", levelNumber);
  if (subCategoryKey) params.append("subCategoryKey", subCategoryKey);
  if (params.toString()) query = `?${params.toString()}`;

  const response = await API.get(`/working-memory/improvement/history/${studentId}${query}`);
  return response.data;
};
