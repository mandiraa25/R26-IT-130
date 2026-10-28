/*
 * FILE PURPOSE
 * Frontend HTTP wrappers and a short-lived cache for improvement access/progress.
 *
 * HOW IT CONNECTS
 * LevelSelection and ImprovementPage call getWorkingMemoryAccess; result/report views use
 * progress/history; the controller submits attempts through submitSubCategoryAttempt.
 * Direct source importers: ../improvement/ImprovementPage.jsx, ../improvement/LevelSelection.jsx,
 * identifyApi.js, ../../../pages/common/reports/ImproveWorkingMemoryReport.jsx.
 *
 * THINGS TO REMEMBER
 * Access first reads the authenticated profile, then that student ID. Cache lifetime is 30 seconds and
 * tied to the current login token. These wrappers return response bodies, unlike identifyApi Axios
 * responses. Refresh reads must not resubmit an already saved attempt.
 */

import API from "../../../services/api";
import { getStudentProfile } from "../../../services/student/api";

// Reuse a recently verified response during internal navigation. Keep this in
// memory and bind it to the login token, so another account cannot inherit it.
let accessCache;
let accessPending;
const ACCESS_TTL = 30_000;
export const clearWorkingMemoryAccess = () => { accessCache = undefined; accessPending = undefined; };
/*
 * FUNCTION: getWorkingMemoryAccess
 * Fetch the authenticated student profile and that student saved WM progress.
 * WHEN: The level map and activity access checks call this.
 * HOW / RESULT: Reuses a token-bound 30-second value/pending request unless refresh is requested;
 * rejects an incomplete response.
 */
export const getWorkingMemoryAccess = ({ refresh = false } = {}) => {
  // VIVA: Fetch authenticated profile first, then that student's saved progress.
  // Token-bound in-memory caching lasts 30 seconds; refresh bypasses cache reuse.
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
/*
 * FUNCTION: getStudentProgress
 * Read saved progress and unlock state for a student.
 * WHEN: getWorkingMemoryAccess and report views call this.
 * HOW / RESULT: Returns the API response body; the backend GET can initialize progress from the first
 * screening if it is missing.
 */
export const getStudentProgress = async (studentId) => {
  const response = await API.get(`/working-memory/improvement/progress/${studentId}`);
  return response.data;
};

/**
 * Submit a sub-category attempt & update unlock status
 * @param {Object} attemptData
 */
/*
 * FUNCTION: submitSubCategoryAttempt
 * POST one completed improvement attempt.
 * WHEN: ImprovementPage handleCompleteQuiz calls this.
 * HOW / RESULT: Updates or clears the local access cache using returned progress, then returns the
 * server response body. Backend saving/unlocks happen in the controller.
 */
export const submitSubCategoryAttempt = async (attemptData) => {
  // VIVA: Wrappers return the API response body (response.data). Its nested data
  // holds the saved attempt/progress used to reconcile local stars and unlocks.
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
/*
 * FUNCTION: getAttemptHistory
 * Read saved improvement attempts with optional level/game filters.
 * WHEN: ImprovementPage history refresh and reports call this.
 * HOW / RESULT: Builds query parameters and returns response.data; reading history does not award
 * rewards.
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
