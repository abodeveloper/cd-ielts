import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "./ReadingQuestionRenderer";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { Reading } from "@/features/exams/types";
import ResizableContent from "@/features/exams/components/ResizibleContent";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/htmlRenderer";

interface ReadingQuestionContentProps {
  part: Reading;
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionContent = ({
  part,
  form,
}: ReadingQuestionContentProps) => {
  return (
    <ResizableContent
      leftContent={
        <HTMLRenderer
          className="h-full overflow-y-auto p-6 text-sm"
          htmlString={part.content}
        />
      }
      rightContent={
        <div className="h-full overflow-y-auto p-6 space-y-8 text-sm">
          <HTMLRenderer htmlString={part.questions} />
          {part.questions ? (
            <ReadingQuestionRenderer htmlString={part.questions} form={form} />
          ) : (
            <div>No questions available</div>
          )}
        </div>
      }
      className="h-[calc(100vh-260px)] bg-muted"
    />
  );
};

export default ReadingQuestionContent;
