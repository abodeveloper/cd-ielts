import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { useListeningForm } from "@/features/exams/hooks/useListeningForm";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { Listening } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import TestSoundStep from "./TestSoundsStep";

// Asosiy ListeningTestStep komponenti
const ListeningTestStep = () => {
  const { id } = useParams();
  const { form, onSubmit, query } = useListeningForm(id);
  const data: Listening[] = Array.isArray(query.data) ? query.data : [];
  const {
    timeLeft,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
  } = useTestLogic<Listening>(3000, data, form.handleSubmit(onSubmit));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showTestSoundStep, setShowTestSoundStep] = useState(true);

  // TestSoundStep dan o‘tish
  const handleContinue = () => {
    setShowTestSoundStep(false);
  };

  // Audio fayllarni ketma-ket ijro qilish
  useEffect(() => {
    if (
      showTestSoundStep ||
      !audioRef.current ||
      !data.length ||
      currentAudioIndex >= data.length
    )
      return;

    const audio = audioRef.current;
    audio.src = data[currentAudioIndex].audio;
    audio.volume = 1;
    audio.play().catch((error) => {
      console.error(
        `Audio ijro etishda xato (part ${data[currentAudioIndex].id}):`,
        error
      );
    });

    const handleAudioEnd = () => {
      if (currentAudioIndex < data.length - 1) {
        setCurrentAudioIndex((prev) => prev + 1);
      }
    };

    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleAudioEnd);
    };
  }, [currentAudioIndex, data, showTestSoundStep]);

  // Ovoz balandligini boshqarish
  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  if (query.isLoading) return <LoadingSpinner message="Loading test data..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  const activePart = data.find((part) => `tab-${part.id}` === activeTab);

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

            {data.length > 0 && <audio ref={audioRef} controls={false} />}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <ContentPanel
                data={data}
                activeTab={activeTab}
                testType={TestType.LISTENING}
                form={form}
              />
              <TestNavigation
                data={data}
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
