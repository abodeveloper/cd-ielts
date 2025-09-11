import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider import qilindi
import { cn } from "@/lib/utils";
import { Role } from "@/shared/enums/role.enum";
import { TestType } from "@/shared/enums/test-type.enum";
import { useAuthStore } from "@/store/auth-store";
import {
  RiArrowLeftLine,
  RiShieldUserLine,
  RiTimerLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "@remixicon/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TestHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  testType: TestType;
  type: "Mock" | "Thematic";
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  handleVolumeChange?: (value: number) => void; // handleVolumeChange yangilandi
}

const TestHeader = ({
  timeLeft,
  formatTime,
  testType = TestType.READING,
  audioRef,
  handleVolumeChange,
  type,
}: TestHeaderProps) => {
  const navigate = useNavigate();

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen(); // Safari
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen(); // IE/Edge
    }
  };

  const handleBack = () => {
    if (user?.role === Role.TEACHER) {
      if (type === "Thematic") {
        navigate("/teacher/tests/thematic");
      } else {
        navigate("/teacher/tests/mock");
      }
    } else {
      if (type === "Thematic") {
        navigate("/student/tests/thematic");
      } else {
        navigate("/student/tests/mock");
      }
    }
    exitFullscreen();
  };

  const { user } = useAuthStore();

  const [volume, setVolume] = useState(0.5);

  // Slider qiymati o‘zgarganda
  const onVolumeChange = (value: number[]) => {
    const newVolume = value[0]; // Slider massiv sifatida qiymat qaytaradi
    setVolume(newVolume);
    if (handleVolumeChange) {
      handleVolumeChange(newVolume);
    }
  };

  return (
    <Card className="w-full shadow-md rounded-none">
      <CardContent className="p-3 grid grid-cols-3 items-center h-[50px]">
        <div className="text-sm flex items-center gap-2">
          <RiShieldUserLine />
          <b>Candidate:</b> {user?.full_name || user?.username}
        </div>
        <div className="text-sm font-semibold font-mono flex items-center gap-2 justify-center">
          <RiTimerLine className="w-5 h-5" />
          Time Left:{" "}
          <span
            className={cn("text-red-400", timeLeft < 600 && "text-red-700")}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-8 justify-end">
          {testType === TestType.LISTENING &&
            audioRef &&
            handleVolumeChange && (
              <div className="flex items-center gap-2">
                {volume === 0 ? (
                  <RiVolumeMuteLine className="w-5 h-5" />
                ) : (
                  <RiVolumeUpLine className="w-5 h-5" />
                )}
                <Slider
                  id="volume"
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={[0.5]}
                  onValueChange={onVolumeChange}
                  className="w-24"
                />
              </div>
            )}

          {(user?.role === Role.TEACHER ||
            (user?.role === Role.STUDENT && type === "Thematic")) && (
            <Button
              onClick={handleBack}
              variant="default"
              type="button"
              className="flex items-center gap-2 h-7 w-24"
            >
              <RiArrowLeftLine className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestHeader;
