import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { useListeningForm } from "@/features/exams/hooks/useListeningForm";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { ListeningPart } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { get } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import TestSoundStep from "./TestSoundsStep";
import { sortListeningParts } from "@/features/exams/utils/sortListeningParts";

interface StepProps {
  onNext?: (data: any) => void;
}

// Asosiy ListeningTestStep komponenti
const ListeningTestStep = ({ onNext }: StepProps) => {
  const { id } = useParams();
  const { form, onSubmit, query, listeningMutation, finish } = useListeningForm(
    id,
    onNext
  );

  const listeningParts = get(
    query,
    "data.listening_parts",
    []
  ) as ListeningPart[] | undefined;
  const parts = useMemo(
    () => sortListeningParts(Array.isArray(listeningParts) ? listeningParts : []),
    [listeningParts]
  );
  const answer_time = get(query, "data.answer_time", null);
  const materialTestType = (get(query, "data.material.test_type", "Mock") || "Mock")
    .toString()
    .toLowerCase();
  const isMockTest = materialTestType === "mock";
  const hasAnswerDuration = typeof answer_time === "number" && answer_time > 0;

  const [startTimer, setStartTimer] = useState(false); // Audio tugagach taymerni boshlash uchun
  const [showTestSoundStep, setShowTestSoundStep] = useState(true);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0); // Hozir ijro etilayotgan audio indexi

  // Barcha audio fayllar yuklanganini bildirish uchun holat
  const [audioPreloaded, setAudioPreloaded] = useState(false);
  // Yuklangan audio elementlarini saqlash uchun ref
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  // Hozirgi aktiv audio elementini saqlash uchun ref
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("audioVolume");
    return savedVolume ? parseFloat(savedVolume) : 1;
  });

  // Pause state for thematic tests
  const [isPaused, setIsPaused] = useState(false);
  // Track if student has started the audio (for disabling button after first play)
  const [studentHasStarted, setStudentHasStarted] = useState(false);
  // Track if user has manually started the audio
  const [userHasStarted, setUserHasStarted] = useState(false);

  // Update pause state when query data is available
  useEffect(() => {
    if (query.data) {
      const testType = get(query, "data.material.test_type", "Mock");
      if (testType === "Thematic") {
        setIsPaused(true); // Start paused for thematic tests
        setUserHasStarted(false); // Ensure user hasn't started yet
      } else {
        setIsPaused(false); // Mock tests play normally
        setUserHasStarted(true); // Mock tests auto-start
      }
    }
  }, [query.data]);

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
    startTimer, // Audio tugagach taymerni boshlash
    finish // Vaqt tugaganda keyingi testga o'tkazish uchun
  );

  usePreventPageLeave(!isTestFinished); // Aktivlashtirilgan

  // Audio fayllarni oldindan yuklash
  useEffect(() => {
    if (query.isSuccess && parts.length > 0 && !audioPreloaded) {
      let loadedCount = 0;
      const newAudioElements: HTMLAudioElement[] = [];

      parts.forEach((part, index) => {
        const audio = new Audio();
        audio.src = part.audio;
        audio.preload = "auto"; // Faylni avtomatik yuklash
        audio.volume = volume; // Ovoz balandligini sozlash
        newAudioElements[index] = audio;

        audio.oncanplaythrough = () => {
          loadedCount++;
          if (loadedCount === parts.length) {
            setAudioPreloaded(true);
            audioRefs.current = newAudioElements;
          }
        };

        audio.onerror = (e) => {
          console.error(`Audio yuklashda xato (part ${part.id}):`, e);
          // Xatolik bo'lsa ham yuklangan deb hisoblash kerak bo'lishi mumkin
          // Yoki yuklash xatosi bilan ishlovchi logikani qo'shish
          loadedCount++;
          if (loadedCount === parts.length) {
            setAudioPreloaded(true);
            audioRefs.current = newAudioElements;
          }
        };
      });
    }
  }, [query.isSuccess, parts, audioPreloaded, volume]);

  // TestSoundStep dan o'tish
  const handleContinue = () => {
    setShowTestSoundStep(false);
    // Birinchi audioni ijro etishni boshlash - faqat Mock testlar uchun
    if (audioRefs.current.length > 0) {
      activeAudioRef.current = audioRefs.current[0];
      
      // Check if it's a thematic test
      const testType = get(query, "data.material.test_type", "Mock");
      if (testType === "Mock") {
        // Mock tests auto-play
        activeAudioRef.current.play().catch((error) => {
          console.error("Birinchi audio ijro etishda xato:", error);
        });
      } else {
        // Thematic tests start paused - don't auto-play
      }
    }
  };

  // Ovoz balandligini localStorage'da saqlash
  useEffect(() => {
    localStorage.setItem("audioVolume", volume.toString());
    // Barcha yuklangan audio elementlarining ovoz balandligini yangilash
    audioRefs.current.forEach((audio) => {
      audio.volume = volume;
    });
  }, [volume]);

  // Ensure thematic tests start paused
  useEffect(() => {
    if (query.data && audioPreloaded) {
      const testType = get(query, "data.material.test_type", "Mock");
      if (testType === "Thematic" && activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      }
    }
  }, [query.data, audioPreloaded]);

  // Audio fayllarni ketma-ket ijro qilish
  useEffect(() => {
    if (showTestSoundStep || !audioPreloaded || parts.length === 0) {
      return;
    }

    // Check if it's a thematic test and user hasn't started yet
    const testType = get(query, "data.material.test_type", "Mock");
    if (testType === "Thematic" && !userHasStarted) {
      return;
    }

    const currentAudio = activeAudioRef.current;

    const handleAudioEnd = () => {
      if (currentAudioIndex < parts.length - 1) {
        // Hozirgi audioni to'xtatish va keyingisiga o'tish
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0; // Keyingi safar boshidan ijro etish uchun
        }
        setCurrentAudioIndex((prev) => prev + 1);
      } else {
        // Barcha audio fayllar tugagach taymerni boshlash (boshlangandan keyin to'xtamasligi uchun)
        setStartTimer(true);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
    };

    if (currentAudioIndex < parts.length) {
      // Yangi audioni faollashtirish
      const nextAudio = audioRefs.current[currentAudioIndex];
      if (nextAudio && nextAudio !== currentAudio) {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.removeEventListener("ended", handleAudioEnd);
        }
        activeAudioRef.current = nextAudio;
        activeAudioRef.current.volume = volume; // Ovoz balandligini sozlash
        
        // For thematic tests, ensure audio is paused initially
        if (testType === "Thematic" && !userHasStarted) {
          activeAudioRef.current.pause();
          activeAudioRef.current.currentTime = 0;
        }
        
        // Only play if not paused (for thematic tests) AND user has manually started
        if (!isPaused && userHasStarted) {
          activeAudioRef.current.play().catch((error) => {
            console.error(
              `Audio ijro etishda xato (part ${parts[currentAudioIndex].id}):`,
              error
            );
          });
        }
        activeAudioRef.current.addEventListener("ended", handleAudioEnd);
      } else if (currentAudio) {
        // Agar audio o'zgarmagan bo'lsa va ijro etilmayotgan bo'lsa, ijro etish
        if (currentAudio.paused && !isPaused && userHasStarted) {
          currentAudio.play().catch((error) => {
            console.error("Audio ijro etishda xato:", error);
          });
        }
        currentAudio.addEventListener("ended", handleAudioEnd);
      }
    }

    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.removeEventListener("ended", handleAudioEnd);
      }
    };
  }, [currentAudioIndex, parts, showTestSoundStep, audioPreloaded, volume, isPaused, userHasStarted]);

  // MediaSession API orqali media tugmalarini bloklash (faol audio elementga ta'sir qiladi)
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        if (activeAudioRef.current && activeAudioRef.current.paused && userHasStarted) {
          activeAudioRef.current.play();
        }
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (activeAudioRef.current && !activeAudioRef.current.paused) {
          activeAudioRef.current.pause();
        }
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        if (activeAudioRef.current) {
          activeAudioRef.current.pause();
          activeAudioRef.current.currentTime = 0;
        }
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        // Keyingi audioni ijro etish logikasini shu yerga qo'shishingiz mumkin
        if (currentAudioIndex < parts.length - 1) {
          setCurrentAudioIndex((prev) => prev + 1);
        }
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        // Oldingi audioni ijro etish logikasini shu yerga qo'shishingiz mumkin
        if (currentAudioIndex > 0) {
          setCurrentAudioIndex((prev) => prev - 1);
        }
      });
    }
  }, [currentAudioIndex, parts.length, userHasStarted]);

  // Ovoz balandligini boshqarish
  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  // Pause/Play toggle handler
  const handlePauseToggle = () => {
    if (activeAudioRef.current) {
      if (isPaused) {
        // Starting audio
        activeAudioRef.current.play();
        setIsPaused(false);
        setUserHasStarted(true); // Mark that user has manually started audio
        
        // If user is student, mark that they have started the audio
        const { user } = useAuthStore.getState();
        if (user?.role === Role.STUDENT) {
          setStudentHasStarted(true);
        }
      } else {
        // Pausing audio - only allow if user is teacher or student hasn't started yet
        const { user } = useAuthStore.getState();
        if (user?.role === Role.TEACHER || !studentHasStarted) {
          activeAudioRef.current.pause();
          setIsPaused(true);
        }
      }
    }
  };

  const activePart = parts.find((part) => `tab-${part.id}` === activeTab);

  if (query.isLoading || !audioPreloaded)
    return <LoadingSpinner message="Loading test data and audio files..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  if (query.data?.listening_parts.length === 0)
    return (
      <ErrorMessage
        title="Failed to load test"
        message="An error occurred while loading the test questions. Please try again later."
      />
    );

  return (
    <>
      {showTestSoundStep ? (
        // TestSoundStep komponentiga volume va audioRefs ni uzatish
        <TestSoundStep
          onNext={handleContinue}
          onVolumeChange={handleVolumeChange}
          initialVolume={volume}
          audioElements={audioRefs.current} // Ovoz balandligini sinash uchun audio elementlar
        />
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen">
            <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
              <TestHeader
                timeLeft={timeLeft}
                formatTime={formatTime}
                testType={TestType.LISTENING}
                type={get(query, "data.material.test_type", "Mock")}
                // activeAudioRef.current ni yuborish, chunki endi u bitta audio elementini bildiradi
                audioRef={activeAudioRef}
                handleVolumeChange={handleVolumeChange}
                handlePauseToggle={handlePauseToggle}
                isPaused={isPaused}
                studentHasStarted={studentHasStarted}
                userHasStarted={userHasStarted}
              />
              <PartInfo activePart={activePart} testType={TestType.LISTENING} />
            </div>

            {/* Endi bu yerda bitta audio elementi kerak emas, chunki u ref orqali boshqariladi */}
            {/* <audio ref={activeAudioRef} controls={false} /> */}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <ContentPanel
                data={parts}
                activeTab={activeTab}
                testType={TestType.LISTENING}
                form={form}
                testId={id}
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
                isLoading={listeningMutation.isPending}
              />
            </Tabs>
          </form>
        </FormProvider>
      )}
    </>
  );
};

export default ListeningTestStep;
