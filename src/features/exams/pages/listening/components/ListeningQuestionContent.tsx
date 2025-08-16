import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import { Reading } from "@/features/exams/types";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import ListeningQuestionRenderer from "./ListeningQuestionRenderer";

interface Props {
  part: Reading;
  form: UseFormReturn<ListeningFormValues>;
}

const ListeningQuestionContent = ({ part, form }: Props) => {
  return (
    <div className="h-[calc(100vh-232px)]">
      <ResizablePanelGroup
        direction={"horizontal"}
        className={cn("w-full border rounded-none")}
      >
        <ResizablePanel defaultSize={100}>
          <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 text-sm">
            {part.questions ? (
              <ListeningQuestionRenderer
                htmlString={part.questions}
                form={form}
              />
            ) : (
              <div>No questions available</div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ListeningQuestionContent;
