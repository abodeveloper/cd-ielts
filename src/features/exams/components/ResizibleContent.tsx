import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface ResizableContentProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  direction?: "horizontal" | "vertical";
  defaultSizes?: [number, number];
  className?: string;
}

const ResizableContent = ({
  leftContent,
  rightContent,
  direction = "horizontal",
  defaultSizes = [50, 50],
  className,
}: ResizableContentProps) => (
  <ResizablePanelGroup
    direction={direction}
    className={cn("w-full border rounded-none", className)}
  >
    <ResizablePanel defaultSize={defaultSizes[0]}>{leftContent}</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={defaultSizes[1]}>
      {rightContent}
    </ResizablePanel>
  </ResizablePanelGroup>
);

export default ResizableContent;
