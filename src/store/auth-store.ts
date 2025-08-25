// store/auth-store.ts
import { getMe } from "@/features/auth/api/login";
import { cookieService } from "@/lib/cookieService";
import { create } from "zustand";

interface User {
  email: string;
  full_name: string;
  groups: null;
  id: string;
  phone: "";
  role: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!cookieService.getToken(),
  accessToken: cookieService.getToken() || null,
  user: null,
  loading: false,

  login: (token) => {
    cookieService.setToken(token);
    set({ isAuthenticated: true, accessToken: token });
  },

  logout: () => {
    cookieService.removeToken();
    set({ isAuthenticated: false, accessToken: null, user: null });
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const data = await getMe();
      set({ user: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        loading: false,
      });
    }
  },
}));
