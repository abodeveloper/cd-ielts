import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const usePreventPageLeave = (shouldBlock: boolean) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Faqat Student uchun ishlashi kerak
  const isStudent = user?.role === Role.STUDENT;

  // Fullscreen rejimini yoqish
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error("Fullscreen rejimini yoqishda xato:", err);
      });
    }
  }, []);

  // Fullscreen rejimidan chiqish
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Fullscreen rejimidan chiqishda xato:", err);
      });
    }
  }, []);

  // Navigatsiyani boshqarish
  const handleNavigation = useCallback(() => {
    if (isStudent && shouldBlock) {
      if (window.confirm("Test hali tugamadi! Chiqishni xohlaysizmi?")) {
        exitFullscreen(); // Tasdiqlansa, fullscreen’dan chiqish
      } else {
        navigate(location.pathname, { replace: true }); // Sahifada qolish
      }
    }
  }, [isStudent, shouldBlock, location.pathname, navigate, exitFullscreen]);

  useEffect(() => {
    // Student emas bo‘lsa, hook ishlamasin
    if (!isStudent) return;

    if (!shouldBlock) {
      exitFullscreen();
      return;
    }

    enterFullscreen();

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldBlock) {
        event.preventDefault();
        event.returnValue =
          "Test hali tugamadi! Chiqishni tasdiqlasangiz, natijalar saqlanmaydi!";
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        shouldBlock &&
        ((event.ctrlKey && event.key === "r") || event.key === "F5")
      ) {
        event.preventDefault();
        alert("Test tugamaguncha sahifani yangilash taqiqlangan!");
      }
      if (shouldBlock && event.key === "F11") {
        event.preventDefault();
        alert("Test tugamaguncha fullscreen rejimidan chiqish taqiqlangan!");
      }
    };

    const handleFullscreenChange = () => {
      if (shouldBlock && !document.fullscreenElement) {
        enterFullscreen();
        alert("Test tugamaguncha fullscreen rejimida qolishingiz kerak!");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handleNavigation);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handleNavigation);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [
    isStudent,
    shouldBlock,
    handleNavigation,
    enterFullscreen,
    exitFullscreen,
  ]);
};
