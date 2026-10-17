import API from "../../../services/api";
import { clearWorkingMemoryAccess } from "./improveApi";

export const saveWorkingMemoryResult = async (data) => {
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
