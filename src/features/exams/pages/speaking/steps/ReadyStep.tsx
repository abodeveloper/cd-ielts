import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { RiMic2Line, RiErrorWarningLine } from "@remixicon/react";

interface StepProps {
  onNext?: () => void;
}

export default function ReadyStepSpeaking({ onNext }: StepProps) {
  return (
    <div className="flex items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiMic2Line className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            IELTS Academic Speaking
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Time:</strong> 11–14 minutes
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INSTRUCTIONS TO CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>This test will be recorded through your microphone.</li>
              <li>Speak clearly and answer all the questions.</li>
              <li>You cannot pause or repeat the questions.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INFORMATION FOR CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Speaking test has three parts.</li>
              <li>Part 1: Introduction and interview.</li>
              <li>
                Part 2: Long turn (1 minute to prepare, 1–2 minutes to speak).
              </li>
              <li>Part 3: Two-way discussion.</li>
            </ul>
          </div>
          <p className="flex gap-2">
            <RiErrorWarningLine /> Check your microphone before starting.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onNext}>
            Start Speaking Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
