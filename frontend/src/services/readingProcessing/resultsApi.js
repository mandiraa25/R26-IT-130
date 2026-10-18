import API from "../api";

export const getReadingDashboard = (mode) =>
  API.get("/reading-processing/dashboard", { params: { mode } });

export const getReadingResults = (mode) =>
  API.get("/reading-processing/results", { params: { mode } });
