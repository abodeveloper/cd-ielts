import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { RiMic2Line, RiErrorWarningLine } from "@remixicon/react";
import { useRef, useState } from "react";

interface StepProps {
  onNext?: () => void;
}

export default function TestMicrophoneStep({ onNext }: StepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to continue.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiMic2Line className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            Test microphone
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center">
            Click on the button below and say a few words to check your
            microphone.
          </p>
          <div className="flex justify-center gap-2">
            {!isRecording ? (
              <Button variant="outline" onClick={startRecording}>
                🎤 Start recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording}>
                ⏹ Stop recording
              </Button>
            )}
          </div>

          {audioUrl && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Playback your recording:
              </p>
              <audio controls src={audioUrl}></audio>
            </div>
          )}

          <p className="flex gap-2">
            <RiErrorWarningLine className="text-destructive" />
            If your voice cannot be heard clearly, please tell the invigilator.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onNext} disabled={!audioUrl}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
