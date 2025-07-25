import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  RiErrorWarningLine,
  RiPencilLine
} from "@remixicon/react";

interface StepProps {
  onNext?: () => void;
}

export default function ReadyStep({ onNext }: StepProps) {
  return (
    <div className="flex items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiPencilLine className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            IELTS Academic Writing
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Time:</strong> 1 hour
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INSTRUCTIONS TO CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Answer both parts.</li>
              <li>You can change your answers at any time during the test.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">
              INFORMATION FOR CANDIDATES
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>There are two parts in this test.</li>
              <li>
                Part 2 contributes twice as much as Part 1 to the writing score.
              </li>
              <li>
                The test clock will show you when there are 10 minutes and 5
                minutes remaining.
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
