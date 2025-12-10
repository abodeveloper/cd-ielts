import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface PreventPageLeaveOptions {
  shouldBlock: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  timeLeft?: number | null;
  isAudioPlaying?: boolean;
  customMessage?: string;
}

export const usePreventPageLeave = (
  options: boolean | PreventPageLeaveOptions
) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle both old boolean API and new options API
  const config = typeof options === 'boolean' 
    ? { shouldBlock: options }
    : options;

  const { 
    shouldBlock, 
    audioRef, 
    timeLeft, 
    isAudioPlaying,
    customMessage 
  } = config;

  // Faqat Student uchun ishlashi kerak
  const isStudent = user?.role === Role.STUDENT;

  // Check if audio is currently playing
  const checkAudioPlaying = (): boolean => {
    if (!audioRef?.current) return false;
    return !audioRef.current.paused && !audioRef.current.ended;
  };

  // Check if timer is still running
  const checkTimerRunning = (): boolean => {
    if (timeLeft === null || timeLeft === undefined) return false;
    return timeLeft > 0;
  };

  // Determine if page should be blocked
  const shouldBlockPage = (): boolean => {
    if (!isStudent || !shouldBlock) return false;
    
    // Block if audio is playing
    if (checkAudioPlaying()) return true;
    
    // Block if timer is still running
    if (checkTimerRunning()) return true;
    
    // Block if explicitly requested
    return shouldBlock;
  };

  // Get appropriate warning message
  const getWarningMessage = (): string => {
    if (customMessage) return customMessage;
    
    const audioPlaying = checkAudioPlaying();
    const timerRunning = checkTimerRunning();
    
    if (audioPlaying && timerRunning) {
      return "Audio hali ijro etilmoqda va vaqt tugamagan! Chiqishni xohlaysizmi?";
    } else if (audioPlaying) {
      return "Audio hali ijro etilmoqda! Chiqishni xohlaysizmi?";
    } else if (timerRunning) {
      return "Test vaqti hali tugamagan! Chiqishni xohlaysizmi?";
    }
    
    return "Test hali tugamadi! Chiqishni xohlaysizmi?";
  };

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
    const blockPage = shouldBlockPage();
    if (isStudent && blockPage) {
      const message = getWarningMessage();
      if (window.confirm(message)) {
        exitFullscreen(); // Tasdiqlansa, fullscreen'dan chiqish
      } else {
        navigate(location.pathname, { replace: true }); // Sahifada qolish
      }
    }
  }, [isStudent, shouldBlock, audioRef, timeLeft, location.pathname, navigate, exitFullscreen]);

  useEffect(() => {
    // Student emas bo‘lsa, hook ishlamasin
    if (!isStudent) return;

    if (!shouldBlock) {
      exitFullscreen();
      return;
    }

    enterFullscreen();

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage) {
        event.preventDefault();
        const message = customMessage || 
          "Test hali tugamadi! Audio ijro etilmoqda yoki vaqt tugamagan. Chiqishni tasdiqlasangiz, natijalar saqlanmaydi!";
        event.returnValue = message;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const blockPage = shouldBlockPage();
      if (
        blockPage &&
        ((event.ctrlKey && event.key === "r") || event.key === "F5")
      ) {
        event.preventDefault();
        const audioPlaying = checkAudioPlaying();
        const timerRunning = checkTimerRunning();
        
        let message = "Test tugamaguncha sahifani yangilash taqiqlangan!";
        if (audioPlaying && timerRunning) {
          message = "Audio ijro etilmoqda va vaqt tugamagan! Sahifani yangilash taqiqlangan!";
        } else if (audioPlaying) {
          message = "Audio hali ijro etilmoqda! Sahifani yangilash taqiqlangan!";
        } else if (timerRunning) {
          message = "Test vaqti hali tugamagan! Sahifani yangilash taqiqlangan!";
        }
        
        alert(message);
      }
      if (blockPage && event.key === "F11") {
        event.preventDefault();
        alert("Test tugamaguncha fullscreen rejimidan chiqish taqiqlangan!");
      }
      
      // Block Escape key during audio/timer
      if (blockPage && event.key === "Escape") {
        event.preventDefault();
        alert("Test tugamaguncha Escape tugmasi ishlamaydi!");
      }
      
      // Block Alt+Tab, Ctrl+Tab during audio/timer
      if (blockPage && ((event.altKey && event.key === "Tab") || (event.ctrlKey && event.key === "Tab"))) {
        event.preventDefault();
        alert("Test tugamaguncha boshqa oynaga o'tish taqiqlangan!");
      }
    };

    const handleFullscreenChange = () => {
      const blockPage = shouldBlockPage();
      if (blockPage && !document.fullscreenElement) {
        enterFullscreen();
        const audioPlaying = checkAudioPlaying();
        const timerRunning = checkTimerRunning();
        
        let message = "Test tugamaguncha fullscreen rejimida qolishingiz kerak!";
        if (audioPlaying && timerRunning) {
          message = "Audio ijro etilmoqda va vaqt tugamagan! Fullscreen rejimida qolishingiz kerak!";
        } else if (audioPlaying) {
          message = "Audio hali ijro etilmoqda! Fullscreen rejimida qolishingiz kerak!";
        } else if (timerRunning) {
          message = "Test vaqti hali tugamagan! Fullscreen rejimida qolishingiz kerak!";
        }
        
        alert(message);
      }
    };

    // Block right-click context menu during test
    const handleContextMenu = (event: MouseEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage) {
        event.preventDefault();
        alert("Test tugamaguncha o'ng tugma menyusi ishlamaydi!");
      }
    };

    // Block developer tools shortcuts
    const handleDevToolsBlock = (event: KeyboardEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          event.key === "F12" ||
          (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) ||
          (event.ctrlKey && event.key === "u")
        ) {
          event.preventDefault();
          alert("Test tugamaguncha developer tools ishlamaydi!");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleDevToolsBlock);
    window.addEventListener("popstate", handleNavigation);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);

    // Block window focus/blur events during audio
    const handleWindowBlur = () => {
      const blockPage = shouldBlockPage();
      if (blockPage && checkAudioPlaying()) {
        setTimeout(() => {
          window.focus();
          alert("Audio ijro etilmoqda! Boshqa oynaga o'tish taqiqlangan!");
        }, 100);
      }
    };

    window.addEventListener("blur", handleWindowBlur);

    // Block browser navigation buttons (back/forward)
    const handleHashChange = (event: HashChangeEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage) {
        event.preventDefault();
        history.pushState(null, '', location.pathname);
        alert("Test tugamaguncha browser navigation tugmalari ishlamaydi!");
      }
    };

    // Push a dummy state to prevent back button
    if (shouldBlockPage()) {
      history.pushState(null, '', location.pathname);
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleDevToolsBlock);
      window.removeEventListener("popstate", handleNavigation);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [
    isStudent,
    shouldBlock,
    audioRef,
    timeLeft,
    handleNavigation,
    enterFullscreen,
    exitFullscreen,
  ]);
};
