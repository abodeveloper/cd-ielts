import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionInput from "./ReadingQuestionInput";

interface QuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionRenderer: React.FC<QuestionRendererProps> = ({
  htmlString,
  form,
}) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const container = doc.body;

  const walk = (node: ChildNode): React.ReactNode => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      // Agar <question-input> bo‘lsa
      if (el.tagName.toLowerCase() === "question-input") {
        const number = el.dataset.questionNumber ?? "";
        const type = el.dataset.questionType ?? "";

        const inputElement = (
          <ReadingQuestionInput number={number} type={type} form={form} />
        );

        // true_false_not_given bo‘lsa, alohida qatorda chiqsin (block)
        if (type === "true_false_not_given") {
          return (
            <div key={number} style={{ margin: "8px 0" }}>
              {inputElement}
            </div>
          );
        }

        // Aks holda inline chiqsin
        return (
          <span key={number} style={{ display: "inline-block", minWidth: 100 }}>
            {inputElement}
          </span>
        );
      }

      // Bola elementlarni rekursiv yurib chiqish
      const children = Array.from(node.childNodes).map((child, i) => (
        <React.Fragment key={i}>{walk(child)}</React.Fragment>
      ));

      // O‘ziga mos HTML tag hosil qilish
      return React.createElement(el.tagName.toLowerCase(), {}, children);
    }

    // Agar matn bo‘lsa
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    return null;
  };

  // Bosh container childlarini yurib chiqish
  const content = Array.from(container.childNodes).map((node, i) => (
    <React.Fragment key={i}>{walk(node)}</React.Fragment>
  ));

  return <div>{content}</div>;
};

export default ReadingQuestionRenderer;
