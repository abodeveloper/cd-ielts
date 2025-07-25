import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  RiCustomerServiceLine,
  RiErrorWarningLine
} from "@remixicon/react";
import { useRef, useState } from "react";

interface StepProps {
  onNext?: () => void;
}

export default function TestSoundStep({ onNext }: StepProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleSound = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiCustomerServiceLine className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            Test sound
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center">
            Put on your headphones and click on the Play sound button to play a
            sample sound.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={toggleSound}>
              {isPlaying ? "Stop sound" : "Play sound"}
            </Button>
          </div>
          <p className="flex gap-2">
            <RiErrorWarningLine className="text-destructive" /> If you cannot
            hear the sound clearly, please tell the invigilator.
          </p>
          <audio
            ref={audioRef}
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onNext}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
