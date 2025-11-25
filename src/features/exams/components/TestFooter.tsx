import { cn } from "@/lib/utils";
import { RiTimerLine } from "@remixicon/react";

interface TestFooterProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const TestFooter = ({ timeLeft, formatTime }: TestFooterProps) => {
  return (
    <footer className="sticky bottom-0 z-[60] flex h-16 shrink-0 items-center gap-2 bg-background border-t border-border-alpha-light transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4 w-full">
        <div className="text-sm font-semibold font-mono flex items-center gap-2">
          <RiTimerLine className="w-5 h-5" />
          <span>Time Left:</span>
          <span
            className={cn("text-red-400", timeLeft < 600 && "text-red-700")}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default TestFooter;




