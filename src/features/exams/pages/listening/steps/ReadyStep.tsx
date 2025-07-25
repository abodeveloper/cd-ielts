import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  RiErrorWarningLine,
  RiHeadphoneLine
} from "@remixicon/react";

interface StepProps {
  onNext?: () => void;
}

export default function ReadyStep({ onNext }: StepProps) {
  return (
    <div className="flex items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiHeadphoneLine className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            IELTS Academic Listening
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Time:</strong> Approximately 30 minutes
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INSTRUCTIONS TO CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Answer all the questions.</li>
              <li>You can change your answers at any time during the test.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INFORMATION FOR CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>There are 40 questions in this test.</li>
              <li>Each question carries one mark.</li>
              <li>There are four parts to the test.</li>
              <li>You will hear each part once.</li>
              <li>
                For each part of the test there will be time for you to look
                through the questions and time for you to check your answers.
              </li>
            </ul>
          </div>
          <p className="flex gap-2">
            <RiErrorWarningLine /> Read instructions and start only when ready.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onNext}>
            Start test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
