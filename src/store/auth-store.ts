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
      isAuthenticated: false,
      accessToken: cookieService.getToken() || null,
      user: null,
      loading: false,

      login: (token, userData) => {
        cookieService.setToken(token); // Tokenni cookie ga saqlash
        set({
          isAuthenticated: true,
          accessToken: token,
          user: userData || null,
        });
      },

      logout: () => {
        cookieService.removeToken(); // Cookie dan tokenni o‘chirish
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
          set({ user: data, loading: false });
        } catch (error) {
          console.error("Failed to fetch user:", error);
          set({ loading: false }); // Xato bo‘lsa, faqat loading o‘chiriladi
          toastService.error("Foydalanuvchi ma'lumotlarini olishda xato");
        }
      },
    }),
    {
      name: "auth-storage", // localStorage da saqlanadigan kalit nomi
      storage: createJSONStorage(() => localStorage), // localStorage ni ishlatish
      partialize: (state) => ({
        // Faqat isAuthenticated, user va loading ni saqlash
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
      }),
    }
  )
);
