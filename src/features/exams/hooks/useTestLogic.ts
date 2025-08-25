import { toastService } from "@/lib/toastService";
import { useEffect, useState } from "react";
import { AllTestParts } from "../types";

const useTestLogic = <T extends AllTestParts>(
  initialTime: number | null, // ⬅️ null bo‘lsa vaqt yo‘q degani
  data: T[],
  onSubmit: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTime); // ⬅️ Allow null initially
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  // Update timeLeft when initialTime changes
  useEffect(() => {
    if (initialTime !== null) {
      setTimeLeft(initialTime); // Set timeLeft only when initialTime is available
    }
  }, [initialTime]);

  // Timer logic
  useEffect(() => {
    // Skip if no initialTime, test is finished, or timeLeft is not set
    if (initialTime === null || timeLeft === null || isTestFinished) {
      return;
    }

    // Handle time expiration
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
  }, [initialTime, timeLeft, isTestFinished, onSubmit]);

  // Tab initialization
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

  // Finish test only if there's a timer and test isn't finished
  const finishTest = () => {
    if (initialTime !== null && !isTestFinished) {
      onSubmit();
      setIsTestFinished(true);
    }
  };

  return {
    timeLeft: timeLeft ?? 0, // Return 0 for display if timeLeft is null
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
