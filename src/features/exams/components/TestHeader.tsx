import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider import qilindi
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Role } from "@/shared/enums/role.enum";
import { TestType } from "@/shared/enums/test-type.enum";
import { useAuthStore } from "@/store/auth-store";
import { useTestDisplayStore } from "@/store/test-display-store";
import {
  RiArrowLeftLine,
  RiPauseLine,
  RiPlayLine,
  RiShieldUserLine,
  RiTimerLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiSettings3Line,
} from "@remixicon/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TestHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  testType: TestType;
  type: "Mock" | "Thematic";
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  handleVolumeChange?: (value: number) => void;
  handlePauseToggle?: () => void; // New prop for pause functionality
  isPaused?: boolean; // New prop to track pause state
  studentHasStarted?: boolean; // New prop to track if student has started audio
  userHasStarted?: boolean; // New prop to track if user has manually started audio
  isAudioPlaying?: boolean; // Track if audio is currently playing
}

const TestHeader = ({
  timeLeft,
  formatTime,
  testType = TestType.READING,
  audioRef,
  handleVolumeChange,
  handlePauseToggle,
  isPaused = false,
  studentHasStarted = false,
  userHasStarted = false,
  type,
  isAudioPlaying = false,
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
    // STUDENT: English alert with only OK button, prevent navigation
    if (user?.role === Role.STUDENT) {
      // Show English alert
      alert("You cannot leave the page during the test.");
      
      // Enter fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error("Fullscreen error:", err);
        });
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
      
      // Don't navigate - stay on test page
      return;
    }

    // TEACHER: Normal navigation
    if (user?.role === Role.TEACHER) {
      if (type === "Thematic") {
        navigate("/teacher/tests/thematic");
      } else {
        navigate("/teacher/tests/mock");
      }
      exitFullscreen();
    }
  };

  const { user } = useAuthStore();
  const { contrast, textSize, setContrast, setTextSize } = useTestDisplayStore();

  const [volume, setVolume] = useState(0.5);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioElement = audioRef?.current;

  // Track audio current time for listening tests
  useEffect(() => {
    if (testType !== TestType.LISTENING || !audioElement) {
      setAudioCurrentTime(0);
      setAudioDuration(0);
      return;
    }

    const updateTime = () => {
      setAudioCurrentTime(audioElement.currentTime || 0);
    };

    const updateDuration = () => {
      const duration = Number.isFinite(audioElement.duration)
        ? audioElement.duration
        : 0;
      setAudioDuration(duration);
    };

    updateTime();
    updateDuration();

    audioElement.addEventListener("timeupdate", updateTime);
    audioElement.addEventListener("loadedmetadata", updateDuration);
    audioElement.addEventListener("durationchange", updateDuration);
    audioElement.addEventListener("ended", updateTime);

    return () => {
      audioElement.removeEventListener("timeupdate", updateTime);
      audioElement.removeEventListener("loadedmetadata", updateDuration);
      audioElement.removeEventListener("durationchange", updateDuration);
      audioElement.removeEventListener("ended", updateTime);
    };
  }, [testType, audioElement]);

  // Format audio time as MM:SS
  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const audioDisplaySeconds =
    audioDuration > 0
      ? Math.max(audioDuration - audioCurrentTime, 0)
      : audioCurrentTime;

  // Slider qiymati o'zgarganda
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
          {testType === TestType.LISTENING && audioRef ? (
            <>
              <RiTimerLine className="w-5 h-5" />
              {formatAudioTime(audioDisplaySeconds)}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
        <div className="flex items-center gap-8 justify-end">
          {/* Timer moved to right side */}
          <div className="text-sm font-semibold font-mono flex items-center gap-2 whitespace-nowrap">
            <RiTimerLine className="w-5 h-5" />
            <span className="whitespace-nowrap">Time Left:</span>
            <span
              className={cn("text-red-400", timeLeft < 600 && "text-red-700")}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
          {testType === TestType.LISTENING &&
            audioRef &&
            handleVolumeChange && (
              <div className="flex items-center gap-4">
                {/* Pause/Play Button - Only for Thematic tests */}
                {type === "Thematic" && handlePauseToggle && (
                  <Button
                    onClick={handlePauseToggle}
                    variant="default"
                    size="sm"
                    type="button"
                    className="flex items-center gap-1 h-8 w-8 p-0 bg-black hover:bg-gray-800 border-black text-white"
                    disabled={
                      user?.role === Role.STUDENT && 
                      studentHasStarted && 
                      !isPaused
                    }
                    title={
                      user?.role === Role.STUDENT && studentHasStarted && !isPaused
                        ? "Students cannot pause after starting audio"
                        : !userHasStarted
                        ? "Start audio"
                        : isPaused
                        ? "Resume audio"
                        : "Pause audio"
                    }
                  >
                    {!userHasStarted || isPaused ? (
                      <RiPlayLine className="w-4 h-4 text-white" />
                    ) : (
                      <RiPauseLine className="w-4 h-4 text-white" />
                    )}
                  </Button>
                )}
                
                {/* Volume Controls */}
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
              </div>
            )}

          {/* Options button for Listening and Reading tests */}
          {(testType === TestType.LISTENING || testType === TestType.READING) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="flex items-center gap-2 h-7 bg-black text-white border-black hover:bg-gray-800"
                >
                  <RiSettings3Line className="w-4 h-4" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Contrast</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={contrast}
                      onValueChange={(value) =>
                        setContrast(value as "black-on-white" | "white-on-black" | "yellow-on-black")
                      }
                    >
                      <DropdownMenuRadioItem value="black-on-white">
                        Black on white
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="white-on-black">
                        White on Black
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="yellow-on-black">
                        Yellow on black
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Text size</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={textSize}
                      onValueChange={(value) =>
                        setTextSize(value as "regular" | "large" | "extra-large")
                      }
                    >
                      <DropdownMenuRadioItem value="regular">
                        Regular
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="large">
                        Large
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="extra-large">
                        Extra large
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
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
