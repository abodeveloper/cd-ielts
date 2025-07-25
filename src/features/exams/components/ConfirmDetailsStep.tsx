import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { RiErrorWarningLine, RiInfoCardLine } from "@remixicon/react";
import { NavLink } from "react-router-dom";

interface StepProps {
  onNext?: () => void;
}

export default function ConfirmDetailsStep({ onNext }: StepProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiInfoCardLine className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            Confirm your details
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> Abbas Ibragimov
            </p>
            <p>
              <strong>Date of birth:</strong> 28.11.2000
            </p>
            <p>
              <strong>Candidate number:</strong> 0
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-center md:flex-row md:items-center md:text-left">
            <RiErrorWarningLine />
            <span>If your details are not correct, please</span>
            <NavLink
              to="/profil/detail"
              className="text-blue-600 flex gap-2 items-center"
            >
              update your profile.
            </NavLink>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onNext}>
            My details are correct
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
