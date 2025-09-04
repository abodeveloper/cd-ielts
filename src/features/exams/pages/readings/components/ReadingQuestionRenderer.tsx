import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import parse, { Element } from "html-react-parser";
import { UseFormReturn } from "react-hook-form";
import DragDropTags from "./DragDropTags";
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
              const questions = JSON.parse(
                attribs["data-question"] ||
                  `[
                    {
                      "question_number": 1,
                      "question_text": "No questions provided"
                    },
                    {
                      "question_number": 2,
                      "question_text": "some question"
                    },
                    {
                      "question_number": 3,
                      "question_text": "No questions provided"
                    },
                    {
                      "question_number": 4,
                      "question_text": "some question"
                    }
                  ]`
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
                  questions={questions}
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
                <div className="my-6" key={questionNumbers.join("_")}>
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
              const repeatAnswer = Boolean(attribs["repeat_answer"] || false);
              const options = JSON.parse(attribs["data-options"] || "[]");
              const questions = JSON.parse(attribs["data-questions"] || "[]");

              return (
                <DragDropTags
                  options={options}
                  questions={questions}
                  form={form}
                  isRepeatAnswer={repeatAnswer}
                />
              );
            }

            if (domNode.name === "table-tegs") {
              const { attribs } = domNode;
              const options: {
                value: string;
                label: string;
              }[] = JSON.parse(attribs["data-options"] || "[]");
              const questions: {
                question_number: number;
                question_text: string;
              }[] = JSON.parse(attribs["data-questions"] || "[]");

              return (
                <div className="space-y-8 my-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        {options?.map((option) => (
                          <TableHead key={option.value}>
                            {option.value}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {question?.question_number}.{" "}
                            {question?.question_text}
                          </TableCell>
                          {options?.map((option) => (
                            <TableCell key={option.value}>
                              <FormField
                                control={form.control}
                                name={`answers.${index}.answer`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <input
                                        type="radio"
                                        // checked={field.value === option.value}
                                        onChange={() =>
                                          field.onChange(option.value)
                                        }
                                        name={`${question.question_number - 1}`}
                                        value={option.value}
                                        id={`${question.question_number}`}
                                        className="h-4 w-4 rounded-full border border-primary appearance-none 
                                checked:bg-white 
                                relative 
                                checked:after:content-[''] 
                                checked:after:block 
                                checked:after:w-2.5 checked:after:h-2.5 
                                checked:after:rounded-full 
                                checked:after:bg-primary 
                                checked:after:mx-auto checked:after:my-auto 
                                checked:after:absolute checked:after:inset-0
                                disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </FormControl>
                                    <FormLabel></FormLabel>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead colSpan={2}>
                          First invented or used by
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {options?.map((option, index) => (
                        <TableRow key={index}>
                          <TableCell className="w-[50px]">
                            {option.value}
                          </TableCell>
                          <TableCell>{option.label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            }

            if (domNode.name === "table-tegs-input") {
              const { attribs } = domNode;
              const options: {
                value: string;
                label: string;
              }[] = JSON.parse(attribs["data-options"] || "[]");
              const questions: {
                question_number: number;
                question_text: string;
              }[] = JSON.parse(attribs["data-questions"] || "[]");

              return (
                <div className="space-y-8 my-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        {options?.map((option) => (
                          <TableHead key={option.value}>
                            {option.value}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {question?.question_number}.{" "}
                            {question?.question_text}
                          </TableCell>
                          {options?.map((option) => (
                            <TableCell key={option.value}>
                              <FormField
                                control={form.control}
                                name={`answers.${index}.answer`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <input
                                        type="radio"
                                        // checked={field.value === option.value}
                                        onChange={() =>
                                          field.onChange(option.value)
                                        }
                                        name={`${question.question_number - 1}`}
                                        value={option.value}
                                        id={`${question.question_number}`}
                                        className="h-4 w-4 rounded-full border border-primary appearance-none 
                                checked:bg-white 
                                relative 
                                checked:after:content-[''] 
                                checked:after:block 
                                checked:after:w-2.5 checked:after:h-2.5 
                                checked:after:rounded-full 
                                checked:after:bg-primary 
                                checked:after:mx-auto checked:after:my-auto 
                                checked:after:absolute checked:after:inset-0
                                disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </FormControl>
                                    <FormLabel></FormLabel>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
