import { UseFormReturn } from "react-hook-form";
import parse, { Element } from "html-react-parser";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import ReadingQuestionInput from "./ReadingQuestionInput";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import ReadingDragDropTags from "./ReadingDragDropTags";

interface QuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionRenderer: React.FC<QuestionRendererProps> = ({
  htmlString,
  form,
}) => {
  return (
    <div className="w-full text-sm text-[--foreground] [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[--border] [&_td]:p-2 [&_th]:border [&_th]:border-[--border] [&_th]:p-2 [&_p]:mb-2 [&_p]:text-[--foreground] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-[--foreground] [&_strong]:font-bold [&_em]:italic">
      {parse(htmlString, {
        replace: (domNode) => {
          if (domNode instanceof Element) {
            /** --------------------
             * Question Input
             -------------------- **/
            if (domNode.name === "question-input") {
              const { attribs } = domNode;
              const number = attribs["data-question-number"] ?? "";
              const type = attribs["data-question-type"] ?? "";
              const options = JSON.parse(
                attribs["data-question-options"] || "[]"
              );

              if (!number || !type) {
                console.warn(
                  "Missing question-number or question-type:",
                  attribs
                );
                return (
                  <span className="text-destructive">
                    Invalid question input
                  </span>
                );
              }

              const inputElement = (
                <ReadingQuestionInput
                  number={number}
                  type={type}
                  form={form}
                  options={options}
                />
              );

              if (
                type === ReadingQuestionType.TRUE_FALSE_NOT_GIVEN ||
                type === ReadingQuestionType.YES_NO_NOT_GIVEN ||
                type === ReadingQuestionType.MULTIPLE_CHOICE
              ) {
                return (
                  <div style={{ margin: "8px 0" }} key={number}>
                    {inputElement}
                  </div>
                );
              }
              return (
                <span
                  style={{ display: "inline-block", minWidth: 150 }}
                  key={number}
                >
                  {inputElement}
                </span>
              );
            }

            /** --------------------
             * Drag Drop Tags
             -------------------- **/
            if (domNode.name === "drag-drop-tegs") {
              const { attribs } = domNode;
              const options = JSON.parse(attribs["data-options"] || "[]");
              const questions = JSON.parse(
                attribs["data-questions"] || "[]"
              );

              return (
                <ReadingDragDropTags
                  options={options}
                  questions={questions}
                  form={form}
                  isReusable={true}
                />
              );
            }
          }

          return domNode;
        },
      })}
    </div>
  );
};

export default ReadingQuestionRenderer;
