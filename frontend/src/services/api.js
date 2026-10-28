/*
 * FILE PURPOSE
 * Shared Axios connection used by Working Memory and other feature services.
 *
 * HOW IT CONNECTS
 * Working Memory identifyApi/improveApi append endpoint paths to this client. It uses the backend /api
 * base URL and request/response interceptors.
 * Direct source importers: ../features/workingMemory/services/identifyApi.js,
 * ../features/workingMemory/services/improveApi.js, auth/api.js, phonologicalAwareness/improveApi.js,
 * speechProcessing/api.js, student/api.js.
 *
 * THINGS TO REMEMBER
 * The request interceptor attaches the saved token. Token-related 401 responses clear stale login
 * state. Attaching a token does not by itself mean every backend route validates it; inspect each
 * router.
 */

import axios from "axios";

// VIVA: API CONNECTION - feature services append their endpoint paths to this backend base URL.
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Handle 401 Unauthorized globally to prevent stale token deadlock
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = String(error.response.data?.message || "");
      if (
        message === "Invalid token" ||
        message === "No token provided" ||
        message.toLowerCase().includes("token")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("studentId");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("lexiland:auth-expired", { detail: { message } }));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
