import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider import qilindi
import { cn } from "@/lib/utils";
import {
  RiShieldUserLine,
  RiTimerLine,
  RiVolumeUpLine,
  RiVolumeMuteLine,
} from "@remixicon/react";
import { TestType } from "@/shared/enums/test-type.enum";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";

interface TestHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  testType: TestType;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  handleVolumeChange?: (value: number) => void; // handleVolumeChange yangilandi
}

const TestHeader = ({
  timeLeft,
  formatTime,
  testType = TestType.READING,
  audioRef,
  handleVolumeChange,
}: TestHeaderProps) => {

  const {user} = useAuthStore();

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
      <CardContent className="p-3 flex justify-between items-center h-[50px]">
        <div className="text-sm flex items-center gap-2">
          <RiShieldUserLine />
          <b>Candidate:</b> {user?.username || "Guest"}
        </div>
        <div className="flex items-center gap-8">
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
          <div className="text-sm font-semibold font-mono flex items-center gap-2 min-w-[100px]">
            <RiTimerLine className="w-5 h-5" />
            Time Left:{" "}
            <span className={cn(timeLeft < 600 && "text-destructive")}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestHeader;
