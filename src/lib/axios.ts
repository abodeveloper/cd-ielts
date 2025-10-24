import { cookieService } from "@/lib/cookieService";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "https://cdmock.pythonanywhere.com",
  withCredentials: true, // Cookie yuboriladi
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: token qo‘shish
api.interceptors.request.use(
  (config) => {
    const token =
      cookieService.getToken() || localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xatolarni tutish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Unauthorized access - staying on current page");
        // No automatic logout or redirect - user stays on current page
      }

      if (status === 403) {
        console.warn("Access denied.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
