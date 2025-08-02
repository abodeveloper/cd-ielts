import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "./ReadingQuestionRenderer";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { Reading } from "@/features/exams/types";
import ResizableContent from "@/features/exams/components/ResizibleContent";

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
        <div
          className="h-full overflow-y-auto p-6 text-sm"
          dangerouslySetInnerHTML={{ __html: part.content }}
        />
      }
      rightContent={
        <div className="h-full overflow-y-auto p-6 space-y-8 text-sm">
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
