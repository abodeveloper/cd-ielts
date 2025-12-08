/**
 * HTML savol parserи - турли форматдаги HTML контентни parse қилиш учун
 * HTML Question Parser - for parsing HTML content with various question formats
 */

import parse, { Element } from "html-react-parser";

export interface ParsedQuestion {
  questionNumber: string;
  questionType: string;
  options?: Array<{ value: string; label: string }>;
  questionText?: string;
}

export interface ParsedListSelection {
  questions: ParsedQuestion[];
  options: Array<{ value: string; label: string }>;
  questionType: string;
  repeat: boolean;
  rawHTML: string;
}

export interface ParsedMultipleChoice extends ParsedQuestion {
  options: Array<{ value: string; label: string }>;
}

export interface ParseResult {
  listSelections: ParsedListSelection[];
  multipleChoices: ParsedMultipleChoice[];
  totalQuestions: number;
}

/**
 * HTML ичидаги list-selection-tegs элементларини parse қилади
 * Parses list-selection-tegs elements within HTML
 */
export const parseListSelectionElements = (htmlString: string): ParsedListSelection[] => {
  const results: ParsedListSelection[] = [];

  try {
    parse(htmlString, {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.name === "list-selection-tegs") {
          const { attribs } = domNode;
          
          let options: Array<{ value: string; label: string }> = [];
          const questionType = attribs["data-question-type"] || "";
          const repeat = attribs["data-repeat"] !== "false";

          try {
            options = JSON.parse(attribs["data-options"] || "[]");
          } catch (error) {
            console.warn("Error parsing list-selection options:", error);
            return domNode;
          }

          const questions: ParsedQuestion[] = [];
          
          const extractQuestions = (children: any[]): void => {
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
                
                if (child.children && child.children.length > 0) {
                  extractQuestions(child.children);
                }
              }
            });
          };

          if (domNode.children) {
            extractQuestions(domNode.children as any[]);
          }

          if (questions.length > 0 || options.length > 0) {
            results.push({
              questions,
              options,
              questionType,
              repeat,
              rawHTML: htmlString
            });
          }
        }
        return domNode;
      }
    });
  } catch (error) {
    console.warn("Error parsing HTML for list selections:", error);
  }

  return results;
};

/**
 * HTML ичидаги question-input элементларини parse қилади
 * Parses question-input elements within HTML
 */
export const parseMultipleChoiceElements = (htmlString: string): ParsedMultipleChoice[] => {
  const questions: ParsedMultipleChoice[] = [];

  try {
    parse(htmlString, {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.name === "question-input") {
          const { attribs } = domNode;
          const questionNumber = attribs["data-question-number"] || "";
          const questionType = attribs["data-question-type"] || "";
          
          let options: Array<{ value: string; label: string }> = [];
          try {
            const rawOptions = attribs["data-question-options"] || "[]";
            const parsedOptions = JSON.parse(rawOptions.replace(/&quot;/g, '"'));
            options = parsedOptions;
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
 * Тўлиқ HTML парс қилади - барча турдаги саволларни
 * Parses complete HTML - all types of questions
 */
export const parseCompleteHTML = (htmlString: string): ParseResult => {
  const listSelections = parseListSelectionElements(htmlString);
  const multipleChoices = parseMultipleChoiceElements(htmlString);
  
  const totalQuestions = 
    listSelections.reduce((sum, ls) => sum + ls.questions.length, 0) + 
    multipleChoices.length;

  return {
    listSelections,
    multipleChoices,
    totalQuestions
  };
};

/**
 * Фойдаланувчи томонидан берилган HTML форматини текшириш
 * Test the HTML format provided by the user
 */
export const testUserHTML = (htmlString: string): void => {
  console.log("🔍 HTML Content Analysis:");
  console.log("📏 Length:", htmlString.length);
  console.log("\n");

  const parseResult = parseCompleteHTML(htmlString);
  
  console.log("📊 Parse Results:");
  console.log("📝 Total Questions:", parseResult.totalQuestions);
  console.log("📋 List Selections:", parseResult.listSelections.length);
  console.log("🔘 Multiple Choices:", parseResult.multipleChoices.length);
  console.log("\n");

  // List Selection Questions
  parseResult.listSelections.forEach((ls, index) => {
    console.log(`📋 List Selection ${index + 1}:`);
    console.log(`   Type: ${ls.questionType}`);
    console.log(`   Repeat: ${ls.repeat}`);
    console.log(`   Options Count: ${ls.options.length}`);
    console.log(`   Questions Count: ${ls.questions.length}`);
    
    if (ls.options.length > 0) {
      console.log("   Options:");
      ls.options.forEach(opt => {
        console.log(`     ${opt.value}: ${opt.label}`);
      });
    }
    
    if (ls.questions.length > 0) {
      console.log("   Questions:");
      ls.questions.forEach(q => {
        console.log(`     Question ${q.questionNumber}: ${q.questionType}`);
      });
    }
    console.log("");
  });

  // Multiple Choice Questions  
  parseResult.multipleChoices.forEach((mc, index) => {
    console.log(`🔘 Multiple Choice ${index + 1}:`);
    console.log(`   Question: ${mc.questionNumber}`);
    console.log(`   Type: ${mc.questionType}`);
    console.log(`   Options Count: ${mc.options.length}`);
    
    if (mc.options.length > 0) {
      console.log("   Options:");
      mc.options.forEach(opt => {
        console.log(`     ${opt.value}: ${opt.label}`);
      });
    }
    console.log("");
  });
};

// Export everything for use in other files
export default {
  parseListSelectionElements,
  parseMultipleChoiceElements,
  parseCompleteHTML,
  testUserHTML
};
