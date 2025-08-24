import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakingFormValues } from "@/features/exams/schemas/speaking-schema";
import { Speaking } from "@/features/exams/types";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import {
  RiArrowRightSLine,
  RiFlagLine,
  RiSpeakLine,
  RiStopCircleLine,
  RiTimerFlashLine,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface SpeakingQuestionContentProps {
  part: Speaking;
  activeTab: string;
  form: UseFormReturn<SpeakingFormValues>;
  isLastPart: boolean;
  onNextPart?: () => void;
  onFinish?: () => void;
  allAudioChunks: React.MutableRefObject<Blob[]>;
}

type TestPhase = "preparation" | "answering" | "paused" | "finish";

const SpeakingQuestionContent = ({
  part,
  activeTab,
  isLastPart,
  onNextPart,
  onFinish,
  allAudioChunks,
}: SpeakingQuestionContentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<TestPhase>("preparation");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopPromiseRef = useRef<((value?: unknown) => void) | null>(null);

  const questions = part.speaking_answer || [];
  const currentQuestion = questions[currentIndex];

  // Vaqtni formatlash funksiyasi
  const formatTimeLeft = (seconds: number | null) => {
    if (seconds === null) return "";
    if (seconds < 60) {
      return <div className="w-[50px]">{`${seconds} s`}</div>;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return (
        <div className="w-[50px]">
          {`${minutes}:${secs.toString().padStart(2, "0")}`}
        </div>
      );
    }
  };

  // Prep time ni boshlash
  useEffect(() => {
    if (
      currentQuestion &&
      phase === "preparation" &&
      activeTab === `tab-${part.id}`
    ) {
      setTimeLeft(part.prep_time);
    }
  }, [currentIndex, activeTab, phase, currentQuestion, part.prep_time]);

  // Taymer logikasi
  useEffect(() => {
    if (timeLeft === null || phase === "paused" || phase === "finish") return;

    if (timeLeft <= 0) {
      if (phase === "preparation") {
        setPhase("answering");
        setTimeLeft(part.answer_time);
        handleStartRecording();
      } else if (phase === "answering") {
        handleStopRecording().then(() => {
          setPhase("paused");
          setTimeLeft(0);
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, part.answer_time]);

  // Paused fazasidan keyin keyingi savol yoki qismga o‘tish
  useEffect(() => {
    if (phase === "paused" && timeLeft === 0 && !hasFinished) {
      const transitionTimeout = setTimeout(() => {
        console.log("Paused fazasi:", {
          currentIndex,
          questionsLength: questions.length,
          isLastPart,
        });

        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setPhase("preparation");
          setTimeLeft(null);
        } else if (!isLastPart && onNextPart) {
          onNextPart();
          setCurrentIndex(0);
          setPhase("preparation");
          setTimeLeft(null);
        } else if (isLastPart && onFinish) {
          console.log("onFinish chaqirilmoqda");
          setHasFinished(true);
          setPhase("finish");
          onFinish();
        }
      }, 1000);

      return () => clearTimeout(transitionTimeout);
    }
  }, [
    phase,
    timeLeft,
    currentIndex,
    questions.length,
    isLastPart,
    onNextPart,
    onFinish,
    hasFinished,
  ]);

  // Yozib olishni boshlash
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          allAudioChunks.current.push(blob);
          console.log("Audio Blob qo‘shildi:", {
            partId: part.id,
            questionIndex: currentIndex,
            blobSize: blob.size,
          });
        }
        if (stopPromiseRef.current) {
          stopPromiseRef.current();
          stopPromiseRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mikrofon ruxsati rad etildi:", error);
      setPhase("paused");
      setTimeLeft(0);
    }
  };

  // Yozib olishni to‘xtatish
  const handleStopRecording = () => {
    return new Promise<void>((resolve) => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        stopPromiseRef.current = resolve;
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve();
      }
    });
  };

  // “Davom etish” tugmasi
  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (phase === "preparation") {
      setPhase("answering");
      setTimeLeft(part.answer_time);
      handleStartRecording();
    } else if (phase === "answering" && isRecording) {
      await handleStopRecording();
      setPhase("paused");
      setTimeLeft(0);
    }
  };

  if (!currentQuestion) {
    return <div className="text-center text-lg">Savol mavjud emas</div>;
  }

  return (
    <>
      <div className="h-[calc(100vh-225px)] flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col gap-20">
          <div className="text-lg font-extrabold">
            {phase === "preparation" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiTimerFlashLine size={80} className="text-orange-500" />
                <div className="text-orange-500 flex items-center gap-2 justify-center">
                  <div>Get ready:</div> {formatTimeLeft(timeLeft)}
                </div>
              </div>
            )}
            {phase === "answering" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiSpeakLine size={80} className="text-green-500" />
                <div className="text-green-500 flex items-center gap-2 justify-center">
                  <div>Answering:</div> {formatTimeLeft(timeLeft)}
                </div>
              </div>
            )}

            {phase === "paused" && <LoadingSpinner />}
            {phase === "finish" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiFlagLine size={80} className="text-green-500" />
                <div className="text-green-500">Finish speaking</div>
              </div>
            )}
          </div>

          {phase !== "finish" && (
            <div className="text-2xl font-bold text-center">
              {currentQuestion.question_number}. {currentQuestion.question}
            </div>
          )}
        </div>
      </div>
      <Card className="w-full shadow-md p-2 px-5 sticky bottom-0 z-50 rounded-none">
        <CardContent className="p-0 flex items-center justify-end gap-2 h-[80px]">
          {(phase === "preparation" || phase === "answering") && (
            <div className="flex flex-col items-center gap-4">
              {phase === "preparation" && (
                <Button
                  variant="success"
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  <>
                    <RiSpeakLine size={20} />
                    Start replying
                  </>
                </Button>
              )}

              {phase === "answering" && isRecording && (
                <Button
                  variant="destructive"
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  <>
                    <RiStopCircleLine size={20} />
                    Stop and continue
                    <RiArrowRightSLine size={20} />
                  </>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SpeakingQuestionContent;
