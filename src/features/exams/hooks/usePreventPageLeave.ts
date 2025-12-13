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
    
    // Once test has started (shouldBlock is true), ALWAYS block reload
    // regardless of audio or timer state - this ensures complete prevention
    // of page reload during test
    return true;
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

  // Detect OS (Mac vs Windows)
  const isMac = useCallback(() => {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
           navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
  }, []);

  // Fullscreen rejimini yoqish (OS-specific)
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    const mac = isMac();
    
    if (mac) {
      // Mac: Use webkitRequestFullscreen for Safari/Chrome on Mac
      if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error("Fullscreen error:", err);
        });
      }
    } else {
      // Windows/Linux: Use standard requestFullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error("Fullscreen error:", err);
        });
      } else if ((element as any).msRequestFullscreen) {
        // IE/Edge support
        (element as any).msRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        // Firefox support
        (element as any).mozRequestFullScreen();
      } else if ((element as any).webkitRequestFullscreen) {
        // Fallback for older browsers
        (element as any).webkitRequestFullscreen();
      }
    }
  }, [isMac]);

  // Fullscreen rejimidan chiqish
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Fullscreen rejimidan chiqishda xato:", err);
      });
    }
  }, []);

  // Navigatsiyani boshqarish (Back button)
  const handleNavigation = useCallback((event?: PopStateEvent) => {
    const blockPage = shouldBlockPage();
    if (isStudent && blockPage) {
      // Prevent navigation
      if (event) {
        event.preventDefault();
      }
      
      // Push state to prevent back navigation
      history.pushState(null, '', location.pathname);
      
      // English alert with only OK button
      alert("You cannot leave the page during the test.");
      enterFullscreen(); // Return to fullscreen after OK
    }
  }, [isStudent, shouldBlock, audioRef, timeLeft, location.pathname, navigate, enterFullscreen]);

  useEffect(() => {
    // Student emas bo‘lsa, hook ishlamasin
    if (!isStudent) return;

    if (!shouldBlock) {
      exitFullscreen();
      // Clear alert flag when test finishes
      const alertKey = `fullscreen_alert_shown_${location.pathname}`;
      sessionStorage.removeItem(alertKey);
      return;
    }

    // Clear alert flag when entering new test (fresh start)
    const alertKey = `fullscreen_alert_shown_${location.pathname}`;
    sessionStorage.removeItem(alertKey);
    
    enterFullscreen();

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage && isStudent) {
        // Completely prevent reload for students during test
        // This is the most critical prevention - blocks browser reload/close
        event.preventDefault();
        event.returnValue = "You cannot reload the page during the test.";
        // Also try to prevent navigation
        history.pushState(null, '', location.pathname);
        return "You cannot reload the page during the test.";
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const blockPage = shouldBlockPage();
      
      // Refresh - Completely prevent reload for students during test
      // Handle: F5, Ctrl+R, Ctrl+Shift+R (hard reload), Cmd+R (Mac), Cmd+Shift+R (Mac hard reload)
      // Also prevent Ctrl+F5, Alt+F4 (close window), and other reload combinations
      if (
        blockPage &&
        isStudent &&
        (event.key === "F5" ||
         (event.key === "F4" && event.altKey) || // Alt+F4 (close window)
         (event.ctrlKey && !event.shiftKey && (event.key === "r" || event.key === "R")) ||
         (event.ctrlKey && event.shiftKey && (event.key === "r" || event.key === "R")) ||
         (event.ctrlKey && event.key === "F5") || // Ctrl+F5
         (event.metaKey && !event.shiftKey && (event.key === "r" || event.key === "R")) ||
         (event.metaKey && event.shiftKey && (event.key === "r" || event.key === "R")))
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        // Show alert and return to fullscreen
        alert("You cannot reload the page during the test.");
        enterFullscreen(); // Return to fullscreen after OK
        // Push state to prevent navigation
        history.pushState(null, '', location.pathname);
        return false;
      }
      
      // Escape key - English alert with only OK button
      if (blockPage && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        alert("You cannot leave the page during the test.");
        enterFullscreen(); // Return to fullscreen after OK
      }
      
      if (blockPage && event.key === "F11") {
        event.preventDefault();
        if (confirm("Test tugamaguncha fullscreen rejimidan chiqish taqiqlangan!\n\nFullscreen rejimiga qaytishni xohlaysizmi?")) {
          enterFullscreen();
        }
      }
      
      // Block Alt+Tab, Ctrl+Tab during audio/timer
      if (blockPage && ((event.altKey && event.key === "Tab") || (event.ctrlKey && event.key === "Tab"))) {
        event.preventDefault();
        if (confirm("Test tugamaguncha boshqa oynaga o'tish taqiqlangan!\n\nFullscreen rejimiga qaytishni xohlaysizmi?")) {
          enterFullscreen();
        }
      }
    };

    const handleFullscreenChange = () => {
      const blockPage = shouldBlockPage();
      if (blockPage && !document.fullscreenElement) {
        // Check if alert has already been shown for this test session
        const alertKey = `fullscreen_alert_shown_${location.pathname}`;
        const alertShown = sessionStorage.getItem(alertKey);
        
        if (!alertShown) {
          // Mark alert as shown
          sessionStorage.setItem(alertKey, 'true');
          
          // English alert with only OK button - show only once
          alert("You cannot exit the test until the test time is up");
          
          // Always return to fullscreen after OK is pressed
          // Use setTimeout to ensure alert is closed before entering fullscreen
          setTimeout(() => {
            enterFullscreen();
          }, 100);
        } else {
          // Alert already shown, just return to fullscreen automatically
          setTimeout(() => {
            enterFullscreen();
          }, 50);
        }
      }
    };

    // Block right-click context menu during test
    const handleContextMenu = (event: MouseEvent) => {
      const blockPage = shouldBlockPage();
      if (blockPage) {
        event.preventDefault();
        if (confirm("Test tugamaguncha o'ng tugma menyusi ishlamaydi!\n\nFullscreen rejimiga qaytishni xohlaysizmi?")) {
          enterFullscreen();
        }
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
          if (confirm("Test tugamaguncha developer tools ishlamaydi!\n\nFullscreen rejimiga qaytishni xohlaysizmi?")) {
            enterFullscreen();
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleDevToolsBlock);
    const handlePopState = (event: PopStateEvent) => {
      handleNavigation(event);
    };
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);

    // Block window focus/blur events during audio
    const handleWindowBlur = () => {
      const blockPage = shouldBlockPage();
      if (blockPage && checkAudioPlaying()) {
        setTimeout(() => {
          window.focus();
          // No alert - just return to fullscreen automatically
          enterFullscreen();
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
        if (confirm("Test tugamaguncha browser navigation tugmalari ishlamaydi!\n\nFullscreen rejimiga qaytishni xohlaysizmi?")) {
          enterFullscreen();
        }
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
      window.removeEventListener("popstate", handlePopState);
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
    location.pathname,
  ]);
};
