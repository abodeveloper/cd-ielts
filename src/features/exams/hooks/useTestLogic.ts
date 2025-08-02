import { useEffect, useState } from "react";
import { toastService } from "@/lib/toastService";
import { TestData } from "../types";

const useTestLogic = <T extends TestData>(
  initialTime: number,
  data: T[],
  onSubmit: () => void
) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  // Timer logic
  useEffect(() => {
    if (isTestFinished || timeLeft <= 0) {
      if (timeLeft <= 0 && !isTestFinished) {
        toastService.error("The time limit has expired.");
        setTimeout(() => {
          onSubmit();
          setIsTestFinished(true);
        }, 2000);
      }
      // Ensure timeLeft doesn't go below 0
      if (timeLeft < 0) {
        setTimeLeft(0);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // Stop the timer when reaching 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTestFinished, onSubmit]);

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

  return {
    timeLeft,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
  };
};

export default useTestLogic;
