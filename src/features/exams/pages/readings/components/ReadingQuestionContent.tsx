import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { ReadingPart } from "@/features/exams/types";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "./ReadingQuestionRenderer";

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
  // Create storage keys for persistence
  const contentStorageKey = testId && part.id 
    ? `reading-${testId}-${part.id}-content` 
    : undefined;
  const questionsStorageKey = testId && part.id 
    ? `reading-${testId}-${part.id}-questions` 
    : undefined;

  return (
    <div className="h-[calc(100vh-232px)]">
      <ResizableContent
        leftContent={
          <HTMLRenderer
            className="h-full overflow-y-auto p-6 text-sm"
            htmlString={part.content || "<p>Sample content for testing</p>"}
            enabledHighlight={true}
            storageKey={contentStorageKey}
          />
        }
        rightContent={
          <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 text-sm">
            {part.questions ? (
              <ReadingQuestionRenderer
                htmlString={part.questions}
                form={form}
                storageKey={questionsStorageKey}
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
