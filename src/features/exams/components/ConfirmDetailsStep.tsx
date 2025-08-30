import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { RiErrorWarningLine, RiInfoCardLine } from "@remixicon/react";
import { get } from "lodash";
import { NavLink } from "react-router-dom";

interface StepProps {
  onNext?: () => void;
}

export default function ConfirmDetailsStep({ onNext }: StepProps) {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted w-full">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiInfoCardLine className="w-12 h-12" />
          <h1 className="scroll-m-20 text-center text-lg font-extrabold tracking-tight text-balance">
            Confirm your details
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {get(user, "full_name")}
            </p>
            <p>
              <strong>Phone number:</strong> {get(user, "phone")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-center md:flex-row md:items-center md:text-left">
            <RiErrorWarningLine />
            <span>If your details are not correct, please</span>
            <NavLink
              to={
                user?.role === Role.TEACHER
                  ? "/teacher/profile"
                  : "/student/profile"
              }
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
