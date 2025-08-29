import { toastService } from "@/lib/toastService";
import { useEffect, useState } from "react";
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

  // initialTime o‘zgarganda timeLeft ni yangilash
  useEffect(() => {
    if (initialTime !== null) {
      setTimeLeft(initialTime);
    }
  }, [initialTime]);

  // Taymer logikasi
  useEffect(() => {
    // startTimer false bo‘lsa yoki initialTime null bo‘lsa, taymer ishlamaydi
    if (
      !startTimer ||
      initialTime === null ||
      timeLeft === null ||
      isTestFinished
    ) {
      return;
    }

    // Vaqt tugaganda
    if (timeLeft <= 0) {
      if (!isTestFinished) {
        toastService.error("The time limit has expired.");
        setTimeout(() => {
          onSubmit();
          setIsTestFinished(true);
        }, 2000);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTime, timeLeft, isTestFinished, onSubmit, startTimer]);

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
