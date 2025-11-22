interface TestTopHeaderProps {
  timeLeft?: number;
  formatTime?: (seconds: number) => string;
}

const TestTopHeader = ({ timeLeft, formatTime }: TestTopHeaderProps) => {
  return (
    <div className="sticky top-0 z-[60] flex h-16 shrink-0 items-center gap-2 bg-background border-b border-border-alpha-light transition-[width,height] ease-linear px-4">
      {/* Branding/Logo Area */}
      <div className="flex items-center gap-2">
        <h3 className="font-medium capitalize text-xl">WONDERS MOCK IELTS</h3>
      </div>
    </div>
  );
};

export default TestTopHeader;

