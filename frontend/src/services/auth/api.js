// VIVA: Shared Axios client supplies /api base URL and request/response interceptors.
// VIVA: These helpers return Axios promises; page components handle messages and navigation.
import API from "../api";

// Register Student
export const registerStudent = (data) => {
  return API.post("/auth/register/student", data);
};

// Register Admin
export const registerAdmin = (data) => {
  return API.post("/auth/register/admin", data);
};

// Login
export const login = (data) => {
  return API.post("/auth/login", data);
};

// Forgot password: emails a reset link to a registered address
export const requestPasswordReset = (email) => {
  return API.post("/auth/forgot-password", { email });
};

// Reset password with the token from the emailed link
export const resetPassword = (data) => {
  return API.post("/auth/reset-password", data);
};
