import { useAuthStore } from "@/store/auth-store";
import { Role } from "@/shared/enums/role.enum";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface AutoLogoutOptions {
  enabled?: boolean;
  visibilityTimeout?: number; // milliseconds
  blurTimeout?: number; // milliseconds
  immediateOnExit?: boolean;
  excludeTestPages?: boolean;
}

export const useAutoLogout = (options: AutoLogoutOptions = {}) => {
  const {
    enabled = true,
    visibilityTimeout = 5 * 60 * 1000, // 5 daqiqa
    blurTimeout = 10 * 60 * 1000, // 10 daqiqa  
    immediateOnExit = true,
    excludeTestPages = true
  } = options;

  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();
  const logoutCalledRef = useRef(false);

  useEffect(() => {
    // Agar yoqilmagan yoki authenticated bo'lmasa, hech narsa qilmaymiz
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Test sahifalarda auto-logout ni bloklash
    if (excludeTestPages) {
      const isTestPage = location.pathname.includes('/exams/') || 
                         location.pathname.includes('/listenings/') ||
                         location.pathname.includes('/readings/') ||
                         location.pathname.includes('/writings/') ||
                         location.pathname.includes('/speakings/');
      
      if (isTestPage && user?.role === Role.STUDENT) {
        console.log("Auto logout disabled during test");
        return;
      }
    }

    // Logout funksiyasini bir marta chaqirish uchun
    const performLogout = (reason: string) => {
      if (!logoutCalledRef.current) {
        logoutCalledRef.current = true;
        console.log(`Auto logout triggered: ${reason}`);
        logout();
        // Optional: Show notification
        // toastService.info("Xavfsizlik uchun tizimdan chiqarildi");
      }
    };

    // 1. beforeunload - sahifa yopilishidan oldin (darhol)
    const handleBeforeUnload = () => {
      // Website dan chiqib ketganda darhol logout qilish
      performLogout("page unload");
    };

    // 2. pagehide - sahifa yashirilganda (mobil va desktop uchun)
    const handlePageHide = () => {
      // Website dan chiqib ketganda darhol logout qilish
      performLogout("page hide");
    };

    // 3. visibilitychange - tab hidden bo'lganda
    let visibilityTimer: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab yashirildi - belgilangan vaqtdan keyin logout qilish
        if (visibilityTimeout > 0) {
          visibilityTimer = setTimeout(() => {
            performLogout("tab hidden timeout");
          }, visibilityTimeout);
        }
      } else {
        // Tab qaytib keldi - timer'ni bekor qilish
        if (visibilityTimer) {
          clearTimeout(visibilityTimer);
          visibilityTimer = null;
        }
        logoutCalledRef.current = false; // Reset qilish
      }
    };

    // 4. focus/blur - window focus yo'qotganda
    let blurTimer: NodeJS.Timeout | null = null;
    const handleWindowBlur = () => {
      // Window focus yo'qotildi - belgilangan vaqtdan keyin logout
      if (blurTimeout > 0) {
        blurTimer = setTimeout(() => {
          performLogout("window blur timeout");
        }, blurTimeout);
      }
    };

    const handleWindowFocus = () => {
      // Window qaytib keldi - timer'ni bekor qilish
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      logoutCalledRef.current = false; // Reset qilish
    };

    // Event listener'larni qo'shish
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Cleanup funksiyasi
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      
      // Timer'larni tozalash
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
      }
      if (blurTimer) {
        clearTimeout(blurTimer);
      }
    };
  }, [
    enabled,
    isAuthenticated, 
    logout, 
    user?.role,
    location.pathname,
    visibilityTimeout,
    blurTimeout,
    immediateOnExit,
    excludeTestPages
  ]);
};
