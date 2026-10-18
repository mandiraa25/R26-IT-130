import API from "../api";

export const getReadingPlan = (mode, level, difficulty) =>
  API.get("/reading-processing/next", { params: { mode, level, difficulty } });

export const startReadingSession = (body) => API.post("/reading-processing/session", body);

export const endReadingSession = (sessionId, body) =>
  API.post(`/reading-processing/session/${sessionId}/end`, body);
