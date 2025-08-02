import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RiShieldUserLine, RiTimerLine } from "@remixicon/react";

interface TestHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const TestHeader = ({ timeLeft, formatTime }: TestHeaderProps) => (
  <Card className="w-full shadow-md rounded-none">
    <CardContent className="p-3 flex justify-between items-center">
      <div className="text-sm flex items-center gap-2">
        <RiShieldUserLine />
        <b>Candidate:</b> Abbos Ibragimov
      </div>
      <div
        className={cn(
          "text-sm font-semibold font-mono flex items-center gap-2 min-w-[100px]"
        )}
      >
        <RiTimerLine className="w-5 h-5" />
        Time Left:{" "}
        <span className={cn(timeLeft < 600 && "text-destructive")}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default TestHeader;
