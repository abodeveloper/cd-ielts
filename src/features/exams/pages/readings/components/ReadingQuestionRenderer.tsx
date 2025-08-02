import { UseFormReturn } from "react-hook-form";
import parse, { Element } from "html-react-parser";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import ReadingQuestionInput from "./ReadingQuestionInput";

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
          if (domNode instanceof Element && domNode.name === "question-input") {
            const { attribs } = domNode;
            const number = attribs["data-question-number"] ?? "";
            const type = attribs["data-question-type"] ?? "";
            if (!number || !type) {
              console.warn(
                "Missing question-number or question-type:",
                attribs
              );
              return (
                <span className="text-destructive">Invalid question input</span>
              );
            }
            const inputElement = (
              <ReadingQuestionInput number={number} type={type} form={form} />
            );
            if (type === "true_false_not_given") {
              return (
                <div style={{ margin: "8px 0" }} key={number}>
                  {inputElement}
                </div>
              );
            }
            return (
              <span
                style={{ display: "inline-block", minWidth: 100 }}
                key={number}
              >
                {inputElement}
              </span>
            );
          }
          return domNode;
        },
      })}
    </div>
  );
};

export default ReadingQuestionRenderer;
