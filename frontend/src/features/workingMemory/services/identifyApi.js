/*
 * FILE PURPOSE
 * Frontend HTTP wrappers for saving and reading screening attempts.
 *
 * HOW IT CONNECTS
 * ScreeningPage saves through saveWorkingMemoryResult; IdentifyWorkingMemoryReport reads history. The
 * shared services/api client adds the backend base URL and token header.
 * Direct source importers: ../identification/ScreeningPage.jsx,
 * ../../../pages/common/reports/IdentifyWorkingMemoryReport.jsx.
 * Local feature/style dependencies: improveApi.js.
 *
 * THINGS TO REMEMBER
 * These functions return Axios responses. A successful save clears the cached improvement access so
 * placement can be fetched again. The backend identification router/controller/model handle
 * persistence and the optional ML call.
 */

import API from "../../../services/api";
import { clearWorkingMemoryAccess } from "./improveApi";

/*
 * FUNCTION: saveWorkingMemoryResult
 * POST the real screening payload through the common API client.
 * WHEN: ScreeningPage saveResults calls this.
 * HOW / RESULT: On success invalidates cached improvement access and returns the Axios response.
 */
export const saveWorkingMemoryResult = async (data) => {
  // VIVA: The shared API client supplies its base URL/auth handling. Invalidate
  // improvement access after a saved screening so the next read checks unlocks.
  const response = await API.post(
    "/working-memory/identification/save-result",
    data
  );
  clearWorkingMemoryAccess();
  return response;
};

export const getWorkingMemoryIdentifyResults = (studentId) => {
  return API.get(`/working-memory/identification/student-results/${studentId}`);
};
