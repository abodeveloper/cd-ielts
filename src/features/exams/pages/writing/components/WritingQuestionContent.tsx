import ResizableContent from "@/features/exams/components/ResizibleContent";
import TextHighlight from "@/features/exams/components/TextHighlight";
import { WritingFormValues } from "@/features/exams/schemas/writing-schema";
import { Writing } from "@/features/exams/types";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import MyQuestionTextArea from "@/shared/components/atoms/question-inputs/MyQuestionTextarea";
import { UseFormReturn } from "react-hook-form";

interface WritingQuestionContentProps {
  part: Writing;
  form: UseFormReturn<WritingFormValues>;
  index: number;
}

const WritingQuestionContent = ({
  part,
  form,
  index,
}: WritingQuestionContentProps) => {
  const answerValue = form.watch(`answers.${0}.answer`) || "";
  const charCount = answerValue.length;

  return (
    <div className="h-[calc(100vh-232px)] bg-muted">
      <ResizableContent
        leftContent={
          <HTMLRenderer
            className="h-full overflow-y-auto p-6 text-sm"
            htmlString={part.content}
          />
        }
        rightContent={
          <div className="h-full overflow-y-auto p-6 space-y-4 text-sm">
            <MyQuestionTextArea<WritingFormValues>
              floatingError
              id={"1"}
              control={form.control}
              name={`answers.${index}.answer`}
              className="min-h-[calc(100vh-315px)]"
            />
            <div className="text-xs text-muted-foreground">
              Words count: {charCount}
            </div>

            <TextHighlight/>
          </div>
        }
        // className="h-[calc(100vh-260px)] bg-muted"
      />
    </div>
  );
};

export default WritingQuestionContent;
