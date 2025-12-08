/**
 * Парсер для HTML-контента с вопросами в разных форматах
 * Parser for HTML content with questions in different formats
 */

import parse, { Element, domToReact } from "html-react-parser";
import { UseFormReturn } from "react-hook-form";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";

export interface QuestionData {
  questionNumber: string;
  questionType: string;
  options: Array<{ value: string; label: string }>;
}

export interface ListSelectionData {
  questions: QuestionData[];
  options: Array<{ value: string; label: string }>;
  questionType: string;
  repeat: boolean;
}

/**
 * Парсит HTML и извлекает данные о вопросах типа list-selection
 * Parses HTML and extracts list-selection type question data
 */
export const parseListSelectionHTML = (htmlString: string): ListSelectionData | null => {
  if (!htmlString) return null;

  let listSelectionData: ListSelectionData | null = null;

  try {
    parse(htmlString, {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.name === "list-selection-tegs") {
          const { attribs } = domNode;
          
          // Извлекаем основные данные из атрибутов
          let options: Array<{ value: string; label: string }> = [];
          const questionType = attribs["data-question-type"] || "";
          const repeat = attribs["data-repeat"] !== "false";

          try {
            options = JSON.parse(attribs["data-options"] || "[]");
          } catch (error) {
            console.warn("Error parsing list-selection options:", error);
            return domNode;
          }

          // Извлекаем данные о вопросах из дочерних элементов
          const questions: QuestionData[] = [];
          
          const extractQuestions = (children: any[]) => {
            children?.forEach((child: any) => {
              if (child instanceof Element) {
                if (child.name === "list-selection-input") {
                  const questionNumber = child.attribs["data-question-number"] || "";
                  const childQuestionType = child.attribs["data-question-type"] || questionType;
                  
                  if (questionNumber) {
                    questions.push({
                      questionNumber,
                      questionType: childQuestionType,
                      options: options
                    });
                  }
                }
                
                // Рекурсивно обрабатываем дочерние элементы
                if (child.children && child.children.length > 0) {
                  extractQuestions(child.children);
                }
              }
            });
          };

          if (domNode.children) {
            extractQuestions(domNode.children as any[]);
          }

          listSelectionData = {
            questions,
            options,
            questionType,
            repeat
          };
        }
        return domNode;
      }
    });
  } catch (error) {
    console.warn("Error parsing HTML:", error);
    return null;
  }

  return listSelectionData;
};

/**
 * Парсит HTML и извлекает все вопросы multiple-choice
 * Parses HTML and extracts all multiple-choice questions
 */
export const parseMultipleChoiceHTML = (htmlString: string): QuestionData[] => {
  const questions: QuestionData[] = [];

  try {
    parse(htmlString, {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.name === "question-input") {
          const { attribs } = domNode;
          const questionNumber = attribs["data-question-number"] || "";
          const questionType = attribs["data-question-type"] || "";
          
          let options: Array<{ value: string; label: string }> = [];
          try {
            options = JSON.parse(attribs["data-question-options"] || "[]");
          } catch (error) {
            console.warn("Error parsing question options:", error);
            return domNode;
          }

          if (questionNumber && questionType && options.length > 0) {
            questions.push({
              questionNumber,
              questionType,
              options
            });
          }
        }
        return domNode;
      }
    });
  } catch (error) {
    console.warn("Error parsing multiple choice HTML:", error);
  }

  return questions;
};

/**
 * Объединяет HTML парсинг для всех типов вопросов
 * Combines HTML parsing for all question types
 */
export const parseCompleteHTML = (htmlString: string) => {
  const listSelectionData = parseListSelectionHTML(htmlString);
  const multipleChoiceQuestions = parseMultipleChoiceHTML(htmlString);

  return {
    listSelection: listSelectionData,
    multipleChoice: multipleChoiceQuestions,
    originalHTML: htmlString
  };
};
