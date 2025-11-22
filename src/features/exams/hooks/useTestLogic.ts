import { toastService } from "@/lib/toastService";
import { useEffect, useRef, useState } from "react";
import { AllTestParts } from "../types";

const useTestLogic = <T extends AllTestParts>(
  initialTime: number | null, // null bo'lsa vaqt yo'q degani
  data: T[],
  onSubmit: () => void,
  startTimer: boolean = true // Listening testda audio tugagach boshlash uchun
) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef<boolean>(false); // Vaqt tugaganda submit qilinganligini kuzatish
  const timerStartedRef = useRef<boolean>(false); // Taymer boshlanganligini kuzatish (boshlangandan keyin to'xtamasligi uchun)
  
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // initialTime o'zgarganda timeLeft ni yangilash
  useEffect(() => {
    if (initialTime !== null) {
      endTimeRef.current = Date.now() + initialTime * 1000;
      setTimeLeft(initialTime);
      hasSubmittedRef.current = false; // Yangi vaqt boshlanganda reset qilish
    } else {
      endTimeRef.current = null;
      setTimeLeft(null);
    }
  }, [initialTime]);

  // Taymer logikasi - boshlangandan keyin hech qachon to'xtamaydi
  useEffect(() => {
    // initialTime null bo'lsa yoki test tugagan bo'lsa, taymer ishlamaydi
    if (initialTime === null || isTestFinished) {
      return;
    }

    // startTimer false bo'lsa va taymer hali boshlanmagan bo'lsa, kutish
    if (!startTimer && !timerStartedRef.current) {
      return;
    }

    // Taymer boshlangan deb belgilash (boshlangandan keyin to'xtamasligi uchun)
    timerStartedRef.current = true;

    const tick = () => {
      if (endTimeRef.current === null) return;

      const secondsLeft = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      );
      setTimeLeft(secondsLeft);

      // Vaqt tugaganda avtomatik submit qilish (faqat bir marta)
      if (secondsLeft <= 0 && !isTestFinished && !hasSubmittedRef.current) {
        clearTimer();
        hasSubmittedRef.current = true;
        setIsTestFinished(true);
        toastService.error("The time limit has expired.");
        // Avtomatik submit qilish
        onSubmit();
      }
    };

    // Darhol birinchi marta tekshirish
    tick();
    // Har sekundda tekshirish
    timerRef.current = setInterval(tick, 1000);

    return () => {
      // Taymerni faqat test tugaganda to'xtatish
      // Boshqa holatlarda (masalan, component unmount bo'lganda) ham to'xtatish kerak
      // Lekin taymer boshlangan bo'lsa va test tugagan bo'lsa, to'xtatish
      if (isTestFinished || !timerStartedRef.current) {
        clearTimer();
      }
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
