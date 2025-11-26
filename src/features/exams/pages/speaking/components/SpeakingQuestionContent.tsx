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
  RiVolumeUpLine,
  RiVolumeMuteLine,
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
function animateBars(
  analyser: AnalyserNode,
  canvas: HTMLCanvasElement,
  canvasCtx: CanvasRenderingContext2D,
  // Relax type here to satisfy linter and match AnalyserNode.getByteFrequencyData
  // which accepts Uint8Array with ArrayBufferLike internally.
  dataArray: any,
  bufferLength: number
) {
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
const WaveForm = ({
  analyzerData,
}: {
  analyzerData: {
    analyzer: AnalyserNode;
    bufferLength: number;
    dataArray: Uint8Array;
  };
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataArray, analyzer, bufferLength } = analyzerData;

  const draw = (
    dataArray: Uint8Array,
    analyzer: AnalyserNode,
    bufferLength: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas || !analyzer) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

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
  const [analyzerData, setAnalyzerData] = useState<{
    analyzer: AnalyserNode;
    bufferLength: number;
    dataArray: Uint8Array;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const stopPromiseRef = useRef<((value?: unknown) => void) | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyzerNodeRef = useRef<{
    analyzer: AnalyserNode;
    bufferLength: number;
    dataArray: Uint8Array;
  } | null>(null);

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const extractPlainText = (html: string): string => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion || !currentQuestion.question) return;
    if (!("speechSynthesis" in window)) {
      console.warn("Text-to-Speech is not supported in this browser.");
      return;
    }

    const text = extractPlainText(currentQuestion.question).trim();
    if (!text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  // Auto TTS when question changes
  useEffect(() => {
    if (!currentQuestion || !currentQuestion.question) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      utteranceRef.current = null;
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const text = extractPlainText(currentQuestion.question).trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.question_number]);

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
        handlePauseRecording();
        setPhase("paused");
        setTimeLeft(0);
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
          handleStopRecording().finally(() => {
            setPhase("finish");
            onFinish();
          });
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
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        // Request data before resuming to capture any remaining data from paused state
        try {
          mediaRecorderRef.current.requestData();
        } catch (e) {
          console.warn("Could not request data before resume:", e);
        }
        mediaRecorderRef.current.resume();
        setIsRecording(true);
        if (analyzerNodeRef.current) {
          setAnalyzerData(analyzerNodeRef.current);
        }
        console.log("Recording resumed. Total chunks:", allAudioChunks.current.length);
        return;
      }

      if (mediaRecorderRef.current?.state === "recording") {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      const highpass = audioCtx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 120;

      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 8000;

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-30, audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      const destination = audioCtx.createMediaStreamDestination();

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(destination);

      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 2048;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      compressor.connect(analyzer);
      analyzerNodeRef.current = { analyzer, bufferLength, dataArray };
      setAnalyzerData(analyzerNodeRef.current);

      const processedStream = destination.stream;

      const preferredMimeTypes = [
        "audio/mpeg", // mp3, agar brauzer qo'llab-quvvatlasa
        "audio/webm;codecs=opus",
        "audio/webm",
      ];

      const supportedMimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorderOptions: MediaRecorderOptions = supportedMimeType
        ? {
            mimeType: supportedMimeType,
            audioBitsPerSecond: 128000,
          }
        : { audioBitsPerSecond: 128000 };

      const recorder = new MediaRecorder(processedStream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          console.log("Audio chunk received:", e.data.size, "bytes");
          allAudioChunks.current.push(e.data);
        }
      };

      // Ensure we get all data when recording stops
      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
      };

      recorder.onstop = () => {
        // Request final data chunk before stopping
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try {
            mediaRecorderRef.current.requestData();
          } catch (e) {
            console.warn("Could not request final data:", e);
          }
        }
        
        setIsRecording(false);
        setAnalyzerData(null);
        analyzerNodeRef.current = null;
        console.log("Recording stopped. Total chunks:", allAudioChunks.current.length);
        
        // Cleanup after a small delay to ensure all data is received
        setTimeout(() => {
          mediaRecorderRef.current = null;
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          if (stopPromiseRef.current) {
            stopPromiseRef.current();
            stopPromiseRef.current = null;
          }
        }, 100);
      };

      // timeslice beramiz, shunda MediaRecorder har bir intervalda (masalan, 1 soniyada)
      // chunklarni yuboradi va ular darhol allAudioChunks ga qo'shiladi.
      // Bu eski bo'limlardagi yozuvlarning faqat oxirgi qismini emas,
      // butun davomiyligini saqlashga yordam beradi.
      // 1000ms = 1 soniya - bu recording davomida har sekundda chunk olish uchun
      recorder.start(1000);
      setIsRecording(true);
      console.log("Recording started with timeslice 1000ms");
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setPhase("paused");
      setTimeLeft(0);
    }
  };

  const handlePauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      // Request final data before pausing to ensure we capture everything
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.pause();
      setIsRecording(false);
      setAnalyzerData(null);
      console.log("Recording paused. Total chunks:", allAudioChunks.current.length);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    return new Promise<void>((resolve) => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        // Request final data before stopping to ensure we capture everything
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.requestData();
          }
        } catch (e) {
          console.warn("Could not request final data before stop:", e);
        }
        
        stopPromiseRef.current = () => {
          console.log("Recording fully stopped. Final chunk count:", allAudioChunks.current.length);
          resolve();
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve();
      }
    });
  };

  // Continue button
  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (phase === "preparation") {
      // Stop text-to-speech when starting to answer
      handleStopSpeaking();
      setPhase("answering");
      setTimeLeft(part.answer_time);
      await handleStartRecording();
    } else if (phase === "answering" && isRecording) {
      // Stop text-to-speech when stopping recording
      handleStopSpeaking();
      handlePauseRecording();
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
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-center">
                {currentQuestion.question_number}.{" "}
                <HTMLRendererWithHighlight
                  htmlString={currentQuestion.question}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isSpeaking ? handleStopSpeaking : handleSpeakQuestion}
                  className="flex items-center gap-2"
                >
                  {isSpeaking ? (
                    <>
                      <RiVolumeMuteLine size={18} />
                      <span>Stop Reading</span>
                    </>
                  ) : (
                    <>
                      <RiVolumeUpLine size={18} />
                      <span>Read Question</span>
                    </>
                  )}
                </Button>
              </div>
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
