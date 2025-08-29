import { Label } from "@/components/ui/label"; // Shadcn label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // shadcn select
import ResizableContent from "@/features/exams/components/ResizibleContent";
import { WritingFormValues } from "@/features/exams/schemas/writing-schema";
import { WritingPart } from "@/features/exams/types";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import MyQuestionTextArea from "@/shared/components/atoms/question-inputs/MyQuestionTextarea";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface WritingQuestionContentProps {
  part: WritingPart;
  form: UseFormReturn<WritingFormValues>;
  index: number;
}

const WritingQuestionContent = ({
  part,
  form,
  index,
}: WritingQuestionContentProps) => {
  const answerValue = form.watch(`answers.${index}.answer`) || "";
  // Calculate word count by splitting on whitespace and filtering out empty strings
  const wordCount = answerValue
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const [fontSize, setFontSize] = useState("16px"); // Mahalliy holat uchun font o'lchami

  return (
    <div className="h-[calc(100vh-232px)] bg-muted">
      <ResizableContent
        leftContent={
          <HTMLRenderer
            className="h-full overflow-y-auto p-6 text-sm"
            htmlString={part.writing_questions[0].question}
          />
        }
        rightContent={
          <div className="h-full overflow-y-auto p-6 space-y-4 text-sm">
            <MyQuestionTextArea<WritingFormValues>
              floatingError
              id={"1"}
              control={form.control}
              name={`answers.${index}.answer`}
              className="min-h-[calc(100vh-335px)]"
              style={{ fontSize }} // Font o'lchamini mahalliy holatdan oladi
            />
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                Word count: {answerValue.trim() ? wordCount : 0}
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="font-size-trigger"
                  className="text-xs text-muted-foreground"
                >
                  Font size:
                </Label>
                <Select
                  onValueChange={(value) => setFontSize(value)}
                  defaultValue="16px"
                >
                  <SelectTrigger id="font-size-trigger" className="w-[75px]">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default WritingQuestionContent;
