import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const usePreventPageLeave = (shouldBlock: boolean) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    if (shouldBlock) {
      if (window.confirm("Test hali tugamadi! Chiqishni xohlaysizmi?")) {
        exitFullscreen(); // Tasdiqlansa, fullscreen’dan chiqish
      } else {
        navigate(location.pathname, { replace: true }); // Sahifada qolish
      }
    }
  }, [shouldBlock, location.pathname, navigate, exitFullscreen]);

  useEffect(() => {
    if (!shouldBlock) {
      // Test tugaganda fullscreen’dan chiqish
      exitFullscreen();
      return;
    }

    // Test boshlanganda fullscreen rejimini yoqish
    enterFullscreen();

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue =
        "Test hali tugamadi! Chiqishni tasdiqlasangiz, natijalar saqlanmaydi!";
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        shouldBlock &&
        ((event.ctrlKey && event.key === "r") || event.key === "F5")
      ) {
        event.preventDefault();
        alert("Test tugamaguncha sahifani yangilash taqiqlangan!");
      }
      // F11 (fullscreen toggle) ni bloklash
      if (shouldBlock && event.key === "F11") {
        event.preventDefault();
        alert("Test tugamaguncha fullscreen rejimidan chiqish taqiqlangan!");
      }
    };

    // Fullscreen rejimidan chiqishni aniqlash
    const handleFullscreenChange = () => {
      if (shouldBlock && !document.fullscreenElement) {
        // Agar foydalanuvchi fullscreen’dan chiqsa, qayta yoqish
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
  }, [shouldBlock, handleNavigation, enterFullscreen, exitFullscreen]);
};
