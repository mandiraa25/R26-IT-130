import API from "../api";

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
