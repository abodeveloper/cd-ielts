import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { useListeningForm } from "@/features/exams/hooks/useListeningForm";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { ListeningPart } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { get } from "lodash";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import TestSoundStep from "./TestSoundsStep";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";

// Asosiy ListeningTestStep komponenti
const ListeningTestStep = () => {
  const { id } = useParams();
  const { form, onSubmit, query } = useListeningForm(id);

  const parts: ListeningPart[] = get(query, "data.listening_parts", []);
  const answer_time = get(query, "data.answer_time", null);

  const [startTimer, setStartTimer] = useState(false); // Taymerni boshlash uchun holat

  const {
    timeLeft,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
  } = useTestLogic<ListeningPart>(
    answer_time,
    parts,
    form.handleSubmit(onSubmit),
    startTimer // Yangi prop
  );

  // Prevent page leave when test is not finished
  usePreventPageLeave(!isTestFinished);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showTestSoundStep, setShowTestSoundStep] = useState(true);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("audioVolume");
    return savedVolume ? parseFloat(savedVolume) : 1;
  });

  // TestSoundStep dan o‘tish
  const handleContinue = () => {
    setShowTestSoundStep(false);
  };

  // Ovoz balandligini localStorage'da saqlash
  useEffect(() => {
    localStorage.setItem("audioVolume", volume.toString());
  }, [volume]);

  // Ovoz balandligini yangilash (audio restart qilmasdan)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio fayllarni ketma-ket ijro qilish
  useEffect(() => {
    if (
      showTestSoundStep ||
      !audioRef.current ||
      !parts.length ||
      currentAudioIndex >= parts.length
    ) {
      if (currentAudioIndex >= parts.length && parts.length > 0) {
        setStartTimer(true); // Barcha audio fayllar tugagach taymerni boshlash
      }
      return;
    }

    const audio = audioRef.current;
    audio.src = parts[currentAudioIndex].audio;
    audio.volume = volume;
    audio.play().catch((error) => {
      console.error(
        `Audio ijro etishda xato (part ${parts[currentAudioIndex].id}):`,
        error
      );
    });

    const handleAudioEnd = () => {
      if (currentAudioIndex < parts.length - 1) {
        setCurrentAudioIndex((prev) => prev + 1);
      } else {
        setStartTimer(true); // Oxirgi audio tugagach taymerni boshlash
      }
    };

    audio.addEventListener("ended", handleAudioEnd);

    // Pauza bo‘lsa, avtomatik play qilish
    const handlePause = () => {
      audio.play();
    };
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleAudioEnd);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentAudioIndex, parts, showTestSoundStep]);

  // MediaSession API orqali media tugmalarini bloklash
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {});
      navigator.mediaSession.setActionHandler("pause", () => {});
      navigator.mediaSession.setActionHandler("stop", () => {});
      navigator.mediaSession.setActionHandler("nexttrack", () => {});
      navigator.mediaSession.setActionHandler("previoustrack", () => {});
    }
  }, []);

  // Ovoz balandligini boshqarish
  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const activePart = parts.find((part) => `tab-${part.id}` === activeTab);

  if (query.isLoading) return <LoadingSpinner message="Loading test data..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  return (
    <>
      {showTestSoundStep ? (
        <TestSoundStep onNext={handleContinue} />
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen">
            <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
              <TestHeader
                timeLeft={timeLeft}
                formatTime={formatTime}
                testType={TestType.LISTENING}
                audioRef={audioRef}
                handleVolumeChange={handleVolumeChange}
              />
              <PartInfo activePart={activePart} testType={TestType.LISTENING} />
            </div>

            {parts.length > 0 && <audio ref={audioRef} controls={false} />}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <ContentPanel
                data={parts}
                activeTab={activeTab}
                testType={TestType.LISTENING}
                form={form}
              />
              <TestNavigation
                data={parts}
                testType={TestType.LISTENING}
                form={form}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentTabIndex={currentTabIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                onSubmit={form.handleSubmit(onSubmit)}
                isTestFinished={isTestFinished}
              />
            </Tabs>
          </form>
        </FormProvider>
      )}
    </>
  );
};

export default ListeningTestStep;
