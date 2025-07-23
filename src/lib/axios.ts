import { cookieService } from "@/lib/cookieService";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "/", // Proxy orqali boradi
  withCredentials: true, // Cookie yuboriladi
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: token qo‘shish (cookie yoki localStorage dan)
api.interceptors.request.use(
  (config) => {
    const token =
      cookieService.getToken() || localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        console.warn("Unauthorized. Logging out...");

        // Tokenni tozalash
        localStorage.removeItem("accessToken");
        cookieService.removeToken();

        // Logoutga redirect qilish mumkin
        window.location.href = "/login";
      }

      if (status === 403) {
        console.warn("Access denied.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
