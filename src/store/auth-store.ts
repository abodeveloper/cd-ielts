// store/auth-store.ts
import { cookieService } from "@/lib/cookieService";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!cookieService.getToken(),
  accessToken: cookieService.getToken() || null,
  login: (token) => {
    cookieService.setToken(token);
    set({ isAuthenticated: true, accessToken: token });
  },
  logout: () => {
    cookieService.removeToken();
    set({ isAuthenticated: false, accessToken: null });
  },
}));
