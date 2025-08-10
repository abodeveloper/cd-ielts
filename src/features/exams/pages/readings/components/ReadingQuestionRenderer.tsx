import { UseFormReturn } from "react-hook-form";
import parse, { Element } from "html-react-parser";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import ReadingQuestionInput from "./ReadingQuestionInput";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import ReadingDragDropTags from "./ReadingDragDropTags";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";

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
             * List Selection Tags
             -------------------- **/
            if (domNode.name === "list-selection-tegs") {
              const { attribs } = domNode;
              const questionNumbers = JSON.parse(
                attribs["question_numbers"] || "[]"
              );
              const options = JSON.parse(attribs["data-options"] || "[]");
              const questionType = attribs["question_type"] || "";

              if (
                !questionNumbers.length ||
                !options.length ||
                questionType !== ReadingQuestionType.LIST_SELECTION
              ) {
                console.warn(
                  "Invalid list-selection-tegs attributes:",
                  attribs
                );
                return (
                  <span className="text-destructive">
                    Invalid list selection tags
                  </span>
                );
              }

              // Optionsni tekshirish va to‘g‘ri shaklda uzatish
              const formattedOptions = options.map(
                (option: { label: string; value: string }) => ({
                  value: option.value,
                  label: option.label || option.value, // Agar label bo‘lmasa, value dan foydalanamiz
                  id: `sharedAnswers_${questionNumbers.join("_")}_${
                    option.value
                  }`,
                })
              );

              return (
                <div
                  className="my-6"
                  key={questionNumbers.join("_")}
                >
                  <MyQuestionCheckboxGroup
                    control={form.control}
                    name={`sharedAnswers_${questionNumbers.join("_")}`}
                    options={formattedOptions}
                    maxSelections={questionNumbers.length}
                    orientation="vertical"
                    className="w-full"
                    onValueChange={(values: string[]) => {
                      questionNumbers.forEach((num: string, index: number) => {
                        const answerIndex = parseInt(num) - 1;
                        form.setValue(
                          `answers.${answerIndex}.answer`,
                          values[index] || ""
                        );
                      });
                    }}
                  />
                </div>
              );
            }

            /** --------------------
             * Drag Drop Tags
             -------------------- **/
            if (domNode.name === "drag-drop-tegs") {
              const { attribs } = domNode;
              const repeatAnswer = Boolean(
                attribs["data-repeat-answer"] || "False"
              );
              const options = JSON.parse(attribs["data-options"] || "[]");
              const questions = JSON.parse(attribs["data-questions"] || "[]");

              return (
                <ReadingDragDropTags
                  options={options}
                  questions={questions}
                  form={form}
                  isRepeatAnswer={repeatAnswer}
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
