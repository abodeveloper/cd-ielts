import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { ReadingPart } from "@/features/exams/types";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "./ReadingQuestionRenderer";
import { useAuthStore } from "@/store/auth-store";
import { useTestDisplayStore } from "@/store/test-display-store";
import { getTestDisplayClasses } from "@/shared/utils/test-display-utils";
import { cn } from "@/lib/utils";

interface ReadingQuestionContentProps {
  part: ReadingPart;
  form: UseFormReturn<ReadingFormValues>;
  testId?: string;
}

const ReadingQuestionContent = ({
  part,
  form,
  testId,
}: ReadingQuestionContentProps) => {
  const { user } = useAuthStore();
  const { contrast, textSize } = useTestDisplayStore();
  const userId = user?.id || 'guest';
  
  // Create storage keys for persistence (per user)
  const contentStorageKey = testId && part.id 
    ? `reading-${userId}-${testId}-${part.id}-content` 
    : undefined;
  const questionsStorageKey = testId && part.id 
    ? `reading-${userId}-${testId}-${part.id}-questions` 
    : undefined;

  const displayClasses = getTestDisplayClasses(contrast, textSize);

  return (
    <div className={cn("h-[calc(100vh-232px)]", displayClasses)}>
      <ResizableContent
        leftContent={
          <HTMLRenderer
            className={cn("h-full overflow-y-auto p-6", displayClasses)}
            htmlString={part.content || "<p>Sample content for testing</p>"}
            enabledHighlight={true}
            storageKey={contentStorageKey}
          />
        }
        rightContent={
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
            {/* {part.questions} */}
          </div>
        }
      />
    </div>
  );
};

export default ReadingQuestionContent;
