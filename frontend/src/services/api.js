import axios from "axios";

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