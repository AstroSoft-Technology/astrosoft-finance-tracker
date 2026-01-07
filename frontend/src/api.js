import axios from "axios";

// Read the URL from the environment (Vercel), or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/`, // Use the smart URL
});

// 1. Add Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. NEW: Handle "401 Unauthorized" automatically
api.interceptors.response.use(
  (response) => response, // Return success responses as is
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired -> Clear storage and redirect to login
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
