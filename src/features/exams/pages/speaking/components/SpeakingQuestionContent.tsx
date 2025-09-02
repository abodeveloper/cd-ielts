import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakingPart } from "@/features/exams/types";
import HTMLRendererWithHighlight from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import {
  RiArrowRightSLine,
  RiFlagLine,
  RiSpeakLine,
  RiStopCircleLine,
  RiTimerFlashLine,
} from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";

// useSize hook (from the article)
const useSize = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const setSizes = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, [setWidth, setHeight]);

  useEffect(() => {
    window.addEventListener("resize", setSizes);
    setSizes();
    return () => window.removeEventListener("resize", setSizes);
  }, [setSizes]);

  return [width, height];
};

// animateBars function (from the article, modified for green color)
function animateBars(analyser, canvas, canvasCtx, dataArray, bufferLength) {
  analyser.getByteFrequencyData(dataArray);
  canvasCtx.fillStyle = "#000";
  const HEIGHT = canvas.height / 2;
  var barWidth = Math.ceil(canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (var i = 0; i < bufferLength; i++) {
    barHeight = (dataArray[i] / 255) * HEIGHT;
    canvasCtx.fillStyle = "#21C55d"; // Green color
    canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

// WaveForm component (from the article)
const WaveForm = ({ analyzerData }) => {
  const canvasRef = useRef(null);
  const { dataArray, analyzer, bufferLength } = analyzerData;

  const draw = (dataArray, analyzer, bufferLength) => {
    const canvas = canvasRef.current;
    if (!canvas || !analyzer) return;
    const canvasCtx = canvas.getContext("2d");

    const animate = () => {
      if (!canvasRef.current || !analyzer) return;
      requestAnimationFrame(animate);
      canvas.width = canvas.width; // Clear canvas
      animateBars(analyzer, canvas, canvasCtx, dataArray, bufferLength);
    };

    animate();
  };

  useEffect(() => {
    draw(dataArray, analyzer, bufferLength);
  }, [dataArray, analyzer, bufferLength]);

  const [width, height] = useSize();
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        maxWidth: "600px",
        maxHeight: "100px",
        marginTop: "16px",
        width: "100%",
      }}
    />
  );
};

interface SpeakingQuestionContentProps {
  part: SpeakingPart;
  activeTab: string;
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
  const [analyzerData, setAnalyzerData] = useState(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopPromiseRef = useRef<((value?: unknown) => void) | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const questions = part?.question_numbers || [];
  const currentQuestion = questions[currentIndex];

  // Format time function
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

  // Audio analysis function (adapted from article, no audio output)
  const audioAnalyzer = (stream: MediaStream) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioCtx;
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 2048;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer); // Connect only to analyzer, not destination
    setAnalyzerData({ analyzer, bufferLength, dataArray });
  };

  // Start prep time
  useEffect(() => {
    if (
      currentQuestion &&
      phase === "preparation" &&
      activeTab === `tab-${part.id}`
    ) {
      setTimeLeft(part.prep_time);
    }
  }, [currentIndex, activeTab, phase, currentQuestion, part.prep_time]);

  // Timer logic
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

  // Transition after paused phase
  useEffect(() => {
    if (phase === "paused" && timeLeft === 0 && !hasFinished) {
      const transitionTimeout = setTimeout(() => {
        console.log("Paused phase:", {
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
          console.log("onFinish called");
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

  // Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Analyze audio for waveform
      audioAnalyzer(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          allAudioChunks.current.push(blob);
          console.log("Audio Blob added:", {
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
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setAnalyzerData(null); // Stop waveform
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setPhase("paused");
      setTimeLeft(0);
    }
  };

  // Stop recording
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

  // Continue button
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
    return <div className="text-center text-lg">No question available</div>;
  }

  return (
    <>
      <div className="h-[calc(100vh-225px)] flex flex-col items-center justify-center gap-6 p-[100px]">
        <div className="flex flex-col gap-10">
          <div className="text-lg font-extrabold">
            {phase === "preparation" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiTimerFlashLine size={80} className="text-orange-500" />
                <div className="text-orange-500 flex items-center gap-2 justify-center">
                  <div>Preparation:</div> {formatTimeLeft(timeLeft)}
                </div>
              </div>
            )}
            {phase === "answering" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiSpeakLine size={80} className="text-green-500" />
                <div className="text-green-500 flex items-center gap-2 justify-center">
                  <div>Speaking:</div> {formatTimeLeft(timeLeft)}
                </div>
                {isRecording && analyzerData && (
                  <WaveForm analyzerData={analyzerData} />
                )}
              </div>
            )}
            {phase === "paused" && <LoadingSpinner />}
            {phase === "finish" && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <RiFlagLine size={80} className="text-green-500" />
                <div className="text-green-500">Test Completed</div>
              </div>
            )}
          </div>

          {phase !== "finish" && (
            <div className="text-2xl font-bold text-center">
              {currentQuestion.question_number}.{" "}
              <HTMLRendererWithHighlight
                // className="h-full overflow-y-auto p-6 text-sm"
                htmlString={currentQuestion.question}
              />
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
                  <RiSpeakLine size={20} />
                  Start Answering
                </Button>
              )}
              {phase === "answering" && isRecording && (
                <Button
                  variant="destructive"
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  <RiStopCircleLine size={20} />
                  Stop and Continue
                  <RiArrowRightSLine size={20} />
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
