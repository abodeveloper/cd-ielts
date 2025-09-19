import { cookieService } from "@/lib/cookieService";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
        console.warn("Unauthorized. Logging out...");

        // Tokenni tozalash va auth holatini yangilash
        useAuthStore.getState().logout();

        // Login sahifasiga yo‘naltirish (faqat agar login sahifasida bo‘lmasa)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }

      if (status === 403) {
        console.warn("Access denied.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
