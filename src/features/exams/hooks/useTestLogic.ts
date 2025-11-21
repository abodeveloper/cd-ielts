import { toastService } from "@/lib/toastService";
import { useEffect, useRef, useState } from "react";
import { AllTestParts } from "../types";

const useTestLogic = <T extends AllTestParts>(
  initialTime: number | null, // null bo‘lsa vaqt yo‘q degani
  data: T[],
  onSubmit: () => void,
  startTimer: boolean = true // Yangi prop: taymerni boshlashni boshqaradi
) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // initialTime o‘zgarganda timeLeft ni yangilash
  useEffect(() => {
    if (initialTime !== null) {
      endTimeRef.current = Date.now() + initialTime * 1000;
      setTimeLeft(initialTime);
    } else {
      endTimeRef.current = null;
      setTimeLeft(null);
    }
  }, [initialTime]);

  // Taymer logikasi
  useEffect(() => {
    // startTimer false bo‘lsa yoki initialTime null bo‘lsa, taymer ishlamaydi
    if (!startTimer || initialTime === null || isTestFinished) {
      return;
    }

    const tick = () => {
      if (endTimeRef.current === null) return;

      const secondsLeft = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      );
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0 && !isTestFinished) {
        clearTimer();
        toastService.error("The time limit has expired.");
        setIsTestFinished(true);
        onSubmit();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      clearTimer();
    };
  }, [initialTime, isTestFinished, onSubmit, startTimer]);

  // Tabni boshlash
  useEffect(() => {
    if (data.length > 0 && !activeTab) {
      setActiveTab(`tab-${data[0].id}`);
    }
  }, [data, activeTab]);

  const currentTabIndex = data.findIndex(
    (part) => `tab-${part.id}` === activeTab
  );

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  const handlePrevious = () =>
    currentTabIndex > 0 && setActiveTab(`tab-${data[currentTabIndex - 1].id}`);
  const handleNext = () =>
    currentTabIndex < data.length - 1 &&
    setActiveTab(`tab-${data[currentTabIndex + 1].id}`);

  // Testni yakunlash
  const finishTest = () => {
    if (initialTime !== null && !isTestFinished) {
      clearTimer();
      onSubmit();
      setIsTestFinished(true);
    }
  };

  return {
    timeLeft: timeLeft ?? 0,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
    finishTest,
  };
};

export default useTestLogic;
