import { getMe } from "@/features/auth/api/login";
import { cookieService } from "@/lib/cookieService";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toastService } from "@/lib/toastService";

interface User {
  email: string;
  full_name: string;
  groups: null;
  id: string;
  phone: string;
  role: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated:
        !!cookieService.getToken() || !!localStorage.getItem("accessToken"),
      accessToken:
        cookieService.getToken() || localStorage.getItem("accessToken") || null,
      user: null,
      loading: false,

      login: (token, userData) => {
        cookieService.setToken(token); // Tokenni cookie ga saqlash
        localStorage.setItem("accessToken", token); // Tokenni localStorage ga ham saqlash
        set({
          isAuthenticated: true,
          accessToken: token,
          user: userData || null,
          loading: false,
        });
      },

      logout: () => {
        cookieService.removeToken(); // Cookie dan tokenni o‘chirish
        localStorage.removeItem("accessToken"); // localStorage dan tokenni o‘chirish
        localStorage.removeItem("auth-storage"); // Persist storage ni tozalash
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          loading: false,
        });
      },

      fetchMe: async () => {
        set({ loading: true });
        try {
          const data = await getMe();
          set({ user: data, isAuthenticated: true, loading: false });
        } catch (error: any) {
          console.error("Failed to fetch user:", error);
          if (error.response?.status === 401) {
            // 401 xatosi bo‘lsa, logout qilish
            get().logout();
            if (window.location.pathname !== "/login") {
              window.location.href = "/login"; // Login sahifasiga yo‘naltirish
            }
          }
          set({ loading: false });
          toastService.error("Foydalanuvchi ma'lumotlarini olishda xato");
        }
      },
    }),
    {
      name: "auth-storage", // localStorage da saqlanadigan kalit nomi
      storage: createJSONStorage(() => localStorage), // localStorage ni ishlatish
      partialize: (state) => ({
        // Faqat isAuthenticated va user ni saqlash
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
