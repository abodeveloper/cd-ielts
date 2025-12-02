import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import { ListeningPart } from "@/features/exams/types";
import { cn } from "@/lib/utils";
import HTMLRendererWithHighlight from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "../../readings/components/ReadingQuestionRenderer";
import { useAuthStore } from "@/store/auth-store";
import { useTestDisplayStore } from "@/store/test-display-store";
import { getTestDisplayClasses } from "@/shared/utils/test-display-utils";

interface Props {
  part: ListeningPart;
  form: UseFormReturn<ListeningFormValues>;
  testId?: string;
}

const ListeningQuestionContent = ({ part, form, testId }: Props) => {
  const { user } = useAuthStore();
  const { contrast, textSize } = useTestDisplayStore();
  const userId = user?.id || 'guest';
  
  // Create storage keys for persistence (per user)
  const scriptStorageKey = testId && part.id 
    ? `listening-${userId}-${testId}-${part.id}-script` 
    : undefined;
  const questionsStorageKey = testId && part.id 
    ? `listening-${userId}-${testId}-${part.id}-questions` 
    : undefined;

  const displayClasses = getTestDisplayClasses(contrast, textSize);

  return (
    <div className={cn("h-[calc(100vh-232px)]", displayClasses)}>
      {part.is_script ? (
        <ResizableContent
          leftContent={
            <HTMLRendererWithHighlight
              className={cn("h-full overflow-y-auto p-6", displayClasses)}
              htmlString={part.audioscript}
              storageKey={scriptStorageKey}
            />
          }
          rightContent={
            <div className={cn("h-full overflow-y-auto overflow-x-hidden p-6 space-y-8", displayClasses)}>
              {part.questions ? (
                <>
                  <ReadingQuestionRenderer
                    htmlString={part.questions}
                    form={form}
                    storageKey={questionsStorageKey}
                    className={displayClasses}
                  />
                </>
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
            <div className={cn("h-full overflow-y-auto overflow-x-hidden p-6 space-y-8", displayClasses)}>
              {part.questions ? (
                <ReadingQuestionRenderer
                  htmlString={part.questions}
                  form={form}
                  storageKey={questionsStorageKey}
                  className={displayClasses}
                />
              ) : (
                <div>No questions available</div>
              )}
              {/* {JSON.stringify(part.questions)} */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default ListeningQuestionContent;
