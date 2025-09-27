import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import { ListeningPart } from "@/features/exams/types";
import { cn } from "@/lib/utils";
import HTMLRendererWithHighlight from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "../../readings/components/ReadingQuestionRenderer";

interface Props {
  part: ListeningPart;
  form: UseFormReturn<ListeningFormValues>;
}

const ListeningQuestionContent = ({ part, form }: Props) => {
  return (
    <div className="h-[calc(100vh-232px)]">
      {part.is_script ? (
        <ResizableContent
          leftContent={
            <HTMLRendererWithHighlight
              className="h-full overflow-y-auto p-6 text-sm"
              htmlString={part.audioscript}
            />
          }
          rightContent={
            <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 text-sm">
              {part.questions ? (
                <ReadingQuestionRenderer
                  htmlString={part.questions}
                  form={form}
                />
              ) : (
                <div>No questions available</div>
              )}
            </div>
          }
        />
      ) : (
        <ResizablePanelGroup
          direction={"horizontal"}
          className={cn("w-full border rounded-none")}
        >
          <ResizablePanel defaultSize={100}>
            <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 text-sm">
              {part.questions ? (
                <ReadingQuestionRenderer
                  htmlString={part.questions}
                  form={form}
                />
              ) : (
                <div>No questions available</div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default ListeningQuestionContent;
