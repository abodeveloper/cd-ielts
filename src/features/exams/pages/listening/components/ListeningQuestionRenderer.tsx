import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import { ListeningQuestionType } from "@/shared/enums/listening-question-type.enum";
import parse, { Element } from "html-react-parser";
import { UseFormReturn } from "react-hook-form";
import ListeningDragDropTags from "./ListeningDragDropTags";
import ListeningQuestionInput from "./ListeningQuestionInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface QuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ListeningFormValues>;
}

const ListeningQuestionRenderer: React.FC<QuestionRendererProps> = ({
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
                <ListeningQuestionInput
                  number={number}
                  type={type}
                  form={form}
                  options={options}
                />
              );

              if (type === ListeningQuestionType.MULTIPLE_CHOICE) {
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
              const repeatAnswer = Boolean(attribs["repeat_answer"] || false);
              const options = JSON.parse(attribs["data-options"] || "[]");
              const questions = JSON.parse(attribs["data-questions"] || "[]");

              return (
                <ListeningDragDropTags
                  options={options}
                  questions={questions}
                  form={form}
                  isRepeatAnswer={repeatAnswer}
                />
              );
            }

            /** --------------------
             * Table Tags Input
             -------------------- **/
            if (domNode.name === "table-tegs-input") {
              const { attribs } = domNode;
              let options: { value: string; label: string }[] = [];
              let questions: { question_number: number; question_text: string }[] =
                [];

              try {
                options = JSON.parse(attribs["data-options"] || "[]");
                questions = JSON.parse(attribs["data-questions"] || "[]");
              } catch (error) {
                console.warn("Error parsing table-tegs-input attributes:", error);
                return (
                  <span className="text-destructive">
                    Invalid table input tags
                  </span>
                );
              }

              const repeatAnswer = attribs["repeat_answer"] !== "False"; // Default true if not specified

              return (
                <div className="space-y-8 my-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        {options?.map((option) => (
                          <TableHead key={option.value}>{option.value}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => {
                        const questionIndex = question.question_number - 1;

                        // Agar repeat_answer false bo'lsa, boshqa savollarda ishlatilgan optionlarni topish
                        const usedOptions = !repeatAnswer
                          ? questions
                              .filter(
                                (q) => q.question_number !== question.question_number
                              )
                              .map((q) => {
                                const qIndex = q.question_number - 1;
                                return form.watch(`answers.${qIndex}.answer`);
                              })
                              .filter((val) => val && val.trim() !== "")
                          : [];

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {question?.question_number}. {question?.question_text}
                            </TableCell>
                            {options?.map((option) => {
                              const isUsed =
                                !repeatAnswer && usedOptions.includes(option.value);
                              const currentValue = form.watch(
                                `answers.${questionIndex}.answer`
                              );
                              const isCurrentOption = currentValue === option.value;

                              // Agar option ishlatilgan bo'lsa va bu joriy savolning javobi bo'lmasa, disabled qilish
                              const isDisabled = isUsed && !isCurrentOption;

                              return (
                                <TableCell key={option.value}>
                                  <FormField
                                    control={form.control}
                                    name={`answers.${questionIndex}.answer`}
                                    render={({ field }) => {
                                      return (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <input
                                              type="radio"
                                              onChange={() =>
                                                field.onChange(option.value)
                                              }
                                              checked={currentValue === option.value}
                                              name={`table_tegs_input_question_${question.question_number}`}
                                              value={option.value}
                                              id={`${question.question_number}_${option.value}_input`}
                                              disabled={isDisabled}
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
                                      );
                                    }}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
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

export default ListeningQuestionRenderer;
